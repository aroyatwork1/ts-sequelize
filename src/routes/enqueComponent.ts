import { Request, Response } from 'express';

import { DelegateQueue } from '../shared/delegateQueue';
import { DelegateQueueManager } from '../shared/queueManager';
import { getAccessToken } from '../shared/ms.graph.helper';

function getRandInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function helper(input: any, cb: any) {
    // Simulating MS Graph API
    getAccessToken((err: Error, data: any) => {
        cb(err, data);
    });
}

export function enqeueRequest(req: Request, res: Response, next: any) {
    const delegateAccounts: any[] = (global as any).delegateAcounts;
    const delegateAcountLength = delegateAccounts.length;
    const index = getRandInt(0, delegateAcountLength);

    (async (index) => {
        if (index % 2 == 0) { // Simulating scenario when Token has not expired
            next();
        } else { // Simulating scenario when token has expired
            const q: DelegateQueue = DelegateQueueManager.getQueue(delegateAccounts[index].delegateEmail, helper);

            (() => {
                console.log(`********** Enqueueing request for delegate account ${delegateAccounts[index].delegateEmail} **********`);
                q.enqueue(req, res)
                .on('finish', (result: any[]) => {
                    console.log(`********** Request completed for delegate account ${delegateAccounts[index].delegateEmail} **********`);
                    next();
                })
                .on('failed', (err: Error) => {
                    if (err.message == '429') {
                        return res.status(429).send('Too many request');
                    } else {
                        return res.status(400).send(err.message);
                    }
                });
            })();
        }
    })(index);
}