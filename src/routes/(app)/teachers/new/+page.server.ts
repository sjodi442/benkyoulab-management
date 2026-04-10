import type { PageServerLoad, Actions } from './$types';
import { getDb } from '$lib/server/db';
import { createTeacher } from '$lib/server/services/teachers';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async () => ({ });

export const actions: Actions = {
	default: async ({ request, platform }) => {
		const db = platform?.env?.DB ? getDb(platform.env.DB) : null;
		if (!db) return fail(500, { error: 'Database unavailable' });

		const data = await request.formData();
		const name = data.get('name') as string;
		const email = data.get('email') as string;
		const password = data.get('password') as string;
		const phone = data.get('phone') as string;
		const specialization = data.getAll('specialization') as string[];
		const notes = data.get('notes') as string;

		if (!name || !email || !password) {
			return fail(400, { error: 'Nama, email, dan password wajib diisi', name, email, phone, notes });
		}

		try {
			const id = await createTeacher(db, { name, email, password, phone, specialization, notes });
			throw redirect(303, `/teachers/${id}`);
		} catch (e: any) {
			if (e.status === 303) throw e;
			return fail(400, { error: e.message || 'Gagal membuat guru', name, email, phone, notes });
		}
	}
};
