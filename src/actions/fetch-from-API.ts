/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-18
 *  @Filename: fetch-from-API.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use server';

import { cookies } from 'next/headers';
import { AuthenticationError } from '../types';
import { getAuthCookieName } from './authenticate-api';

export default async function fetchFromAPI<T>(
  route: string,
  opts: RequestInit & { baseURL?: string } = {},
  needs_authentication: boolean = false
): Promise<T> {
  /** Fetches data from the API. */

  const baseURL = opts.baseURL || process.env.LVM_API_BASE_URL;
  delete opts.baseURL;

  const url = new URL(route, baseURL).toString();
  const tokenName = await getAuthCookieName();

  const cookieStore = await cookies();

  if (needs_authentication) {
    const token = cookieStore.get(tokenName);

    if (token === undefined) {
      throw new AuthenticationError('No API token found.');
    }

    opts.headers = {
      ...opts.headers,
      Authorization: `Bearer ${token.value}`,
    };
  }

  const response = await fetch(url, opts);
  if (!response.ok) {
    if (response.status === 401 && needs_authentication) {
      cookieStore.delete(tokenName);
      throw new AuthenticationError('Authentication error');
    }

    throw new Error(`Failed to fetch from API: ${response.statusText}`);
  }

  return response.json() as T;
}
