<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let loading = $state(false);

	const levels = ['N5', 'N4', 'N3', 'N2', 'N1', 'Kaiwa', 'SSW'];
	const days = [
		{ value: 'monday', label: 'Senin' }, { value: 'tuesday', label: 'Selasa' },
		{ value: 'wednesday', label: 'Rabu' }, { value: 'thursday', label: 'Kamis' },
		{ value: 'friday', label: 'Jumat' }, { value: 'saturday', label: 'Sabtu' },
		{ value: 'sunday', label: 'Minggu' }
	];
</script>

<svelte:head><title>Buat Kelas - BenkyouLab</title></svelte:head>

<div class="max-w-2xl mx-auto space-y-6">
	<div class="flex items-center gap-3">
		<a href="/classes" class="p-2 rounded-lg text-surface-800/40 dark:text-white/30 hover:bg-surface-100 dark:hover:bg-white/5 transition-colors" aria-label="Kembali ke Daftar Kelas">
			<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
		</a>
		<div>
			<h1 class="text-2xl font-bold text-surface-800 dark:text-white/95">Buat Kelas Baru</h1>
			<p class="text-sm text-surface-800/50 dark:text-white/40">Atur jadwal dan detail kelas</p>
		</div>
	</div>

	{#if form?.error}
		<div class="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">{form.error}</div>
	{/if}

	<form method="POST" use:enhance={() => { loading = true; return async ({ update }) => { loading = false; await update(); }; }} class="bg-white dark:bg-surface-900/50 rounded-2xl border border-surface-200 dark:border-white/5 p-6 space-y-5">
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
			<div class="sm:col-span-2">
				<label for="name" class="block text-sm font-medium text-surface-800/70 dark:text-white/60 mb-1.5">Nama Kelas *</label>
				<input type="text" id="name" name="name" required value={form?.name ?? ''} class="w-full px-4 py-2.5 bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-white/10 rounded-xl text-sm text-surface-800 dark:text-white/80 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all" placeholder="Contoh: Kelas N5 Senin" />
			</div>
			<div>
				<label for="level" class="block text-sm font-medium text-surface-800/70 dark:text-white/60 mb-1.5">Level *</label>
				<select id="level" name="level" required class="w-full px-4 py-2.5 bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-white/10 rounded-xl text-sm text-surface-800 dark:text-white/80 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all cursor-pointer">
					{#each levels as level}<option value={level} selected={form?.level === level}>{level}</option>{/each}
				</select>
			</div>
			<div>
				<label for="teacherId" class="block text-sm font-medium text-surface-800/70 dark:text-white/60 mb-1.5">Guru *</label>
				<select id="teacherId" name="teacherId" required class="w-full px-4 py-2.5 bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-white/10 rounded-xl text-sm text-surface-800 dark:text-white/80 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all cursor-pointer">
					<option value="">Pilih guru...</option>
					{#each data.teachers as teacher}<option value={teacher.id} selected={form?.teacherId === teacher.id}>{teacher.user?.name}</option>{/each}
				</select>
			</div>
			<div class="sm:col-span-2">
				<label class="block text-sm font-medium text-surface-800/70 dark:text-white/60 mb-2.5">Hari *</label>
				<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
					{#each days as day}
						<label class="flex items-center gap-2.5 p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-white/10 cursor-pointer transition-all hover:border-primary-500/50 group">
							<input type="checkbox" name="scheduleDay" value={day.value} class="w-4 h-4 rounded text-primary-500 focus:ring-primary-500/30 border-surface-300" />
							<span class="text-sm text-surface-800/70 dark:text-white/60 group-hover:text-surface-800 dark:group-hover:text-white transition-colors">{day.label}</span>
						</label>
					{/each}
				</div>
			</div>
			<div>
				<label for="scheduleTime" class="block text-sm font-medium text-surface-800/70 dark:text-white/60 mb-1.5">Jam *</label>
				<input type="time" id="scheduleTime" name="scheduleTime" required value={form?.scheduleTime ?? '09:00'} class="w-full px-4 py-2.5 bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-white/10 rounded-xl text-sm text-surface-800 dark:text-white/80 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all" />
			</div>
			<div>
				<label for="durationMinutes" class="block text-sm font-medium text-surface-800/70 dark:text-white/60 mb-1.5">Durasi (menit)</label>
				<input type="number" id="durationMinutes" name="durationMinutes" value="60" min="30" max="180" step="15" class="w-full px-4 py-2.5 bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-white/10 rounded-xl text-sm text-surface-800 dark:text-white/80 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all" />
			</div>
			<div>
				<label for="maxStudents" class="block text-sm font-medium text-surface-800/70 dark:text-white/60 mb-1.5">Max Siswa</label>
				<input type="number" id="maxStudents" name="maxStudents" value="10" min="1" max="50" class="w-full px-4 py-2.5 bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-white/10 rounded-xl text-sm text-surface-800 dark:text-white/80 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all" />
			</div>
			<div class="sm:col-span-2">
				<label for="meetingLink" class="block text-sm font-medium text-surface-800/70 dark:text-white/60 mb-1.5">Link Meeting (Zoom/Meet)</label>
				<input type="url" id="meetingLink" name="meetingLink" value={form?.meetingLink ?? ''} class="w-full px-4 py-2.5 bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-white/10 rounded-xl text-sm text-surface-800 dark:text-white/80 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all" placeholder="https://zoom.us/j/..." />
			</div>
		</div>

		<div class="flex items-center justify-end gap-3 pt-3 border-t border-surface-200 dark:border-white/5">
			<a href="/classes" class="px-4 py-2.5 text-sm font-medium text-surface-800/60 dark:text-white/50">Batal</a>
			<button type="submit" disabled={loading} class="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-medium rounded-xl hover:from-primary-400 hover:to-primary-500 shadow-lg shadow-primary-500/25 transition-all disabled:opacity-50 cursor-pointer">
				{loading ? 'Membuat...' : 'Buat Kelas'}
			</button>
		</div>
	</form>
</div>
