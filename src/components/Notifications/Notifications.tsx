/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-11-08
 *  @Filename: Notifications.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use client';

import React from 'react';
import { Box, ScrollArea, Skeleton, Stack, Title } from '@mantine/core';
import useAPICall from '@/src/hooks/use-api-call';
import Notification from './Notification';

type NotificationsResponse = {
  date: string;
  message: string;
  level: 'debug' | 'info' | 'warning' | 'error' | 'critical';
};

type NotificationsProps = {
  hideTitle?: boolean;
};

export default function Notifications(props: NotificationsProps) {
  const ref = React.useRef<HTMLDivElement>(null);

  const { hideTitle = false } = props;

  const [notifications, , noData] = useAPICall<NotificationsResponse[]>(
    '/logs/notifications/0',
    {
      interval: 10000,
    }
  );

  React.useEffect(() => {
    if (noData) {
      return () => {};
    }

    const timeout = setTimeout(() => {
      ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: 'auto' });
    }, 1000);

    return () => clearTimeout(timeout);
  }, [notifications?.length, noData]);

  let elements: React.ReactNode;
  if (noData || notifications === null) {
    elements = [...Array(15).keys()].map((_, index) => <Skeleton key={index} h={80} />);
  } else {
    elements = notifications.map(({ date, message, level }, index) => (
      <Notification key={index} date={date} message={message} level={level} />
    ));
  }

  return (
    <Stack px={16} py={hideTitle ? 0 : 16} gap="xs" h="100%">
      <Box ta="center">{!hideTitle && <Title order={3}>Notifications</Title>}</Box>
      <Box style={{ flexGrow: 1 }} />
      <ScrollArea scrollbars="y" type="never" viewportRef={ref}>
        <Stack gap="sm">{elements}</Stack>
      </ScrollArea>
    </Stack>
  );
}
