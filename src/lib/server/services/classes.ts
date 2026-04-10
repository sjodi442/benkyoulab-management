import { getDb } from '$lib/server/db';
import { classes, classSessions, enrollments, attendance } from '$lib/server/db/schema';
import { eq, and, count } from 'drizzle-orm';
import type { Database } from '$lib/server/db';

export async function listClasses(db: Database, opts: { status?: string; level?: string; page?: number; limit?: number } = {}) {
	const { status, level, page = 1, limit = 20 } = opts;
	const offset = (page - 1) * limit;

	const whereClauses = [];
	if (status) whereClauses.push(eq(classes.status, status as any));
	if (level) whereClauses.push(eq(classes.level, level as any));

	const results = await db.query.classes.findMany({
		where: whereClauses.length > 0 ? and(...whereClauses) : undefined,
		with: {
			teacher: { with: { user: true } },
			enrollments: { with: { student: { with: { user: true } } } }
		},
		orderBy: (c, { desc }) => [desc(c.createdAt)],
		limit,
		offset
	});

	const [totalResult] = await db
		.select({ count: count() })
		.from(classes)
		.where(whereClauses.length > 0 ? and(...whereClauses) : undefined);

	return {
		classes: results,
		total: totalResult?.count ?? 0,
		page,
		limit
	};
}

export async function getClass(db: Database, id: string) {
	return db.query.classes.findFirst({
		where: eq(classes.id, id),
		with: {
			teacher: { with: { user: true } },
			enrollments: { with: { student: { with: { user: true } } } },
			sessions: {
				with: { attendance: { with: { student: { with: { user: true } } } } },
				orderBy: (s, { asc }) => [asc(s.sessionDate)]
			}
		}
	});
}

export async function createClass(
	db: Database,
	data: {
		name: string;
		level: string;
		teacherId: string;
		scheduleDay: string;
		scheduleTime: string;
		durationMinutes: number;
		meetingLink?: string;
		maxStudents?: number;
	}
) {
	// Check for schedule conflicts (handle multi-day strings)
	const existingClasses = await db.query.classes.findMany({
		where: and(eq(classes.teacherId, data.teacherId), eq(classes.status, 'active'))
	});

	const newDays = data.scheduleDay.split(',').map(d => d.trim());
	const conflict = existingClasses.find(c => {
		const existingDays = c.scheduleDay.split(',').map(d => d.trim());
		const hasDayOverlap = newDays.some(d => existingDays.includes(d));
		return hasDayOverlap && c.scheduleTime === data.scheduleTime;
	});

	if (conflict) {
		throw new Error(`Guru sudah memiliki kelas pada salah satu hari tersebut (${data.scheduleDay}) pukul ${data.scheduleTime}`);
	}

	const classId = crypto.randomUUID();
	await db.insert(classes).values({
		id: classId,
		name: data.name,
		level: data.level as any,
		teacherId: data.teacherId,
		scheduleDay: data.scheduleDay as any,
		scheduleTime: data.scheduleTime,
		durationMinutes: data.durationMinutes,
		meetingLink: data.meetingLink || null,
		maxStudents: data.maxStudents || 10,
		status: 'active'
	});

	return classId;
}

export async function enrollStudent(db: Database, classId: string, studentId: string, ignoreConflict = false) {
	const existing = await db.query.enrollments.findFirst({
		where: and(eq(enrollments.classId, classId), eq(enrollments.studentId, studentId))
	});

	if (existing) throw new Error('Siswa sudah terdaftar di kelas ini');

	const cls = await db.query.classes.findFirst({ where: eq(classes.id, classId) });
	if (!cls) throw new Error('Kelas tidak ditemukan');

	// Check for student schedule overlap
	if (!ignoreConflict) {
		const studentEnrollments = await db.query.enrollments.findMany({
			where: eq(enrollments.studentId, studentId),
			with: { class: true }
		});

		const conflict = studentEnrollments.find(e => {
			if (e.class.status !== 'active') return false;
			const existingDays = e.class.scheduleDay.split(',').map(d => d.trim());
			const newDays = cls.scheduleDay.split(',').map(d => d.trim());
			const hasDayOverlap = newDays.some(d => existingDays.includes(d));
			return hasDayOverlap && e.class.scheduleTime === cls.scheduleTime;
		});

		if (conflict) {
			throw new Error(`Siswa ini sudah memiliki kelas lain (${conflict.class.name}) pada hari dan jam yang sama!`);
		}
	}

	const enrollmentCount = await db.query.enrollments.findMany({
		where: and(eq(enrollments.classId, classId), eq(enrollments.status, 'active'))
	});

	if (enrollmentCount.length >= (cls.maxStudents || 10)) {
		throw new Error('Kelas sudah penuh');
	}

	await db.insert(enrollments).values({
		id: crypto.randomUUID(),
		studentId,
		classId,
		status: 'active'
	});
}

export async function unenrollStudent(db: Database, classId: string, studentId: string) {
	await db.delete(enrollments).where(and(eq(enrollments.classId, classId), eq(enrollments.studentId, studentId)));
}

export async function updateClass(
	db: Database,
	id: string,
	data: {
		name?: string;
		level?: string;
		teacherId?: string;
		scheduleDay?: string;
		scheduleTime?: string;
		durationMinutes?: number;
		meetingLink?: string;
		maxStudents?: number;
		status?: string;
	}
) {
	// If teacher/schedule changes, check conflict
	if (data.teacherId || data.scheduleDay || data.scheduleTime) {
		const current = await db.query.classes.findFirst({ where: eq(classes.id, id) });
		const teacherId = data.teacherId || current?.teacherId;
		const day = data.scheduleDay || current?.scheduleDay;
		const time = data.scheduleTime || current?.scheduleTime;

		if (teacherId && day && time) {
			const existingClasses = await db.query.classes.findMany({
				where: and(eq(classes.teacherId, teacherId), eq(classes.status, 'active'))
			});

			const newDays = day.split(',').map(d => d.trim());
			const conflict = existingClasses.find(c => {
				if (c.id === id) return false;
				const existingDays = c.scheduleDay.split(',').map(d => d.trim());
				const hasDayOverlap = newDays.some(d => existingDays.includes(d));
				return hasDayOverlap && c.scheduleTime === time;
			});

			if (conflict) {
				throw new Error(`Guru sudah memiliki kelas pada salah satu hari tersebut (${day}) pukul ${time}`);
			}
		}
	}

	await db
		.update(classes)
		.set({
			...data,
			updatedAt: new Date().toISOString()
		} as any)
		.where(eq(classes.id, id));
}

export async function createClassSession(
	db: Database,
	data: { classId: string; sessionDate: string; sessionNumber: number; sessionTime?: string; meetingLink?: string; topic?: string; notes?: string }
) {
	const sessionId = crypto.randomUUID();
	await db.insert(classSessions).values({
		id: sessionId,
		classId: data.classId,
		sessionDate: data.sessionDate,
		sessionNumber: data.sessionNumber,
		sessionTime: data.sessionTime || null,
		meetingLink: data.meetingLink || null,
		topic: data.topic || null,
		notes: data.notes || null,
		status: 'scheduled'
	});
	return sessionId;
}

export async function updateSessionStatus(db: Database, id: string, status: 'scheduled' | 'completed' | 'cancelled') {
	await db.update(classSessions).set({ status }).where(eq(classSessions.id, id));
}

export async function recordAttendance(
	db: Database,
	data: { sessionId: string; studentId: string; status: string; notes?: string }
) {
	// Upsert attendance
	const existing = await db.query.attendance.findFirst({
		where: and(eq(attendance.sessionId, data.sessionId), eq(attendance.studentId, data.studentId))
	});

	if (existing) {
		await db
			.update(attendance)
			.set({ status: data.status as any, notes: data.notes || null })
			.where(eq(attendance.id, existing.id));
	} else {
		await db.insert(attendance).values({
			id: crypto.randomUUID(),
			sessionId: data.sessionId,
			studentId: data.studentId,
			status: data.status as any,
			notes: data.notes || null
		});
	}
}

export async function recordProgress(
	db: Database,
	data: { studentId: string; classId: string; sessionId?: string; jlptProgress?: string; score?: number; notes?: string; createdBy?: string }
) {
	const { progress } = await import('$lib/server/db/schema');
	await db.insert(progress).values({
		id: crypto.randomUUID(),
		studentId: data.studentId,
		classId: data.classId,
		sessionId: data.sessionId || null,
		jlptProgress: data.jlptProgress || null,
		score: data.score ?? null,
		notes: data.notes || null,
		createdBy: data.createdBy || null
	});
}

export async function deleteClass(db: Database, id: string) {
	await db.delete(classes).where(eq(classes.id, id));
}
