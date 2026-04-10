import type { PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import { students, teachers, classes, invoices, enrollments, payments } from '$lib/server/db/schema';
import { eq, sql, count, sum } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals, platform }) => {
	const db = platform?.env?.DB ? getDb(platform.env.DB) : null;

	if (!db) {
		return {
			stats: { totalStudents: 0, activeClasses: 0, activeTeachers: 0, monthlyRevenue: 0 },
			recentStudents: [],
			recentPayments: [],
			upcomingClasses: []
		};
	}

	const now = new Date();
	const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

	// Stats queries
	const [totalStudentsResult] = await db.select({ count: count() }).from(students).where(eq(students.status, 'active'));
	const [activeClassesResult] = await db.select({ count: count() }).from(classes).where(eq(classes.status, 'active'));
	const [activeTeachersResult] = await db.select({ count: count() }).from(teachers);
	const [monthlyRevenueResult] = await db.select({ total: sum(payments.amount) }).from(payments).where(eq(payments.paymentDate, sql`substr(${payments.paymentDate}, 1, 7) = ${currentMonth}`));

	// Recent students (last 5)
	const recentStudents = await db.query.students.findMany({
		limit: 5,
		orderBy: (s, { desc }) => [desc(s.enrollmentDate)],
		with: { user: true }
	});

	// Recent payments (last 5)
	const recentPayments = await db.query.payments.findMany({
		limit: 5,
		orderBy: (p, { desc }) => [desc(p.paymentDate)],
		with: {
			invoice: {
				with: {
					student: {
						with: { user: true }
					}
				}
			}
		}
	});

	return {
		stats: {
			totalStudents: totalStudentsResult?.count ?? 0,
			activeClasses: activeClassesResult?.count ?? 0,
			activeTeachers: activeTeachersResult?.count ?? 0,
			monthlyRevenue: Number(monthlyRevenueResult?.total ?? 0)
		},
		recentStudents,
		recentPayments,
		upcomingClasses: []
	};
};
