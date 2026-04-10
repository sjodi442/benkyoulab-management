<script lang="ts">
</script>

<svelte:head>
	<title>Laporan - BenkyouLab</title>
</svelte:head>

<div class="space-y-6">
	<div>
		<h1 class="text-2xl font-bold text-surface-800 dark:text-white/95">Laporan</h1>
		<p class="text-sm text-surface-800/50 dark:text-white/40 mt-0.5">Ringkasan dan analisis data</p>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
		<!-- Revenue chart placeholder -->
		<div class="bg-white dark:bg-surface-900/50 rounded-2xl border border-surface-200 dark:border-white/5 p-6">
			<h3 class="text-sm font-semibold text-surface-800 dark:text-white/90 mb-4">Pendapatan Bulanan</h3>
			<div class="h-48 flex items-center justify-center text-surface-800/20 dark:text-white/10">
				<div class="text-center">
					<svg class="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="0.5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
					</svg>
					<p class="text-xs">Chart akan muncul saat data tersedia</p>
				</div>
			</div>
		</div>

		<!-- Student growth placeholder -->
		<div class="bg-white dark:bg-surface-900/50 rounded-2xl border border-surface-200 dark:border-white/5 p-6">
			<h3 class="text-sm font-semibold text-surface-800 dark:text-white/90 mb-4">Pertumbuhan Siswa</h3>
			<div class="h-48 flex items-center justify-center text-surface-800/20 dark:text-white/10">
				<div class="text-center">
					<svg class="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="0.5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
					</svg>
					<p class="text-xs">Chart akan muncul saat data tersedia</p>
				</div>
			</div>
		</div>

		<!-- JLPT Level Distribution -->
		<div class="bg-white dark:bg-surface-900/50 rounded-2xl border border-surface-200 dark:border-white/5 p-6">
			<h3 class="text-sm font-semibold text-surface-800 dark:text-white/90 mb-4">Distribusi Level JLPT</h3>
			<div class="space-y-3">
				{#each ['N5', 'N4', 'N3', 'N2', 'N1'] as level, i}
					{@const percentage = [45, 25, 15, 10, 5][i]}
					<div class="flex items-center gap-3">
						<span class="text-xs font-medium text-surface-800/60 dark:text-white/50 w-8">{level}</span>
						<div class="flex-1 h-2 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
							<div class="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-500" style="width: {percentage}%"></div>
						</div>
						<span class="text-xs text-surface-800/40 dark:text-white/30 w-8 text-right">{percentage}%</span>
					</div>
				{/each}
			</div>
		</div>

		<!-- Payment Status -->
		<div class="bg-white dark:bg-surface-900/50 rounded-2xl border border-surface-200 dark:border-white/5 p-6">
			<h3 class="text-sm font-semibold text-surface-800 dark:text-white/90 mb-4">Status Pembayaran</h3>
			<div class="space-y-3">
				{#each [
					{ label: 'Lunas', color: 'bg-emerald-500', pct: 70 },
					{ label: 'Belum Bayar', color: 'bg-amber-500', pct: 20 },
					{ label: 'Jatuh Tempo', color: 'bg-red-500', pct: 10 }
				] as item}
					<div class="flex items-center gap-3">
						<span class="text-xs font-medium text-surface-800/60 dark:text-white/50 w-24">{item.label}</span>
						<div class="flex-1 h-2 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
							<div class="h-full {item.color} rounded-full transition-all duration-500" style="width: {item.pct}%"></div>
						</div>
						<span class="text-xs text-surface-800/40 dark:text-white/30 w-8 text-right">{item.pct}%</span>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
