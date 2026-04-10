<script lang="ts">
	import type { LayoutData } from './$types';
	import Sidebar from '$lib/components/layout/Sidebar.svelte';
	import Navbar from '$lib/components/layout/Navbar.svelte';

	let { data, children }: { data: LayoutData; children: any } = $props();
	let sidebarCollapsed = $state(false);
	let mobileSidebarOpen = $state(false);
	let darkMode = $state(true);

	$effect(() => {
		// On mount, sync the state with what the head script already applied to the DOM
		// This ensures we start with the correct theme without any layout shift
		const isDark = document.documentElement.classList.contains('dark');
		darkMode = isDark;
	});

	$effect(() => {
		// Sync the 'dark' class and localStorage whenever darkMode changes
		if (typeof document !== 'undefined') {
			document.documentElement.classList.toggle('dark', darkMode);
			localStorage.setItem('theme', darkMode ? 'dark' : 'light');
		}
	});
</script>

<svelte:head>
	<title>BenkyouLab - Management</title>
</svelte:head>

<div class="flex h-screen overflow-hidden bg-surface-50 dark:bg-surface-950 transition-colors duration-300">
	<!-- Mobile overlay -->
	{#if mobileSidebarOpen}
		<div
			class="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
			role="button"
			tabindex="-1"
			onclick={() => mobileSidebarOpen = false}
			onkeypress={() => mobileSidebarOpen = false}
		></div>
	{/if}

	<!-- Sidebar -->
	<Sidebar
		user={data.user}
		collapsed={sidebarCollapsed}
		mobileOpen={mobileSidebarOpen}
		onToggle={() => sidebarCollapsed = !sidebarCollapsed}
		onMobileClose={() => mobileSidebarOpen = false}
	/>

	<!-- Main content area -->
	<div class="flex-1 flex flex-col overflow-hidden transition-all duration-300"
		style="margin-left: {sidebarCollapsed ? '72px' : '260px'};"
	>
		<Navbar
			user={data.user}
			{darkMode}
			onToggleDarkMode={() => darkMode = !darkMode}
			onToggleMobileSidebar={() => mobileSidebarOpen = !mobileSidebarOpen}
		/>

		<main class="flex-1 overflow-y-auto p-4 lg:p-6">
			<div class="animate-fade-in">
				{@render children()}
			</div>
		</main>
	</div>
</div>

<style>
	@media (max-width: 1023px) {
		div[style] {
			margin-left: 0 !important;
		}
	}
</style>
