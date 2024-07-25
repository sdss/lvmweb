'use client';

import { Box, Group, Image, Title } from '@mantine/core';
import Link from 'next/link';
import ShutdownActionIcon from '../ShutdownActionIcon/ShutdownActionIcon';
import classes from './Header.module.css';

export default function Header() {
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
        <ShutdownActionIcon />
      </Group>
    </Box>
  );
}
