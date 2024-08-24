/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-18
 *  @Filename: use-interval-immediate.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import React from 'react';
import { useInterval } from 'react-use';

export default function useIntervalImmediate(callback: Function, delay: number) {
  /** A simple wrapper around useInterval that runs the callback once initially. */

  // Initial call
  React.useEffect(() => {
    callback();
  }, []);

  // Subsequent calls. The first call starts after delay ms.
  useInterval(callback, delay);
}
