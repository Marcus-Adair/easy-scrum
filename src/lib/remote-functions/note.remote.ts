import { command } from '$app/server';
import { createNote, updateNote, deleteNote } from '$lib/server/api';
import z from 'zod';

export const createNewNote = command(
    z.object({
      topicId: z.string(),
      header: z.string(),
      notes: z.string().optional(),
      noteCategoryId: z.string().optional(),
      colIdx: z.number(),
    }),
    async (input) => {
      await createNote({
        topicId: input.topicId,
        header: input.header,
        notes: input.notes,
        noteCategoryId: input.noteCategoryId,
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