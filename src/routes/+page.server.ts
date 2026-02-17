import { error, redirect } from '@sveltejs/kit';
import { createScrumSession } from '$lib/server/api';
import type { Actions } from './$types';

export const actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const name = formData.get('newScrumName')?.toString().trim();

		if (!name) error(400, 'Name is required');

		const session = await createScrumSession({ name });

		redirect(303, `/${session.id}`);
	}
} satisfies Actions;
