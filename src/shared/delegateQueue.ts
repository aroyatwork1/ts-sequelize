import { Request, Response } from 'express';

const q = require('better-queue');

export class DelegateQueue {
    private static _queue: any;
    private static _delegateEmail: string;

    constructor(delegateEmail: string, cb: any) {

        if (!delegateEmail || !cb) {
            throw new Error("DelegateQueue :: invalid parametes");
        }

        DelegateQueue._delegateEmail = delegateEmail.trim().toLowerCase();

        if (!DelegateQueue._queue) {
            DelegateQueue._queue = new q(cb, { concurrent: 1 });
        }
    }

    public enqueue(req: Request, res: Response) {
        return DelegateQueue._queue.push({});
    }
}