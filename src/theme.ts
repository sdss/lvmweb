'use client';

import { createTheme } from '@mantine/core';

export const theme = createTheme({
  /* Put your mantine theme override here */
  colors: {
    blue: [
      '#eef3ff',
      '#dce4f5',
      '#b9c7e2',
      '#94a8d0',
      '#748dc1',
      '#5f7cb8',
      '#5474b4',
      '#44639f',
      '#39588f',
      '#2d4b81',
    ],
  },
  scale: 1.1,
  breakpoints: {
    xs: '30em',
    sm: '40em',
    md: '54em',
    lg: '84em',
    xl: '114em',
  },
});
