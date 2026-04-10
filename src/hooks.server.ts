import { createAuth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/environment';
import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

const publicPaths = ['/login', '/api/auth'];

export const handle: Handle = async ({ event, resolve }) => {
	// Skip auth during build
	if (building) {
		return resolve(event);
	}

	const db = event.platform?.env?.DB;
	if (!db) {
		// During dev without D1, allow access
		return resolve(event);
	}

	const auth = createAuth(db);

	// Get session
	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	if (session) {
		event.locals.user = {
			id: session.user.id,
			name: session.user.name,
			email: session.user.email,
			role: (session.user as any).role || 'teacher',
			image: session.user.image
		};
		event.locals.session = {
			id: session.session.id,
			userId: session.session.userId,
			token: session.session.token,
			expiresAt: session.session.expiresAt
		};
	} else {
		event.locals.user = null;
		event.locals.session = null;
	}

	// Protect routes
	const isPublic = publicPaths.some((p) => event.url.pathname.startsWith(p));
	if (!isPublic && !event.locals.user) {
		throw redirect(303, '/login');
	}

	// Handle Better Auth API routes
	return svelteKitHandler({ event, resolve, auth, building });
};
