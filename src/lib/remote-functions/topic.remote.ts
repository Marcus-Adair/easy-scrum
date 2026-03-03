import { command } from '$app/server';
import { updateTopic, createTopic, deleteTopic } from '$lib/server/api';
import z from 'zod';

const colorSchema = z.enum(['pink', 'yellow', 'blue', 'orange', 'salmon', 'red', 'green', 'white', 'purple']);

export const createNewTopic = command(
  z.object({
    scrumSessionId: z.string(),
    topicName: z.string(),
    color: colorSchema,
    rowIdx: z.number(),
  }),
  async (input) => {
    await createTopic(
      {
        scrumSessionId: input.scrumSessionId,
        topicName: input.topicName,
        color: input.color,
        rowIdx: input.rowIdx,
      }
    );
  }
);

export const updateTopicName = command(
    z.object({
      id: z.string(),
      topicName: z.string(),
    }),
    async (input) => {
      await updateTopic(input.id, { topicName: input.topicName });
    }
);

export const updateTopicColor = command(
    z.object({
      id: z.string(),
      color: colorSchema,
    }),
    async (input) => {
      await updateTopic(input.id, { color: input.color });
    }
);

export const deleteTopicById = command(
    z.object({
      id: z.string(),
    }),
    async (input) => {
      await deleteTopic(input.id);
    }
);

export const shiftTopicRowIndices = command(
    z.object({
      updates: z.array(z.object({
        id: z.string(),
        rowIdx: z.number(),
      })),
    }),
    async (input) => {
      await Promise.all(
        input.updates.map(({ id, rowIdx }) => updateTopic(id, { rowIdx }))
      );
    }
);