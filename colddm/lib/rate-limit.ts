import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
	? new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN })
	: undefined;

export const rateLimiters = {
	login: redis ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "1 m") }) : null,
	aiGeneration: redis ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, "1 h") }) : null,
	sendTrigger: redis ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(50, "1 h") }) : null,
	csvUpload: redis ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(3, "1 h") }) : null,
};

export async function checkRateLimit(limiter: Ratelimit | null, key: string) {
	if (!limiter) return { success: true };
	return await limiter.limit(key);
}

