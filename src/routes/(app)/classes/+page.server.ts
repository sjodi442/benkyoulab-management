import type { PageServerLoad, Actions } from './$types';
import { getDb } from '$lib/server/db';
import { listClasses, deleteClass } from '$lib/server/services/classes';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ url, platform }) => {
	const db = platform?.env?.DB ? getDb(platform.env.DB) : null;
	if (!db) return { classes: [], total: 0, page: 1, limit: 20 };

	const status = url.searchParams.get('status') || '';
	const level = url.searchParams.get('level') || '';
	const page = parseInt(url.searchParams.get('page') || '1');

	return listClasses(db, { status, level, page });
};

export const actions: Actions = {
	delete: async ({ request, platform }) => {
		const db = platform?.env?.DB ? getDb(platform.env.DB) : null;
		if (!db) return fail(500, { error: 'Database unavailable' });

		const data = await request.formData();
		const id = data.get('id') as string;

		try {
			await deleteClass(db, id);
			return { success: true };
		} catch (e: any) {
			return fail(400, { error: e.message });
		}
	}
};
