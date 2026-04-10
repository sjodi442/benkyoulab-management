<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let search = $state($page.url.searchParams.get('search') || '');
	let statusFilter = $state($page.url.searchParams.get('status') || '');
	let levelFilter = $state($page.url.searchParams.get('level') || '');
	let deleteConfirm = $state<string | null>(null);

	function applyFilters() {
		const params = new URLSearchParams();
		if (search) params.set('search', search);
		if (statusFilter) params.set('status', statusFilter);
		if (levelFilter) params.set('level', levelFilter);
		goto(`/students?${params.toString()}`, { replaceState: true });
	}

	const jlptLevels = ['N5', 'N4', 'N3', 'N2', 'N1'];
</script>

<svelte:head>
	<title>Manajemen Siswa - BenkyouLab</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
		<div>
			<h1 class="text-2xl font-bold text-surface-800 dark:text-white/95">Manajemen Siswa</h1>
			<p class="text-sm text-surface-800/50 dark:text-white/40 mt-0.5">{data.total} siswa terdaftar</p>
		</div>
		<a
			href="/students/new"
			class="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-medium rounded-xl hover:from-primary-400 hover:to-primary-500 shadow-lg shadow-primary-500/25 transition-all hover:-translate-y-0.5"
		>
			<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
			</svg>
			Tambah Siswa
		</a>
	</div>

	<!-- Filters -->
	<div class="flex flex-col sm:flex-row gap-3">
		<div class="relative flex-1">
			<svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-800/30 dark:text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
			</svg>
			<input
				type="text"
				placeholder="Cari nama, email, atau HP..."
				bind:value={search}
				oninput={() => applyFilters()}
				class="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-surface-900/50 border border-surface-200 dark:border-white/10 rounded-xl text-sm text-surface-800 dark:text-white/80 placeholder:text-surface-800/30 dark:placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all"
			/>
		</div>
		<select
			bind:value={statusFilter}
			onchange={() => applyFilters()}
			class="px-3 py-2.5 bg-white dark:bg-surface-900/50 border border-surface-200 dark:border-white/10 rounded-xl text-sm text-surface-800 dark:text-white/80 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all cursor-pointer"
		>
			<option value="">Semua Status</option>
			<option value="active">Aktif</option>
			<option value="inactive">Nonaktif</option>
		</select>
		<select
			bind:value={levelFilter}
			onchange={() => applyFilters()}
			class="px-3 py-2.5 bg-white dark:bg-surface-900/50 border border-surface-200 dark:border-white/10 rounded-xl text-sm text-surface-800 dark:text-white/80 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all cursor-pointer"
		>
			<option value="">Semua Level</option>
			{#each jlptLevels as level}
				<option value={level}>{level}</option>
			{/each}
		</select>
	</div>

	<!-- Table -->
	<div class="bg-white dark:bg-surface-900/50 rounded-2xl border border-surface-200 dark:border-white/5 overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead>
					<tr class="border-b border-surface-200 dark:border-white/5">
						<th class="text-left px-5 py-3 text-xs font-semibold text-surface-800/50 dark:text-white/40 uppercase tracking-wider">Nama</th>
						<th class="text-left px-5 py-3 text-xs font-semibold text-surface-800/50 dark:text-white/40 uppercase tracking-wider hidden sm:table-cell">Email</th>
						<th class="text-left px-5 py-3 text-xs font-semibold text-surface-800/50 dark:text-white/40 uppercase tracking-wider hidden md:table-cell">HP</th>
						<th class="text-center px-5 py-3 text-xs font-semibold text-surface-800/50 dark:text-white/40 uppercase tracking-wider">Level</th>
						<th class="text-center px-5 py-3 text-xs font-semibold text-surface-800/50 dark:text-white/40 uppercase tracking-wider">Status</th>
						<th class="text-right px-5 py-3 text-xs font-semibold text-surface-800/50 dark:text-white/40 uppercase tracking-wider">Aksi</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-surface-200 dark:divide-white/5">
					{#each data.students as student}
						<tr class="hover:bg-surface-50 dark:hover:bg-white/[0.02] transition-colors">
							<td class="px-5 py-3">
								<div class="flex items-center gap-3">
									<div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
										{student.user?.name?.charAt(0)?.toUpperCase() || '?'}
									</div>
									<div>
										<a href="/students/{student.id}" class="text-sm font-medium text-surface-800 dark:text-white/90 hover:text-primary-500 transition-colors">
											{student.user?.name}
										</a>
										<p class="text-xs text-surface-800/40 dark:text-white/30 sm:hidden">{student.user?.email}</p>
									</div>
								</div>
							</td>
							<td class="px-5 py-3 text-sm text-surface-800/60 dark:text-white/50 hidden sm:table-cell">{student.user?.email}</td>
							<td class="px-5 py-3 text-sm text-surface-800/60 dark:text-white/50 hidden md:table-cell">{student.phone || '-'}</td>
							<td class="px-5 py-3 text-center">
								<span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-primary-500/10 text-primary-500">{student.jlptLevel}</span>
							</td>
							<td class="px-5 py-3 text-center">
								<span class="px-2 py-0.5 text-xs font-medium rounded-full {student.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}">
									{student.status === 'active' ? 'Aktif' : 'Nonaktif'}
								</span>
							</td>
							<td class="px-5 py-3 text-right">
								<div class="flex items-center justify-end gap-1">
									<a href="/students/{student.id}" class="p-1.5 rounded-lg text-surface-800/40 dark:text-white/30 hover:text-primary-500 hover:bg-primary-500/5 transition-all" title="Detail">
										<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
											<path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
											<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
										</svg>
									</a>
									{#if deleteConfirm === student.id}
										<form method="POST" action="?/delete" use:enhance>
											<input type="hidden" name="id" value={student.id} />
											<button type="submit" class="p-1.5 rounded-lg text-red-500 bg-red-500/10 text-xs font-medium cursor-pointer">Hapus?</button>
										</form>
										<button onclick={() => deleteConfirm = null} class="p-1.5 rounded-lg text-surface-800/40 dark:text-white/30 hover:bg-surface-100 dark:hover:bg-white/5 text-xs cursor-pointer">Batal</button>
									{:else}
										<button onclick={() => deleteConfirm = student.id} class="p-1.5 rounded-lg text-surface-800/40 dark:text-white/30 hover:text-red-500 hover:bg-red-500/5 transition-all cursor-pointer" title="Hapus">
											<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
												<path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
											</svg>
										</button>
									{/if}
								</div>
							</td>
						</tr>
					{:else}
						<tr>
							<td colspan="6" class="px-5 py-16 text-center">
								<svg class="w-16 h-16 mx-auto text-surface-800/10 dark:text-white/10 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="0.5">
									<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" />
								</svg>
								<p class="text-surface-800/40 dark:text-white/30 text-sm">Tidak ada siswa ditemukan</p>
								<a href="/students/new" class="inline-block mt-3 px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-400 transition-colors">
									Tambah Siswa Pertama
								</a>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
