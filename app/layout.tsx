import { Header } from '@/components/Header/Header';
import { theme } from '@/theme';
import {
  AppShell,
  AppShellHeader,
  AppShellMain,
  AppShellNavbar,
  Button,
  ColorSchemeScript,
  MantineProvider,
} from '@mantine/core';
import '@mantine/core/styles.css';
import Link from 'next/link';

export const metadata = {
  title: 'Mantine Next.js template',
  description: 'I am using Mantine with Next.js!',
};

export default function RootLayout({ children }: { children: any }) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body>
        <MantineProvider theme={theme}>
          <AppShell
            header={{ height: 60 }}
            navbar={{
              width: 300,
              breakpoint: 'sm',
            }}
            padding="md"
          >
            <AppShellHeader>
              <Header />
            </AppShellHeader>
            <AppShellNavbar p="md">
              <Button component={Link} href="/">
                Home
              </Button>
              <Button component={Link} href="/summary">
                Summary
              </Button>
            </AppShellNavbar>
            <AppShellMain>{children}</AppShellMain>
          </AppShell>
        </MantineProvider>
      </body>
    </html>
  );
}
