import { getDb } from '$lib/server/db';
import { teachers, users, accounts } from '$lib/server/db/schema';
import { eq, count } from 'drizzle-orm';
import type { Database } from '$lib/server/db';

export async function listTeachers(db: Database, opts: { search?: string; page?: number; limit?: number } = {}) {
	const { search, page = 1, limit = 20 } = opts;

	let results = await db.query.teachers.findMany({
		with: { user: true, classes: true },
		orderBy: (t, { desc }) => [desc(t.userId)]
	});

	if (search) {
		const q = search.toLowerCase();
		results = results.filter(
			(t) => t.user?.name?.toLowerCase().includes(q) || t.user?.email?.toLowerCase().includes(q)
		);
	}

	const [totalResult] = await db.select({ count: count() }).from(teachers);

	return {
		teachers: results.slice((page - 1) * limit, page * limit),
		total: totalResult?.count ?? 0,
		page,
		limit
	};
}

export async function getTeacher(db: Database, id: string) {
	return db.query.teachers.findFirst({
		where: eq(teachers.id, id),
		with: {
			user: true,
			classes: {
				with: {
					enrollments: { with: { student: { with: { user: true } } } },
					sessions: true
				}
			}
		}
	});
}

export async function createTeacher(
	db: Database,
	data: {
		name: string;
		email: string;
		password: string;
		phone?: string;
		specialization?: string[];
		notes?: string;
	}
) {
	const userId = crypto.randomUUID();
	const teacherId = crypto.randomUUID();

	await db.insert(users).values({
		id: userId,
		name: data.name,
		email: data.email,
		role: 'teacher'
	});

	const { hashPassword } = await import('$lib/server/utils/password');
	const hashedPassword = await hashPassword(data.password);

	await db.insert(accounts).values({
		id: crypto.randomUUID(),
		userId,
		accountId: userId,
		providerId: 'credential',
		password: hashedPassword
	});

	await db.insert(teachers).values({
		id: teacherId,
		userId,
		phone: data.phone || null,
		specialization: data.specialization || [],
		availability: {},
		notes: data.notes || null
	});

	return teacherId;
}

export async function updateTeacher(
	db: Database,
	id: string,
	data: {
		name?: string;
		email?: string;
		phone?: string | null;
		specialization?: string[];
		availability?: Record<string, string[]>;
		notes?: string | null;
	}
) {
	const teacher = await db.query.teachers.findFirst({ where: eq(teachers.id, id) });
	if (!teacher) throw new Error('Teacher not found');

	if (data.name || data.email) {
		const updates: any = {};
		if (data.name) updates.name = data.name;
		if (data.email) updates.email = data.email;
		updates.updatedAt = new Date();
		await db.update(users).set(updates).where(eq(users.id, teacher.userId));
	}

	const teacherUpdates: any = {};
	if (data.phone !== undefined) teacherUpdates.phone = data.phone;
	if (data.specialization) teacherUpdates.specialization = data.specialization;
	if (data.availability) teacherUpdates.availability = data.availability;
	if (data.notes !== undefined) teacherUpdates.notes = data.notes;

	if (Object.keys(teacherUpdates).length > 0) {
		await db.update(teachers).set(teacherUpdates).where(eq(teachers.id, id));
	}
}

export async function deleteTeacher(db: Database, id: string) {
	const teacher = await db.query.teachers.findFirst({ where: eq(teachers.id, id) });
	if (!teacher) throw new Error('Teacher not found');
	await db.delete(users).where(eq(users.id, teacher.userId));
}
