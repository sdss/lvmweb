/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-21
 *  @Filename: WeatherTable.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use client';

import { AlertsContext } from '@/src/components/LVMWebRoot/LVMWebRoot';
import useAPICall from '@/src/hooks/use-api-call';
import useNow from '@/src/hooks/use-now';
import { Pill } from '@mantine/core';
import { IconCloudRain } from '@tabler/icons-react';
import React from 'react';
import APIStatusText from '../../APITable/APIStatusText/APIStatusText';
import APITable from '../../APITable/APITable';

type WeatherResponse = {
  ts: string;
  temperature: number;
  wind_dir_min: number;
  wind_dir_avg: number;
  wind_dir_max: number;
  wind_speed_min: number;
  wind_speed_avg: number;
  wind_speed_max: number;
  wind_speed_avg_5m: number;
  wind_speed_avg_30m: number;
  wind_dir_avg_5m: number;
  wind_gust_5m: number;
  relative_humidity: number;
  air_pressure: number;
  rain_intensity: number;
  station: string;
}[];

function colourWindSpeed(speed: number | undefined) {
  if (speed === undefined) return null;

  let color: string | undefined = undefined;
  if (speed >= 35) {
    color = 'red.8';
  } else if (speed >= 30) {
    color = 'yellow.8';
  }

  return <APIStatusText color={color}>{speed.toFixed(1)} mph</APIStatusText>;
}

export default function WeatherTable() {
  const [weather, , noData, refresh] = useAPICall<WeatherResponse>(
    '/weather/report?delta_time=600&last=true',
    { interval: 60000 }
  );

  const alerts = React.useContext(AlertsContext);
  const now = useNow({ asString: false, delay: 10000 });

  const age = React.useMemo(() => {
    if (!weather || !now) return null;

    const diff = new Date(now.getTime() - new Date(`${weather[0].ts}Z`).getTime());

    const minutes = diff.getUTCMinutes() + diff.getUTCHours() * 60;
    return minutes;
  }, [weather, now]);

  const timestamp = weather?.[0]?.ts
    .replace(/T/, ' ')
    .replace(/Z/, '')
    .replace(/\.\d+/, '')
    .split(' ')[1];

  const elements = [
    {
      key: 'ts',
      label: 'Timestamp',
      value: timestamp ? `${timestamp} (${age} min. ago)` : null,
    },
    {
      key: 'temperature',
      label: 'Temperature',
      value: weather?.[0]?.temperature.toFixed(1),
      unit: '°C',
    },
    {
      key: 'wind_speed_avg',
      label: 'Wind Speed (5m avg.)',
      value: weather?.[0]?.wind_speed_avg_5m.toFixed(1),
      unit: ' mph',
    },
    {
      key: 'wind_speed_30m',
      label: 'Wind Speed (30m avg.)',
      value: colourWindSpeed(weather?.[0]?.wind_speed_avg_30m),
    },
    {
      key: 'wind_gust',
      label: 'Wind Gust (1m max.)',
      value: weather?.[0]?.wind_speed_max.toFixed(1),
      unit: ' mph',
    },
    {
      key: 'wind_dir_avg',
      label: 'Wind Dir. (5m avg.)',
      value: weather?.[0]?.wind_dir_avg_5m.toFixed(1),
      unit: ' degrees',
    },
    {
      key: 'relative_humidity',
      label: 'Relative Humidity',
      value: weather?.[0]?.relative_humidity,
      unit: '%',
    },
    {
      key: 'rain_alert',
      label: 'Rain alert',
      value: alerts?.rain ? (
        <Pill bg="red.9">
          <APIStatusText size="xs">Yes</APIStatusText>
        </Pill>
      ) : (
        'No'
      ),
    },
    {
      key: 'station',
      label: 'Station',
      value: weather?.[0]?.station,
    },
  ];

  return (
    <APITable
      title="Weather"
      elements={elements}
      noData={noData}
      icon={<IconCloudRain />}
      refreshData={refresh}
    />
  );
}
