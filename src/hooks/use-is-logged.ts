/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-08-28
 *  @Filename: use-is-logged.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import React from 'react';
import { testAuthentication } from '../actions/authenticate-api';
import useIntervalImmediate from './use-interval-immediate';

export default function useIsLogged(
  interval: number = 60000
): [boolean, () => Promise<boolean>] {
  /** Returns true if the user is authenticated for the API. */

  const [isLogged, setIsLogged] = React.useState(false);

  const checkLogged = React.useCallback(async () => {
    const response = await testAuthentication();
    setIsLogged(response);
    return response;
  }, []);

  useIntervalImmediate(checkLogged, interval);

  return [isLogged, checkLogged];
}
