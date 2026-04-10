import { error } from '@sveltejs/kit';
import { getTeacher } from '$lib/server/services/teachers';
import { getDb } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, platform }) => {
	const rawDb = platform?.env?.DB;
	if (!rawDb) {
		throw error(500, 'Database not available');
	}
	const db = getDb(rawDb);

	const teacherId = params.id;
	const teacher = await getTeacher(db, teacherId);

	if (!teacher) {
		throw error(404, 'Guru tidak ditemukan');
	}

	return {
		teacherData: teacher
	};
};
