import { RateLimiterMemory } from 'rate-limiter-flexible';
import { Request, Response } from 'express'

const rateLimiter = new RateLimiterMemory({
    keyPrefix: 'middleware',
    points: 10,
    duration: 1
});

export function thyShallNotPass (req: Request, res: Response, next: any) {
    rateLimiter.consume(req.ip)
        .then(() => {
            next();
        })
        .catch((err) => {
            res.setHeader('Retry-After', err.msBeforeNext / 1000);
            res.setHeader('X-RateLimit-Limit', 10);
            res.setHeader('X-RateLimit-Remaining', err.remainingPoints);
            res.setHeader('X-RateLimit-Reset', new Date(Date.now() + err.msBeforeNext).toISOString());
            res.status(429).send('Slow it down buddy!');
        });
}