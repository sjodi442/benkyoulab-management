import { z } from 'zod';

export const studentSchema = z.object({
	name: z.string().min(2, 'Nama minimal 2 karakter').max(100, 'Nama terlalu panjang'),
	email: z.string().email('Format email tidak valid'),
	phone: z.string().optional().nullable(),
	jlptLevel: z.enum(['N5', 'N4', 'N3', 'N2', 'N1']).optional(),
	status: z.enum(['active', 'inactive']).default('active'),
	notes: z.string().max(500, 'Catatan terlalu panjang').optional().nullable()
});

export const teacherSchema = z.object({
	name: z.string().min(2, 'Nama minimal 2 karakter').max(100, 'Nama terlalu panjang'),
	email: z.string().email('Format email tidak valid'),
	phone: z.string().optional().nullable(),
	specialization: z.array(z.string()).default([]),
	notes: z.string().max(1000, 'Bio terlalu panjang').optional().nullable()
});

export type StudentInput = z.infer<typeof studentSchema>;
export type TeacherInput = z.infer<typeof teacherSchema>;
