/**
 * Seed script for BenkyouLab Management System
 * Run with: npx wrangler d1 execute benkyoulab-db --local --file=./seed.sql
 */

-- Owner account is created dynamically via better-auth endpoint (`/api/seed-admin`)
-- Create teachers
INSERT INTO users (id, name, email, email_verified, role, created_at, updated_at) VALUES
('teacher-001', 'Tanaka Yuki', 'tanaka@benkyoulab.com', 1, 'teacher', 1767225600000, 1767225600000),
('teacher-002', 'Sato Kenji', 'sato@benkyoulab.com', 1, 'teacher', 1767225600000, 1767225600000),
('teacher-003', 'Yamada Aiko', 'yamada@benkyoulab.com', 1, 'teacher', 1767225600000, 1767225600000);

INSERT INTO accounts (id, user_id, account_id, provider_id, password, created_at, updated_at) VALUES
('acc-t001', 'teacher-001', 'teacher-001', 'credential', 'seeded-password-hash', 1767225600000, 1767225600000),
('acc-t002', 'teacher-002', 'teacher-002', 'credential', 'seeded-password-hash', 1767225600000, 1767225600000),
('acc-t003', 'teacher-003', 'teacher-003', 'credential', 'seeded-password-hash', 1767225600000, 1767225600000);

INSERT INTO teachers (id, user_id, phone, specialization, availability, notes) VALUES
('t-001', 'teacher-001', '081234567001', '["N5","N4","Kaiwa"]', '{"monday":["09:00-12:00"],"wednesday":["09:00-12:00"],"friday":["09:00-12:00"]}', 'Native Japanese speaker'),
('t-002', 'teacher-002', '081234567002', '["N3","N2","N1"]', '{"tuesday":["13:00-17:00"],"thursday":["13:00-17:00"],"saturday":["09:00-12:00"]}', 'JLPT N1 certified'),
('t-003', 'teacher-003', '081234567003', '["N5","N4","SSW"]', '{"monday":["13:00-17:00"],"wednesday":["13:00-17:00"]}', 'SSW preparation specialist');

-- Create students
INSERT INTO users (id, name, email, email_verified, role, created_at, updated_at) VALUES
('student-001', 'Budi Santoso', 'budi@email.com', 0, 'student', '2026-01-15T00:00:00.000Z', '2026-01-15T00:00:00.000Z'),
('student-002', 'Siti Nurhaliza', 'siti@email.com', 0, 'student', '2026-01-20T00:00:00.000Z', '2026-01-20T00:00:00.000Z'),
('student-003', 'Andi Prasetyo', 'andi@email.com', 0, 'student', '2026-02-01T00:00:00.000Z', '2026-02-01T00:00:00.000Z'),
('student-004', 'Dewi Lestari', 'dewi@email.com', 0, 'student', '2026-02-10T00:00:00.000Z', '2026-02-10T00:00:00.000Z'),
('student-005', 'Rahmat Hidayat', 'rahmat@email.com', 0, 'student', '2026-03-01T00:00:00.000Z', '2026-03-01T00:00:00.000Z');

INSERT INTO students (id, user_id, phone, jlpt_level, enrollment_date, status, notes) VALUES
('s-001', 'student-001', '081111222001', 'N5', '2026-01-15', 'active', 'Pemula, baru mulai belajar'),
('s-002', 'student-002', '081111222002', 'N4', '2026-01-20', 'active', 'Sudah selesai Minna no Nihongo 1'),
('s-003', 'student-003', '081111222003', 'N5', '2026-02-01', 'active', 'Target SSW'),
('s-004', 'student-004', '081111222004', 'N3', '2026-02-10', 'active', 'Persiapan JLPT N2'),
('s-005', 'student-005', '081111222005', 'N5', '2026-03-01', 'inactive', 'Cuti sementara');

-- Create classes
INSERT INTO classes (id, name, level, teacher_id, schedule_day, schedule_time, duration_minutes, meeting_link, max_students, status, created_at, updated_at) VALUES
('c-001', 'Kelas N5 Senin Pagi', 'N5', 't-001', 'monday', '09:00', 60, 'https://zoom.us/j/123456789', 10, 'active', '2026-01-10T00:00:00.000Z', '2026-01-10T00:00:00.000Z'),
('c-002', 'Kelas N4 Rabu Pagi', 'N4', 't-001', 'wednesday', '09:00', 60, 'https://zoom.us/j/234567890', 8, 'active', '2026-01-10T00:00:00.000Z', '2026-01-10T00:00:00.000Z'),
('c-003', 'Kelas N3-N2 Selasa Siang', 'N3', 't-002', 'tuesday', '13:00', 90, 'https://meet.google.com/abc-defg-hij', 6, 'active', '2026-01-10T00:00:00.000Z', '2026-01-10T00:00:00.000Z'),
('c-004', 'Kelas Kaiwa Jumat', 'Kaiwa', 't-001', 'friday', '09:00', 60, 'https://zoom.us/j/345678901', 12, 'active', '2026-02-01T00:00:00.000Z', '2026-02-01T00:00:00.000Z'),
('c-005', 'Kelas SSW Senin Siang', 'SSW', 't-003', 'monday', '13:00', 90, 'https://zoom.us/j/456789012', 8, 'active', '2026-02-01T00:00:00.000Z', '2026-02-01T00:00:00.000Z');

-- Enrollments
INSERT INTO enrollments (id, student_id, class_id, enrolled_at, status) VALUES
('e-001', 's-001', 'c-001', '2026-01-15T00:00:00.000Z', 'active'),
('e-002', 's-001', 'c-004', '2026-02-01T00:00:00.000Z', 'active'),
('e-003', 's-002', 'c-002', '2026-01-20T00:00:00.000Z', 'active'),
('e-004', 's-003', 'c-001', '2026-02-01T00:00:00.000Z', 'active'),
('e-005', 's-003', 'c-005', '2026-02-01T00:00:00.000Z', 'active'),
('e-006', 's-004', 'c-003', '2026-02-10T00:00:00.000Z', 'active');

-- Class sessions
INSERT INTO class_sessions (id, class_id, session_date, session_number, topic, notes, status) VALUES
('cs-001', 'c-001', '2026-01-20', 1, 'Hiragana あ-こ', 'Perkenalan dan hiragana dasar', 'completed'),
('cs-002', 'c-001', '2026-01-27', 2, 'Hiragana さ-と', 'Lanjutan hiragana', 'completed'),
('cs-003', 'c-001', '2026-02-03', 3, 'Hiragana な-ほ', null, 'completed'),
('cs-004', 'c-001', '2026-02-10', 4, 'Hiragana ま-よ', null, 'scheduled'),
('cs-005', 'c-002', '2026-01-22', 1, 'Review Minna 1 Bab 1-5', null, 'completed'),
('cs-006', 'c-003', '2026-01-21', 1, 'N3 Bunpou - ために・ように', null, 'completed');

-- Attendance
INSERT INTO attendance (id, session_id, student_id, status, notes) VALUES
('a-001', 'cs-001', 's-001', 'present', null),
('a-002', 'cs-002', 's-001', 'present', null),
('a-003', 'cs-003', 's-001', 'late', 'Terlambat 10 menit'),
('a-004', 'cs-001', 's-003', 'present', null),
('a-005', 'cs-002', 's-003', 'absent', 'Sakit'),
('a-006', 'cs-003', 's-003', 'present', null),
('a-007', 'cs-005', 's-002', 'present', null),
('a-008', 'cs-006', 's-004', 'present', null);

-- Progress
INSERT INTO progress (id, student_id, class_id, session_id, jlpt_progress, score, notes, created_at, created_by) VALUES
('p-001', 's-001', 'c-001', 'cs-001', 'Hiragana 50%', 85, 'Menguasai あ行-か行 dengan baik', '2026-01-20T00:00:00.000Z', 'teacher-001'),
('p-002', 's-001', 'c-001', 'cs-002', 'Hiragana 70%', 90, 'Progress bagus, perlu review dakuten', '2026-01-27T00:00:00.000Z', 'teacher-001'),
('p-003', 's-002', 'c-002', 'cs-005', 'Minna 1 Bab 5', 78, 'Perlu review partikel', '2026-01-22T00:00:00.000Z', 'teacher-001'),
('p-004', 's-004', 'c-003', 'cs-006', 'N3 Bunpou 10%', 82, 'Bisa menggunakan ために dengan benar', '2026-01-21T00:00:00.000Z', 'teacher-002');

-- Invoices
INSERT INTO invoices (id, student_id, amount, period, due_date, status, description, created_at, updated_at) VALUES
('inv-001', 's-001', 500000, '2026-01', '2026-01-31', 'paid', 'Biaya kursus Januari 2026', '2026-01-01T00:00:00.000Z', '2026-01-15T00:00:00.000Z'),
('inv-002', 's-001', 500000, '2026-02', '2026-02-28', 'paid', 'Biaya kursus Februari 2026', '2026-02-01T00:00:00.000Z', '2026-02-10T00:00:00.000Z'),
('inv-003', 's-002', 300000, '2026-01', '2026-01-31', 'paid', 'Biaya kursus Januari 2026', '2026-01-01T00:00:00.000Z', '2026-01-20T00:00:00.000Z'),
('inv-004', 's-003', 500000, '2026-02', '2026-02-28', 'pending', 'Biaya kursus Februari 2026', '2026-02-01T00:00:00.000Z', '2026-02-01T00:00:00.000Z'),
('inv-005', 's-004', 300000, '2026-02', '2026-02-28', 'overdue', 'Biaya kursus Februari 2026', '2026-02-01T00:00:00.000Z', '2026-02-01T00:00:00.000Z'),
('inv-006', 's-001', 500000, '2026-03', '2026-03-31', 'pending', 'Biaya kursus Maret 2026', '2026-03-01T00:00:00.000Z', '2026-03-01T00:00:00.000Z');

-- Payments
INSERT INTO payments (id, invoice_id, amount, payment_date, payment_method, verified, verified_by, notes, created_at, updated_at) VALUES
('pay-001', 'inv-001', 500000, '2026-01-15', 'transfer', 1, 'teacher-001', 'BCA transfer', '2026-01-15T00:00:00.000Z', '2026-01-15T00:00:00.000Z'),
('pay-002', 'inv-002', 500000, '2026-02-10', 'ewallet', 1, 'teacher-001', 'GoPay', '2026-02-10T00:00:00.000Z', '2026-02-10T00:00:00.000Z'),
('pay-003', 'inv-003', 300000, '2026-01-20', 'cash', 1, 'teacher-001', null, '2026-01-20T00:00:00.000Z', '2026-01-20T00:00:00.000Z');
