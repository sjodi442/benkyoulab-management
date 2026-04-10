<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';

	let loading = $state(false);
	let errorMessage = $state<string | null>(null);

	async function handleLogin(e: SubmitEvent) {
		e.preventDefault();
		loading = true;
		errorMessage = null;

		const form = e.target as HTMLFormElement;
		const email = form.email.value;
		const password = form.password.value;

		const { error } = await authClient.signIn.email({
			email,
			password
		});

		if (error) {
			errorMessage = error.message || 'Invalid email or password';
			loading = false;
		} else {
			window.location.href = '/dashboard'; // Force full refresh to properly rebuild locals
		}
	}
</script>

<svelte:head>
	<title>Login - BenkyouLab</title>
	<meta name="description" content="Login to BenkyouLab Management System" />
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-950 via-surface-900 to-primary-900 p-4">
	<!-- Background decoration -->
	<div class="absolute inset-0 overflow-hidden pointer-events-none">
		<div class="absolute top-1/4 -left-20 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl"></div>
		<div class="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl"></div>
		<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-400/5 rounded-full blur-3xl"></div>
	</div>

	<div class="relative w-full max-w-md animate-fade-in">
		<!-- Logo -->
		<div class="text-center mb-8">
			<div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-500/25 mb-4">
				<span class="text-2xl font-bold text-white">勉</span>
			</div>
			<h1 class="text-3xl font-bold text-white tracking-tight">BenkyouLab</h1>
			<p class="text-surface-200/60 mt-1 text-sm">管理システム — Management System</p>
		</div>

		<!-- Login Card -->
		<div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
			<h2 class="text-xl font-semibold text-white mb-6">Welcome back</h2>

			{#if errorMessage}
				<div class="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm">
					{errorMessage}
				</div>
			{/if}

			<form onsubmit={handleLogin}>
				<div class="space-y-4">
					<div>
						<label for="email" class="block text-sm font-medium text-surface-200/80 mb-1.5">Email</label>
						<input
							type="email"
							id="email"
							name="email"
							required
							autocomplete="email"
							class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
							placeholder="you@example.com"
						/>
					</div>

					<div>
						<label for="password" class="block text-sm font-medium text-surface-200/80 mb-1.5">Password</label>
						<input
							type="password"
							id="password"
							name="password"
							required
							autocomplete="current-password"
							class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
							placeholder="••••••••"
						/>
					</div>
				</div>

				<button
					type="submit"
					disabled={loading}
					class="mt-6 w-full py-3 px-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl hover:from-primary-400 hover:to-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/25 cursor-pointer"
				>
					{#if loading}
						<span class="inline-flex items-center gap-2">
							<svg class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
							</svg>
							Signing in...
						</span>
					{:else}
						Sign in
					{/if}
				</button>
			</form>
		</div>

		<p class="text-center text-surface-200/40 text-xs mt-6">
			© 2026 BenkyouLab. All rights reserved.
		</p>
	</div>
</div>
