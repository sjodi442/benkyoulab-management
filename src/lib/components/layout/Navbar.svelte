<script lang="ts">
	import { page } from '$app/stores';

	type Props = {
		user: any;
		darkMode: boolean;
		onToggleDarkMode: () => void;
		onToggleMobileSidebar: () => void;
	};

	let { user, darkMode, onToggleDarkMode, onToggleMobileSidebar }: Props = $props();

	let showUserMenu = $state(false);

	const pageTitle: Record<string, string> = {
		'/dashboard': 'Dashboard',
		'/students': 'Manajemen Siswa',
		'/teachers': 'Manajemen Guru',
		'/classes': 'Manajemen Kelas',
		'/payments': 'Pembayaran & Invoice',
		'/reports': 'Laporan'
	};

	function getTitle(pathname: string): string {
		for (const [path, title] of Object.entries(pageTitle)) {
			if (pathname.startsWith(path)) return title;
		}
		return 'BenkyouLab';
	}
</script>

<header class="sticky top-0 z-30 flex items-center justify-between h-16 px-4 lg:px-6 bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl border-b border-surface-200 dark:border-white/5 shrink-0">
	<div class="flex items-center gap-3">
		<!-- Mobile menu button -->
		<button
			onclick={onToggleMobileSidebar}
			class="lg:hidden p-2 rounded-lg text-surface-800 dark:text-white/60 hover:bg-surface-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
			aria-label="Toggle menu"
		>
			<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
				<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
			</svg>
		</button>

		<h2 class="text-lg font-semibold text-surface-800 dark:text-white/90">
			{getTitle($page.url.pathname)}
		</h2>
	</div>

	<div class="flex items-center gap-2">
		<!-- Dark mode toggle -->
		<button
			onclick={onToggleDarkMode}
			class="p-2 rounded-lg text-surface-800 dark:text-white/60 hover:bg-surface-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
			aria-label="Toggle dark mode"
		>
			{#if darkMode}
				<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
				</svg>
			{:else}
				<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
					<path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
				</svg>
			{/if}
		</button>

		<!-- User menu -->
		<div class="relative">
			<button
				onclick={() => showUserMenu = !showUserMenu}
				class="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-surface-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
			>
				<div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-xs font-bold text-white">
					{user?.name?.charAt(0)?.toUpperCase() || '?'}
				</div>
				<span class="hidden sm:block text-sm font-medium text-surface-800 dark:text-white/80">{user?.name}</span>
			</button>

			{#if showUserMenu}
				<div class="absolute right-0 mt-2 w-56 bg-white dark:bg-surface-800 rounded-xl shadow-xl border border-surface-200 dark:border-white/10 py-1 animate-slide-up">
					<div class="px-4 py-3 border-b border-surface-200 dark:border-white/5">
						<p class="text-sm font-medium text-surface-800 dark:text-white/90">{user?.name}</p>
						<p class="text-xs text-surface-800/50 dark:text-white/40">{user?.email}</p>
						<span class="inline-block mt-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-primary-500/10 text-primary-500 capitalize">{user?.role}</span>
					</div>
					<form method="POST" action="/logout">
						<button type="submit" class="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/5 transition-colors cursor-pointer">
							Sign out
						</button>
					</form>
				</div>
			{/if}
		</div>
	</div>
</header>
