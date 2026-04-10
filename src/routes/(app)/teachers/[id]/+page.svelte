<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let teacher = $derived(data.teacherData);
</script>

<svelte:head>
	<title>{teacher?.user?.name || 'Detail Guru'} - BenkyouLab</title>
</svelte:head>

<div class="space-y-6 max-w-5xl mx-auto">
	{#if !teacher}
		<div class="p-8 text-center text-surface-800/50 dark:text-white/40">
			Memuat data... Jika guru tidak ditemukan, silakan kembali.
		</div>
	{:else}
		<!-- Header -->
		<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
			<div class="flex items-center gap-4">
				<a
					href="/teachers"
					class="p-2 justify-center flex items-center rounded-lg text-surface-800/40 dark:text-white/30 hover:bg-surface-100 dark:hover:bg-white/5 transition-colors"
					title="Kembali ke Daftar Guru"
					aria-label="Kembali ke Daftar Guru"
				>
					<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
					</svg>
				</a>
				<div class="w-12 h-12 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-lg font-bold text-white shrink-0">
					{teacher.user?.name?.charAt(0)?.toUpperCase() || '?'}
				</div>
				<div>
					<div class="flex items-center gap-3">
						<h1 class="text-2xl font-bold text-surface-800 dark:text-white/95">{teacher.user?.name}</h1>
						<a
							href="/teachers/{teacher.id}/edit"
							class="p-1.5 rounded-lg bg-surface-100 dark:bg-surface-800 text-surface-800/60 dark:text-white/50 hover:text-primary-500 hover:bg-primary-500/10 transition-all cursor-pointer"
							title="Edit Guru"
							aria-label="Edit Guru"
						>
							<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
								<path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
							</svg>
						</a>
					</div>
					<p class="text-sm text-surface-800/50 dark:text-white/40">{teacher.user?.email} • {teacher.phone || 'Telepon Kosong'}</p>
				</div>
			</div>
			
			<div class="flex items-center gap-4 text-sm font-medium">
				{#if teacher.specialization && (teacher.specialization as string[]).length > 0}
					<div class="flex flex-wrap gap-2">
						{#each teacher.specialization as spec}
							<span class="px-3 py-1 flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 text-violet-500 text-xs">
								{spec}
							</span>
						{/each}
					</div>
				{:else}
					<div class="px-3 py-1.5 rounded-lg bg-surface-100 dark:bg-surface-800/50 text-surface-800/70 dark:text-white/60">
						Belum ada spesialisasi
					</div>
				{/if}
			</div>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- Taught Classes -->
			<div class="bg-white dark:bg-surface-900/50 rounded-2xl border border-surface-200 dark:border-white/5 overflow-hidden lg:col-span-2">
				<div class="p-5 border-b border-surface-200 dark:border-white/5 flex justify-between items-center">
					<h3 class="font-bold text-surface-800 dark:text-white/90">Kelas yang Diajar</h3>
					<span class="text-xs font-medium bg-surface-100 dark:bg-surface-800 text-surface-800/60 dark:text-white/50 px-2 py-1 rounded-lg">
						{teacher.classes?.length || 0} Kelas
					</span>
				</div>
				{#if !teacher.classes || teacher.classes.length === 0}
					<div class="p-8 text-center text-sm text-surface-800/40 dark:text-white/30">Belum ada kelas yang diajar.</div>
				{:else}
					<div class="divide-y divide-surface-100 dark:divide-white/5 max-h-[400px] overflow-y-auto">
						{#each teacher.classes as cls}
							<div class="p-4 flex flex-col justify-between group flex-wrap gap-2">
								<div class="flex items-center justify-between">
									<a href="/classes/{cls.id}" class="font-medium text-primary-500 hover:text-primary-600 transition-colors">
										{cls.name}
									</a>
									<span class="text-xs px-2 py-0.5 rounded-full {cls.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-surface-500/10 text-surface-500 border border-surface-500/20'}">
										{cls.status === 'active' ? 'Aktif' : 'Selesai'}
									</span>
								</div>
								<div class="text-xs text-surface-800/60 dark:text-white/50 flex flex-wrap gap-4 mt-1">
									<span class="flex items-center gap-1.5">Level: <span class="font-bold">{cls.level}</span></span>
									<span class="flex items-center gap-1.5 capitalize">
										<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
										{cls.scheduleDay}, {cls.scheduleTime}
									</span>
									<span class="flex items-center gap-1.5">
										<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
										{cls.enrollments?.length || 0} Siswa
									</span>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Additional Info -->
			<div class="space-y-6 lg:col-span-1">
				<div class="bg-white dark:bg-surface-900/50 rounded-2xl border border-surface-200 dark:border-white/5 overflow-hidden">
					<div class="p-5 border-b border-surface-200 dark:border-white/5">
						<h3 class="font-bold text-surface-800 dark:text-white/90">Ketersediaan</h3>
					</div>
					<div class="p-5 text-sm text-surface-800/70 dark:text-white/60">
						{#if !teacher.availability || Object.keys(teacher.availability).length === 0}
							<p>Ketersediaan jadwal belum diatur.</p>
						{:else}
							<div class="space-y-3">
								{#each Object.entries(teacher.availability) as [day, times]}
									{#if (times as string[]).length > 0}
										<div>
											<span class="font-semibold capitalize text-surface-800 dark:text-white/90">{day}</span>
											<div class="flex flex-wrap gap-1 mt-1">
												{#each times as time}
													<span class="px-2 py-0.5 text-xs bg-surface-100 dark:bg-surface-800 rounded-md">
														{time}
													</span>
												{/each}
											</div>
										</div>
									{/if}
								{/each}
							</div>
						{/if}
					</div>
				</div>

				{#if teacher.notes}
					<div class="bg-white dark:bg-surface-900/50 rounded-2xl border border-surface-200 dark:border-white/5 overflow-hidden">
						<div class="p-5 border-b border-surface-200 dark:border-white/5">
							<h3 class="font-bold text-surface-800 dark:text-white/90">Catatan Internal</h3>
						</div>
						<div class="p-5 text-sm text-surface-800/70 dark:text-white/60 whitespace-pre-wrap flex items-start gap-3">
							<!-- Added SVG icon for visual styling -->
							<svg class="w-5 h-5 text-primary-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
							{teacher.notes}
						</div>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
