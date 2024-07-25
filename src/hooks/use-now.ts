/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-20
 *  @Filename: use-now.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import React from 'react';

interface UseNowParams {
  delay?: number;
  precision?: number;
  asString?: boolean;
}

interface UseNowParamsString extends UseNowParams {
  asString?: true;
}

interface UseNowParamsDate extends UseNowParams {
  asString?: false;
}

export default function useNow(params?: UseNowParamsString): string;
export default function useNow(params?: UseNowParamsDate): Date;
export default function useNow(params?: UseNowParams): string | Date {
  /** Adapted from
   *  https://stackoverflow.com/questions/73019483/update-date-now-in-react-hook
   *
   * */

  const { delay = 1000, precision = 1, asString = true } = params || {};

  const [now, setNow] = React.useState(new Date());

  React.useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), delay);
    return () => clearInterval(interval);
  });

  if (!asString) {
    return now;
  }

  const iso = now.toISOString().replace('T', ' ').replace('Z', '');

  // No decimals.
  if (precision === 0) {
    return iso.replace(/\.\d+/, '');
  }

  // With decimals.
  const re = new RegExp(String.raw`\.(\d{${precision}})\d*`, 'g');
  return iso.replace(re, '.$1');
}
