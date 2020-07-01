import { Request, Response } from 'express';

import { DelegateQueue } from '../shared/delegateQueue';
import { DelegateQueueManager } from '../shared/queueManager';
import { getAccessToken } from '../shared/ms.graph.helper';

const uuid_gen = require("uuid");

function getRandInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function helper(input: any, cb: any) {
    // Simulating MS Graph API
    // This method will fetch the refresh, access tokena and update the db
    getAccessToken((err: Error, data: any) => {
        cb(err, data);
    });
}

export function enqeueRequest(req: Request, res: Response, next: any) {
    const delegateAccounts: any[] = (global as any).delegateAcounts;
    const delegateAcountLength = delegateAccounts.length;
    const index = getRandInt(0, delegateAcountLength);
    const uuid = uuid_gen.v4();

    (async (index, uuid) => {
        if (index % 2 == 0) { // Simulating scenario when Token has not expired
            next();
        } else { // Simulating scenario when token has expired
            const q: DelegateQueue = DelegateQueueManager.getQueue(delegateAccounts[index].delegateEmail, helper);

            (() => {
                console.log(`[${index} -> ${uuid}]::[${process.pid}]::[${new Date().toISOString()}] ********** Enqueueing request for delegate account ${delegateAccounts[index].delegateEmail} **********`);
                q.enqueue(req, res)
                .on('finish', (result: any) => {
                    // After the fetch from MS-Graph has been completed and db has been updated, we will
                    // continue to the endpoint handler as usual, which will fetch the token from db and send it user
                    console.log(`[[${index} -> ${uuid}]::${process.pid}]::[${new Date().toISOString()}] ********** Request completed for delegate account ${delegateAccounts[index].delegateEmail} **********`);
                    next();
                })
                .on('failed', (err: Error) => {
                    console.error(`[ERROR]::[[${index} -> ${uuid}]::${process.pid}]::[${new Date().toISOString()}] ********** Request completed for delegate account ${delegateAccounts[index].delegateEmail} **********`);
                    if (err.message == '429') {
                        return res.status(429).send('Too many request');
                    } else {
                        return res.status(400).send(err.message);
                    }
                });
            })();
        }
    })(index, uuid);
}