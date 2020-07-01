console.log(" M S   G R A P H   H E L P E R    I N I T");

const q = require('better-queue');

import { RateLimiter } from "limiter";

const limiter = new RateLimiter(15, 'second', true);
const tokenQueue = new q(helper, { concurrent: 1 });

export function getAccessToken(cb: any) {
    tokenQueue
        .push({})
        .on('finish', (result: any[]) => {
            cb(null, {})
        })
        .on('failed', (err: Error) => {
            cb(err, null);
        });
}

function getRandInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sleep(seconds: number) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, seconds * 1000);
    });
}

function helper(input: any, cb: any) {
    limiter.removeTokens(1, async (err, remainingRequests) => {
        console.log("");
        console.log(`[${process.pid}]::[${new Date().toISOString()}] Remaining tokens :: ${remainingRequests}`);
        console.log("");
        if (remainingRequests < 1) {
            console.error(`[ERROR]]::[${new Date().toISOString()}] ########## OUT THROTTLE CLOSED ##########`);
            cb(new Error('429'), null);
        } else {
            // Simulating MS Graph API
            // await sleep(getRandInt(2, 5));
            sleep(1).then(() => { // 2000 ms delay for testing purpose
                cb(null, []); // Send some dummy data
            }).catch((e) => {
                cb(new Error('400'), null);
            });
        }
    });
}