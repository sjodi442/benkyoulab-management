import { invoices, payments, students } from '$lib/server/db/schema';
import { eq, and, count, sum } from 'drizzle-orm';
import type { Database } from '$lib/server/db';

export async function listInvoices(
	db: Database,
	opts: { status?: string; period?: string; studentId?: string; page?: number; limit?: number } = {}
) {
	const { status, period, studentId, page = 1, limit = 20 } = opts;
	const offset = (page - 1) * limit;

	const whereClauses = [];
	if (status) whereClauses.push(eq(invoices.status, status as any));
	if (period) whereClauses.push(eq(invoices.period, period));
	if (studentId) whereClauses.push(eq(invoices.studentId, studentId));

	const results = await db.query.invoices.findMany({
		where: whereClauses.length > 0 ? and(...whereClauses) : undefined,
		with: {
			student: { with: { user: true } },
			payments: true
		},
		orderBy: (inv, { desc }) => [desc(inv.createdAt)],
		limit,
		offset
	});

	const [totalResult] = await db
		.select({ count: count() })
		.from(invoices)
		.where(whereClauses.length > 0 ? and(...whereClauses) : undefined);

	return {
		invoices: results,
		total: totalResult?.count ?? 0,
		page,
		limit
	};
}

export async function getInvoice(db: Database, id: string) {
	return db.query.invoices.findFirst({
		where: eq(invoices.id, id),
		with: {
			student: { with: { user: true } },
			payments: true
		}
	});
}

export async function createInvoice(
	db: Database,
	data: {
		studentId: string;
		amount: number;
		period: string;
		dueDate: string;
		description?: string;
	}
) {
	const invoiceId = crypto.randomUUID();
	await db.insert(invoices).values({
		id: invoiceId,
		studentId: data.studentId,
		amount: data.amount,
		period: data.period,
		dueDate: data.dueDate,
		status: 'pending',
		description: data.description || null
	});
	return invoiceId;
}

export async function recordPayment(
	db: Database,
	data: {
		invoiceId: string;
		amount: number;
		paymentMethod: string;
		notes?: string;
		verifiedBy?: string;
	}
) {
	// Fetch invoice and existing payments first to calculate status
	const invoice = await db.query.invoices.findFirst({
		where: eq(invoices.id, data.invoiceId),
		with: { payments: true }
	});

	if (!invoice) throw new Error('Invoice tidak ditemukan');

	const currentTotalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
	const newTotalPaid = currentTotalPaid + data.amount;
	const paymentId = crypto.randomUUID();

	const statements = [];

	// 1. Insert the payment
	statements.push(
		db.insert(payments).values({
			id: paymentId,
			invoiceId: data.invoiceId,
			amount: data.amount,
			paymentDate: new Date().toISOString().split('T')[0],
			paymentMethod: data.paymentMethod as any,
			verified: !!data.verifiedBy,
			verifiedBy: data.verifiedBy || null,
			notes: data.notes || null
		})
	);

	// 2. Update invoice status if fully paid
	if (newTotalPaid >= invoice.amount) {
		statements.push(
			db
				.update(invoices)
				.set({ status: 'paid', updatedAt: new Date().toISOString() })
				.where(eq(invoices.id, data.invoiceId))
		);
	}

	// Execute as a batch for atomicity in D1
	await db.batch(statements as [any, ...any[]]);

	return paymentId;
}

export async function generateMonthlyInvoices(
	db: Database,
	data: { period: string; dueDate: string; amount: number; description: string }
) {
	const activeStudents = await db.query.students.findMany({
		where: eq(students.status, 'active')
	});

	const created: string[] = [];
	for (const student of activeStudents) {
		// Check if invoice already exists
		const existing = await db.query.invoices.findFirst({
			where: and(eq(invoices.studentId, student.id), eq(invoices.period, data.period))
		});

		if (!existing) {
			const id = await createInvoice(db, {
				studentId: student.id,
				amount: data.amount,
				period: data.period,
				dueDate: data.dueDate,
				description: data.description
			});
			created.push(id);
		}
	}

	return created;
}

export async function deleteInvoice(db: Database, id: string) {
	return db.delete(invoices).where(eq(invoices.id, id));
}
