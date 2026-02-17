import { command } from '$app/server';
import { createComment, updateComment, deleteComment } from '$lib/server/api';
import z from 'zod';

export const createNewComment = command(
	z.object({
		noteId: z.string(),
		content: z.string(),
	}),
	async (input) => {
		await createComment({
			noteId: input.noteId,
			content: input.content,
		});
	}
);

export const updateCommentContent = command(
	z.object({
		id: z.string(),
		content: z.string(),
	}),
	async (input) => {
		await updateComment(input.id, { content: input.content });
	}
);

export const deleteCommentById = command(
	z.object({
		id: z.string(),
	}),
	async (input) => {
		await deleteComment(input.id);
	}
);
