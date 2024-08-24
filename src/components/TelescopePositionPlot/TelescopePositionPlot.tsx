/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-08-18
 *  @Filename: TelescopePositionPlot.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

// Adapted from https://airbnb.io/visx/lineradial

import useAPICall from '@/src/hooks/use-api-call';
import { Tooltip } from '@mantine/core';
import { AxisLeft } from '@visx/axis';
import { LinearGradient } from '@visx/gradient';
import { GridAngle, GridRadial } from '@visx/grid';
import { Group } from '@visx/group';
import { scaleLinear } from '@visx/scale';
import React from 'react';

const green = '#e5fd3d';
export const blue = '#aeeef8';
export const background = '#744cca';
const strokeColor = '#744cca';

type TelescopeCoordinates = {
  alt: number;
  az: number;
  ra: number;
  dec: number;
};

type Telescopes = 'sci' | 'spec' | 'skye' | 'skyw';

export type TelescopesCoordinates = {
  [tel in Telescopes]: TelescopeCoordinates;
};

// scales (just for the grids)
const xScale = scaleLinear<number>({
  range: [0, Math.PI * 2],
  domain: [0, Math.PI * 2],
});

const yScale = scaleLinear<number>({
  domain: [90, 30],
});

const defaultSizes = {
  large: [1000, 1000, 20],
  small: [250, 250, 10],
};

const telescopeEmojis: { [tel in Telescopes]: string } = {
  sci: '🔭',
  spec: '⭐️',
  skye: '⚫️',
  skyw: '⬛️',
};

const telescopeToName: { [tel in Telescopes]: string } = {
  sci: 'Science',
  spec: 'Spec',
  skye: 'Sky-E',
  skyw: 'Sky-W',
};

type TelescopePositionPlotProps = {
  size?: 'large' | 'small';
};

export default function TelescopePositionPlot(props: TelescopePositionPlotProps) {
  const { size = 'large' } = props;
  const [width, height, padding] = defaultSizes[size];

  const [coordinates, , , refresh] = useAPICall<TelescopesCoordinates>(
    '/telescopes/coordinates',
    { interval: 30000 }
  );

  const polar_to_cartesian = React.useCallback(
    (r: number, theta: number) => {
      // r is 0 at 90 deg and 1 at 30 deg
      const rr = 3 / 2 - r / 60;
      // theta is in degrees, convert to radians and rotate for North up, East left
      const tt = -(Math.PI / 180) * theta - Math.PI / 2;

      return {
        x: rr * Math.cos(tt) * (width / 2 - padding),
        y: rr * Math.sin(tt) * (height / 2 - padding),
      };
    },
    [width, height, padding]
  );

  const azTicks = React.useMemo(() => {
    const ticks = ['N', 'E', 'S', 'W'];
    const values = [0, 90, 180, 270];
    return ticks.map((tick, i) => {
      const { x, y } = polar_to_cartesian(28.5, values[i]);
      return [x, y, tick];
    });
  }, [padding]);

  const telCoordinates = React.useMemo(() => {
    if (!coordinates) return {};

    const valid = Object.fromEntries(
      Object.entries(coordinates).filter(([tel, value]) => value.alt > 30)
    );

    return Object.fromEntries(
      Object.entries(valid).map(([tel, value]) => [
        tel,
        polar_to_cartesian(value.alt, value.az),
      ])
    );
  }, [coordinates]);

  // Set the scale for the figure size and reverse it for the grid.
  yScale.range([0, height / 2 - padding]);
  const reverseYScale = yScale.copy().range(yScale.range().reverse());

  return (
    <svg width={width} height={height} onClick={refresh}>
      <LinearGradient from={green} to={blue} id="line-gradient" />
      <rect width={width} height={height} fill="transparent" rx={14} />
      <Group top={height / 2} left={width / 2}>
        <GridAngle
          scale={xScale}
          outerRadius={height / 2 - padding}
          stroke={green}
          strokeWidth={1}
          strokeOpacity={0.3}
          strokeDasharray="5,2"
          tickValues={[...Array(8)].map((_, i) => (i / 4) * Math.PI)}
        />
        <GridRadial
          scale={reverseYScale}
          numTicks={7}
          stroke={blue}
          strokeWidth={1}
          fill={blue}
          fillOpacity={0.1}
          strokeOpacity={0.2}
        />
        <AxisLeft
          top={-height / 2 + padding}
          scale={reverseYScale}
          numTicks={7}
          tickStroke="none"
          tickLabelProps={{
            fontSize: 10,
            fill: blue,
            fillOpacity: 1,
            textAnchor: 'middle',
            dx: '1em',
            dy: '-0.5em',
            stroke: strokeColor,
            strokeWidth: 0.5,
            paintOrder: 'stroke',
          }}
          tickValues={size === 'large' ? [40, 50, 60, 70, 80] : []}
          hideAxisLine
        />
        {size === 'large' &&
          azTicks.map(([x, y, tick]) => (
            <text
              key={tick}
              x={x}
              y={y}
              fontSize={14}
              fontWeight={700}
              textAnchor="middle"
              fill={blue}
              fillOpacity={1}
              dy="0.25em"
            >
              {tick}
            </text>
          ))}
        {Object.entries(telCoordinates).map(([tel, { x, y }]) => (
          <Group key={`telescope-Group-${tel}`}>
            <Tooltip
              label={telescopeToName[tel as Telescopes]}
              key={`telescope-tooltip-${tel}`}
            >
              <text
                key={`telescope-emoji-${tel}`}
                x={x}
                y={y}
                fontSize={size === 'large' ? 30 : 15}
                textAnchor="middle"
                fill={green}
                fillOpacity={1}
                dy="0.25em"
              >
                {telescopeEmojis[tel as Telescopes]}
              </text>
            </Tooltip>
            {size === 'large' && (
              <text
                key={`telescope-name-${tel}`}
                x={x}
                y={y + 25}
                fontSize={20}
                textAnchor="middle"
                fill={green}
                fillOpacity={1}
                dy="0.25em"
              >
                {telescopeToName[tel as Telescopes]}
              </text>
            )}
          </Group>
        ))}
      </Group>
    </svg>
  );
}
