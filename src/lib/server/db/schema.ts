import { sqliteTable as table } from 'drizzle-orm/sqlite-core';
import * as t from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// ─── Helper ──────────────────────────────────────────
const timestamps = {
	createdAt: t.text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
	updatedAt: t.text('updated_at').notNull().$defaultFn(() => new Date().toISOString())
};

const id = t.text('id').primaryKey().$defaultFn(() => crypto.randomUUID());

// ─── Auth tables (Better Auth managed) ───────────────
const authTimestamps = {
	createdAt: t.integer('created_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
	updatedAt: t.integer('updated_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date())
};

export const users = table('users', {
	id,
	name: t.text('name').notNull(),
	email: t.text('email').notNull().unique(),
	emailVerified: t.integer('email_verified', { mode: 'boolean' }).default(false),
	image: t.text('image'),
	role: t.text('role').$type<'owner' | 'teacher' | 'student'>().default('teacher').notNull(),
	...authTimestamps
});

export const sessions = table('sessions', {
	id,
	userId: t.text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	token: t.text('token').notNull().unique(),
	expiresAt: t.integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
	ipAddress: t.text('ip_address'),
	userAgent: t.text('user_agent'),
	...authTimestamps
});

export const accounts = table('accounts', {
	id,
	userId: t.text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	accountId: t.text('account_id').notNull(),
	providerId: t.text('provider_id').notNull(),
	accessToken: t.text('access_token'),
	refreshToken: t.text('refresh_token'),
	accessTokenExpiresAt: t.integer('access_token_expires_at', { mode: 'timestamp_ms' }),
	refreshTokenExpiresAt: t.integer('refresh_token_expires_at', { mode: 'timestamp_ms' }),
	scope: t.text('scope'),
	idToken: t.text('id_token'),
	password: t.text('password'),
	...authTimestamps
});

export const verifications = table('verifications', {
	id,
	identifier: t.text('identifier').notNull(),
	value: t.text('value').notNull(),
	expiresAt: t.integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
	...authTimestamps
});

// ─── Domain tables ───────────────────────────────────

export const students = table('students', {
	id,
	userId: t.text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
	phone: t.text('phone'),
	jlptLevel: t.text('jlpt_level').$type<'N5' | 'N4' | 'N3' | 'N2' | 'N1'>().default('N5'),
	enrollmentDate: t.text('enrollment_date').notNull(),
	status: t.text('status').$type<'active' | 'inactive'>().default('active').notNull(),
	notes: t.text('notes')
});

export const teachers = table('teachers', {
	id,
	userId: t.text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
	phone: t.text('phone'),
	specialization: t.text('specialization', { mode: 'json' }).$type<string[]>().default([]),
	availability: t.text('availability', { mode: 'json' }).$type<Record<string, string[]>>().default({}),
	notes: t.text('notes')
});

export const classes = table('classes', {
	id,
	name: t.text('name').notNull(),
	level: t.text('level').$type<'N5' | 'N4' | 'N3' | 'N2' | 'N1' | 'Kaiwa' | 'SSW'>().notNull(),
	teacherId: t.text('teacher_id').references(() => teachers.id, { onDelete: 'set null' }),
	scheduleDay: t.text('schedule_day').$type<'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'>().notNull(),
	scheduleTime: t.text('schedule_time').notNull(),
	durationMinutes: t.integer('duration_minutes').notNull().default(60),
	meetingLink: t.text('meeting_link'),
	maxStudents: t.integer('max_students').default(10),
	status: t.text('status').$type<'active' | 'completed' | 'cancelled'>().default('active').notNull(),
	...timestamps
});

export const classSessions = table('class_sessions', {
	id,
	classId: t.text('class_id').notNull().references(() => classes.id, { onDelete: 'cascade' }),
	sessionDate: t.text('session_date').notNull(),
	sessionNumber: t.integer('session_number').notNull(),
	topic: t.text('topic'),
	notes: t.text('notes'),
	status: t.text('status').$type<'scheduled' | 'completed' | 'cancelled'>().default('scheduled').notNull()
});

export const enrollments = table('enrollments', {
	id,
	studentId: t.text('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
	classId: t.text('class_id').notNull().references(() => classes.id, { onDelete: 'cascade' }),
	enrolledAt: t.text('enrolled_at').notNull().$defaultFn(() => new Date().toISOString()),
	status: t.text('status').$type<'active' | 'dropped' | 'completed'>().default('active').notNull()
});

export const attendance = table('attendance', {
	id,
	sessionId: t.text('session_id').notNull().references(() => classSessions.id, { onDelete: 'cascade' }),
	studentId: t.text('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
	status: t.text('status').$type<'present' | 'absent' | 'late' | 'excused'>().default('absent').notNull(),
	notes: t.text('notes')
});

export const progress = table('progress', {
	id,
	studentId: t.text('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
	classId: t.text('class_id').notNull().references(() => classes.id, { onDelete: 'cascade' }),
	sessionId: t.text('session_id').references(() => classSessions.id, { onDelete: 'set null' }),
	jlptProgress: t.text('jlpt_progress'),
	score: t.integer('score'),
	notes: t.text('notes'),
	createdAt: t.text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
	createdBy: t.text('created_by').references(() => users.id, { onDelete: 'set null' })
});

export const invoices = table('invoices', {
	id,
	studentId: t.text('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
	amount: t.integer('amount').notNull(),
	period: t.text('period').notNull(),
	dueDate: t.text('due_date').notNull(),
	status: t.text('status').$type<'pending' | 'paid' | 'overdue'>().default('pending').notNull(),
	description: t.text('description'),
	...timestamps
});

export const payments = table('payments', {
	id,
	invoiceId: t.text('invoice_id').notNull().references(() => invoices.id, { onDelete: 'cascade' }),
	amount: t.integer('amount').notNull(),
	paymentDate: t.text('payment_date').notNull(),
	paymentMethod: t.text('payment_method').$type<'transfer' | 'cash' | 'ewallet'>().notNull(),
	verified: t.integer('verified', { mode: 'boolean' }).default(false),
	verifiedBy: t.text('verified_by').references(() => users.id, { onDelete: 'set null' }),
	notes: t.text('notes'),
	...timestamps
});

// ─── Relations ───────────────────────────────────────

export const usersRelations = relations(users, ({ one, many }) => ({
	student: one(students, { fields: [users.id], references: [students.userId] }),
	teacher: one(teachers, { fields: [users.id], references: [teachers.userId] }),
	sessions: many(sessions)
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
	user: one(users, { fields: [students.userId], references: [users.id] }),
	enrollments: many(enrollments),
	attendance: many(attendance),
	progress: many(progress),
	invoices: many(invoices)
}));

export const teachersRelations = relations(teachers, ({ one, many }) => ({
	user: one(users, { fields: [teachers.userId], references: [users.id] }),
	classes: many(classes)
}));

export const classesRelations = relations(classes, ({ one, many }) => ({
	teacher: one(teachers, { fields: [classes.teacherId], references: [teachers.id] }),
	sessions: many(classSessions),
	enrollments: many(enrollments)
}));

export const classSessionsRelations = relations(classSessions, ({ one, many }) => ({
	class: one(classes, { fields: [classSessions.classId], references: [classes.id] }),
	attendance: many(attendance),
	progress: many(progress)
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
	student: one(students, { fields: [enrollments.studentId], references: [students.id] }),
	class: one(classes, { fields: [enrollments.classId], references: [classes.id] })
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
	session: one(classSessions, { fields: [attendance.sessionId], references: [classSessions.id] }),
	student: one(students, { fields: [attendance.studentId], references: [students.id] })
}));

export const progressRelations = relations(progress, ({ one }) => ({
	student: one(students, { fields: [progress.studentId], references: [students.id] }),
	class: one(classes, { fields: [progress.classId], references: [classes.id] }),
	session: one(classSessions, { fields: [progress.sessionId], references: [classSessions.id] })
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
	student: one(students, { fields: [invoices.studentId], references: [students.id] }),
	payments: many(payments)
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
	invoice: one(invoices, { fields: [payments.invoiceId], references: [invoices.id] })
}));
