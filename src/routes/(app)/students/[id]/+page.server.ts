import type { PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import { error } from '@sveltejs/kit';
import { getStudent } from '$lib/server/services/students';

export const load: PageServerLoad = async ({ params, platform }) => {
	const db = platform?.env?.DB ? getDb(platform.env.DB) : null;
	if (!db) return { studentData: null };

	const studentData = await getStudent(db, params.id);
	if (!studentData) throw error(404, 'Data siswa tidak ditemukan');

	return { studentData };
};
