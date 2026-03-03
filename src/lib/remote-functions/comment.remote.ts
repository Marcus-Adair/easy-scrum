import { command } from '$app/server';
import { createComment, updateComment, deleteComment, getCommentById } from '$lib/server/api';
import z from 'zod';

export const createNewComment = command(
	z.object({
		noteId: z.string(),
		content: z.string(),
		createdById: z.string().optional(),
	}),
	async (input) => {
		await createComment({
			noteId: input.noteId,
			content: input.content,
			createdById: input.createdById,
		});
	}
);

export const updateCommentContent = command(
	z.object({
		id: z.string(),
		content: z.string(),
		userId: z.string(),
	}),
	async (input) => {
		const comment = await getCommentById(input.id);
		if (!comment || comment.createdById !== input.userId) {
			throw new Error('Unauthorized: You can only edit your own comments');
		}
		await updateComment(input.id, { content: input.content });
	}
);

export const deleteCommentById = command(
	z.object({
		id: z.string(),
		userId: z.string(),
	}),
	async (input) => {
		const comment = await getCommentById(input.id);
		if (!comment || comment.createdById !== input.userId) {
			throw new Error('Unauthorized: You can only delete your own comments');
		}
		await deleteComment(input.id);
	}
);
