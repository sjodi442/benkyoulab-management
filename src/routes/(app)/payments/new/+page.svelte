<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let mode = $state<'single' | 'batch'>('single');
	let loading = $state(false);
</script>

<svelte:head>
	<title>Buat Invoice - BenkyouLab</title>
</svelte:head>

<div class="max-w-2xl mx-auto space-y-6">
	<div class="flex items-center gap-3">
		<a href="/payments" class="p-2 rounded-lg text-surface-800/40 dark:text-white/30 hover:bg-surface-100 dark:hover:bg-white/5 transition-colors" aria-label="Kembali ke Daftar Pembayaran">
			<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
		</a>
		<div>
			<h1 class="text-2xl font-bold text-surface-800 dark:text-white/95">Buat Invoice</h1>
			<p class="text-sm text-surface-800/50 dark:text-white/40">Buat invoice baru untuk siswa</p>
		</div>
	</div>

	{#if form?.error}
		<div class="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">{form.error}</div>
	{/if}

	{#if form?.success}
		<div class="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 text-sm">
			{form.count ? `Berhasil membuat ${form.count} invoice!` : 'Invoice berhasil dibuat!'}
		</div>
	{/if}

	<!-- Mode toggle -->
	<div class="flex items-center bg-surface-100 dark:bg-surface-800/50 rounded-xl p-1 w-fit">
		<button onclick={() => mode = 'single'} class="px-4 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer {mode === 'single' ? 'bg-white dark:bg-surface-700 text-surface-800 dark:text-white shadow-sm' : 'text-surface-800/50 dark:text-white/40'}">
			Invoice Satuan
		</button>
		<button onclick={() => mode = 'batch'} class="px-4 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer {mode === 'batch' ? 'bg-white dark:bg-surface-700 text-surface-800 dark:text-white shadow-sm' : 'text-surface-800/50 dark:text-white/40'}">
			Invoice Massal
		</button>
	</div>

	<form
		method="POST"
		action="?/{mode}"
		use:enhance={() => { loading = true; return async ({ update }) => { loading = false; await update(); }; }}
		class="bg-white dark:bg-surface-900/50 rounded-2xl border border-surface-200 dark:border-white/5 p-6 space-y-5"
	>
		{#if mode === 'single'}
			<div>
				<label for="studentId" class="block text-sm font-medium text-surface-800/70 dark:text-white/60 mb-1.5">Siswa *</label>
				<select id="studentId" name="studentId" required class="w-full px-4 py-2.5 bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-white/10 rounded-xl text-sm cursor-pointer">
					<option value="">Pilih siswa...</option>
					{#each data.students as student}
						<option value={student.id}>{student.user?.name} - {student.user?.email}</option>
					{/each}
				</select>
			</div>
		{:else}
			<div class="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-600 dark:text-amber-400 text-sm">
				⚡ Invoice massal akan dibuat untuk <strong>semua siswa aktif</strong> ({data.students.length} siswa). Siswa yang sudah memiliki invoice untuk periode yang sama akan di-skip.
			</div>
		{/if}

		<div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
			<div>
				<label for="amount" class="block text-sm font-medium text-surface-800/70 dark:text-white/60 mb-1.5">Jumlah (IDR) *</label>
				<input type="number" id="amount" name="amount" required min="1000" step="1000" value="500000" class="w-full px-4 py-2.5 bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all" />
			</div>
			<div>
				<label for="period" class="block text-sm font-medium text-surface-800/70 dark:text-white/60 mb-1.5">Periode *</label>
				<input type="month" id="period" name="period" required class="w-full px-4 py-2.5 bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all" />
			</div>
			<div>
				<label for="dueDate" class="block text-sm font-medium text-surface-800/70 dark:text-white/60 mb-1.5">Jatuh Tempo *</label>
				<input type="date" id="dueDate" name="dueDate" required class="w-full px-4 py-2.5 bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all" />
			</div>
			<div>
				<label for="description" class="block text-sm font-medium text-surface-800/70 dark:text-white/60 mb-1.5">Deskripsi</label>
				<input type="text" id="description" name="description" class="w-full px-4 py-2.5 bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all" placeholder="Biaya kursus..." />
			</div>
		</div>

		<div class="flex items-center justify-end gap-3 pt-3 border-t border-surface-200 dark:border-white/5">
			<a href="/payments" class="px-4 py-2.5 text-sm font-medium text-surface-800/60 dark:text-white/50">Batal</a>
			<button type="submit" disabled={loading} class="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-medium rounded-xl hover:from-primary-400 hover:to-primary-500 shadow-lg shadow-primary-500/25 transition-all disabled:opacity-50 cursor-pointer">
				{loading ? 'Membuat...' : mode === 'batch' ? `Buat Invoice Massal (${data.students.length} siswa)` : 'Buat Invoice'}
			</button>
		</div>
	</form>
</div>
