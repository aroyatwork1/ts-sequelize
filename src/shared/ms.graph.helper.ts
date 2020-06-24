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
        if (remainingRequests < 1) {
            cb(new Error('429'), null);
          } else {
              try {
                  // Simulating MS Graph API
                  await sleep(getRandInt(2, 5));
                  cb(null, []); // Send some dummy data
              } catch(e) {
                cb(new Error('400'), null);
              }
          }
    });
}