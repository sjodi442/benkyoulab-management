<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let viewMode = $state<'list' | 'calendar'>('list');
	let statusFilter = $state($page.url.searchParams.get('status') || '');
	let deleteConfirm = $state<string | null>(null);

	const dayNames: Record<string, string> = {
		monday: 'Senin', tuesday: 'Selasa', wednesday: 'Rabu',
		thursday: 'Kamis', friday: 'Jumat', saturday: 'Sabtu', sunday: 'Minggu'
	};

	const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

	function applyFilters() {
		const params = new URLSearchParams();
		if (statusFilter) params.set('status', statusFilter);
		goto(`/classes?${params.toString()}`, { replaceState: true });
	}

	// Group classes by day for calendar view
	function getCalendarData() {
		const grouped: Record<string, typeof data.classes> = {};
		for (const day of dayOrder) {
			grouped[day] = data.classes.filter((c: any) => c.scheduleDay === day);
		}
		return grouped;
	}
</script>

<svelte:head>
	<title>Manajemen Kelas - BenkyouLab</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
		<div>
			<h1 class="text-2xl font-bold text-surface-800 dark:text-white/95">Manajemen Kelas</h1>
			<p class="text-sm text-surface-800/50 dark:text-white/40 mt-0.5">{data.total} kelas</p>
		</div>
		<div class="flex items-center gap-2">
			<!-- View toggle -->
			<div class="flex items-center bg-surface-100 dark:bg-surface-800/50 rounded-lg p-0.5">
				<button onclick={() => viewMode = 'list'} class="px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer {viewMode === 'list' ? 'bg-white dark:bg-surface-700 text-surface-800 dark:text-white shadow-sm' : 'text-surface-800/50 dark:text-white/40'}">
					List
				</button>
				<button onclick={() => viewMode = 'calendar'} class="px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer {viewMode === 'calendar' ? 'bg-white dark:bg-surface-700 text-surface-800 dark:text-white shadow-sm' : 'text-surface-800/50 dark:text-white/40'}">
					Jadwal
				</button>
			</div>
			<a href="/classes/new" class="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-medium rounded-xl hover:from-primary-400 hover:to-primary-500 shadow-lg shadow-primary-500/25 transition-all hover:-translate-y-0.5" aria-label="Buat Kelas Baru">
				<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
				Buat Kelas
			</a>
		</div>
	</div>

	<!-- Filters -->
	<div class="flex gap-3">
		<select bind:value={statusFilter} onchange={applyFilters} class="px-3 py-2.5 bg-white dark:bg-surface-900/50 border border-surface-200 dark:border-white/10 rounded-xl text-sm text-surface-800 dark:text-white/80 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all cursor-pointer">
			<option value="">Semua Status</option>
			<option value="active">Aktif</option>
			<option value="completed">Selesai</option>
			<option value="cancelled">Dibatalkan</option>
		</select>
	</div>

	{#if viewMode === 'calendar'}
		<!-- Calendar/Schedule View -->
		<div class="grid grid-cols-1 md:grid-cols-7 gap-2">
			{#each dayOrder as day}
				{@const dayClasses = getCalendarData()[day]}
				<div class="bg-white dark:bg-surface-900/50 rounded-xl border border-surface-200 dark:border-white/5 overflow-hidden">
					<div class="px-3 py-2 bg-surface-50 dark:bg-surface-800/50 border-b border-surface-200 dark:border-white/5">
						<h3 class="text-xs font-semibold text-surface-800/60 dark:text-white/50 uppercase">{dayNames[day]}</h3>
					</div>
					<div class="p-2 space-y-1.5 min-h-[100px]">
						{#each dayClasses as cls}
							<a href="/classes/{cls.id}" class="block p-2 rounded-lg bg-primary-500/5 dark:bg-primary-500/10 border border-primary-500/10 hover:border-primary-500/30 transition-all">
								<p class="text-xs font-medium text-surface-800 dark:text-white/90 truncate">{cls.name}</p>
								<p class="text-[10px] text-surface-800/40 dark:text-white/30 mt-0.5">{cls.scheduleTime} · {cls.durationMinutes}min</p>
								<p class="text-[10px] text-primary-500 mt-0.5">{cls.teacher?.user?.name || 'TBD'}</p>
							</a>
						{:else}
							<p class="text-xs text-surface-800/20 dark:text-white/10 text-center py-4">-</p>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<!-- List View -->
		<div class="bg-white dark:bg-surface-900/50 rounded-2xl border border-surface-200 dark:border-white/5 overflow-hidden">
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead>
						<tr class="border-b border-surface-200 dark:border-white/5">
							<th class="text-left px-5 py-3 text-xs font-semibold text-surface-800/50 dark:text-white/40 uppercase tracking-wider">Kelas</th>
							<th class="text-left px-5 py-3 text-xs font-semibold text-surface-800/50 dark:text-white/40 uppercase tracking-wider hidden sm:table-cell">Guru</th>
							<th class="text-center px-5 py-3 text-xs font-semibold text-surface-800/50 dark:text-white/40 uppercase tracking-wider">Jadwal</th>
							<th class="text-center px-5 py-3 text-xs font-semibold text-surface-800/50 dark:text-white/40 uppercase tracking-wider">Siswa</th>
							<th class="text-center px-5 py-3 text-xs font-semibold text-surface-800/50 dark:text-white/40 uppercase tracking-wider">Status</th>
							<th class="text-right px-5 py-3 text-xs font-semibold text-surface-800/50 dark:text-white/40 uppercase tracking-wider">Aksi</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-surface-200 dark:divide-white/5">
						{#each data.classes as cls}
							<tr class="hover:bg-surface-50 dark:hover:bg-white/[0.02] transition-colors">
								<td class="px-5 py-3">
									<a href="/classes/{cls.id}" class="text-sm font-medium text-surface-800 dark:text-white/90 hover:text-primary-500 transition-colors">{cls.name}</a>
									<span class="ml-2 px-1.5 py-0.5 text-[10px] font-medium rounded bg-primary-500/10 text-primary-500">{cls.level}</span>
								</td>
								<td class="px-5 py-3 text-sm text-surface-800/60 dark:text-white/50 hidden sm:table-cell">{cls.teacher?.user?.name || '-'}</td>
								<td class="px-5 py-3 text-center text-sm text-surface-800/60 dark:text-white/50">{dayNames[cls.scheduleDay]} {cls.scheduleTime}</td>
								<td class="px-5 py-3 text-center text-sm text-surface-800/60 dark:text-white/50">{cls.enrollments?.length || 0}/{cls.maxStudents}</td>
								<td class="px-5 py-3 text-center">
									<span class="px-2 py-0.5 text-xs font-medium rounded-full {cls.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : cls.status === 'completed' ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'}">
										{cls.status === 'active' ? 'Aktif' : cls.status === 'completed' ? 'Selesai' : 'Batal'}
									</span>
								</td>
								<td class="px-5 py-3 text-right">
									<div class="flex items-center justify-end gap-1">
										<a href="/classes/{cls.id}" class="p-1.5 rounded-lg text-surface-800/40 dark:text-white/30 hover:text-primary-500 hover:bg-primary-500/5 transition-all" aria-label="Lihat Detail Kelas {cls.name}">
											<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
										</a>
									</div>
								</td>
							</tr>
						{:else}
							<tr>
								<td colspan="6" class="px-5 py-16 text-center">
									<p class="text-surface-800/40 dark:text-white/30 text-sm">Belum ada kelas</p>
									<a href="/classes/new" class="inline-block mt-3 px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-400 transition-colors">Buat Kelas</a>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>
