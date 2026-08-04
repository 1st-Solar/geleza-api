/**
 * @fileoverview HTTP server entry point.
 * Loads data into memory, then starts Express.
 */

import app from './app.js';
import { config } from './config/config.js';
import { load as loadPapers } from './repositories/paperRepository.js';

async function start() {
  try {
    console.log('[server] Loading paper data…');
    await loadPapers();

    app.listen(config.port, () => {
      console.log(
        `[server] Geleza API listening on port ${config.port} (${config.nodeEnv})`
      );
    });
  } catch (err) {
    console.error('[server] Failed to start:', err.message);
    process.exit(1);
  }
}

start();
