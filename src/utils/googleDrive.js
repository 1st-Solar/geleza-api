/**
 * @fileoverview Google Drive URL helpers and PDF fetch.
 * Used only on the server. Clients never see Drive URLs.
 */

const FILE_ID_RE =
  /\/file\/d\/([a-zA-Z0-9_-]+)|[?&]id=([a-zA-Z0-9_-]+)/;

/**
 * Extract a Drive file id from a view/open/uc URL.
 * @param {string|null|undefined} url
 * @returns {string|null}
 */
export function extractFileId(url) {
  if (!url) return null;
  const m = String(url).match(FILE_ID_RE);
  return m ? m[1] || m[2] || null : null;
}

/**
 * Build the uc?export=download URL for a file id or any Drive URL.
 * @param {string} urlOrId
 * @returns {string|null}
 */
export function driveDownloadUrl(urlOrId) {
  if (!urlOrId) return null;
  const id = extractFileId(urlOrId) || (/^[a-zA-Z0-9_-]{10,}$/.test(urlOrId) ? urlOrId : null);
  if (!id) return null;
  return `https://drive.google.com/uc?export=download&id=${id}`;
}

/**
 * Fetch PDF bytes from Google Drive, handling the HTML "confirm" interstitial
 * that appears for larger files.
 *
 * @param {string} sourceUrl - original paper.pdf / memoPdf value
 * @param {{ timeoutMs?: number }} [opts]
 * @returns {Promise<{ buffer: Buffer, contentType: string, size: number }>}
 */
export async function fetchDrivePdf(sourceUrl, opts = {}) {
  const timeoutMs = opts.timeoutMs ?? 60_000;
  const id = extractFileId(sourceUrl);
  if (!id) {
    const err = new Error('Invalid or missing Google Drive URL');
    err.status = 400;
    err.code = 'INVALID_DRIVE_URL';
    throw err;
  }

  const primary = driveDownloadUrl(id);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let res = await fetch(primary, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; GelezaAPI/1.0; +https://geleza.ai)',
        Accept: 'application/pdf,*/*',
      },
    });

    if (!res.ok && res.status !== 200) {
      const err = new Error(`Google Drive returned HTTP ${res.status}`);
      err.status = res.status === 404 ? 404 : 502;
      err.code = 'DRIVE_UNAVAILABLE';
      throw err;
    }

    const contentType = (res.headers.get('content-type') || '').toLowerCase();

    // Large-file confirmation page (HTML)
    if (contentType.includes('text/html')) {
      const html = await res.text();
      const confirm =
        html.match(/confirm=([0-9A-Za-z_]+)/)?.[1] ||
        html.match(/name="confirm"\s+value="([^"]+)"/)?.[1];
      const uuid = html.match(/name="uuid"\s+value="([^"]+)"/)?.[1];

      if (!confirm) {
        // Sometimes Drive embeds a direct link in the HTML
        const direct = html.match(
          /href="(https:\/\/drive\.usercontent\.google\.com\/download[^"]+)"/
        )?.[1];
        if (direct) {
          res = await fetch(direct.replace(/&amp;/g, '&'), {
            redirect: 'follow',
            signal: controller.signal,
            headers: {
              'User-Agent':
                'Mozilla/5.0 (compatible; GelezaAPI/1.0; +https://geleza.ai)',
              Accept: 'application/pdf,*/*',
            },
          });
        } else {
          const err = new Error(
            'Google Drive blocked the download (confirmation required)'
          );
          err.status = 502;
          err.code = 'DRIVE_BLOCKED';
          throw err;
        }
      } else {
        const confirmUrl = new URL(primary);
        confirmUrl.searchParams.set('confirm', confirm);
        if (uuid) confirmUrl.searchParams.set('uuid', uuid);
        res = await fetch(confirmUrl.toString(), {
          redirect: 'follow',
          signal: controller.signal,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (compatible; GelezaAPI/1.0; +https://geleza.ai)',
            Accept: 'application/pdf,*/*',
          },
        });
      }

      if (!res.ok) {
        const err = new Error(`Google Drive returned HTTP ${res.status}`);
        err.status = 502;
        err.code = 'DRIVE_UNAVAILABLE';
        throw err;
      }
    }

    const finalType = (res.headers.get('content-type') || '').toLowerCase();
    if (finalType.includes('text/html')) {
      const err = new Error(
        'Google Drive returned HTML instead of a PDF'
      );
      err.status = 502;
      err.code = 'DRIVE_HTML';
      throw err;
    }

    const arrayBuf = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuf);

    // Sanity: PDF files start with %PDF
    if (buffer.length < 5 || buffer.subarray(0, 4).toString() !== '%PDF') {
      const err = new Error('Downloaded content is not a valid PDF');
      err.status = 502;
      err.code = 'INVALID_PDF';
      throw err;
    }

    return {
      buffer,
      contentType: 'application/pdf',
      size: buffer.length,
    };
  } catch (err) {
    if (err.name === 'AbortError') {
      const e = new Error('Google Drive request timed out');
      e.status = 504;
      e.code = 'DRIVE_TIMEOUT';
      throw e;
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
