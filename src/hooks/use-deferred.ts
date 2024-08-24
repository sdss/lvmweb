/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-25
 *  @Filename: use-deferred.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import React from 'react';

export type DeferredPromise<DeferType> = {
  resolve: (value: DeferType) => void;
  reject: (value: unknown) => void;
  promise: Promise<DeferType>;
};

export default function useDeferredPromise<DeferType>() {
  /** Creates a deferred promise.
   *
   * Taken from https://dev.to/vicnovais/creating-a-deferred-promise-hook-in-react-39jh
   *
   */

  const deferRef = React.useRef<DeferredPromise<DeferType> | null>(null);

  const defer = () => {
    const deferred = {} as DeferredPromise<DeferType>;

    const promise = new Promise<DeferType>((resolve, reject) => {
      deferred.resolve = resolve;
      deferred.reject = reject;
    });

    deferred.promise = promise;
    deferRef.current = deferred;
    return deferRef.current;
  };

  return { defer, deferRef: deferRef.current };
}
