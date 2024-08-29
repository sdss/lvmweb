/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-18
 *  @Filename: fetch-from-API.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use server';

import { cookies } from 'next/headers';
import { AuthenticationError } from '../types';

export default async function fetchFromAPI<T>(
  route: string,
  opts: RequestInit & { baseURL?: string } = {},
  needs_authentication: boolean = false
): Promise<T> {
  /** Fetches data from the API. */

  let { baseURL, ...fetchOpts } = opts;
  baseURL = baseURL || process.env.LVM_API_BASE_URL;

  const url = new URL(route, baseURL).toString();

  if (needs_authentication) {
    const token = cookies().get('apiToken');

    if (token === undefined) {
      throw new AuthenticationError('No API token found.');
    }

    fetchOpts.headers = {
      ...fetchOpts.headers,
      Authorization: `Bearer ${token.value}`,
    };
  }

  const response = await fetch(url, fetchOpts);
  if (!response.ok) {
    if (response.status === 401) {
      cookies().delete('apiToken');
      throw new AuthenticationError('Authentication error');
    }

    throw new Error(`Failed to fetch from API: ${response.statusText}`);
  }

  return response.json() as T;
}
