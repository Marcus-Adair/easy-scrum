import { command } from '$app/server';
import { createNoteCategory, updateNoteCategory, deleteNoteCategory } from '$lib/server/api';
import z from 'zod';

export const createNewNoteCategory = command(
	z.object({
		scrumSessionId: z.string(),
		categoryName: z.string(),
		color: z.string(),
	}),
	async (input) => {
		await createNoteCategory({
			scrumSessionId: input.scrumSessionId,
			categoryName: input.categoryName,
			color: input.color,
		});
	}
);

export const updateNoteCategoryName = command(
	z.object({
		id: z.string(),
		categoryName: z.string(),
	}),
	async (input) => {
		await updateNoteCategory(input.id, { categoryName: input.categoryName });
	}
);

export const updateNoteCategoryColor = command(
	z.object({
		id: z.string(),
		color: z.string(),
	}),
	async (input) => {
		await updateNoteCategory(input.id, { color: input.color });
	}
);

export const deleteNoteCategoryById = command(
	z.object({
		id: z.string(),
	}),
	async (input) => {
		await deleteNoteCategory(input.id);
	}
);
