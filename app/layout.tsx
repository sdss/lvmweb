/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-26
 *  @Filename: layout.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import '@/src/variables.css';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

import { CookiesProvider } from 'next-client-cookies/server';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import LVMWebRoot from '@/src/components/LVMWebRoot/LVMWebRoot';
import { theme } from '@/src/theme';
import LVMWebHeartbeat from './heartbeat';

export const metadata = {
  title: 'LVM Web',
  description: 'Overview of LVM operations',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ColorSchemeScript defaultColorScheme="dark" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />
        <meta
          name="viewport"
          content="minimum-scale=1,initial-scale=1,width=device-width,user-scalable=no"
        />
      </head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="dark">
          <Notifications position="bottom-left" />
          <CookiesProvider>
            <LVMWebRoot>{children}</LVMWebRoot>
            <LVMWebHeartbeat />
          </CookiesProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
