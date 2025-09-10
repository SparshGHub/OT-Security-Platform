export function connectWS(onMsg: (data: any) => void) {
  const url = `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.hostname}:8080/live`;
  const ws = new WebSocket(url);
  ws.onmessage = (ev) => onMsg(JSON.parse(ev.data));
  return ws;
}

