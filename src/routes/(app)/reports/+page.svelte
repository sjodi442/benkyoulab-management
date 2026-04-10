<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { Chart, registerables } from 'chart.js';
	import type { PageData } from './$types';

	Chart.register(...registerables);

	let { data }: { data: PageData } = $props();

	type JLPTItem = { level: string | null; count: number };
	type PaymentStatusItem = { status: "paid" | "pending" | "overdue" | "cancelled" | null; count: number };

	let revenueCanvas: HTMLCanvasElement | undefined = $state();
	let growthCanvas: HTMLCanvasElement | undefined = $state();
	let jlptCanvas: HTMLCanvasElement | undefined = $state();
	let paymentCanvas: HTMLCanvasElement | undefined = $state();

	let revenueChart: Chart | undefined;
	let growthChart: Chart | undefined;
	let jlptChart: Chart | undefined;
	let paymentChart: Chart | undefined;

	// Polling for real-time updates every 30 seconds
	onMount(() => {
		const interval = setInterval(() => invalidateAll(), 30000);
		return () => {
			clearInterval(interval);
			destroyCharts();
		};
	});

	function destroyCharts() {
		revenueChart?.destroy();
		growthChart?.destroy();
		jlptChart?.destroy();
		paymentChart?.destroy();
	}

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
	}

	function formatMonth(monthStr: string): string {
		if (!monthStr) return '-';
		const [year, month] = monthStr.split('-');
		return new Intl.DateTimeFormat('id-ID', { month: 'short', year: '2-digit' }).format(new Date(parseInt(year), parseInt(month) - 1));
	}

	let reports = $derived(data.reports);
	let jlptDistribution = $derived((reports?.jlptDistribution || []) as JLPTItem[]);
	let paymentStatus = $derived((reports?.paymentStatus || []) as PaymentStatusItem[]);
	let summary = $derived(reports?.summary);

	$effect(() => {
		if (!revenueCanvas || !growthCanvas || !jlptCanvas || !paymentCanvas) return;
		
		destroyCharts();

		// Common Chart Config
		const isDark = document.documentElement.classList.contains('dark');
		const textColor = isDark ? '#94a3b8' : '#64748b';
		const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';

		// 1. Revenue Chart (Bar)
		revenueChart = new Chart(revenueCanvas, {
			type: 'bar',
			data: {
				labels: reports?.monthlyRevenue?.map(d => formatMonth(d.month)) || [],
				datasets: [{
					label: 'Pendapatan',
					data: reports?.monthlyRevenue?.map(d => d.total) || [],
					backgroundColor: 'rgba(16, 185, 129, 0.5)',
					borderColor: '#10b981',
					borderWidth: 2,
					borderRadius: 8,
					hoverBackgroundColor: '#10b981',
				}]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: { display: false },
					tooltip: {
						backgroundColor: isDark ? '#1e293b' : '#ffffff',
						titleColor: isDark ? '#ffffff' : '#1e293b',
						bodyColor: isDark ? '#94a3b8' : '#64748b',
						borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
						borderWidth: 1,
						callbacks: {
							label: (ctx) => ` ${formatCurrency(ctx.raw as number)}`
						}
					}
				},
				scales: {
					y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor, callback: (v) => v.toLocaleString('id-ID') } },
					x: { grid: { display: false }, ticks: { color: textColor } }
				}
			}
		});

		// 2. Growth Chart (Line)
		growthChart = new Chart(growthCanvas, {
			type: 'line',
			data: {
				labels: reports?.studentGrowth?.map(d => formatMonth(d.month)) || [],
				datasets: [{
					label: 'Siswa Baru',
					data: reports?.studentGrowth?.map(d => d.count) || [],
					borderColor: '#8b5cf6',
					backgroundColor: 'rgba(139, 92, 246, 0.1)',
					fill: true,
					tension: 0.4,
					pointRadius: 4,
					pointBackgroundColor: '#8b5cf6',
					borderWidth: 3
				}]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: { display: false },
					tooltip: {
						backgroundColor: isDark ? '#1e293b' : '#ffffff',
						titleColor: isDark ? '#ffffff' : '#1e293b',
						bodyColor: isDark ? '#94a3b8' : '#64748b',
						borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
						borderWidth: 1
					}
				},
				scales: {
					y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor, stepSize: 1 } },
					x: { grid: { display: false }, ticks: { color: textColor } }
				}
			}
		});

		// 3. JLPT Distribution (Doughnut)
		jlptChart = new Chart(jlptCanvas, {
			type: 'doughnut',
			data: {
				labels: jlptDistribution.map(d => d.level || 'No Level'),
				datasets: [{
					data: jlptDistribution.map(d => d.count),
					backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'],
					borderWidth: 0,
					hoverOffset: 10
				}]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				cutout: '70%',
				plugins: {
					legend: { position: 'right', labels: { color: textColor, boxWidth: 12, font: { size: 11 } } },
					tooltip: {
						backgroundColor: isDark ? '#1e293b' : '#ffffff',
						titleColor: isDark ? '#ffffff' : '#1e293b',
						bodyColor: isDark ? '#94a3b8' : '#64748b',
						borderWidth: 1
					}
				}
			}
		});

		// 4. Payment Status (Pie)
		paymentChart = new Chart(paymentCanvas, {
			type: 'pie',
			data: {
				labels: paymentStatus.map(d => d.status || 'unknown'),
				datasets: [{
					data: paymentStatus.map(d => d.count),
					backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#94a3b8'],
					borderWidth: 0
				}]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: { position: 'right', labels: { color: textColor, boxWidth: 12, font: { size: 11 } } },
					tooltip: {
						backgroundColor: isDark ? '#1e293b' : '#ffffff',
						titleColor: isDark ? '#ffffff' : '#1e293b',
						bodyColor: isDark ? '#94a3b8' : '#64748b',
						borderWidth: 1
					}
				}
			}
		});
	});
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
		<div class="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full no-print">
			<span class="relative flex h-2 w-2">
				<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
				<span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
			</span>
			<span class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase">Live updating</span>
		</div>
	</div>

	<!-- Summary Cards -->
	<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
		<div class="bg-white dark:bg-surface-900/50 p-5 rounded-2xl border border-surface-200 dark:border-white/5 shadow-sm">
			<p class="text-[10px] font-bold text-surface-800/40 dark:text-white/30 uppercase tracking-widest mb-1">Total Pendapatan</p>
			<p class="text-lg font-bold text-emerald-500">{formatCurrency(summary?.totalRevenue || 0)}</p>
		</div>
		<div class="bg-white dark:bg-surface-900/50 p-5 rounded-2xl border border-surface-200 dark:border-white/5 shadow-sm">
			<p class="text-[10px] font-bold text-surface-800/40 dark:text-white/30 uppercase tracking-widest mb-1">Siswa Aktif</p>
			<p class="text-lg font-bold text-surface-800 dark:text-white/90">{summary?.totalStudents || 0}</p>
		</div>
		<div class="bg-white dark:bg-surface-900/50 p-5 rounded-2xl border border-surface-200 dark:border-white/5 shadow-sm">
			<p class="text-[10px] font-bold text-surface-800/40 dark:text-white/30 uppercase tracking-widest mb-1">Kelas Aktif</p>
			<p class="text-lg font-bold text-primary-500">{summary?.totalClasses || 0}</p>
		</div>
		<div class="bg-white dark:bg-surface-900/50 p-5 rounded-2xl border border-surface-200 dark:border-white/5 shadow-sm">
			<p class="text-[10px] font-bold text-surface-800/40 dark:text-white/30 uppercase tracking-widest mb-1">Tagihan Pending</p>
			<p class="text-lg font-bold text-amber-500">{summary?.pendingInvoices || 0}</p>
		</div>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
		<!-- Revenue Chart -->
		<div class="bg-white dark:bg-surface-900/50 rounded-2xl border border-surface-200 dark:border-white/5 p-6 shadow-sm flex flex-col">
			<h3 class="text-sm font-bold text-surface-800 dark:text-white/90 mb-6 flex items-center gap-2">
				<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
				Pendapatan Bulanan
			</h3>
			<div class="flex-1 min-h-[220px]">
				<canvas bind:this={revenueCanvas}></canvas>
			</div>
		</div>

		<!-- Student Growth Chart -->
		<div class="bg-white dark:bg-surface-900/50 rounded-2xl border border-surface-200 dark:border-white/5 p-6 shadow-sm flex flex-col">
			<h3 class="text-sm font-bold text-surface-800 dark:text-white/90 mb-6 flex items-center gap-2">
				<span class="w-1.5 h-1.5 rounded-full bg-violet-500"></span>
				Pertumbuhan Siswa
			</h3>
			<div class="flex-1 min-h-[220px]">
				<canvas bind:this={growthCanvas}></canvas>
			</div>
		</div>

		<!-- JLPT Level Distribution -->
		<div class="bg-white dark:bg-surface-900/50 rounded-2xl border border-surface-200 dark:border-white/5 p-6 shadow-sm flex flex-col">
			<h3 class="text-sm font-bold text-surface-800 dark:text-white/90 mb-6">Distribusi Level JLPT</h3>
			<div class="flex-1 min-h-[220px]">
				<canvas bind:this={jlptCanvas}></canvas>
			</div>
		</div>

		<!-- Payment Status -->
		<div class="bg-white dark:bg-surface-900/50 rounded-2xl border border-surface-200 dark:border-white/5 p-6 shadow-sm flex flex-col">
			<h3 class="text-sm font-bold text-surface-800 dark:text-white/90 mb-6">Status Pembayaran (Invoice)</h3>
			<div class="flex-1 min-h-[220px]">
				<canvas bind:this={paymentCanvas}></canvas>
			</div>
		</div>
	</div>
</div>
