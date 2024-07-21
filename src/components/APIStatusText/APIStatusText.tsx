/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-20
 *  @Filename: APIStatusText.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Text } from '@mantine/core';
import React from 'react';
import classes from './APIStatusText.module.css';

export default function APIStatusText({
  children,
  error,
}: {
  children: React.ReactNode;
  error: boolean;
}) {
  console.log(error);
  return (
    <Text size="sm" className={classes.root} span data-error={error}>
      {children}
    </Text>
  );
}
