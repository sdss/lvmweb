'use client';

import { ActionIcon, Box, Group, Image, Title, Tooltip } from '@mantine/core';
import { IconSquareX } from '@tabler/icons-react';
import Link from 'next/link';
import React from 'react';
import classes from './Header.module.css';

export default function Header() {
  React.useEffect(() => {
    console.log('loading');
  }, []);

  return (
    <Box className={classes.root}>
      <Group className={classes.group}>
        <Link href="/">
          <Group>
            <Image src="/lvm_logo.png" h={50} />
            <Title order={3} className={classes.title}>
              LVM Web
            </Title>
          </Group>
        </Link>
        <div style={{ flexGrow: 1 }} />
        <Tooltip label="Emergency shutdown" position="bottom">
          <ActionIcon size="lg" color="red.9">
            <IconSquareX />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Box>
  );
}
