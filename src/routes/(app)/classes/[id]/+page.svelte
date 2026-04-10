<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let loading = $state(false);

	let showProgressModal = $state(false);
	let showEditClassModal = $state(false);
	let showAddStudentModal = $state(false);
	let showUnenrollModal = $state<any>(null);
	
	let selectedStudentId = $state('');
	let studentSearch = $state('');
	let ignoreConflict = $state(false);
	
	let cls = $derived(data.classData);
	
	// Filter students for the "Add Student" modal
	let availableStudents = $derived(
		data.students.filter(s => 
			!cls?.enrollments.some(e => e.studentId === s.id) &&
			(s.user?.name?.toLowerCase().includes(studentSearch.toLowerCase()) || 
			 s.user?.email?.toLowerCase().includes(studentSearch.toLowerCase()))
		)
	);

	const days = [
		{ value: 'monday', label: 'Senin' }, { value: 'tuesday', label: 'Selasa' },
		{ value: 'wednesday', label: 'Rabu' }, { value: 'thursday', label: 'Kamis' },
		{ value: 'friday', label: 'Jumat' }, { value: 'saturday', label: 'Sabtu' },
		{ value: 'sunday', label: 'Minggu' }
	];

	function formatDays(dayStr: string) {
		if (!dayStr) return '-';
		return dayStr.split(',').map(d => days.find(day => day.value === d)?.label || d).join(', ');
	}
</script>

<svelte:head>
	<title>{cls?.name || 'Detail Kelas'} - BenkyouLab</title>
</svelte:head>

<!-- Edit Class Modal -->
{#if showEditClassModal && cls}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 no-print">
		<button type="button" class="absolute inset-0 bg-surface-900/40 backdrop-blur-sm" onclick={() => showEditClassModal = false} onkeydown={(e) => e.key === 'Escape' && (showEditClassModal = false)} aria-label="Tutup modal"></button>
		<div class="relative w-full max-w-lg bg-white dark:bg-surface-900 rounded-2xl shadow-xl overflow-hidden animate-slide-up border border-surface-200 dark:border-white/10">
			<form method="POST" action="?/update" use:enhance={() => { loading = true; return async ({ update }) => { loading = false; await update(); showEditClassModal = false; }; }} class="p-6 space-y-4">
				<div class="flex items-center justify-between pb-3 border-b border-surface-100 dark:border-white/5">
					<h3 class="text-lg font-bold text-surface-800 dark:text-white/90">Edit Pengaturan Kelas</h3>
					<button type="button" onclick={() => showEditClassModal = false} class="p-1.5 text-surface-800/40 hover:bg-surface-100 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer" aria-label="Tutup">
						<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
					</button>
				</div>
				
				<div class="grid grid-cols-2 gap-4">
					<div class="col-span-2">
						<label for="name" class="block text-xs font-semibold text-surface-800/50 uppercase tracking-wider mb-1.5">Nama Kelas</label>
						<input type="text" id="name" name="name" value={cls.name} required class="w-full px-4 py-2 bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/30" />
					</div>
					
					<div>
						<label for="level" class="block text-xs font-semibold text-surface-800/50 uppercase tracking-wider mb-1.5">Level</label>
						<select id="level" name="level" value={cls.level} class="w-full px-4 py-2 bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-white/10 rounded-xl text-sm">
							<option value="N5">N5</option>
							<option value="N4">N4</option>
							<option value="N3">N3</option>
							<option value="N2">N2</option>
							<option value="N1">N1</option>
							<option value="Kaiwa">Kaiwa</option>
							<option value="SSW">SSW</option>
						</select>
					</div>
					
					<div>
						<label for="teacherId" class="block text-xs font-semibold text-surface-800/50 uppercase tracking-wider mb-1.5">Pengajar</label>
						<select id="teacherId" name="teacherId" value={cls.teacherId} class="w-full px-4 py-2 bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-white/10 rounded-xl text-sm">
							<option value="">Tanpa Pengajar</option>
							{#each data.teachers as teacher}
								<option value={teacher.id}>{teacher.user?.name}</option>
							{/each}
						</select>
					</div>

					<div class="col-span-2">
						<label class="block text-xs font-semibold text-surface-800/50 uppercase tracking-wider mb-2">Hari</label>
						<div class="grid grid-cols-2 gap-2">
							{#each days as day}
								<label class="flex items-center gap-2 p-2 rounded-lg bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-white/10 cursor-pointer text-xs">
									<input type="checkbox" name="scheduleDay" value={day.value} checked={cls.scheduleDay.includes(day.value)} class="w-3.5 h-3.5 rounded text-primary-500" />
									<span class="text-surface-800/70 dark:text-white/60">{day.label}</span>
								</label>
							{/each}
						</div>
					</div>

					<div>
						<label for="scheduleTime" class="block text-xs font-semibold text-surface-800/50 uppercase tracking-wider mb-1.5">Jam Mulai</label>
						<input type="time" id="scheduleTime" name="scheduleTime" value={cls.scheduleTime} class="w-full px-4 py-2 bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-white/10 rounded-xl text-sm" />
					</div>

					<div>
						<label for="durationMinutes" class="block text-xs font-semibold text-surface-800/50 uppercase tracking-wider mb-1.5">Durasi (Menit)</label>
						<input type="number" id="durationMinutes" name="durationMinutes" value={cls.durationMinutes} class="w-full px-4 py-2 bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-white/10 rounded-xl text-sm" />
					</div>

					<div>
						<label for="maxStudents" class="block text-xs font-semibold text-surface-800/50 uppercase tracking-wider mb-1.5">Max Siswa</label>
						<input type="number" id="maxStudents" name="maxStudents" value={cls.maxStudents} class="w-full px-4 py-2 bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-white/10 rounded-xl text-sm" />
					</div>

					<div class="col-span-2">
						<label for="meetingLink" class="block text-xs font-semibold text-surface-800/50 uppercase tracking-wider mb-1.5">Link Meeting</label>
						<input type="url" id="meetingLink" name="meetingLink" value={cls.meetingLink} placeholder="https://..." class="w-full px-4 py-2 bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-white/10 rounded-xl text-sm" />
					</div>

					<div class="col-span-2">
						<label for="status" class="block text-xs font-semibold text-surface-800/50 uppercase tracking-wider mb-1.5">Status Kelas</label>
						<select id="status" name="status" value={cls.status} class="w-full px-4 py-2 bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-white/10 rounded-xl text-sm">
							<option value="active">Aktif</option>
							<option value="completed">Selesai</option>
							<option value="cancelled">Dibatalkan</option>
						</select>
					</div>
				</div>

				<div class="flex justify-end gap-3 pt-4">
					<button type="button" onclick={() => showEditClassModal = false} class="px-4 py-2 text-surface-800/50 dark:text-white/40 hover:text-surface-800 dark:hover:text-white text-sm font-medium transition-colors cursor-pointer">Batal</button>
					<button type="submit" disabled={loading} class="px-6 py-2.5 bg-primary-500 text-white text-sm font-bold rounded-xl hover:bg-primary-600 disabled:opacity-50 transition-all shadow-lg shadow-primary-500/20 cursor-pointer">
						{loading ? 'Menyimpan...' : 'Simpan Perubahan'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Add Student Modal -->
{#if showAddStudentModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 no-print">
		<button type="button" class="absolute inset-0 bg-surface-900/40 backdrop-blur-sm" onclick={() => { showAddStudentModal = false; ignoreConflict = false; }} onkeydown={(e) => e.key === 'Escape' && (showAddStudentModal = false)} aria-label="Tutup modal"></button>
		<div class="relative w-full max-w-md bg-white dark:bg-surface-900 rounded-2xl shadow-xl overflow-hidden animate-slide-up border border-surface-200 dark:border-white/10 flex flex-col max-h-[80vh]">
			<div class="p-6 border-b border-surface-100 dark:border-white/5">
				<div class="flex items-center justify-between mb-4">
					<h3 class="text-lg font-bold text-surface-800 dark:text-white/90">Tambah Siswa ke Kelas</h3>
					<button type="button" onclick={() => { showAddStudentModal = false; ignoreConflict = false; }} class="p-1.5 text-surface-800/40 hover:bg-surface-100 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer" aria-label="Tutup">
						<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
					</button>
				</div>
				<div class="relative">
					<input type="text" bind:value={studentSearch} placeholder="Cari nama atau email siswa..." class="w-full pl-10 pr-4 py-2.5 bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/30" />
					<svg class="w-4 h-4 absolute left-3.5 top-3 text-surface-800/40 dark:text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
				</div>
			</div>

			<div class="flex-1 overflow-y-auto p-4 space-y-2">
				{#each availableStudents as student}
					<div class="flex items-center justify-between p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-white/5 transition-colors">
						<div class="flex-1 min-w-0 pr-3">
							<p class="text-sm font-medium text-surface-800 dark:text-white/90 truncate">{student.user?.name}</p>
							<p class="text-[10px] text-surface-800/40 dark:text-white/30 truncate">{student.user?.email}</p>
						</div>
						<form method="POST" action="?/enroll" use:enhance={() => { loading = true; return async ({ result, update }) => { loading = false; if (result.type === 'success') { showAddStudentModal = false; ignoreConflict = false; } await update(); }; }}>
							<input type="hidden" name="studentId" value={student.id} />
							<input type="hidden" name="ignoreConflict" value={ignoreConflict} />
							
							{#if form?.error && form?.studentId === student.id}
								<div class="flex flex-col items-end gap-2">
									<p class="text-[10px] text-red-500 font-medium max-w-[150px] text-right">⚠️ Konflik Jadwal!</p>
									<button type="submit" onclick={() => ignoreConflict = true} class="px-3 py-1 bg-amber-500 text-white text-[10px] font-bold rounded-lg hover:bg-amber-600 transition-colors cursor-pointer">
										Tetap Tambah
									</button>
								</div>
							{:else}
								<button type="submit" disabled={loading} class="px-3 py-1.5 bg-primary-500/10 text-primary-500 text-xs font-bold rounded-lg hover:bg-primary-500 hover:text-white transition-all cursor-pointer">
									+ Pilih
								</button>
							{/if}
						</form>
					</div>
				{:else}
					<div class="p-8 text-center text-sm text-surface-800/40 dark:text-white/30 italic">
						Tidak ada siswa aktif lain ditemukan.
					</div>
				{/each}
			</div>
		</div>
	</div>
{/if}

<!-- Unenroll Confirmation Modal -->
{#if showUnenrollModal}
	<div class="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 no-print">
		<button type="button" class="absolute inset-0 bg-surface-900/40 backdrop-blur-sm" onclick={() => showUnenrollModal = null} onkeydown={(e) => e.key === 'Escape' && (showUnenrollModal = null)} aria-label="Tutup modal"></button>
		<div class="relative w-full max-w-sm bg-white dark:bg-surface-900 rounded-2xl shadow-xl p-6 animate-slide-up border border-surface-200 dark:border-white/10">
			<h3 class="text-lg font-bold text-surface-800 dark:text-white/90 mb-2">Keluarkan Siswa?</h3>
			<p class="text-sm text-surface-800/60 dark:text-white/50 mb-6">
				Anda akan mengeluarkan <strong>{showUnenrollModal.student.user.name}</strong> dari kelas ini. Data kehadiran yang sudah ada akan tetap tersimpan sebagai riwayat.
			</p>
			
			<form method="POST" action="?/unenroll" use:enhance={() => { loading = true; return async ({ update }) => { loading = false; showUnenrollModal = null; await update(); }; }}>
				<input type="hidden" name="studentId" value={showUnenrollModal.studentId} />
				<div class="flex justify-end gap-3">
					<button type="button" onclick={() => showUnenrollModal = null} class="px-4 py-2 text-sm font-medium text-surface-800/50 dark:text-white/40 hover:text-surface-800 dark:hover:text-white cursor-pointer transition-colors">Batal</button>
					<button type="submit" disabled={loading} class="px-5 py-2 bg-red-500 text-white text-sm font-bold rounded-xl hover:bg-red-600 disabled:opacity-50 transition-colors cursor-pointer">
						{loading ? 'Mengeluarkan...' : 'Ya, Keluarkan'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Progress Modal -->
{#if showProgressModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 no-print">
		<button type="button" class="absolute inset-0 bg-surface-900/40 backdrop-blur-sm" onclick={() => showProgressModal = false} onkeydown={(e) => e.key === 'Escape' && (showProgressModal = false)} aria-label="Tutup modal"></button>
		<div class="relative w-full max-w-md bg-white dark:bg-surface-900 rounded-2xl shadow-xl overflow-hidden animate-slide-up border border-surface-200 dark:border-white/10">
			<form method="POST" action="?/recordProgress" use:enhance={() => { loading = true; return async ({ update }) => { loading = false; await update(); showProgressModal = false; }; }} class="p-6 space-y-5">
				<div class="flex items-center justify-between pb-3 border-b border-surface-100 dark:border-white/5">
					<h3 class="text-lg font-bold text-surface-800 dark:text-white/90">Catat Progress Siswa</h3>
					<button type="button" onclick={() => showProgressModal = false} class="p-1.5 text-surface-800/40 hover:bg-surface-100 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer" aria-label="Tutup">
						<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
					</button>
				</div>
				
				<input type="hidden" name="studentId" value={selectedStudentId} />
				<input type="hidden" name="sessionId" value={cls?.sessions.at(-1)?.id || ''} />

				<div>
					<label for="jlptProgress" class="block text-sm font-medium text-surface-800/70 dark:text-white/60 mb-1.5">Progress JLPT / Buku</label>
					<input type="text" id="jlptProgress" name="jlptProgress" placeholder="Bab 5 / Hal 42 / Kanji dll..." class="w-full px-4 py-2.5 bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all" />
				</div>
				
				<div>
					<label for="score" class="block text-sm font-medium text-surface-800/70 dark:text-white/60 mb-1.5">Nilai (Opsional)</label>
					<input type="number" id="score" name="score" min="0" max="100" class="w-full px-4 py-2.5 bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all" />
				</div>
				
				<div>
					<label for="notes" class="block text-sm font-medium text-surface-800/70 dark:text-white/60 mb-1.5">Catatan</label>
					<textarea id="notes" name="notes" rows="3" class="w-full px-4 py-2.5 bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-white/10 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all"></textarea>
				</div>

				<div class="flex justify-end gap-3 pt-4">
					<button type="button" onclick={() => showProgressModal = false} class="px-4 py-2 bg-transparent text-surface-800/50 dark:text-white/40 hover:text-surface-800 dark:hover:text-white text-sm font-medium transition-colors cursor-pointer">Batal</button>
					<button type="submit" disabled={loading} class="px-5 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors cursor-pointer">
						{loading ? 'Menyimpan...' : 'Simpan Progress'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<div class="space-y-6">
	{#if !cls}
		<div class="p-8 text-center text-surface-800/50 dark:text-white/40">
			Memuat data... Jika kelas tidak ditemukan, silakan kembali.
		</div>
	{:else}
		<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
			<div class="flex items-center gap-3">
				<a href="/classes" class="p-2 justify-center flex items-center rounded-lg text-surface-800/40 dark:text-white/30 hover:bg-surface-100 dark:hover:bg-white/5 transition-colors" aria-label="Kembali ke Daftar Kelas">
					<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
				</a>
				<div>
					<h1 class="text-2xl font-bold text-surface-800 dark:text-white/95">{cls.name}</h1>
					<p class="text-sm text-surface-800/50 dark:text-white/40">{cls.level} • {cls.teacher?.user?.name || 'Tanpa Pengajar'}</p>
				</div>
				<button onclick={() => showEditClassModal = true} class="p-1.5 rounded-lg text-surface-800/30 hover:text-primary-500 hover:bg-primary-500/5 transition-all transition-colors cursor-pointer" title="Edit Kelas" aria-label="Edit Kelas">
					<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
				</button>
			</div>
			
			<div class="flex items-center gap-4 text-sm font-medium no-print">
				<div class="px-3 py-1.5 rounded-lg bg-surface-100 dark:bg-surface-800/50 text-surface-800/70 dark:text-white/60">
					<span class="capitalize">{formatDays(cls.scheduleDay)}</span>, {cls.scheduleTime} ({cls.durationMinutes}m)
				</div>
				{#if cls.status === 'active'}
					<span class="px-3 py-1 flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 text-xs">
						<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Aktif
					</span>
				{:else}
					<span class="px-3 py-1 flex items-center gap-2 rounded-full border border-surface-500/20 bg-surface-500/10 text-surface-500 text-xs">
						<span class="w-1.5 h-1.5 rounded-full bg-surface-500"></span> {cls.status}
					</span>
				{/if}
			</div>
		</div>

		{#if form?.error && !form?.studentId}
			<div class="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm animate-shake">{form.error}</div>
		{/if}
		{#if form?.success}
			<div class="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 text-sm animate-fade-in">Berhasil memperbarui data!</div>
		{/if}

		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- Enrolled Students & Progress -->
			<div class="lg:col-span-2 space-y-6">
				<div class="bg-white dark:bg-surface-900/50 rounded-2xl border border-surface-200 dark:border-white/5 overflow-hidden">
					<div class="p-5 border-b border-surface-200 dark:border-white/5 flex items-center justify-between">
						<div class="flex items-center gap-2">
							<h3 class="font-bold text-surface-800 dark:text-white/90">Siswa Terdaftar</h3>
							<span class="px-2 py-0.5 bg-primary-500/10 text-primary-500 text-[10px] font-bold rounded-full border border-primary-500/10 uppercase tracking-tighter">
								{cls.enrollments.length} / {cls.maxStudents}
							</span>
						</div>
						<button onclick={() => showAddStudentModal = true} class="flex items-center gap-1.5 px-3 py-1.5 bg-primary-500 text-white text-[11px] font-bold rounded-lg hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/10 active:scale-95 cursor-pointer no-print">
							<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
							Tambah Siswa
						</button>
					</div>
					
					{#if cls.enrollments.length === 0}
						<div class="p-8 text-center text-sm text-surface-800/40 dark:text-white/30 italic">
							Belum ada siswa yang terdaftar. Gunakan tombol "Tambah Siswa" di atas.
						</div>
					{:else}
						<div class="divide-y divide-surface-100 dark:divide-white/5">
							{#each cls.enrollments as enrollment}
								<div class="p-4 flex items-center justify-between group flex-wrap gap-4 hover:bg-surface-50 dark:hover:bg-white/[0.01] transition-colors">
									<div class="flex flex-col gap-1">
										<p class="font-bold text-sm text-surface-800 dark:text-white/90 leading-none">
											{enrollment.student?.user?.name || 'Siswa Terhapus'}
										</p>
										<p class="text-[10px] font-medium text-surface-800/40 dark:text-white/30">
											{enrollment.student?.user?.email || '-'}
										</p>
									</div>
									<div class="flex items-center gap-2">
										<button 
											onclick={() => { selectedStudentId = enrollment.studentId; showProgressModal = true; }}
											class="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold rounded-lg bg-primary-500/10 text-primary-500 hover:bg-primary-500 hover:text-white transition-all cursor-pointer no-print"
										>
											<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
											Progress
										</button>
										<button 
											onclick={() => showUnenrollModal = enrollment}
											class="p-1.5 rounded-lg text-red-500/30 hover:text-red-500 hover:bg-red-500/5 transition-all opacity-0 group-hover:opacity-100 cursor-pointer no-print"
											title="Keluarkan dari kelas"
											aria-label="Keluarkan siswa"
										>
											<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
										</button>
										<a href="/students/{enrollment.studentId}" class="p-1.5 rounded-lg text-surface-800/40 hover:bg-surface-100 dark:text-white/30 dark:hover:bg-white/5 transition-all outline-none" aria-label="Lihat Profil Siswa">
											<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
										</a>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>

			<!-- Sessions -->
			<div class="space-y-6">
				<div class="bg-white dark:bg-surface-900/50 rounded-2xl border border-surface-200 dark:border-white/5 overflow-hidden">
					<div class="p-5 border-b border-surface-200 dark:border-white/5 no-print">
						<h3 class="font-bold text-surface-800 dark:text-white/90">Sesi Kelas</h3>
					</div>
					
					<div class="p-4 border-b border-surface-100 dark:border-white/5 bg-surface-50 dark:bg-surface-800/20 no-print">
						<form method="POST" action="?/addSession" use:enhance={() => { loading = true; return async ({ update }) => { loading = false; await update(); }; }} class="space-y-3">
							<div class="grid grid-cols-2 gap-2">
								<input type="date" name="sessionDate" required class="w-full px-3 py-2 bg-white dark:bg-surface-800 border border-surface-200 dark:border-white/10 rounded-lg text-sm" />
								<input type="time" name="sessionTime" value={cls.scheduleTime} class="w-full px-3 py-2 bg-white dark:bg-surface-800 border border-surface-200 dark:border-white/10 rounded-lg text-sm" />
							</div>
							<input type="url" name="meetingLink" value={cls.meetingLink} placeholder="Link Meeting (Opsional)" class="w-full px-3 py-2 bg-white dark:bg-surface-800 border border-surface-200 dark:border-white/10 rounded-lg text-sm" />
							<input type="text" name="topic" placeholder="Materi / Topik" class="w-full px-3 py-2 bg-white dark:bg-surface-800 border border-surface-200 dark:border-white/10 rounded-lg text-sm" />
							<button type="submit" disabled={loading} class="w-full px-3 py-2 bg-surface-800 dark:bg-white/10 text-white text-sm font-medium rounded-lg hover:bg-surface-700 dark:hover:bg-white/20 transition-all cursor-pointer disabled:opacity-50">
								+ Tambah Sesi
							</button>
						</form>
					</div>

					{#if cls.sessions.length === 0}
						<div class="p-6 text-center text-sm text-surface-800/40 dark:text-white/30 italic">
							Belum ada sesi tercatat.
						</div>
					{:else}
						<div class="divide-y divide-surface-100 dark:divide-white/5 max-h-[500px] overflow-y-auto">
							{#each cls.sessions as session}
								<div class="p-4 space-y-2 hover:bg-surface-50 dark:hover:bg-white/[0.01] transition-colors relative group">
									<div class="flex items-center justify-between">
										<span class="text-[10px] font-bold text-primary-500 uppercase tracking-wider">Sesi {session.sessionNumber}</span>
										<div class="flex items-center gap-2">
											{#if session.status === 'scheduled'}
												<form method="POST" action="?/completeSession" use:enhance>
													<input type="hidden" name="sessionId" value={session.id} />
													<input type="hidden" name="status" value="completed" />
													<button type="submit" class="p-1 rounded bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all cursor-pointer opacity-0 group-hover:opacity-100" title="Tandai Selesai">
														<svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
													</button>
												</form>
											{/if}
											<span class="text-[9px] font-bold px-1.5 py-0.5 rounded {session.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-surface-100 dark:bg-white/5 text-surface-800/40 dark:text-white/30'} uppercase">
												{session.status}
											</span>
										</div>
									</div>
									<div class="flex items-center justify-between">
										<p class="text-sm font-bold text-surface-800 dark:text-white/90 font-mono tracking-tight">{session.sessionDate}</p>
										{#if session.sessionTime}
											<p class="text-[11px] text-surface-800/50 dark:text-white/40">{session.sessionTime}</p>
										{/if}
									</div>
									{#if session.topic}
										<p class="text-xs text-surface-800/60 dark:text-white/50 leading-relaxed">{session.topic}</p>
									{/if}
									{#if session.meetingLink}
										<a href={session.meetingLink} target="_blank" class="flex items-center gap-1.5 text-[10px] text-primary-500 hover:underline">
											<svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>
											Link Sesi ini
										</a>
									{/if}
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>
