/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-16
 *  @Filename: NavBar.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use client';

import { Stack } from '@mantine/core';
import { IconCloudRain, IconHome, IconLogs, IconNotebook } from '@tabler/icons-react';
import NavBarItem from './NavBarItem/NavBarItem';

export default function NavBar() {
  return (
    <Stack p={8} mt={2} gap="xs">
      <NavBarItem path="/overview" icon={<IconHome />} text="Overview" />
      <NavBarItem path="/gort-log" icon={<IconNotebook />} text="GORT Log" />
      <NavBarItem path="/night-log" icon={<IconLogs />} text="Night Log" />
      <NavBarItem
        path="http://lco.cl/weather"
        icon={<IconCloudRain />}
        text="Weather"
        external
        newWindow
      />
    </Stack>
  );
}
