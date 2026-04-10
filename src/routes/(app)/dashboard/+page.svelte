<script lang="ts">
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Polling for real-time updates every 30 seconds
	onMount(() => {
		const interval = setInterval(() => {
			invalidateAll();
		}, 30000);
		return () => clearInterval(interval);
	});

	let stats = $derived([
		{
			label: 'Total Siswa',
			value: data.stats.totalStudents,
			icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
			color: 'from-blue-500 to-blue-600',
			bgGlow: 'bg-blue-500/10',
			trend: '+12%'
		},
		{
			label: 'Kelas Aktif',
			value: data.stats.activeClasses,
			icon: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5',
			color: 'from-emerald-500 to-emerald-600',
			bgGlow: 'bg-emerald-500/10',
			trend: '+5%'
		},
		{
			label: 'Guru Aktif',
			value: data.stats.activeTeachers,
			icon: 'M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z',
			color: 'from-violet-500 to-violet-600',
			bgGlow: 'bg-violet-500/10',
			trend: '+2%'
		},
		{
			label: 'Pendapatan Bulan Ini',
			value: formatCurrency(data.stats.monthlyRevenue),
			icon: 'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z',
			color: 'from-amber-500 to-orange-500',
			bgGlow: 'bg-amber-500/10',
			trend: '+18%'
		}
	]);

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
	}

	function formatDate(dateStr: string): string {
		return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(dateStr));
	}
</script>

<svelte:head>
	<title>Dashboard - BenkyouLab</title>
</svelte:head>

<div class="space-y-6">
	<!-- Welcome -->
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
		<div>
			<h1 class="text-2xl font-bold text-surface-800 dark:text-white/95">
				Selamat datang, {data.user?.name} 👋
			</h1>
			<p class="text-sm text-surface-800/50 dark:text-white/40 mt-1">
				Ini adalah ringkasan aktivitas BenkyouLab hari ini.
			</p>
		</div>
		<div class="flex items-center gap-3">
			<div class="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full shrink-0">
				<span class="relative flex h-2 w-2">
					<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
					<span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
				</span>
				<span class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase">Live Dashboard</span>
			</div>
			<div class="text-xs text-surface-800/40 dark:text-white/30 text-right hidden sm:block">
				{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
			</div>
		</div>
	</div>

	<!-- Stats Grid -->
	<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
		{#each stats as stat, i}
			<div
				class="relative overflow-hidden bg-white dark:bg-surface-900/50 rounded-2xl border border-surface-200 dark:border-white/5 p-5 transition-all duration-300 hover:shadow-lg hover:shadow-surface-200/50 dark:hover:shadow-primary-500/5 hover:-translate-y-0.5 group"
				style="animation-delay: {i * 80}ms;"
			>
				<!-- Glow effect -->
				<div class="absolute top-0 right-0 w-24 h-24 {stat.bgGlow} rounded-full blur-2xl opacity-50 group-hover:opacity-80 transition-opacity"></div>

				<div class="relative flex items-start justify-between">
					<div>
						<p class="text-xs font-medium text-surface-800/50 dark:text-white/40 uppercase tracking-wider">{stat.label}</p>
						<p class="text-2xl font-bold text-surface-800 dark:text-white/95 mt-2">{stat.value}</p>
						<p class="text-xs text-emerald-500 font-medium mt-1">{stat.trend} dari bulan lalu</p>
					</div>
					<div class="p-2.5 rounded-xl bg-gradient-to-br {stat.color} shadow-lg shrink-0">
						<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
							<path stroke-linecap="round" stroke-linejoin="round" d={stat.icon} />
						</svg>
					</div>
				</div>
			</div>
		{/each}
	</div>

	<!-- Content grid -->
	<div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
		<!-- Recent Students -->
		<div class="xl:col-span-2 bg-white dark:bg-surface-900/50 rounded-2xl border border-surface-200 dark:border-white/5 overflow-hidden">
			<div class="flex items-center justify-between px-5 py-4 border-b border-surface-200 dark:border-white/5">
				<h3 class="text-sm font-semibold text-surface-800 dark:text-white/90">Siswa Terbaru</h3>
				<a href="/students" class="text-xs text-primary-500 hover:text-primary-400 font-medium transition-colors">Lihat semua →</a>
			</div>

			{#if data.recentStudents.length > 0}
				<div class="divide-y divide-surface-200 dark:divide-white/5">
					{#each data.recentStudents as student}
						<div class="flex items-center gap-3 px-5 py-3 hover:bg-surface-50 dark:hover:bg-white/[0.02] transition-colors">
							<div class="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
								{student.user?.name?.charAt(0)?.toUpperCase() || '?'}
							</div>
							<div class="flex-1 min-w-0">
								<p class="text-sm font-medium text-surface-800 dark:text-white/90 truncate">{student.user?.name}</p>
								<p class="text-xs text-surface-800/40 dark:text-white/30">{student.user?.email}</p>
							</div>
							<span class="px-2 py-0.5 text-[10px] font-medium rounded-full bg-primary-500/10 text-primary-500">{student.jlptLevel}</span>
							<span class="px-2 py-0.5 text-[10px] font-medium rounded-full {student.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}">
								{student.status === 'active' ? 'Aktif' : 'Nonaktif'}
							</span>
						</div>
					{/each}
				</div>
			{:else}
				<div class="px-5 py-12 text-center">
					<svg class="w-12 h-12 mx-auto text-surface-800/10 dark:text-white/10 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
						<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" />
					</svg>
					<p class="text-sm text-surface-800/40 dark:text-white/30">Belum ada siswa terdaftar</p>
					<a href="/students/new" class="inline-block mt-3 px-4 py-2 text-xs font-medium bg-primary-500 text-white rounded-lg hover:bg-primary-400 transition-colors">
						Tambah Siswa
					</a>
				</div>
			{/if}
		</div>

		<!-- Recent Payments -->
		<div class="bg-white dark:bg-surface-900/50 rounded-2xl border border-surface-200 dark:border-white/5 overflow-hidden">
			<div class="flex items-center justify-between px-5 py-4 border-b border-surface-200 dark:border-white/5">
				<h3 class="text-sm font-semibold text-surface-800 dark:text-white/90">Pembayaran Terbaru</h3>
				<a href="/payments" class="text-xs text-primary-500 hover:text-primary-400 font-medium transition-colors">Lihat semua →</a>
			</div>

			{#if data.recentPayments.length > 0}
				<div class="divide-y divide-surface-200 dark:divide-white/5">
					{#each data.recentPayments as payment}
						<div class="px-5 py-3 hover:bg-surface-50 dark:hover:bg-white/[0.02] transition-colors">
							<div class="flex items-center justify-between">
								<p class="text-sm font-medium text-surface-800 dark:text-white/90">
									{payment.invoice?.student?.user?.name || 'Unknown'}
								</p>
								<p class="text-sm font-semibold text-emerald-500">{formatCurrency(payment.amount)}</p>
							</div>
							<p class="text-xs text-surface-800/40 dark:text-white/30 mt-0.5">{formatDate(payment.paymentDate)}</p>
						</div>
					{/each}
				</div>
			{:else}
				<div class="px-5 py-12 text-center">
					<svg class="w-12 h-12 mx-auto text-surface-800/10 dark:text-white/10 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
						<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3" />
					</svg>
					<p class="text-sm text-surface-800/40 dark:text-white/30">Belum ada pembayaran</p>
				</div>
			{/if}
		</div>
	</div>

	<!-- Quick Actions -->
	<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
		{#each [
			{ label: 'Tambah Siswa', href: '/students/new', icon: 'M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-blue-500' },
			{ label: 'Buat Kelas', href: '/classes/new', icon: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25', color: 'text-emerald-500' },
			{ label: 'Buat Invoice', href: '/payments/new', icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2 6.75H12m2.25 0H12m0-3h.008v.008H12V10.5zm0 3h.008v.008H12V13.5zM12 16.5h.008v.008H12V16.5z', color: 'text-amber-500' },
			{ label: 'Lihat Laporan', href: '/reports', icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75z', color: 'text-violet-500' }
		] as action}
			<a href={action.href} class="flex items-center gap-3 p-4 bg-white dark:bg-surface-900/50 rounded-xl border border-surface-200 dark:border-white/5 hover:shadow-md hover:-translate-y-0.5 transition-all group">
				<svg class="w-5 h-5 {action.color} shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
					<path stroke-linecap="round" stroke-linejoin="round" d={action.icon} />
				</svg>
				<span class="text-sm font-medium text-surface-800 dark:text-white/80 group-hover:text-surface-800 dark:group-hover:text-white transition-colors">{action.label}</span>
			</a>
		{/each}
	</div>
</div>
