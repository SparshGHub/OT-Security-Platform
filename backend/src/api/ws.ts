import { Server } from 'ws';
import { env } from '../util/env';

export function attachWs(server: any) {
  const wss = new Server({ noServer: true });
  const clients = new Set<any>();

  wss.on('connection', (ws) => {
    clients.add(ws);
    ws.on('close', () => clients.delete(ws));
  });

  server.on('upgrade', (req: any, socket: any, head: any) => {
    if (req.url === env.WS_PATH) {
      wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, req));
    } else {
      socket.destroy();
    }
  });

  return {
    broadcast: (msg: any) => {
      const s = JSON.stringify(msg);
      clients.forEach((ws) => ws.readyState === ws.OPEN && ws.send(s));
    }
  };
}

