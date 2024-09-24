/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-17
 *  @Filename: LVMAppShell.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use client';

import React from 'react';
import { ActionIcon, Affix, AppShell, Burger, Drawer } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Header from './Header/Header';
import NavBar from './NavBar/NavBar';
import classes from './LVMAppShell.module.css';

export default function LVMAppShell({ children }: { children: React.ReactNode }) {
  const [drawerOpened, { close, toggle }] = useDisclosure(false);

  return (
    <>
      <AppShell
        header={{ height: 60 }}
        navbar={{
          width: 250,
          breakpoint: 'sm',
        }}
        padding="md"
      >
        <AppShell.Header className={classes.header}>
          <Header />
        </AppShell.Header>
        <AppShell.Navbar className={classes.navbar} visibleFrom="sm">
          <NavBar />
        </AppShell.Navbar>
        <AppShell.Main>{children}</AppShell.Main>
      </AppShell>
      <Drawer opened={drawerOpened} onClose={close} position="left">
        <NavBar />
      </Drawer>
      <Affix position={{ bottom: 30, right: 30 }} hiddenFrom="sm">
        <ActionIcon radius="xl" size="xl" variant="filled">
          <Burger opened={drawerOpened} onClick={toggle} lineSize={3} />
        </ActionIcon>
      </Affix>
    </>
  );
}
