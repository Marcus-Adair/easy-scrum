import { command } from '$app/server';
import { updateTopic, createTopic, deleteTopic } from '$lib/server/api';
import z from 'zod';


export const createNewTopic = command(
  z.object({
    scrumSessionId: z.string(),
    topicName: z.string(),
    color: z.string(),
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
      color: z.string(),
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