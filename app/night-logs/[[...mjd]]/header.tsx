/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-09-23
 *  @Filename: header.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use client';

import { Group, NativeSelect, SegmentedControl, Tooltip } from '@mantine/core';
import { NightLogMode } from './page';

type HeaderProps = {
  mjd: number | null;
  mjds: number[];
  mode: NightLogMode | null;
  setMode: (mode: NightLogMode) => void;
  setMJD: (mjd: number) => void;
};

export default function Header(props: HeaderProps) {
  const { mjd, mjds, mode, setMode, setMJD } = props;

  return (
    <Group gap="sm">
      {mode === 'history' && (
        <Tooltip label="Select MJD">
          <NativeSelect
            data={mjds.map((m) => m.toString())}
            value={mjd?.toString()}
            onChange={(event) => setMJD(parseInt(event.currentTarget.value, 10))}
          />
        </Tooltip>
      )}
      <SegmentedControl
        data={[
          { label: 'Tonight', value: 'tonight' },
          { label: 'History', value: 'history' },
        ]}
        value={mode || 'tonight'}
        onChange={(value) => setMode(value as NightLogMode)}
      />
    </Group>
  );
}
