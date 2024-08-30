/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-08-28
 *  @Filename: authenticate-api.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use server';

import { cookies } from 'next/headers';
import fetchFromAPI from './fetch-from-API';

type APIResponse = {
  access_token: string;
  token_type: string;
};

export default async function authenticateAPI(password: string) {
  /** Gets a bearer token from the API and stores it as an HTTP-only cookie. */

  let response: APIResponse;

  try {
    response = await fetchFromAPI('/auth/login', {
      method: 'POST',
      body: new URLSearchParams({ username: 'any', password }),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    cookies().set('apiToken', response.access_token, { httpOnly: true });
  } catch (error) {
    console.error(`Failed to get API token: ${(error as Error).message}`);
    return false;
  }

  return true;
}

export async function testAuthentication() {
  /** Tests the authentication with the API. */

  try {
    await fetchFromAPI('/auth/test', {}, true);
  } catch (error) {
    return false;
  }

  return true;
}

export async function forgetAuth() {
  /** Logs out the user. */

  cookies().delete('apiToken');
}
