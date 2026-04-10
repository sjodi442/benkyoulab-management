<script lang="ts">
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	type JLPTItem = { level: string | null; count: number };
	type PaymentStatusItem = { status: "paid" | "pending" | "overdue" | "cancelled" | null; count: number };

	// Polling for real-time updates every 30 seconds
	onMount(() => {
		const interval = setInterval(() => {
			invalidateAll();
		}, 30000);
		return () => clearInterval(interval);
	});

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
	}

	function formatMonth(monthStr: string): string {
		const [year, month] = monthStr.split('-');
		return new Intl.DateTimeFormat('id-ID', { month: 'short', year: '2-digit' }).format(new Date(parseInt(year), parseInt(month) - 1));
	}

	let reports = $derived(data.reports);
	let jlptDistribution = $derived((reports?.jlptDistribution || []) as JLPTItem[]);
	let paymentStatus = $derived((reports?.paymentStatus || []) as PaymentStatusItem[]);
	let totalStudents = $derived(jlptDistribution.reduce((acc: number, curr: JLPTItem) => acc + curr.count, 0));
	let totalInvoices = $derived(paymentStatus.reduce((acc: number, curr: PaymentStatusItem) => acc + curr.count, 0));
</script>

<svelte:head>
	<title>Laporan - BenkyouLab</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-surface-800 dark:text-white/95">Laporan</h1>
			<p class="text-sm text-surface-800/50 dark:text-white/40 mt-0.5">Ringkasan dan analisis data secara realtime</p>
		</div>
		<div class="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
			<span class="relative flex h-2 w-2">
				<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
				<span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
			</span>
			<span class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase">Live Updating</span>
		</div>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
		<!-- Revenue Chart -->
		<div class="bg-white dark:bg-surface-900/50 rounded-2xl border border-surface-200 dark:border-white/5 p-6">
			<h3 class="text-sm font-semibold text-surface-800 dark:text-white/90 mb-4">Pendapatan Bulanan (6 Bulan Terakhir)</h3>
			<div class="h-48 flex items-end gap-2 px-2">
				{#if reports?.monthlyRevenue && reports.monthlyRevenue.length > 0}
					{@const max = Math.max(...reports.monthlyRevenue.map((d: { total: number }) => d.total || 0), 1)}
					{#each reports.monthlyRevenue as entry}
						<div class="flex-1 flex flex-col items-center gap-2 group">
							<div class="relative w-full bg-primary-500/20 rounded-t-lg transition-all duration-500 hover:bg-primary-500/40" style="height: {(entry.total / max) * 100}%">
								<div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
									{formatCurrency(entry.total)}
								</div>
							</div>
							<span class="text-[10px] font-medium text-surface-800/40 dark:text-white/30">{formatMonth(entry.month)}</span>
						</div>
					{/each}
				{:else}
					<div class="w-full h-full flex items-center justify-center text-surface-800/20 dark:text-white/10">
						<p class="text-xs">Belum ada data pendapatan</p>
					</div>
				{/if}
			</div>
		</div>

		<!-- Student Growth Chart -->
		<div class="bg-white dark:bg-surface-900/50 rounded-2xl border border-surface-200 dark:border-white/5 p-6">
			<h3 class="text-sm font-semibold text-surface-800 dark:text-white/90 mb-4">Pertumbuhan Siswa (6 Bulan Terakhir)</h3>
			<div class="h-48 flex items-end gap-2 px-2">
				{#if reports?.studentGrowth && reports.studentGrowth.length > 0}
					{@const max = Math.max(...reports.studentGrowth.map((d: { count: number }) => d.count || 0), 1)}
					{#each reports.studentGrowth as entry}
						<div class="flex-1 flex flex-col items-center gap-2 group">
							<div class="relative w-full bg-violet-500/20 rounded-t-lg transition-all duration-500 hover:bg-violet-500/40" style="height: {(entry.count / max) * 100}%">
								<div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
									{entry.count} Siswa
								</div>
							</div>
							<span class="text-[10px] font-medium text-surface-800/40 dark:text-white/30">{formatMonth(entry.month)}</span>
						</div>
					{/each}
				{:else}
					<div class="w-full h-full flex items-center justify-center text-surface-800/20 dark:text-white/10">
						<p class="text-xs">Belum ada data siswa</p>
					</div>
				{/if}
			</div>
		</div>

		<!-- JLPT Level Distribution -->
		<div class="bg-white dark:bg-surface-900/50 rounded-2xl border border-surface-200 dark:border-white/5 p-6">
			<h3 class="text-sm font-semibold text-surface-800 dark:text-white/90 mb-4">Distribusi Level JLPT</h3>
			<div class="space-y-4">
				{#if jlptDistribution.length > 0}
					{#each jlptDistribution as dist}
						{@const percentage = totalStudents > 0 ? (dist.count / totalStudents) * 100 : 0}
						<div class="flex items-center gap-3">
							<span class="text-xs font-medium text-surface-800/60 dark:text-white/50 w-8">{dist.level}</span>
							<div class="flex-1 h-2 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
								<div class="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-1000" style="width: {percentage}%"></div>
							</div>
							<span class="text-[10px] text-surface-800/40 dark:text-white/30 w-12 text-right">{dist.count} ({Math.round(percentage)}%)</span>
						</div>
					{/each}
				{:else}
					<div class="h-24 flex items-center justify-center text-surface-800/20 dark:text-white/10">
						<p class="text-xs">Belum ada data distribusi</p>
					</div>
				{/if}
			</div>
		</div>

		<!-- Payment Status -->
		<div class="bg-white dark:bg-surface-900/50 rounded-2xl border border-surface-200 dark:border-white/5 p-6">
			<h3 class="text-sm font-semibold text-surface-800 dark:text-white/90 mb-4">Status Pembayaran (Invoice)</h3>
			<div class="space-y-4">
				{#if paymentStatus.length > 0}
					{#each paymentStatus as status}
						{@const percentage = totalInvoices > 0 ? (status.count / totalInvoices) * 100 : 0}
						{@const color = status.status === 'paid' ? 'bg-emerald-500' : status.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'}
						<div class="flex items-center gap-3">
							<span class="text-xs font-medium text-surface-800/60 dark:text-white/50 w-24 truncate capitalize">{status.status}</span>
							<div class="flex-1 h-2 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
								<div class="h-full {color} rounded-full transition-all duration-1000" style="width: {percentage}%"></div>
							</div>
							<span class="text-[10px] text-surface-800/40 dark:text-white/30 w-12 text-right">{status.count} ({Math.round(percentage)}%)</span>
						</div>
					{/each}
				{:else}
					<div class="h-24 flex items-center justify-center text-surface-800/20 dark:text-white/10">
						<p class="text-xs">Belum ada data invoice</p>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
