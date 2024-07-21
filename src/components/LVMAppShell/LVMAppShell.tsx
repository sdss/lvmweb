/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-17
 *  @Filename: LVMAppShell.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use client';

import { AppShell } from '@mantine/core';
import React from 'react';
import Header from '../Header/Header';
import NavBar from '../NavBar/NavBar';
import classes from './LVMAppShell.module.css';

export default function LVMAppShell({ children }: { children: React.ReactNode }) {
  return (
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
  );
}
