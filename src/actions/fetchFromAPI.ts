/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-18
 *  @Filename: fetchFromAPI.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use server';

export default async function fetchFromAPI<T>(
  route: string,
  baseURL: string | undefined = undefined
): Promise<T> {
  if (!baseURL) {
    baseURL = process.env.LVM_API_BASE_URL;
  }

  const url = new URL(route, baseURL).toString();

  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Failed to fetch from API: ${response.statusText}`);
  }

  return response.json() as T;
}
