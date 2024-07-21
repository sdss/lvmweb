/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-20
 *  @Filename: use-now.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import React from 'react';

export default function useNow(refreshFrequency: number = 1000, precision: number = 0): string {
  /** Adapted from https://stackoverflow.com/questions/73019483/update-date-now-in-react-hook */

  const [now, setNow] = React.useState(new Date());

  React.useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), refreshFrequency);
    return () => clearInterval(interval);
  });

  const iso = now.toISOString().replace('T', ' ').replace('Z', '');

  // No decimals.
  if (precision === 0) {
    return iso.replace(/\.\d+/, '');
  }

  // With decimals.
  const re = new RegExp(String.raw`\.(\d{${precision}})\d*`, 'g');
  return iso.replace(re, '.$1');
}
