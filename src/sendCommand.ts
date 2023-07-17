/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2023-07-15
 *  @Filename: sendCommand.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import ReconnectingWebSocket from 'reconnecting-websocket';

let RWS: ReconnectingWebSocket | null = null;

interface GortReply {
  command_id: string;
  [k: string]: unknown;
}

const WS_URL = 'ws://10.8.38.21:9000';

export default function sendCommand(command: string, params: unknown = {}) {
  return new Promise<GortReply>((resolve, reject) => {
    if (!RWS) {
      RWS = new ReconnectingWebSocket(WS_URL);
      console.log(`Creating WS connection to ${WS_URL}`);
      RWS.onopen = () => {
        console.log('Connection to WS open.');
      };
      RWS.onclose = () => {
        console.log('Connection to WS closed');
      };
      RWS.onerror = () => {
        console.log('Failed connecting to WS socket.');
      };
    }

    const command_id = crypto.randomUUID();

    const listenForMessages = (event: MessageEvent<string>) => {
      const data = JSON.parse(event.data) as GortReply;
      if (data.command_id !== command_id) {
        return;
      }
      RWS?.removeEventListener('message', listenForMessages);
      resolve(data);
    };

    const message = { command_id, route: command, params };
    if (RWS && RWS?.readyState == RWS?.OPEN) {
      RWS.send(JSON.stringify(message));
      RWS.addEventListener('message', listenForMessages);
    } else {
      RWS?.removeEventListener('message', listenForMessages);
      reject();
    }
  });
}
