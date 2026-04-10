<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let search = $state($page.url.searchParams.get('search') || '');
	let deleteConfirm = $state<string | null>(null);

	function applySearch() {
		const params = new URLSearchParams();
		if (search) params.set('search', search);
		goto(`/teachers?${params.toString()}`, { replaceState: true });
	}
</script>

<svelte:head>
	<title>Manajemen Guru - BenkyouLab</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
		<div>
			<h1 class="text-2xl font-bold text-surface-800 dark:text-white/95">Manajemen Guru</h1>
			<p class="text-sm text-surface-800/50 dark:text-white/40 mt-0.5">{data.total} guru terdaftar</p>
		</div>
		<a href="/teachers/new" class="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-medium rounded-xl hover:from-primary-400 hover:to-primary-500 shadow-lg shadow-primary-500/25 transition-all hover:-translate-y-0.5">
			<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
			Tambah Guru
		</a>
	</div>

	<div class="relative max-w-md">
		<svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-800/30 dark:text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
			<path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
		</svg>
		<input type="text" placeholder="Cari guru..." bind:value={search} oninput={applySearch} class="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-surface-900/50 border border-surface-200 dark:border-white/10 rounded-xl text-sm text-surface-800 dark:text-white/80 placeholder:text-surface-800/30 dark:placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all" />
	</div>

	<!-- Teacher cards grid -->
	<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
		{#each data.teachers as teacher}
			<div class="bg-white dark:bg-surface-900/50 rounded-2xl border border-surface-200 dark:border-white/5 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all group">
				<div class="flex items-start gap-3">
					<div class="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-lg font-bold text-white shrink-0">
						{teacher.user?.name?.charAt(0)?.toUpperCase() || '?'}
					</div>
					<div class="flex-1 min-w-0">
						<a href="/teachers/{teacher.id}" class="text-base font-semibold text-surface-800 dark:text-white/90 hover:text-primary-500 transition-colors">
							{teacher.user?.name}
						</a>
						<p class="text-xs text-surface-800/40 dark:text-white/30 mt-0.5">{teacher.user?.email}</p>
					</div>
				</div>

				{#if teacher.specialization && (teacher.specialization as string[]).length > 0}
					<div class="flex flex-wrap gap-1.5 mt-3">
						{#each teacher.specialization as spec}
							<span class="px-2 py-0.5 text-[10px] font-medium rounded-full bg-violet-500/10 text-violet-500">{spec}</span>
						{/each}
					</div>
				{/if}

				<div class="flex items-center justify-between mt-4 pt-3 border-t border-surface-200 dark:border-white/5">
					<span class="text-xs text-surface-800/40 dark:text-white/30">
						{teacher.classes?.length || 0} kelas
					</span>
					<div class="flex items-center gap-1">
						<a href="/teachers/{teacher.id}" class="p-1.5 rounded-lg text-surface-800/40 dark:text-white/30 hover:text-primary-500 hover:bg-primary-500/5 transition-all" title="Detail">
							<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
						</a>
						{#if deleteConfirm === teacher.id}
							<form method="POST" action="?/delete" use:enhance>
								<input type="hidden" name="id" value={teacher.id} />
								<button type="submit" class="p-1.5 rounded-lg text-red-500 bg-red-500/10 text-xs font-medium cursor-pointer">Hapus?</button>
							</form>
							<button onclick={() => deleteConfirm = null} class="p-1.5 rounded-lg text-surface-800/40 dark:text-white/30 text-xs cursor-pointer">Batal</button>
						{:else}
							<button onclick={() => deleteConfirm = teacher.id} class="p-1.5 rounded-lg text-surface-800/40 dark:text-white/30 hover:text-red-500 hover:bg-red-500/5 transition-all cursor-pointer" title="Hapus">
								<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
							</button>
						{/if}
					</div>
				</div>
			</div>
		{:else}
			<div class="sm:col-span-2 xl:col-span-3 py-16 text-center">
				<svg class="w-16 h-16 mx-auto text-surface-800/10 dark:text-white/10 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="0.5">
					<path stroke-linecap="round" stroke-linejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3" />
				</svg>
				<p class="text-surface-800/40 dark:text-white/30 text-sm">Belum ada guru terdaftar</p>
				<a href="/teachers/new" class="inline-block mt-3 px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-400 transition-colors">Tambah Guru</a>
			</div>
		{/each}
	</div>
</div>
