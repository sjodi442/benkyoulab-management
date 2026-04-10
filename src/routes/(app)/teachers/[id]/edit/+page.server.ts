import { error, fail, redirect } from '@sveltejs/kit';
import { getTeacher, updateTeacher } from '$lib/server/services/teachers';
import { getDb } from '$lib/server/db';
import { teacherSchema } from '$lib/server/validations';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, platform }) => {
	const rawDb = platform?.env?.DB;
	if (!rawDb) throw error(500, 'Database not available');
	const db = getDb(rawDb);

	const teacher = await getTeacher(db, params.id);
	if (!teacher) throw error(404, 'Guru tidak ditemukan');

	return {
		teacherData: teacher
	};
};

export const actions: Actions = {
	default: async ({ request, params, platform }) => {
		const rawDb = platform?.env?.DB;
		if (!rawDb) return fail(500, { error: 'Database not available' });
		const db = getDb(rawDb);

		const data = await request.formData();
		const specializationStr = data.get('specialization') as string;
		const formData = {
			name: data.get('name') as string,
			email: data.get('email') as string,
			phone: data.get('phone') as string,
			specialization: specializationStr ? specializationStr.split(',').map(s => s.trim()).filter(Boolean) : [],
			notes: data.get('notes') as string
		};

		const result = teacherSchema.safeParse(formData);

		if (!result.success) {
			const errors = result.error.flatten().fieldErrors;
			return fail(400, { 
				error: 'Validasi gagal', 
				fieldErrors: errors,
				...formData 
			});
		}

		try {
			await updateTeacher(db, params.id, result.data);
		} catch (e: any) {
			return fail(400, { error: e.message || 'Gagal menyimpan perubahan', ...formData });
		}

		throw redirect(303, `/teachers/${params.id}`);
	}
};
