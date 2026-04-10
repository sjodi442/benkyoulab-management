<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let loading = $state(false);

	const specializations = ['N5', 'N4', 'N3', 'N2', 'N1', 'Kaiwa', 'SSW', 'Mensetsu', 'Bunpou'];
	let selectedSpecs = $state<string[]>([]);

	function toggleSpec(spec: string) {
		if (selectedSpecs.includes(spec)) {
			selectedSpecs = selectedSpecs.filter((s) => s !== spec);
		} else {
			selectedSpecs = [...selectedSpecs, spec];
		}
	}
</script>

<svelte:head>
	<title>Tambah Guru - BenkyouLab</title>
</svelte:head>

<div class="max-w-2xl mx-auto space-y-6">
	<div class="flex items-center gap-3">
		<a href="/teachers" class="p-2 rounded-lg text-surface-800/40 dark:text-white/30 hover:bg-surface-100 dark:hover:bg-white/5 transition-colors" aria-label="Kembali ke Daftar Guru">
			<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
		</a>
		<div>
			<h1 class="text-2xl font-bold text-surface-800 dark:text-white/95">Tambah Guru Baru</h1>
			<p class="text-sm text-surface-800/50 dark:text-white/40">Daftarkan guru pengajar baru</p>
		</div>
	</div>

	{#if form?.error}
		<div class="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">{form.error}</div>
	{/if}

	<form method="POST" use:enhance={() => { loading = true; return async ({ update }) => { loading = false; await update(); }; }} class="bg-white dark:bg-surface-900/50 rounded-2xl border border-surface-200 dark:border-white/5 p-6 space-y-5">
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
			<div class="sm:col-span-2">
				<label for="name" class="block text-sm font-medium text-surface-800/70 dark:text-white/60 mb-1.5">Nama Lengkap *</label>
				<input type="text" id="name" name="name" required value={form?.name ?? ''} class="w-full px-4 py-2.5 bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-white/10 rounded-xl text-sm text-surface-800 dark:text-white/80 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all" />
			</div>
			<div>
				<label for="email" class="block text-sm font-medium text-surface-800/70 dark:text-white/60 mb-1.5">Email *</label>
				<input type="email" id="email" name="email" required value={form?.email ?? ''} class="w-full px-4 py-2.5 bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-white/10 rounded-xl text-sm text-surface-800 dark:text-white/80 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all" />
			</div>
			<div>
				<label for="password" class="block text-sm font-medium text-surface-800/70 dark:text-white/60 mb-1.5">Password *</label>
				<input type="password" id="password" name="password" required minlength="6" class="w-full px-4 py-2.5 bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-white/10 rounded-xl text-sm text-surface-800 dark:text-white/80 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all" />
			</div>
			<div class="sm:col-span-2">
				<label for="phone" class="block text-sm font-medium text-surface-800/70 dark:text-white/60 mb-1.5">No. HP</label>
				<input type="tel" id="phone" name="phone" value={form?.phone ?? ''} class="w-full px-4 py-2.5 bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-white/10 rounded-xl text-sm text-surface-800 dark:text-white/80 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all" />
			</div>
		</div>

		<div>
			<span class="block text-sm font-medium text-surface-800/70 dark:text-white/60 mb-2">Spesialisasi</span>
			<div class="flex flex-wrap gap-2">
				{#each specializations as spec}
					<button
						type="button"
						onclick={() => toggleSpec(spec)}
						class="px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer
							{selectedSpecs.includes(spec) ? 'bg-primary-500 text-white border-primary-500' : 'bg-surface-50 dark:bg-surface-800/50 text-surface-800/60 dark:text-white/50 border-surface-200 dark:border-white/10 hover:border-primary-500/50'}"
					>
						{spec}
					</button>
				{/each}
			</div>
			{#each selectedSpecs as spec}
				<input type="hidden" name="specialization" value={spec} />
			{/each}
		</div>

		<div>
			<label for="notes" class="block text-sm font-medium text-surface-800/70 dark:text-white/60 mb-1.5">Catatan</label>
			<textarea id="notes" name="notes" rows="3" class="w-full px-4 py-2.5 bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-white/10 rounded-xl text-sm text-surface-800 dark:text-white/80 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all resize-none">{form?.notes ?? ''}</textarea>
		</div>

		<div class="flex items-center justify-end gap-3 pt-3 border-t border-surface-200 dark:border-white/5">
			<a href="/teachers" class="px-4 py-2.5 text-sm font-medium text-surface-800/60 dark:text-white/50 hover:text-surface-800 dark:hover:text-white transition-colors">Batal</a>
			<button type="submit" disabled={loading} class="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-medium rounded-xl hover:from-primary-400 hover:to-primary-500 shadow-lg shadow-primary-500/25 transition-all disabled:opacity-50 cursor-pointer">
				{loading ? 'Menyimpan...' : 'Simpan Guru'}
			</button>
		</div>
	</form>
</div>
