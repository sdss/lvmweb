/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-16
 *  @Filename: page.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use client';

import React from 'react';
// import { getEphemeris } from './server';

export default function SummaryPage() {
  const [currentJD, setCurrentJD] = React.useState<number>();

  // React.useEffect(() => {
  //   console.log('aaaaa');
  //   getEphemeris().then((data) => {
  //     console.log(data);
  //     setCurrentJD(data.request_jd);
  //   });
  //   getEphemeris().then((data) => {
  //     console.log(data);
  //     setCurrentJD(data.request_jd);
  //   });
  // }, []);
  // useInterval(() => {
  //   console.log('here');
  //   getEphemeris().then((data) => {
  //     console.log(data);
  //     setCurrentJD(data.request_jd);
  //   });
  // }, 20000);

  return <>Weather {currentJD}</>;
}
