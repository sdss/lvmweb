/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-16
 *  @Filename: NavBarItem.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use client';

import { Box, Group, ThemeIcon, Title } from '@mantine/core';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactElement } from 'react';
import classes from './NavBarItem.module.css';

type NavBarItemProps = {
  path: string;
  icon: ReactElement;
  text: string;
};

export default function NavBarItem(props: NavBarItemProps) {
  const { path, icon, text } = props;

  const pathname = usePathname();

  return (
    <Box
      component={Link}
      href={path}
      className={classes.root}
      mod={{ selected: pathname === path }}
    >
      <Group align="center" gap={8}>
        <ThemeIcon size="lg" className={classes.theme_icon}>
          {icon}
        </ThemeIcon>
        <Title order={5} className={classes.title}>
          {text}
        </Title>
      </Group>
    </Box>
  );
}
