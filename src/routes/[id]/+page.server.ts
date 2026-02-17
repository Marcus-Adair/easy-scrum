import { error } from '@sveltejs/kit';
import { getScrumSessionById } from '$lib/server/api';
import type { PageServerLoad } from './$types';
import type { ScrumSession } from '$lib/types';

export const load = (async ({ params }) => {
	const session: ScrumSession | null = await getScrumSessionById(params.id);
	if (!session) error(404, 'Session not found');
	return { session};
}) satisfies PageServerLoad;
