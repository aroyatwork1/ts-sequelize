console.log(" M S   G R A P H   H E L P E R    I N I T");

const q = require('better-queue'); // require("async").queue;

import { RateLimiter } from "limiter";

const limiter = new RateLimiter(15, 'second', true);
const tokenQueue =  new q(helper, { concurrent: 1 }); // new q(helper, 1);

export function getAccessToken(index: number, cb: any) {
    tokenQueue
        .push({index: index})
        .on('finish', (result: any[]) => {
            cb(null, {})
        })
        .on('failed', (err: Error) => {
            cb(err, null);
        });

    // tokenQueue.push({}, (err: Error) => {
    //     cb(err, {});
    // });

    // sleep(1.5).then(() => { // 2000 ms delay for testing purpose
    //     cb(null, []); // Send some dummy data
    // }).catch((e) => {
    //     cb(new Error('400'), null);
    // });
}

function getRandInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sleep(seconds: number) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, seconds * 1000);
    });
}

function helper(input: { index: number }, cb: any) {
    const index = input.index;
    limiter.removeTokens(1, (err, remainingRequests) => {
        console.log("");
        console.log(`[${process.pid}]::[${new Date().toISOString()}] Remaining tokens :: ${remainingRequests}`);
        console.log("");
        if (remainingRequests < 1) {
            console.error(`[ERROR]]::[${new Date().toISOString()}] ########## OUT THROTTLE CLOSED ##########`);
            cb(new Error('429'), null);
        } else {
            // Simulating MS Graph API
            // await sleep(getRandInt(2, 5));
            try {
                if ((global as any).delegateAccounts[index].isExpired == 'expired') {

                    // Set the delegate account's status to 'refreshing' and go to fetch MS-Graph
                    (global as any).delegateAccounts[index].isExpired = 'refreshing';
                    call_ms_graph(index);
                    cb(null, []); // Send some dummy data
                } else {
                    console.error(new Error("Woah!! Did not expect to reach here for index " + index));
                    cb(new Error('500'),  null); // Woah!! Did not expect to reach here ! 
                }
            } catch(e) {
                console.error(new Error("Delegate account access got bust at index " + index));
                console.error(e);
                cb(new Error('500'), null);
            }
        }
    });
}

function call_ms_graph(index: number) {
    sleep(5).then(() => {
        (global as any).delegateAccounts[index].isExpired = 'available';
    });
}