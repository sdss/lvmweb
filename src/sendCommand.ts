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

const WS_URL = 'ws://10.8.38.21:8080/wslvmweb';

function createUUID() {
  var s: string[] = [];
  var hexDigits = '0123456789abcdef';
  for (var i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = '4';
  s[19] = hexDigits.substr((parseInt(s[19]) & 0x3) | 0x8, 1);
  s[8] = s[13] = s[18] = s[23] = '-';
  return s.join('');
}

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

    const command_id = createUUID();

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
