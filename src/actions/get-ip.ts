/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2025-01-12
 *  @Filename: get-ip.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use server';

import { headers } from 'next/headers';

export default async function getRequestIP() {
  const headerList = await headers();
  const ip = headerList.get('x-forwarded-for')?.split(',')[0] || null;
  return ip;
}

export async function isLCO() {
  const ip = await getRequestIP();
  if (ip?.startsWith('10.8.')) {
    return true;
  }
  return false;
}

export async function getLCOOverrideCode() {
  return process.env.LCO_OVERRIDE_CODE || null;
}
