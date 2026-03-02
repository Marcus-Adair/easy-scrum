import { command } from '$app/server';
import { createNote, updateNote, deleteNote } from '$lib/server/api';
import z from 'zod';

export const createNewNote = command(
    z.object({
      topicId: z.string(),
      header: z.string(),
      notes: z.string().optional(),
      noteCategoryId: z.string().optional(),
      createdById: z.string().optional(),
      colIdx: z.number(),
    }),
    async (input) => {
      await createNote({
        topicId: input.topicId,
        header: input.header,
        notes: input.notes,
        noteCategoryId: input.noteCategoryId,
        createdById: input.createdById,
        colIdx: input.colIdx,
      });
    }
);

export const updateNoteHeader = command(
    z.object({
      id: z.string(),
      header: z.string(),
    }),
    async (input) => {
      await updateNote(input.id, { header: input.header });
    }
);

export const updateNoteContent = command(
    z.object({
      id: z.string(),
      notes: z.string(),
    }),
    async (input) => {
      await updateNote(input.id, { notes: input.notes });
    }
);

export const updateNoteCategory = command(
    z.object({
      id: z.string(),
      noteCategoryId: z.string().nullable(),
    }),
    async (input) => {
      await updateNote(input.id, { noteCategoryId: input.noteCategoryId });
    }
);

export const deleteNoteById = command(
    z.object({
      id: z.string(),
    }),
    async (input) => {
      await deleteNote(input.id);
    }
);

export const shiftNoteColIndices = command(
    z.object({
      updates: z.array(z.object({
        id: z.string(),
        colIdx: z.number(),
      })),
    }),
    async (input) => {
      await Promise.all(
        input.updates.map(({ id, colIdx }) => updateNote(id, { colIdx }))
      );
    }
);

export const moveNoteToTopic = command(
    z.object({
      id: z.string(),
      topicId: z.string(),
      colIdx: z.number(),
    }),
    async (input) => {
      await updateNote(input.id, { topicId: input.topicId, colIdx: input.colIdx });
    }
);