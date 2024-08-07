/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-18
 *  @Filename: use-api-call.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import React from 'react';
import fetchFromAPI from '../actions/fetch-from-API';
import useIntervalImmediate from './use-interval-immediate';

export type UseAPICallOptions = {
  baseURL?: string;
  interval?: number;
};

export type UseAPICallResponse<T> = [
  data: T | null,
  status: APICallStatus,
  boolean,
  () => void,
];

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
  const [noData, setNoData] = React.useState<boolean>(true);
  const [status, setStatus] = React.useState<APICallStatus>(APICallStatus.NODATA);

  React.useEffect(() => {
    // Once the status changes to ERROR, do not change it back until a explicit OK.

    if (status === APICallStatus.ERROR) {
      setNoData(true);
    } else if (status === APICallStatus.OK) {
      setNoData(false);
    }
  }, [status]);

  const callback = React.useCallback(() => {
    fetchFromAPI<T>(route, baseURL)
      .then((dd) => {
        setData(dd);
        setStatus(APICallStatus.OK);
      })
      .catch(() => {
        setStatus(APICallStatus.ERROR);
      });
  }, [baseURL, route]);

  useIntervalImmediate(() => {
    setStatus(APICallStatus.FETCHING);
    callback();
  }, interval);

  return [data, status, noData, () => callback()];
}
