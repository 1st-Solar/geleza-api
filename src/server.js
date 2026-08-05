/**
 * @fileoverview HTTP server entry – load data, then listen.
 */

import app from './app.js';
import { config } from './config/config.js';
import { load as loadPapers } from './repositories/paperRepository.js';

async function start() {
  try {
    console.log('[server] Loading paper data…');
    const count = await loadPapers();

    const mem = process.memoryUsage();
    console.log('[server] Startup info', {
      version: config.appVersion,
      env: config.nodeEnv,
      papers: count,
      heapUsedMB: Math.round(mem.heapUsed / 1024 / 1024),
    });

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
