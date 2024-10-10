/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-10-10
 *  @Filename: page.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Image } from '@mantine/core';
import getSystemFile from '@/src/actions/get-system-image';

function ImageFile(props: { path: string | null }) {
  const [data, setData] = React.useState<string | null>(null);
  const [fullWidth, setFullWidth] = React.useState(true);

  React.useEffect(() => {
    if (!props.path) {
      return;
    }

    getSystemFile(props.path)
      .then((data) => {
        setData(data);
      })
      .catch(() => {
        setData(null);
      });
  }, [props.path]);

  if (!data) {
    return null;
  }

  return (
    <Image
      src={`data:image/png;base64,${data}`}
      style={{ width: fullWidth ? '100%' : 'unset' }}
      onClick={() => setFullWidth((current) => !current)}
    />
  );
}

function FilePath() {
  const params = useSearchParams();

  const type = params.get('type');
  const path = params.get('path');

  if (type === 'image') {
    return <ImageFile path={path} />;
  }

  return null;
}

export default function FilePage() {
  <Suspense fallback={<div>Loading...</div>}>
    <FilePath />
  </Suspense>;
}
