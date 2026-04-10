import { error, fail, redirect } from '@sveltejs/kit';
import { getStudent, updateStudent } from '$lib/server/services/students';
import { getDb } from '$lib/server/db';
import { studentSchema } from '$lib/server/validations';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, platform }) => {
	const rawDb = platform?.env?.DB;
	if (!rawDb) throw error(500, 'Database not available');
	const db = getDb(rawDb);

	const student = await getStudent(db, params.id);
	if (!student) throw error(404, 'Siswa tidak ditemukan');

	return {
		studentData: student
	};
};

export const actions: Actions = {
	default: async ({ request, params, platform }) => {
		const rawDb = platform?.env?.DB;
		if (!rawDb) return fail(500, { error: 'Database not available' });
		const db = getDb(rawDb);

		const data = await request.formData();
		const formData = {
			name: data.get('name') as string,
			email: data.get('email') as string,
			phone: data.get('phone') as string,
			jlptLevel: data.get('jlptLevel') as any,
			status: data.get('status') === 'active' ? 'active' : 'inactive',
			notes: data.get('notes') as string
		};

		const result = studentSchema.safeParse(formData);

		if (!result.success) {
			const errors = result.error.flatten().fieldErrors;
			return fail(400, { 
				error: 'Validasi gagal', 
				fieldErrors: errors,
				...formData 
			});
		}

		try {
			await updateStudent(db, params.id, result.data);
		} catch (e: any) {
			return fail(400, { error: e.message || 'Gagal menyimpan perubahan', ...formData });
		}

		throw redirect(303, `/students/${params.id}`);
	}
};
