import express from 'express';
import cors from 'cors';
import http from 'http';
import { env } from './util/env';
import { log } from './util/logger';
import { ensureSchema } from './db/init';
import { ingestRouter } from './api/ingest';
import { alertsRouter } from './api/alerts';
import { simulateRouter } from './api/simulate';
import { attachWs } from './api/ws';

async function main() {
  await ensureSchema();

  const app = express();
  app.use(cors());
  app.use(express.json());

  const server = http.createServer(app);
  const ws = attachWs(server);

  app.use('/ingest', ingestRouter(ws.broadcast));
  app.use('/alerts', alertsRouter());
  app.use('/simulate', simulateRouter());
  app.get('/', (_req, res) => {
    res.type('html').send(`
      <h1>OT Security Backend</h1>
      <ul>
        <li><a href="/alerts">GET /alerts</a> – recent alerts (JSON)</li>
        <li>POST /simulate/modbus-write-drum</li>
        <li>POST /simulate/modbus-write-load</li>
        <li>WebSocket: ws://localhost:${env.PORT}${env.WS_PATH}</li>
      </ul>
    `);
  });

  server.listen(env.PORT, () => log.info(`backend on :${env.PORT} (ws ${env.WS_PATH})`));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

