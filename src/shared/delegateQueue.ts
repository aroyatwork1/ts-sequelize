import { Request, Response } from 'express';
import { EventEmitter } from 'events';

const q =  require('better-queue'); // require("async").queue; // require('fastq');

export class DelegateQueue {
    private static _queue: any;
    private static _delegateEmail: string;

    constructor(delegateEmail: string, cb: any) {

        if (!delegateEmail || !cb) {
            throw new Error("DelegateQueue :: invalid parametes");
        }

        DelegateQueue._delegateEmail = delegateEmail.trim().toLowerCase();

        if (!DelegateQueue._queue) {
            DelegateQueue._queue = new q(cb, { concurrent: 1 }); // new q(cb, 1); // q(cb, 1); 
        }
    }

    public enqueue(req: Request, res: Response, index: number) {
        return DelegateQueue._queue.push({index: index});
        
        // const emitter = new EventEmitter();
        // DelegateQueue._queue.push({}, (err: Error) => {
        //     (!err) ? emitter.emit('finish', {}) : emitter.emit('failed', err);
        // });        
        // return emitter;
    }
}