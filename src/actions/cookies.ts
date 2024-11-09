/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-11-08
 *  @Filename: cookies.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use server';

import { cookies } from 'next/headers';

export async function setCookie(name: string, value: string) {
  const cookieStore = await cookies();
  await cookieStore.set(name, value);
}

export async function getCookie(name: string) {
  const cookieStore = await cookies();
  return await cookieStore.get(name)?.value;
}
