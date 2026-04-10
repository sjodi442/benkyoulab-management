import type { PageServerLoad, Actions } from './$types';
import { getDb } from '$lib/server/db';
import { createClass } from '$lib/server/services/classes';
import { listTeachers } from '$lib/server/services/teachers';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ platform }) => {
	const db = platform?.env?.DB ? getDb(platform.env.DB) : null;
	if (!db) return { teachers: [] };

	const { teachers } = await listTeachers(db, { limit: 100 });
	return { teachers };
};

export const actions: Actions = {
	default: async ({ request, platform }) => {
		const db = platform?.env?.DB ? getDb(platform.env.DB) : null;
		if (!db) return fail(500, { error: 'Database unavailable' });

		const data = await request.formData();
		const name = data.get('name') as string;
		const level = data.get('level') as string;
		const teacherId = data.get('teacherId') as string;
		const scheduleDays = data.getAll('scheduleDay') as string[];
		const scheduleDay = scheduleDays.join(',');
		const scheduleTime = data.get('scheduleTime') as string;
		const durationMinutes = parseInt(data.get('durationMinutes') as string) || 60;
		const meetingLink = data.get('meetingLink') as string;
		const maxStudents = parseInt(data.get('maxStudents') as string) || 10;

		if (!name || !level || !teacherId || !scheduleDay || !scheduleTime) {
			return fail(400, { error: 'Semua field wajib diisi', name, level, teacherId, scheduleDay, scheduleTime, meetingLink });
		}

		try {
			const id = await createClass(db, { name, level, teacherId, scheduleDay, scheduleTime, durationMinutes, meetingLink, maxStudents });
			throw redirect(303, `/classes/${id}`);
		} catch (e: any) {
			if (e.status === 303) throw e;
			return fail(400, { error: e.message || 'Gagal membuat kelas', name, level, teacherId, scheduleDay, scheduleTime, meetingLink });
		}
	}
};
