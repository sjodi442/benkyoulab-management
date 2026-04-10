import { getDb } from '$lib/server/db';
import { students, users, accounts } from '$lib/server/db/schema';
import { eq, like, and, or, count, desc } from 'drizzle-orm';
import type { Database } from '$lib/server/db';

export type StudentWithUser = {
	id: string;
	userId: string;
	phone: string | null;
	jlptLevel: string | null;
	enrollmentDate: string;
	status: string;
	notes: string | null;
	user: {
		id: string;
		name: string;
		email: string;
	} | null;
};

export async function listStudents(
	db: Database,
	opts: { search?: string; status?: string; level?: string; page?: number; limit?: number } = {}
) {
	const { search, status, level, page = 1, limit = 20 } = opts;

	const results = await db.query.students.findMany({
		with: { user: true },
		orderBy: (s, { desc }) => [desc(s.enrollmentDate)],
		limit,
		offset: (page - 1) * limit
	});

	let filtered = results;
	if (search) {
		const q = search.toLowerCase();
		filtered = filtered.filter(
			(s) =>
				s.user?.name?.toLowerCase().includes(q) ||
				s.user?.email?.toLowerCase().includes(q) ||
				s.phone?.includes(q)
		);
	}
	if (status) {
		filtered = filtered.filter((s) => s.status === status);
	}
	if (level) {
		filtered = filtered.filter((s) => s.jlptLevel === level);
	}

	const [totalResult] = await db.select({ count: count() }).from(students);

	return {
		students: filtered,
		total: totalResult?.count ?? 0,
		page,
		limit
	};
}

export async function getStudent(db: Database, id: string) {
	return db.query.students.findFirst({
		where: eq(students.id, id),
		with: {
			user: true,
			enrollments: {
				with: { class: { with: { teacher: { with: { user: true } } } } }
			},
			invoices: {
				with: { payments: true },
				orderBy: (inv, { desc }) => [desc(inv.createdAt)]
			},
			progress: {
				with: { class: true },
				orderBy: (p, { desc }) => [desc(p.createdAt)],
				limit: 20
			}
		}
	});
}

export async function createStudent(
	db: Database,
	data: {
		name: string;
		email: string;
		password: string;
		phone?: string;
		jlptLevel?: string;
		notes?: string;
	}
) {
	const userId = crypto.randomUUID();
	const studentId = crypto.randomUUID();

	// Create user
	await db.insert(users).values({
		id: userId,
		name: data.name,
		email: data.email,
		role: 'student'
	});

	// Create account for password (Better Auth pattern)
	const { hashPassword } = await import('$lib/server/utils/password');
	const hashedPassword = await hashPassword(data.password);

	await db.insert(accounts).values({
		id: crypto.randomUUID(),
		userId,
		accountId: userId,
		providerId: 'credential',
		password: hashedPassword
	});

	// Create student profile
	await db.insert(students).values({
		id: studentId,
		userId,
		phone: data.phone || null,
		jlptLevel: (data.jlptLevel as any) || 'N5',
		enrollmentDate: new Date().toISOString().split('T')[0],
		status: 'active',
		notes: data.notes || null
	});

	return studentId;
}

export async function updateStudent(
	db: Database,
	id: string,
	data: {
		name?: string;
		email?: string;
		phone?: string | null;
		jlptLevel?: string;
		status?: string;
		notes?: string | null;
	}
) {
	const student = await db.query.students.findFirst({ where: eq(students.id, id) });
	if (!student) throw new Error('Student not found');

	// Update user
	if (data.name || data.email) {
		const updates: any = {};
		if (data.name) updates.name = data.name;
		if (data.email) updates.email = data.email;
		updates.updatedAt = new Date();
		await db.update(users).set(updates).where(eq(users.id, student.userId));
	}

	// Update student
	const studentUpdates: any = {};
	if (data.phone !== undefined) studentUpdates.phone = data.phone;
	if (data.jlptLevel) studentUpdates.jlptLevel = data.jlptLevel;
	if (data.status) studentUpdates.status = data.status;
	if (data.notes !== undefined) studentUpdates.notes = data.notes;

	if (Object.keys(studentUpdates).length > 0) {
		await db.update(students).set(studentUpdates).where(eq(students.id, id));
	}
}

export async function deleteStudent(db: Database, id: string) {
	const student = await db.query.students.findFirst({ where: eq(students.id, id) });
	if (!student) throw new Error('Student not found');

	// Cascade: delete user will cascade to student, enrollments, etc.
	await db.delete(users).where(eq(users.id, student.userId));
}
