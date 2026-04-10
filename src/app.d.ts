// See https://svelte.dev/docs/kit/types#app.d.ts

declare global {
	namespace App {
		interface Locals {
			user: {
				id: string;
				name: string;
				email: string;
				role: 'owner' | 'teacher' | 'student';
				image?: string | null;
			} | null;
			session: {
				id: string;
				userId: string;
				token: string;
				expiresAt: Date;
			} | null;
		}
		interface Platform {
			env: {
				DB: D1Database;
			};
			context: ExecutionContext;
			caches: CacheStorage & { default: Cache };
		}
	}
}

export {};
