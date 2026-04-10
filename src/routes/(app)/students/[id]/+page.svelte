<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let student = $derived(data.studentData);
</script>

<svelte:head>
	<title>{student?.user?.name || 'Detail Siswa'} - BenkyouLab</title>
</svelte:head>

<div class="space-y-6 max-w-5xl mx-auto">
	{#if !student}
		<div class="p-8 text-center text-surface-800/50 dark:text-white/40">
			Memuat data... Jika siswa tidak ditemukan, silakan kembali.
		</div>
	{:else}
		<!-- Header -->
		<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
			<div class="flex items-center gap-4">
				<a href="/students" class="p-2 justify-center flex items-center rounded-lg text-surface-800/40 dark:text-white/30 hover:bg-surface-100 dark:hover:bg-white/5 transition-colors" aria-label="Kembali ke Daftar Siswa">
					<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
				</a>
				<div class="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-lg font-bold text-white shrink-0">
					{student.user?.name?.charAt(0)?.toUpperCase() || '?'}
				</div>
				<div>
					<div class="flex items-center gap-3">
						<h1 class="text-2xl font-bold text-surface-800 dark:text-white/95">{student.user?.name}</h1>
						<a href="/students/{student.id}/edit" class="p-1.5 rounded-lg bg-surface-100 dark:bg-surface-800 text-surface-800/60 dark:text-white/50 hover:text-primary-500 hover:bg-primary-500/10 transition-all cursor-pointer" title="Edit Siswa">
							<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
						</a>
					</div>
					<p class="text-sm text-surface-800/50 dark:text-white/40">{student.user?.email} • {student.phone || 'Kosong'}</p>
				</div>
			</div>
			
			<div class="flex items-center gap-4 text-sm font-medium">
				<div class="px-3 py-1.5 rounded-lg bg-surface-100 dark:bg-surface-800/50 text-surface-800/70 dark:text-white/60">
					Level: <span class="font-bold">{student.jlptLevel}</span>
				</div>
				{#if student.status === 'active'}
					<span class="px-3 py-1 flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 text-xs">
						<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Aktif
					</span>
				{:else}
					<span class="px-3 py-1 flex items-center gap-2 rounded-full border border-surface-500/20 bg-surface-500/10 text-surface-500 text-xs">
						<span class="w-1.5 h-1.5 rounded-full bg-surface-500"></span> Nonaktif
					</span>
				{/if}
			</div>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<!-- Enrolled Classes -->
			<div class="bg-white dark:bg-surface-900/50 rounded-2xl border border-surface-200 dark:border-white/5 overflow-hidden">
				<div class="p-5 border-b border-surface-200 dark:border-white/5 flex justify-between items-center">
					<h3 class="font-bold text-surface-800 dark:text-white/90">Kelas yang Diambil</h3>
					<span class="text-xs font-medium bg-surface-100 dark:bg-surface-800 text-surface-800/60 dark:text-white/50 px-2 py-1 rounded-lg">
						{student.enrollments.length} Kelas
					</span>
				</div>
				{#if student.enrollments.length === 0}
					<div class="p-8 text-center text-sm text-surface-800/40 dark:text-white/30">Belum masuk ke kelas manapun.</div>
				{:else}
					<div class="divide-y divide-surface-100 dark:divide-white/5 max-h-[300px] overflow-y-auto">
						{#each student.enrollments as enrollment}
							<div class="p-4 flex flex-col justify-between group flex-wrap gap-2">
								<div class="flex items-center justify-between">
									<a href="/classes/{enrollment.classId}" class="font-medium text-primary-500 hover:text-primary-600 transition-colors">
										{enrollment.class?.name || 'Kelas Terhapus'}
									</a>
									<span class="text-xs px-2 py-0.5 rounded-full {enrollment.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-surface-500/10 text-surface-500'}">
										{enrollment.status}
									</span>
								</div>
								<div class="text-xs text-surface-800/60 dark:text-white/50 flex flex-wrap gap-4 mt-1">
									<span class="flex items-center gap-1.5">
										<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
										{enrollment.class?.level || '-'}
									</span>
									<span class="flex items-center gap-1.5 capitalize">
										<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
										{#if enrollment.class}
											{enrollment.class.scheduleDay}, {enrollment.class.scheduleTime}
										{:else}
											Tanpa Jadwal
										{/if}
									</span>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Invoices Summary -->
			<div class="bg-white dark:bg-surface-900/50 rounded-2xl border border-surface-200 dark:border-white/5 overflow-hidden">
				<div class="p-5 border-b border-surface-200 dark:border-white/5 flex justify-between items-center">
					<h3 class="font-bold text-surface-800 dark:text-white/90">Riwayat Tagihan</h3>
					<span class="text-xs font-medium bg-surface-100 dark:bg-surface-800 text-surface-800/60 dark:text-white/50 px-2 py-1 rounded-lg">
						{student.invoices.length} Tagihan
					</span>
				</div>
				{#if student.invoices.length === 0}
					<div class="p-8 text-center text-sm text-surface-800/40 dark:text-white/30">Belum ada tagihan.</div>
				{:else}
					<div class="divide-y divide-surface-100 dark:divide-white/5 max-h-[300px] overflow-y-auto">
						{#each student.invoices.slice(0, 5) as invoice}
							<div class="p-4 flex items-center justify-between group">
								<div class="flex flex-col gap-1">
									<p class="font-medium text-surface-800 dark:text-white/90">{invoice.period}</p>
									<p class="text-xs text-surface-800/50 dark:text-white/40">Rp {invoice.amount.toLocaleString('id-ID')}</p>
								</div>
								<div class="flex flex-col items-end gap-1">
									<span class="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full {invoice.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : invoice.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}">
										{invoice.status}
									</span>
								</div>
							</div>
						{/each}
					</div>
					{#if student.invoices.length > 5}
						<div class="p-3 border-t border-surface-100 dark:border-white/5 text-center">
							<a href="/payments" class="text-xs font-medium text-primary-500 hover:text-primary-600 transition-colors">Lihat Semua di Pembayaran</a>
						</div>
					{/if}
				{/if}
			</div>

			<!-- Progress History -->
			<div class="bg-white dark:bg-surface-900/50 rounded-2xl border border-surface-200 dark:border-white/5 overflow-hidden lg:col-span-2">
				<div class="p-5 border-b border-surface-200 dark:border-white/5">
					<h3 class="font-bold text-surface-800 dark:text-white/90">Catatan Progress</h3>
				</div>
				{#if student.progress.length === 0}
					<div class="p-8 text-center text-sm text-surface-800/40 dark:text-white/30">Belum ada progress tercatat.</div>
				{:else}
					<div class="divide-y divide-surface-100 dark:divide-white/5 max-h-[400px] overflow-y-auto">
						{#each [...student.progress].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) as prog}
							<div class="p-5">
								<div class="flex items-start justify-between mb-2">
									<div>
										<a href="/classes/{prog.classId}" class="text-sm font-bold text-primary-500 hover:underline">{prog.class?.name || 'Kelas Terhapus'}</a>
										<p class="text-xs text-surface-800/50 dark:text-white/40 mt-1">{new Date(prog.createdAt).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
									</div>
									{#if prog.score !== null}
										<div class="px-3 py-1 bg-surface-100 dark:bg-surface-800/50 rounded-lg flex flex-col items-center justify-center">
											<span class="text-[10px] text-surface-800/50 dark:text-white/40 uppercase">Nilai</span>
											<span class="text-lg font-bold text-surface-800 dark:text-white/90">{prog.score}</span>
										</div>
									{/if}
								</div>
								
								<div class="space-y-2 mt-4">
									{#if prog.jlptProgress}
										<div>
											<span class="text-xs text-surface-800/50 dark:text-white/40 uppercase font-semibold">Progress Buku/JLPT</span>
											<p class="text-sm text-surface-800 dark:text-white/80">{prog.jlptProgress}</p>
										</div>
									{/if}
									{#if prog.notes}
										<div>
											<span class="text-xs text-surface-800/50 dark:text-white/40 uppercase font-semibold">Catatan Evaluasi</span>
											<p class="text-sm text-surface-800 dark:text-white/70 italic bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-white/5 p-3 rounded-xl mt-1">{prog.notes}</p>
										</div>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
