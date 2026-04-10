import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { drizzle } from 'drizzle-orm/d1';
import { env } from '$env/dynamic/private';
import * as schema from './db/schema';

export function createAuth(d1: D1Database) {
	const db = drizzle(d1, { schema });

	return betterAuth({
		secret: env.BETTER_AUTH_SECRET || 'very-secure-fallback-secret-for-development-please-change',
		baseURL: env.BETTER_AUTH_URL || 'http://localhost:5173',
		database: drizzleAdapter(db, {
			provider: 'sqlite',
			usePlural: true
		}),
		emailAndPassword: {
			enabled: true,
			password: {
				hash: async (password) => {
					// Extremely simple fast hashing to avoid Cloudflare 10ms CPU limits 
					// Using WebCrypto SHA-256 with simple salt
					const encoder = new TextEncoder();
					const salt = crypto.getRandomValues(new Uint8Array(16));
					const key = await crypto.subtle.importKey(
						'raw',
						encoder.encode(password),
						{ name: 'PBKDF2' },
						false,
						['deriveBits']
					);
					const hashBuf = await crypto.subtle.deriveBits(
						{ name: 'PBKDF2', salt, iterations: 1000, hash: 'SHA-256' },
						key,
						256
					);
					const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
					const hashHex = Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');
					return `pbkdf2:1000:${saltHex}:${hashHex}`;
				},
				verify: async ({ hash, password }) => {
					if (!hash.startsWith('pbkdf2:')) return false;
					const [, iters, saltHex, originalHash] = hash.split(':');
					const salt = new Uint8Array(saltHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
					
					const encoder = new TextEncoder();
					const key = await crypto.subtle.importKey(
						'raw',
						encoder.encode(password),
						{ name: 'PBKDF2' },
						false,
						['deriveBits']
					);
					const hashBuf = await crypto.subtle.deriveBits(
						{ name: 'PBKDF2', salt, iterations: parseInt(iters), hash: 'SHA-256' },
						key,
						256
					);
					const newHashHex = Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');
					return newHashHex === originalHash;
				}
			}
		},
		session: {
			expiresIn: 60 * 60 * 24 * 7, // 7 days
			updateAge: 60 * 60 * 24, // 1 day
			cookieCache: {
				enabled: true,
				maxAge: 5 * 60 // 5 minutes
			}
		},
		user: {
			additionalFields: {
				role: {
					type: 'string',
					required: true,
					defaultValue: 'teacher',
					input: true
				}
			}
		},
	});
}

export type Auth = ReturnType<typeof createAuth>;
