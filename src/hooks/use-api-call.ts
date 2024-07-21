/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-18
 *  @Filename: use-api-call.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import React from 'react';
import fetchFromAPI from '../actions/fetchFromAPI';
import useIntervalImmediate from './use-interval-immediate';

export type UseAPICallOptions = {
  baseURL?: string;
  interval?: number;
};

export type UseAPICallResponse<T> = [data: T | null, status: APICallStatus];

export enum APICallStatus {
  OK,
  NODATA,
  FETCHING,
  ERROR,
}

export default function useAPICall<T>(
  route: string,
  options: UseAPICallOptions
): UseAPICallResponse<T> {
  /** Performs an API call on an interval. */

  const { baseURL, interval = 5000 } = options;

  const [data, setData] = React.useState<T | null>(null);
  const [status, setStatus] = React.useState<APICallStatus>(APICallStatus.NODATA);

  useIntervalImmediate(() => {
    setStatus(APICallStatus.FETCHING);
    fetchFromAPI<T>(route, baseURL)
      .then((data) => {
        setData(data);
        setStatus(APICallStatus.OK);
      })
      .catch((err) => {
        setStatus(APICallStatus.ERROR);
      });
  }, interval);

  return [data, status];
}
