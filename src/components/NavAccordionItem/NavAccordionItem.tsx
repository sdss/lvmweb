/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-08-06
 *  @Filename: NavAccordionItem.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Box, Group, Text } from '@mantine/core';
import { IconExternalLink } from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import classes from './NavAccordionItem.module.css';

type NavAccordionPropsItem = {
  value: string;
  href: string;
  external?: boolean;
};

export default function NavAccordionItem(props: NavAccordionPropsItem) {
  const { value, href, external = false } = props;

  const pathname = usePathname();
  const selected = pathname.startsWith(href);

  return (
    <Link
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
    >
      <Group className={classes.text} mod={{ selected }}>
        <Text component="div">{value}</Text>
        <Box style={{ flexGrow: 1 }} />
        {external && <IconExternalLink width={16} />}
      </Group>
    </Link>
  );
}
