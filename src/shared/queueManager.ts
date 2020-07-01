import { DelegateQueue } from './delegateQueue';

export class DelegateQueueManager {
    private static _qHash: any = {};
    
    constructor() {
        throw new Error("DelegateQueueManager :: Do not instantiate, use getQeue instead");
    }

    public static getQueue(delegateEmail: string, cb: any): DelegateQueue {
        delegateEmail = delegateEmail.trim().toLowerCase();

        if (!DelegateQueueManager._qHash[delegateEmail]) {
            DelegateQueueManager._qHash[delegateEmail] = new DelegateQueue(delegateEmail, cb);
        } else {
            console.log(`[${process.pid}]::[${new Date().toISOString()}] ^^^^^^^^^^ Queue exists for delegate ${delegateEmail} ^^^^^^^^^^`);
        }

        return DelegateQueueManager._qHash[delegateEmail];
    }
}