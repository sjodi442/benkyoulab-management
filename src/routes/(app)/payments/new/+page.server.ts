import type { PageServerLoad, Actions } from './$types';
import { getDb } from '$lib/server/db';
import { createInvoice, generateMonthlyInvoices } from '$lib/server/services/payments';
import { listStudents } from '$lib/server/services/students';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ platform }) => {
	const db = platform?.env?.DB ? getDb(platform.env.DB) : null;
	if (!db) return { students: [] };

	const { students } = await listStudents(db, { status: 'active', limit: 100 });
	return { students };
};

export const actions: Actions = {
	single: async ({ request, platform }) => {
		const db = platform?.env?.DB ? getDb(platform.env.DB) : null;
		if (!db) return fail(500, { error: 'Database unavailable' });

		const data = await request.formData();
		const studentId = data.get('studentId') as string;
		const amount = parseInt(data.get('amount') as string);
		const period = data.get('period') as string;
		const dueDate = data.get('dueDate') as string;
		const description = data.get('description') as string;

		if (!studentId || !amount || !period || !dueDate) {
			return fail(400, { error: 'Semua field wajib diisi' });
		}

		try {
			await createInvoice(db, { studentId, amount, period, dueDate, description });
			throw redirect(303, '/payments');
		} catch (e: any) {
			if (e.status === 303) throw e;
			return fail(400, { error: e.message });
		}
	},

	batch: async ({ request, platform }) => {
		const db = platform?.env?.DB ? getDb(platform.env.DB) : null;
		if (!db) return fail(500, { error: 'Database unavailable' });

		const data = await request.formData();
		const amount = parseInt(data.get('amount') as string);
		const period = data.get('period') as string;
		const dueDate = data.get('dueDate') as string;
		const description = data.get('description') as string;

		if (!amount || !period || !dueDate) {
			return fail(400, { error: 'Semua field wajib diisi' });
		}

		try {
			const created = await generateMonthlyInvoices(db, { period, dueDate, amount, description });
			return { success: true, count: created.length };
		} catch (e: any) {
			return fail(400, { error: e.message });
		}
	}
};
