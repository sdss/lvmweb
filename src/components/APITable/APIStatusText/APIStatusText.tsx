/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-20
 *  @Filename: APIStatusText.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import React from 'react';
import { Text, Tooltip } from '@mantine/core';
import classes from './APIStatusText.module.css';

type APIStatusTextProps = {
  nodata?: boolean;
  error?: boolean;
  errorTooltipText?: string;
  defaultTooltipText?: string;
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  style?: React.CSSProperties;
};

export default function APIStatusText(props: APIStatusTextProps) {
  const {
    nodata = false,
    error = false,
    errorTooltipText,
    defaultTooltipText,
    children,
    size = 'sm',
    color,
    style,
  } = props;

  const tooltipText = React.useMemo(() => {
    if (error) {
      return errorTooltipText || 'Unknown error';
    }

    if (nodata) {
      return 'Failed to fetch data';
    }

    return defaultTooltipText;
  }, [defaultTooltipText, errorTooltipText, error, nodata]);

  return (
    <Tooltip label={tooltipText} hidden={!tooltipText}>
      <Text
        size={size}
        className={classes.root}
        style={style}
        span
        data-nodata={nodata}
        data-error={error}
        c={!nodata && !error ? color : 'undefined'}
      >
        {children}
      </Text>
    </Tooltip>
  );
}
