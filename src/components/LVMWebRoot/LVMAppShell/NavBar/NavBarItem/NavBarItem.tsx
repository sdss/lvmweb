/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-16
 *  @Filename: NavBarItem.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use client';

import { Box, Group, ThemeIcon, Title } from '@mantine/core';
import { IconExternalLink } from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactElement } from 'react';
import classes from './NavBarItem.module.css';

type NavBarItemProps = {
  path: string;
  icon: ReactElement;
  text: string;
  external?: boolean;
  newWindow?: boolean;
};

export default function NavBarItem(props: NavBarItemProps) {
  const { path, icon, text, external = false, newWindow = false } = props;

  const pathname = usePathname();

  return (
    <Box
      component={Link}
      href={path}
      target={newWindow ? '_blank' : undefined}
      rel={newWindow ? 'noopener noreferrer' : undefined}
      className={classes.root}
      mod={{ selected: pathname.includes(path) }}
    >
      <Group align="center" gap={8}>
        <ThemeIcon size="lg" className={classes.theme_icon}>
          {icon}
        </ThemeIcon>
        <Title order={5} className={classes.title}>
          {text}
        </Title>
        <Box style={{ flexGrow: 1 }} />
        {external && (
          <ThemeIcon size="sm" variant="transparent" c="dark.0">
            <IconExternalLink />
          </ThemeIcon>
        )}
      </Group>
    </Box>
  );
}
