import { Request, Response } from 'express';

import { DelegateQueue } from '../shared/delegateQueue';
import { DelegateQueueManager } from '../shared/queueManager';
import { getAccessToken } from '../shared/ms.graph.helper';

const uuid_gen = require("uuid");

function getRandInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function helper(input: {index: number}, cb: any) {
    // Simulating MS Graph API
    // This method will fetch the refresh, access tokena and update the db
    getAccessToken(input.index, (err: Error, data: any) => {
        cb(err, data);
    });
}

export function enqeueRequest(req: Request, res: Response, next: any) {
    const delegateAccounts: any[] = (global as any).delegateAccounts;
    const delegateAcountLength = delegateAccounts.length;
    const index = getRandInt(0, delegateAcountLength - 1);
    const uuid = uuid_gen.v4();

    ((index, uuid) => {
        if ((global as any).delegateAccounts[index].isExpired == 'available') { // Simulating scenario when Token has not expired
            next();
        } else { // Simulating scenario when token has expired
            const q: DelegateQueue = DelegateQueueManager.getQueue(delegateAccounts[index].delegateEmail, helper);

            (() => {

                if ((global as any).delegateAccounts[index].isExpired == 'refreshing') {
                    return res.status(202).send('Fetching new token');
                }

                console.log(`[${index} -> ${uuid}]::[${process.pid}]::[${new Date().toISOString()}] ********** Enqueueing request for delegate account ${delegateAccounts[index].delegateEmail} **********`);
                q.enqueue(req, res, index)
                .on('finish', (result: any) => {
                    // Mark the delegate account as non expired
                    (global as any).delegateAccounts[index].isExpired = 'available';

                    // After the fetch from MS-Graph has been completed and db has been updated, we will
                    // a 202 from here
                    console.log(`[[${index} -> ${uuid}]::${process.pid}]::[${new Date().toISOString()}] ********** Request 202(ed) for delegate account ${delegateAccounts[index].delegateEmail} **********`);
                    return res.status(202).send('Fetching new token');
                })
                .on('failed', (err: Error) => {
                    console.error(`[ERROR]::[[${index} -> ${uuid}]::${process.pid}]::[${new Date().toISOString()}] ********** Request errored for delegate account ${delegateAccounts[index].delegateEmail} **********`);
                    console.error(err);
                    
                    if (err.message == '429') {
                        return res.status(429).send('Too many request');
                    } else if (err.message == '500') {
                        console.error(`Got a 500 for index :: ${index} and delegate account :: ${delegateAccounts[index].delegateEmail} :: ${JSON.stringify(err)}`);
                        return res.status(500).send(err.message);
                    } else {
                        console.error(`Got a 400 for index :: ${index} and delegate account :: ${delegateAccounts[index].delegateEmail} :: ${JSON.stringify(err)}`);
                        return res.status(400).send(err.message);
                    }
                });

                // getAccessToken((err: Error, data: any) => {
                //     next();
                // });

            })();
        }
    })(index, uuid);
}