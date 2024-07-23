/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-20
 *  @Filename: jd-to-iso.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

export default function JDToISO(
  jd: number | undefined,
  precision: number = 0
): string | undefined {
  if (jd === undefined) {
    return undefined;
  }

  const date = new Date((jd - 2440587.5) * 86400000);

  const isot = date.toISOString();
  const iso = isot.replace(/T/, ' ').replace(/Z/, '');

  // No decimals.
  if (precision === 0) {
    return iso.replace(/\.\d+/, '');
  }

  // With decimals.
  const re = new RegExp(String.raw`\.(\d{${precision}})\d*`, 'g');
  return iso.replace(re, '.$1');
}
