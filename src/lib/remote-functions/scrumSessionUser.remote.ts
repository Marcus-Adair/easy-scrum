import { command } from '$app/server';
import { createScrumSessionUser, getScrumSessionUserByName } from '$lib/server/api';
import z from 'zod';

export const signIn = command(
	z.object({
		scrumSessionId: z.string(),
		name: z.string().min(1),
		password: z.string().optional()
	}),
	async (input) => {
		const existingUser = await getScrumSessionUserByName(input.scrumSessionId, input.name);

		if (existingUser) {
			// User exists - check password
			if (existingUser.password) {
				// User has a password, verify it
				if (input.password !== existingUser.password) {
					return { success: false, error: 'Incorrect password' };
				}
			}
			// User has no password or password matches - sign in
			return {
				success: true,
				user: {
					id: existingUser.id,
					name: existingUser.name,
					hasPassword: !!existingUser.password
				}
			};
		}

		// User doesn't exist - create them
		const newUser = await createScrumSessionUser({
			scrumSessionId: input.scrumSessionId,
			name: input.name,
			password: input.password || undefined
		});

		return {
			success: true,
			user: {
				id: newUser.id,
				name: newUser.name,
				hasPassword: !!newUser.password
			}
		};
	}
);
