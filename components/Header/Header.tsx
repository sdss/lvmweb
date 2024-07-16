'use client';

import { Text, Title } from '@mantine/core';
import React from 'react';
import classes from './Header.module.css';

export function Header() {
  React.useEffect(() => {
    console.log('loading');
  }, []);

  return (
    <>
      <Title className={classes.title} ta="center">
        Welcome to{' '}
        <Text inherit variant="gradient" component="span" gradient={{ from: 'pink', to: 'yellow' }}>
          Mantine
        </Text>
      </Title>
    </>
  );
}
