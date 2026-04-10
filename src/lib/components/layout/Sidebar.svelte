<script lang="ts">
	import { page } from '$app/stores';

	type Props = {
		user: any;
		collapsed: boolean;
		mobileOpen: boolean;
		onToggle: () => void;
		onMobileClose: () => void;
	};

	let { user, collapsed, mobileOpen, onToggle, onMobileClose }: Props = $props();

	const navigation = [
		{ name: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
		{ name: 'Siswa', href: '/students', icon: 'students' },
		{ name: 'Guru', href: '/teachers', icon: 'teachers' },
		{ name: 'Kelas', href: '/classes', icon: 'classes' },
		{ name: 'Pembayaran', href: '/payments', icon: 'payments' },
		{ name: 'Laporan', href: '/reports', icon: 'reports' }
	];

	const icons: Record<string, string> = {
		dashboard: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
		students: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
		teachers: 'M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z',
		classes: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5',
		payments: 'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z',
		reports: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z'
	};

	function isActive(href: string, pathname: string): boolean {
		if (href === '/dashboard') return pathname === '/dashboard';
		return pathname.startsWith(href);
	}
</script>

<aside
	class="fixed top-0 left-0 h-full z-50 flex flex-col bg-surface-900 dark:bg-surface-950 border-r border-white/5 transition-all duration-300 {collapsed ? 'w-[72px]' : 'w-[260px]'} {mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0"
>
	<!-- Logo -->
	<div class="flex items-center h-16 px-4 border-b border-white/5 shrink-0">
		<div class="flex items-center gap-3 overflow-hidden">
			<div class="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-500/20 shrink-0">
				<span class="text-lg font-bold text-white">勉</span>
			</div>
			{#if !collapsed}
				<div class="animate-fade-in">
					<h1 class="text-base font-bold text-white tracking-tight">BenkyouLab</h1>
					<p class="text-[10px] text-white/40 -mt-0.5">Management System</p>
				</div>
			{/if}
		</div>
	</div>

	<!-- Navigation -->
	<nav class="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
		{#each navigation as item}
			{@const active = isActive(item.href, $page.url.pathname)}
			<a
				href={item.href}
				onclick={onMobileClose}
				class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
					{active
						? 'bg-primary-500/15 text-primary-400'
						: 'text-white/50 hover:text-white/90 hover:bg-white/5'}"
			>
				<svg class="w-5 h-5 shrink-0 transition-colors {active ? 'text-primary-400' : 'text-white/40 group-hover:text-white/70'}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
					<path stroke-linecap="round" stroke-linejoin="round" d={icons[item.icon]} />
				</svg>
				{#if !collapsed}
					<span class="animate-fade-in">{item.name}</span>
				{/if}
			</a>
		{/each}
	</nav>

	<!-- Collapse button (desktop only) -->
	<div class="hidden lg:flex items-center justify-center py-3 border-t border-white/5">
		<button
			onclick={onToggle}
			class="p-2 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors cursor-pointer"
			aria-label="Toggle sidebar"
		>
			<svg class="w-5 h-5 transition-transform duration-300 {collapsed ? 'rotate-180' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
				<path stroke-linecap="round" stroke-linejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
			</svg>
		</button>
	</div>

	<!-- User info at bottom -->
	{#if user && !collapsed}
		<div class="p-3 border-t border-white/5 animate-fade-in">
			<div class="flex items-center gap-3 px-2 py-2">
				<div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
					{user.name?.charAt(0)?.toUpperCase() || '?'}
				</div>
				<div class="min-w-0">
					<p class="text-sm font-medium text-white/90 truncate">{user.name}</p>
					<p class="text-[10px] text-white/40 capitalize">{user.role}</p>
				</div>
			</div>
		</div>
	{/if}
</aside>
