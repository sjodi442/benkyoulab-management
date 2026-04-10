import { redirect } from '@sveltejs/kit';
import { createAuth } from '$lib/server/auth';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, platform }) => {
		const db = platform?.env?.DB;
		if (db) {
			const auth = createAuth(db);
			await auth.api.signOut({
				headers: request.headers
			});
		}
		throw redirect(303, '/login');
	}
};
