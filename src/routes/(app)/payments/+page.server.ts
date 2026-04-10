import type { PageServerLoad, Actions } from './$types';
import { getDb } from '$lib/server/db';
import { listInvoices, recordPayment, deleteInvoice } from '$lib/server/services/payments';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ url, platform }) => {
	const db = platform?.env?.DB ? getDb(platform.env.DB) : null;
	if (!db) return { invoices: [], total: 0, page: 1, limit: 20 };

	const status = url.searchParams.get('status') || '';
	const period = url.searchParams.get('period') || '';
	const page = parseInt(url.searchParams.get('page') || '1');

	return listInvoices(db, { status, period, page });
};

export const actions: Actions = {
	pay: async ({ request, platform, locals }) => {
		const db = platform?.env?.DB ? getDb(platform.env.DB) : null;
		if (!db) return fail(500, { error: 'Database unavailable' });

		const data = await request.formData();
		const invoiceId = data.get('invoiceId') as string;
		const amount = parseInt(data.get('amount') as string);
		const paymentMethod = data.get('paymentMethod') as string;
		const notes = data.get('notes') as string;

		if (!invoiceId || !amount || !paymentMethod) {
			return fail(400, { error: 'Data pembayaran tidak lengkap' });
		}

		try {
			await recordPayment(db, {
				invoiceId,
				amount,
				paymentMethod,
				notes,
				verifiedBy: locals.user?.id
			});
			return { success: true };
		} catch (e: any) {
			return fail(400, { error: e.message });
		}
	},

	delete: async ({ request, platform }) => {
		const db = platform?.env?.DB ? getDb(platform.env.DB) : null;
		if (!db) return fail(500, { error: 'Database unavailable' });

		const data = await request.formData();
		const id = data.get('id') as string;

		if (!id) return fail(400, { error: 'ID invoice tidak ditemukan' });

		try {
			await deleteInvoice(db, id);
			return { success: true };
		} catch (e: any) {
			return fail(400, { error: e.message });
		}
	}
};
