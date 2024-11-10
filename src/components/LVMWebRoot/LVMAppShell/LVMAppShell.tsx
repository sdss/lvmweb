/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-17
 *  @Filename: LVMAppShell.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use client';

import React from 'react';
import { useCookies } from 'next-client-cookies';
import { Affix, AppShell, Box, Burger, Drawer } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import Notifications from '@/src/components/Notifications/Notifications';
import Header from './Header/Header';
import NavBar from './NavBar/NavBar';
import classes from './LVMAppShell.module.css';

export default function LVMAppShell({ children }: { children: React.ReactNode }) {
  const [drawerOpened, { close, toggle }] = useDisclosure(false);

  const isAsideLarge = useMediaQuery(`(min-width: 95rem)`);

  const [
    collapsedAside,
    { toggle: toggleAside, open: collapseAside, close: openAside },
  ] = useDisclosure(true);

  const cookies = useCookies();

  React.useEffect(() => {
    if (isAsideLarge === undefined || !isAsideLarge) {
      collapseAside();
    }
  }, [isAsideLarge]);

  React.useEffect(() => {
    const openAsideCookie = cookies.get('openAside');
    if (openAsideCookie === 'true') {
      openAside();
    }
  }, []);

  const toggleAsideCookie = React.useCallback(() => {
    if (isAsideLarge) {
      collapsedAside
        ? cookies.set('openAside', 'true')
        : cookies.set('openAside', 'false');
    }
    toggleAside();
  }, [collapsedAside]);

  return (
    <>
      <AppShell
        header={{ height: 60 }}
        navbar={{
          width: 250,
          breakpoint: 'sm',
        }}
        aside={{
          width: 320,
          breakpoint: 'md',
          collapsed: { desktop: !isAsideLarge || collapsedAside, mobile: true },
        }}
        padding="md"
        transitionDuration={500}
        transitionTimingFunction="ease"
      >
        <AppShell.Header className={classes.header}>
          <Header collapsedAside={collapsedAside} toggleAside={toggleAsideCookie} />
        </AppShell.Header>
        <AppShell.Navbar className={classes.navbar} visibleFrom="sm">
          <NavBar />
        </AppShell.Navbar>
        <AppShell.Aside className={classes.aside}>
          <Notifications />
        </AppShell.Aside>
        <AppShell.Main>{children}</AppShell.Main>
      </AppShell>
      <Drawer opened={drawerOpened} onClose={close} position="left">
        <NavBar />
      </Drawer>
      <Drawer
        opened={!isAsideLarge && !collapsedAside}
        onClose={toggleAside}
        position="right"
        size={350}
        title="Notifications"
        keepMounted
        classNames={{
          title: classes['aside-drawer-title'],
          body: classes['aside-drawer-body'],
        }}
      >
        <Notifications hideTitle />
      </Drawer>
      <Affix position={{ bottom: 30, right: 30 }} hiddenFrom="sm">
        <Box className={classes.burger}>
          <Burger opened={drawerOpened} onClick={toggle} lineSize={3} />
        </Box>
      </Affix>
    </>
  );
}
