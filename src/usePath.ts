/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2023-07-15
 *  @Filename: usePath.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { useLocation, useSearchParams } from 'react-router-dom';

function shortcutToTelescope(short: string) {
  switch (short.toLowerCase()) {
    case 'sci':
      return 'Science';
    case 'spec':
      return 'Spec';
    case 'skye':
      return 'SkyE';
    case 'skyw':
      return 'SkyW';
    default:
      throw Error(`Invalid shortcut ${short.toLowerCase()}.`);
  }
}

export interface URLPath {
  url: string;
  title: string;
  className?: string;
}

export default function usePath() {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();

  const path: URLPath = { url: '/', title: '' };

  if (pathname.startsWith('/pwi')) {
    const pwi = searchParams.get('tel') || 'sci';
    if (pwi) {
      path.url = `/pwi${pwi}/vnc_lite.html?scale=true&path=pwi${pwi}/websockify`;
      path.title = `PlaneWave ${shortcutToTelescope(pwi)}`;
      path.className = 'vnc-iframe';
    }
  } else if (pathname.startsWith('/motan')) {
    path.url = '/motan/default';
    path.title = 'Motor controllers';
    path.className = 'vnc-iframe';
  } else if (pathname.startsWith('/rabbitmq')) {
    path.url = '/rabbitmq/#/queues';
    path.title = 'RabbitMQ';
    path.className = 'full-screen-iframe';
  } else if (pathname.startsWith('/weather')) {
    path.url = 'http://weather.lco.cl';
    path.title = 'LCO Weather';
    path.className = 'full-screen-iframe';
  } else if (pathname.startsWith('/docs')) {
    const docs = searchParams.get('page') || 'gort';
    path.className = 'full-screen-iframe';
    switch (docs) {
      case 'gort':
        path.url = 'https://lvmgort.readthedocs.io/en/latest/';
        path.title = 'GORT Documentation';
        break;
    }
  }

  return path;
}
