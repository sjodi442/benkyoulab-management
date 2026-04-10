<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let student = $derived(data.studentData);
	let loading = $state(false);

	const jlptLevels = ['N5', 'N4', 'N3', 'N2', 'N1'];

	// Helper to safely access form data with TypeScript
	function getFormValue(key: string) {
		return form && key in form ? (form as any)[key] : null;
	}

	function getFieldError(key: string) {
		return form && 'fieldErrors' in form ? (form.fieldErrors as any)[key]?.[0] : null;
	}
</script>

<svelte:head>
	<title>Edit Siswa - BenkyouLab</title>
</svelte:head>

<div class="max-w-2xl mx-auto space-y-6">
	<!-- Header -->
	<div class="flex items-center gap-3">
		<a
			href="/students/{student.id}"
			class="p-2 rounded-lg text-surface-800/40 dark:text-white/30 hover:bg-surface-100 dark:hover:bg-white/5 transition-colors"
			title="Kembali ke detail siswa"
			aria-label="Kembali"
		>
			<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
				<path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
			</svg>
		</a>
		<div>
			<h1 class="text-2xl font-bold text-surface-800 dark:text-white/95">Edit Siswa</h1>
			<p class="text-sm text-surface-800/50 dark:text-white/40">Perbarui data sistem untuk {student.user?.name}</p>
		</div>
	</div>

	{#if form?.error}
		<div class="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
			{form.error}
		</div>
	{/if}

	<!-- Form -->
	<form
		method="POST"
		use:enhance={() => {
			loading = true;
			return async ({ update }) => {
				loading = false;
				await update();
			};
		}}
		class="bg-white dark:bg-surface-900/50 rounded-2xl border border-surface-200 dark:border-white/5 p-6 space-y-5"
	>
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
			<div class="sm:col-span-2">
				<label for="name" class="block text-sm font-medium text-surface-800/70 dark:text-white/60 mb-1.5">Nama Lengkap *</label>
				<input type="text" id="name" name="name" required value={getFormValue('name') ?? student.user?.name ?? ''} class="w-full px-4 py-2.5 bg-surface-50 dark:bg-surface-800/50 border {getFieldError('name') ? 'border-red-500/50' : 'border-surface-200 dark:border-white/10'} rounded-xl text-sm text-surface-800 dark:text-white/80 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all" placeholder="Nama siswa" />
				{#if getFieldError('name')}
					<p class="mt-1 text-[10px] text-red-400">{getFieldError('name')}</p>
				{/if}
			</div>

			<div class="sm:col-span-2">
				<label for="email" class="block text-sm font-medium text-surface-800/70 dark:text-white/60 mb-1.5">Email *</label>
				<input type="email" id="email" name="email" required value={getFormValue('email') ?? student.user?.email ?? ''} class="w-full px-4 py-2.5 bg-surface-50 dark:bg-surface-800/50 border {getFieldError('email') ? 'border-red-500/50' : 'border-surface-200 dark:border-white/10'} rounded-xl text-sm text-surface-800 dark:text-white/80 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all" placeholder="email@example.com" />
				{#if getFieldError('email')}
					<p class="mt-1 text-[10px] text-red-400">{getFieldError('email')}</p>
				{/if}
			</div>

			<div>
				<label for="phone" class="block text-sm font-medium text-surface-800/70 dark:text-white/60 mb-1.5">No. HP</label>
				<input type="tel" id="phone" name="phone" value={getFormValue('phone') ?? student.phone ?? ''} class="w-full px-4 py-2.5 bg-surface-50 dark:bg-surface-800/50 border {getFieldError('phone') ? 'border-red-500/50' : 'border-surface-200 dark:border-white/10'} rounded-xl text-sm text-surface-800 dark:text-white/80 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all" placeholder="08xxxxxxxxxx" />
				{#if getFieldError('phone')}
					<p class="mt-1 text-[10px] text-red-400">{getFieldError('phone')}</p>
				{/if}
			</div>

			<div>
				<label for="jlptLevel" class="block text-sm font-medium text-surface-800/70 dark:text-white/60 mb-1.5">Level JLPT</label>
				<select id="jlptLevel" name="jlptLevel" class="w-full px-4 py-2.5 bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-white/10 rounded-xl text-sm text-surface-800 dark:text-white/80 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all cursor-pointer">
					{#each jlptLevels as level}
						<option value={level} selected={(getFormValue('jlptLevel') || student.jlptLevel) === level}>{level}</option>
					{/each}
				</select>
			</div>

			<div class="sm:col-span-2">
				<label for="status" class="block text-sm font-medium text-surface-800/70 dark:text-white/60 mb-1.5">Status Siswa</label>
				<select id="status" name="status" class="w-full px-4 py-2.5 bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-white/10 rounded-xl text-sm text-surface-800 dark:text-white/80 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all cursor-pointer">
					<option value="active" selected={(getFormValue('status') || student.status) === 'active'}>Aktif</option>
					<option value="inactive" selected={(getFormValue('status') || student.status) === 'inactive'}>Nonaktif</option>
				</select>
			</div>
		</div>

		<div>
			<label for="notes" class="block text-sm font-medium text-surface-800/70 dark:text-white/60 mb-1.5">Catatan</label>
			<textarea id="notes" name="notes" rows="3" class="w-full px-4 py-2.5 bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-white/10 rounded-xl text-sm text-surface-800 dark:text-white/80 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all resize-none" placeholder="Catatan tambahan...">{form?.notes ?? student.notes ?? ''}</textarea>
		</div>

		<div class="flex items-center justify-end gap-3 pt-3 border-t border-surface-200 dark:border-white/5">
			<a href="/students/{student.id}" class="px-4 py-2.5 text-sm font-medium text-surface-800/60 dark:text-white/50 hover:text-surface-800 dark:hover:text-white transition-colors">Batal</a>
			<button type="submit" disabled={loading} class="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-medium rounded-xl hover:from-primary-400 hover:to-primary-500 shadow-lg shadow-primary-500/25 transition-all disabled:opacity-50 cursor-pointer">
				{loading ? 'Menyimpan...' : 'Simpan Perubahan'}
			</button>
		</div>
	</form>
</div>
