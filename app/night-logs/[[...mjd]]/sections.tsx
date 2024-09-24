/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-09-23
 *  @Filename: sections.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import React from 'react';
import { IconPlus } from '@tabler/icons-react';
import {
  ActionIcon,
  Box,
  Button,
  CloseButton,
  Group,
  Modal,
  Paper,
  Stack,
  Text,
  Textarea,
  Title,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import fetchFromAPI from '@/src/actions/fetch-from-API';
import { NightLogComment, NightLogData } from './page';
import classes from './night-logs.module.css';

type DeleteCommentModalProps = {
  pk: number;
  opened: boolean;
  close: () => void;
};

function DeleteCommentModal(props: DeleteCommentModalProps) {
  const { pk, opened, close } = props;

  const [loading, setLoading] = React.useState(false);

  const deleteComment = React.useCallback(() => {
    // Delete comment

    setLoading(true);

    fetchFromAPI(`/logs/night-logs/comments/delete/${pk}`)
      .then(() => close())
      .finally(() => setLoading(false));
  }, [pk]);

  return (
    <Modal
      opened={opened}
      onClose={close}
      title="Are you sure you want to delete this comment?"
      size="md"
    >
      {/* <Text>Are you sure you want to delete this comment?</Text> */}
      <Group mt="md" justify="flex-end">
        <Button onClick={close} variant="default">
          Cancel
        </Button>
        <Button onClick={deleteComment} loading={loading}>
          Delete
        </Button>
      </Group>
    </Modal>
  );
}

function formatDate(date: string) {
  const d = new Date(date);
  return d.toUTCString();
}

type CommentProps = {
  pk: number;
  date: string;
  text: string;
  refresh: () => void;
  current: boolean;
};

function Comment(props: CommentProps) {
  const { pk, date, text, refresh, current } = props;

  const [opened, { open, close }] = useDisclosure(false, { onClose: refresh });

  return (
    <>
      <Paper className={classes['comment-paper']} radius={5} withBorder>
        <Group className={classes['comment-header']}>
          <Text size="xs" c="dark.3">
            {formatDate(date)}
          </Text>
          <Box style={{ flexGrow: 1 }} />
          {current && (
            <Tooltip label="Delete comment">
              <CloseButton
                size="sm"
                mt={2}
                style={{ alignSelf: 'start' }}
                onClick={open}
              />
            </Tooltip>
          )}
        </Group>
        <Text>{text}</Text>
      </Paper>
      <DeleteCommentModal pk={pk} opened={opened} close={close} />
    </>
  );
}

type AddCommentModalProps = {
  mjd: number;
  category: string;
  opened: boolean;
  close: () => void;
};

function AddCommentModal(props: AddCommentModalProps) {
  const { mjd, opened, category, close } = props;

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const ref = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    setError(null);
  }, [opened]);

  const submitComment = React.useCallback(() => {
    // Submit comment

    const comment = ref.current?.value;
    if (!comment) {
      setError('Comment cannot be empty.');
      return;
    }

    setLoading(true);
    fetchFromAPI('/logs/night-logs/comments/add', {
      method: 'POST',
      body: JSON.stringify({ mjd, category, comment }),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then(() => close())
      .catch(() => setError('Failed to submit comment.'))
      .finally(() => setLoading(false));
  }, [mjd, category]);

  return (
    <Modal opened={opened} onClose={close} title="Add comment" size="lg">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submitComment();
        }}
      >
        <Textarea
          placeholder="Enter comment"
          error={error}
          ref={ref}
          onChange={() => setError(null)}
          data-autofocus
        />
        <Group justify="flex-end" mt="md">
          <Button onClick={close} variant="default">
            Cancel
          </Button>
          <Button onClick={submitComment} loading={loading}>
            Submit
          </Button>
        </Group>
      </form>
    </Modal>
  );
}

type SectionProps = {
  title: string;
  category: string;
  data: NightLogComment[];
  mjd: number;
  refresh: () => void;
  current: boolean;
};

function Section(props: SectionProps) {
  const { title, category, data, mjd, refresh, current } = props;

  const [opened, { open, close }] = useDisclosure(false, { onClose: refresh });

  return (
    <>
      <Stack gap="sm">
        <Box w="100%">
          <Group>
            <Title order={3}>{title}</Title>
            <Box style={{ flexGrow: 1 }} />
            <Tooltip label="Add comment">
              <ActionIcon
                radius="xl"
                variant="light"
                className={classes['add-icon']}
                onClick={open}
              >
                <IconPlus />
              </ActionIcon>
            </Tooltip>
          </Group>
          <hr className={classes.line} />
        </Box>
        {data.length > 0 ? (
          data.map(({ pk, date, comment }) => (
            <Comment
              key={pk}
              pk={pk}
              date={date}
              text={comment}
              refresh={refresh}
              current={current}
            />
          ))
        ) : (
          <Text size="sm" fs="italic">
            No comments yet.
          </Text>
        )}
      </Stack>
      <AddCommentModal mjd={mjd} category={category} opened={opened} close={close} />
    </>
  );
}

type SectionsProps = {
  data: NightLogData;
  mjd: number | null;
  refresh: () => void;
  current: boolean;
};

export default function Sections(props: SectionsProps) {
  const { data, mjd, refresh, current } = props;

  if (mjd === null) {
    return null;
  }

  return (
    <Stack gap={50}>
      <Section
        title="Weather"
        category="weather"
        data={data.comments.weather}
        mjd={mjd}
        refresh={refresh}
        current={current}
      />
      <Section
        title="Issues/bugs"
        category="issues"
        data={data.comments.issues}
        mjd={mjd}
        refresh={refresh}
        current={current}
      />
      <Section
        title="Other"
        category="other"
        data={data.comments.other}
        mjd={mjd}
        refresh={refresh}
        current={current}
      />
    </Stack>
  );
}
