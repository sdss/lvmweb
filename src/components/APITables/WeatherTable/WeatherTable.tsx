/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-21
 *  @Filename: WeatherTable.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { AlertsContext } from '@/app/overview/page';
import useAPICall from '@/src/hooks/use-api-call';
import useNow from '@/src/hooks/use-now';
import { Pill } from '@mantine/core';
import { IconCloudRain } from '@tabler/icons-react';
import React from 'react';
import APIStatusText from '../../APIStatusText/APIStatusText';
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
  relative_humidity: number;
  air_pressure: number;
  rain_intensity: number;
  station: string;
}[];

export default function WeatherTable() {
  const [weather, , noData] = useAPICall<WeatherResponse>(
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
    .replace(/\.\d+/, '');

  const elements = [
    {
      key: 'ts',
      label: 'Timestamp',
      value: timestamp ? `${timestamp} (${age} minutes ago)` : null,
    },
    {
      key: 'temperature',
      label: 'Temperature',
      value: weather?.[0]?.temperature.toFixed(1),
      unit: '°C',
    },
    {
      key: 'wind_speed_avg',
      label: 'Wind Speed (avg.)',
      value: weather?.[0]?.wind_speed_avg.toFixed(1),
      unit: ' mph',
    },
    {
      key: 'wind_dir_avg',
      label: 'Wind Direction (avg.)',
      value: weather?.[0]?.wind_dir_avg,
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
    />
  );
}
