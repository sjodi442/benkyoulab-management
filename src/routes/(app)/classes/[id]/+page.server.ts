import type { PageServerLoad, Actions } from './$types';
import { getDb } from '$lib/server/db';
import { error, fail } from '@sveltejs/kit';
import { getClass, createClassSession, recordAttendance, recordProgress, enrollStudent, unenrollStudent, updateClass } from '$lib/server/services/classes';
import { listTeachers } from '$lib/server/services/teachers';
import { listStudents } from '$lib/server/services/students';

export const load: PageServerLoad = async ({ params, platform }) => {
	const db = platform?.env?.DB ? getDb(platform.env.DB) : null;
	if (!db) return { classData: null, teachers: [], students: [] };

	const [classData, teachersData, studentsData] = await Promise.all([
		getClass(db, params.id),
		listTeachers(db, { limit: 100 }),
		listStudents(db, { status: 'active', limit: 200 })
	]);

	if (!classData) throw error(404, 'Kelas tidak ditemukan');

	return {
		classData,
		teachers: teachersData.teachers,
		students: studentsData.students
	};
};

export const actions: Actions = {
	update: async ({ request, platform, params }) => {
		const db = platform?.env?.DB ? getDb(platform.env.DB) : null;
		if (!db) return fail(500, { error: 'Database unavailable' });

		const data = await request.formData();
		const name = data.get('name') as string;
		const level = data.get('level') as string;
		const teacherId = data.get('teacherId') as string;
		const scheduleDays = data.getAll('scheduleDay') as string[];
		const scheduleDay = scheduleDays.join(',');
		const scheduleTime = data.get('scheduleTime') as string;
		const durationMinutes = parseInt(data.get('durationMinutes') as string);
		const meetingLink = data.get('meetingLink') as string;
		const maxStudents = parseInt(data.get('maxStudents') as string);
		const status = data.get('status') as string;

		try {
			await updateClass(db, params.id, {
				name,
				level,
				teacherId,
				scheduleDay,
				scheduleTime,
				durationMinutes,
				meetingLink,
				maxStudents,
				status
			});
			return { success: true };
		} catch (e: any) {
			return fail(400, { error: e.message });
		}
	},

	enroll: async ({ request, platform, params }) => {
		const db = platform?.env?.DB ? getDb(platform.env.DB) : null;
		if (!db) return fail(500, { error: 'Database unavailable' });

		const data = await request.formData();
		const studentId = data.get('studentId') as string;
		const ignoreConflict = data.get('ignoreConflict') === 'true';

		if (!studentId) return fail(400, { error: 'Siswa wajib dipilih' });

		try {
			await enrollStudent(db, params.id, studentId, ignoreConflict);
			return { success: true };
		} catch (e: any) {
			return fail(400, { error: e.message, studentId }); // Pass back studentId for UI conflict handling
		}
	},

	unenroll: async ({ request, platform, params }) => {
		const db = platform?.env?.DB ? getDb(platform.env.DB) : null;
		if (!db) return fail(500, { error: 'Database unavailable' });

		const data = await request.formData();
		const studentId = data.get('studentId') as string;

		if (!studentId) return fail(400, { error: 'ID siswa tidak ditemukan' });

		try {
			await unenrollStudent(db, params.id, studentId);
			return { success: true };
		} catch (e: any) {
			return fail(400, { error: e.message });
		}
	},

	addSession: async ({ request, platform, params }) => {
		const db = platform?.env?.DB ? getDb(platform.env.DB) : null;
		if (!db) return fail(500, { error: 'Database unavailable' });

		const data = await request.formData();
		const sessionDate = data.get('sessionDate') as string;
		const sessionTime = data.get('sessionTime') as string;
		const meetingLink = data.get('meetingLink') as string;
		const topic = data.get('topic') as string;
		const notes = data.get('notes') as string;

		if (!sessionDate) {
			return fail(400, { error: 'Tanggal sesi wajib diisi' });
		}

		try {
			// Determine session number based on existing sessions
			const classData = await getClass(db, params.id);
			const sessionNumber = (classData?.sessions.length || 0) + 1;

			await createClassSession(db, {
				classId: params.id,
				sessionDate,
				sessionTime,
				meetingLink,
				sessionNumber,
				topic,
				notes
			});
			return { success: true };
		} catch (e: any) {
			return fail(400, { error: e.message });
		}
	},

	completeSession: async ({ request, platform }) => {
		const db = platform?.env?.DB ? getDb(platform.env.DB) : null;
		if (!db) return fail(500, { error: 'Database unavailable' });

		const data = await request.formData();
		const sessionId = data.get('sessionId') as string;
		const status = data.get('status') as 'completed' | 'scheduled' | 'cancelled';

		if (!sessionId) return fail(400, { error: 'ID sesi tidak ditemukan' });

		try {
			const { updateSessionStatus } = await import('$lib/server/services/classes');
			await updateSessionStatus(db, sessionId, status);
			return { success: true };
		} catch (e: any) {
			return fail(400, { error: e.message });
		}
	},
	
	recordProgress: async ({ request, platform, params, locals }) => {
		const db = platform?.env?.DB ? getDb(platform.env.DB) : null;
		if (!db) return fail(500, { error: 'Database unavailable' });

		const data = await request.formData();
		const studentId = data.get('studentId') as string;
		const sessionId = data.get('sessionId') as string;
		const jlptProgress = data.get('jlptProgress') as string;
		const scoreStr = data.get('score') as string;
		const notes = data.get('notes') as string;

		if (!studentId) {
			return fail(400, { error: 'Siswa wajib diisi' });
		}

		try {
			await recordProgress(db, {
				studentId,
				classId: params.id,
				sessionId: sessionId || undefined,
				jlptProgress,
				score: scoreStr ? parseInt(scoreStr) : undefined,
				notes,
				createdBy: locals.user?.id
			});
			return { success: true };
		} catch (e: any) {
			return fail(400, { error: e.message });
		}
	}
};
