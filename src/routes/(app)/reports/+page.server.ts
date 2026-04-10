import type { PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import { students, invoices, payments, classes } from '$lib/server/db/schema';
import { count, sql, eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ platform }) => {
	const db = platform?.env?.DB ? getDb(platform.env.DB) : null;

	if (!db) {
		return {
			reports: {
				jlptDistribution: [],
				paymentStatus: [],
				monthlyRevenue: [],
				studentGrowth: [],
				summary: {
					totalStudents: 0,
					totalClasses: 0,
					totalRevenue: 0,
					pendingInvoices: 0
				}
			},
			lastUpdated: new Date().toISOString()
		};
	}

	// 1. JLPT Distribution
	const jlptDistribution = await db
		.select({
			level: students.jlptLevel,
			count: count()
		})
		.from(students)
		.groupBy(students.jlptLevel);

	// 2. Payment Status
	const paymentStatus = await db
		.select({
			status: invoices.status,
			count: count()
		})
		.from(invoices)
		.groupBy(invoices.status);

	// 3. Revenue by month (Last 6 months)
	const monthlyRevenue = await db
		.select({
			month: sql<string>`strftime('%Y-%m', ${payments.paymentDate})`,
			total: sql<number>`sum(${payments.amount})`
		})
		.from(payments)
		.groupBy(sql`strftime('%Y-%m', ${payments.paymentDate})`)
		.orderBy(sql`strftime('%Y-%m', ${payments.paymentDate}) desc`)
		.limit(6);

	// 4. Student growth (Last 6 months)
	const studentGrowth = await db
		.select({
			month: sql<string>`strftime('%Y-%m', ${students.enrollmentDate})`,
			count: count()
		})
		.from(students)
		.groupBy(sql`strftime('%Y-%m', ${students.enrollmentDate})`)
		.orderBy(sql`strftime('%Y-%m', ${students.enrollmentDate}) desc`)
		.limit(6);

	// 5. Summary Stats
	const [studentCount] = await db.select({ value: count() }).from(students).where(eq(students.status, 'active'));
	const [classCount] = await db.select({ value: count() }).from(classes).where(eq(classes.status, 'active'));
	const [totalRev] = await db.select({ value: sql<number>`sum(${payments.amount})` }).from(payments);
	const [pendingInv] = await db.select({ value: count() }).from(invoices).where(eq(invoices.status, 'pending'));

	return {
		reports: {
			jlptDistribution,
			paymentStatus,
			monthlyRevenue: monthlyRevenue.reverse(),
			studentGrowth: studentGrowth.reverse(),
			summary: {
				totalStudents: studentCount?.value || 0,
				totalClasses: classCount?.value || 0,
				totalRevenue: totalRev?.value || 0,
				pendingInvoices: pendingInv?.value || 0
			}
		},
		lastUpdated: new Date().toISOString()
	};
};
