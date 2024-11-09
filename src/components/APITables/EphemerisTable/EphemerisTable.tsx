/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-20
 *  @Filename: EphemerisTable.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use client';

import React from 'react';
import { IconSunrise } from '@tabler/icons-react';
import { Progress, Tooltip } from '@mantine/core';
import useAPICall from '@/src/hooks/use-api-call';
import useNow from '@/src/hooks/use-now';
import booleanYesNo from '@/src/tools/boolean-yes-no';
import JDToISO from '@/src/tools/jd-to-iso';
import APIStatusText from '../../APITable/APIStatusText/APIStatusText';
import APITable from '../../APITable/APITable';

type EphemerisResponse = {
  SJD: number;
  request_jd: number;
  date: string;
  sunset: number;
  twilight_end: number;
  twilight_start: number;
  sunrise: number;
  is_night: boolean;
  is_twilight: boolean;
  time_to_sunset: number;
  time_to_sunrise: number;
  moon_illumination: number;
  from_file: boolean;
};

function hoursToHoursMin(hours: number | undefined) {
  if (!hours) {
    return undefined;
  }

  const sign = hours < 0 ? '-' : '';
  const h = Math.floor(Math.abs(hours));

  const hString = h.toString().padStart(2, '0');
  const mString = Math.round((Math.abs(hours) - h) * 60)
    .toString()
    .padStart(2, '0');

  return `${sign}${hString}:${mString}`;
}

function JDToUnix(jd: number) {
  return (jd - 2440587.5) * 86400000; // Unix time in milliseconds
}

type NightProgressProps = { ephemeris: EphemerisResponse | null; noData: boolean };

function NightProgress(props: NightProgressProps) {
  const { ephemeris, noData } = props;

  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    if (!ephemeris) {
      return;
    }

    const now = Date.now();
    const sunset = JDToUnix(ephemeris.twilight_end);
    const sunrise = JDToUnix(ephemeris.twilight_start);

    if (now < sunset) {
      setProgress(0);
    } else {
      setProgress(((now - sunset) / (sunrise - sunset)) * 100);
    }
  }, [ephemeris]);

  let tooltipLabel = '';
  if (progress <= 0) {
    return <APIStatusText nodata={noData}>Night has not started</APIStatusText>;
  } else if (progress >= 100) {
    tooltipLabel = 'Night has ended';
  } else {
    const now = Date.now();
    const sunrise = JDToUnix(ephemeris?.twilight_start || 0);

    const hours = (sunrise - now) / 3600000;
    tooltipLabel = `${progress.toFixed(1)}% complete / ${hoursToHoursMin(hours)} to twilight`;
  }

  return (
    <Tooltip label={tooltipLabel}>
      <Progress
        value={noData ? 100 : progress}
        color={progress >= 100 ? 'lime.9' : 'blue'}
        w="70%"
        animated={!ephemeris || noData}
      />
    </Tooltip>
  );
}

export default function EphemerisTable() {
  const [ephemeris, , noData, refresh] = useAPICall<EphemerisResponse>(
    '/ephemeris/summary',
    {
      interval: 30000,
    }
  );

  const now = useNow({ precision: 0 });

  const elements = [
    { key: 'sjd', label: 'SJD', value: ephemeris?.SJD },
    { key: 'request_jd', label: 'Current JD', value: ephemeris?.request_jd.toFixed(5) },
    { key: 'iso_date', label: 'ISO Date', value: now },
    {
      key: 'night_progress',
      label: 'Night Progress',
      value: <NightProgress ephemeris={ephemeris} noData={noData} />,
    },
    { key: 'sunset', label: 'Sunset', value: JDToISO(ephemeris?.sunset) },
    {
      key: 'twilight_end',
      label: 'Sunset Twilight (-15\u00B0)',
      value: JDToISO(ephemeris?.twilight_end),
    },
    {
      key: 'twilight_start',
      label: 'Sunrise Twilight (-15\u00B0)',
      value: JDToISO(ephemeris?.twilight_start),
    },
    {
      key: 'sunrise',
      label: 'Sunrise',
      value: JDToISO(ephemeris?.sunrise),
    },
    { key: 'is_night', label: 'Is Night?', value: booleanYesNo(ephemeris?.is_night) },
    {
      key: 'is_twilight',
      label: 'Is Twilight?',
      value: booleanYesNo(ephemeris?.is_twilight),
    },
    {
      key: 'time_to_sunset',
      label: 'Time to Sunset',
      value: hoursToHoursMin(ephemeris?.time_to_sunset),
      unit: ' hours',
    },
    {
      key: 'time_to_sunrise',
      label: 'Time to Sunrise',
      value: hoursToHoursMin(ephemeris?.time_to_sunrise),
      unit: ' hours',
    },
    {
      key: 'moon_illumination',
      label: 'Moon Illumination',
      value: ephemeris?.moon_illumination,
    },
  ];

  return (
    <APITable
      title="Ephemeris"
      elements={elements}
      noData={noData}
      icon={<IconSunrise />}
      refreshData={refresh}
    />
  );
}
