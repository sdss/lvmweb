/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-11-08
 *  @Filename: Notification.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use client';

import {
  IconAlertTriangle,
  IconBug,
  IconExclamationCircle,
  IconInfoSquare,
} from '@tabler/icons-react';
import Markdown from 'react-markdown';
import { Box, Group, Paper, Stack, Text, Tooltip } from '@mantine/core';
import classes from './Notification.module.css';

function LinkRenderer(props: any) {
  return (
    <a href={props.href} target="_blank" rel="noreferrer">
      {props.children}
    </a>
  );
}

function formatDate(date: string) {
  return date.split('T')[1].split('.')[0];
}

type NotificationProps = {
  date: string;
  message: string;
  level: 'debug' | 'info' | 'warning' | 'error' | 'critical';
  style?: React.CSSProperties;
};

export default function Notification(props: NotificationProps) {
  const { date, message, level } = props;

  let icon: React.ReactNode;
  if (level === 'info') {
    icon = <IconInfoSquare size={18} color="var(--mantine-color-blue-8)" />;
  } else if (level === 'warning') {
    icon = <IconAlertTriangle size={18} color="var(--mantine-color-yellow-9)" />;
  } else if (level === 'error' || level === 'critical') {
    icon = <IconExclamationCircle size={18} color="var(--mantine-color-red-9)" />;
  } else {
    icon = <IconBug size={20} color="var(--mantine-color-gray-6)" />;
  }

  return (
    <Box style={props.style}>
      <Paper className={classes.paper} radius={5} withBorder>
        <Stack gap={0}>
          <Group className={classes.header}>
            <Text size="xs" c="dark.3" style={{ alignSelf: 'baseline' }}>
              {formatDate(date)}
            </Text>
            <Box style={{ flexGrow: 1 }} />
            <Tooltip label={level} position="left" withArrow>
              <Box>{icon}</Box>
            </Tooltip>
          </Group>
          <Text
            size="sm"
            component="div"
            className={classes.message}
            data-is-error={level === 'error' || level === 'critical'}
            ff="monospace"
          >
            <Markdown components={{ a: LinkRenderer }}>{message}</Markdown>
          </Text>
        </Stack>
      </Paper>
    </Box>
  );
}
