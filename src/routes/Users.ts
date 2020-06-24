import { Request, Response, Router } from 'express';
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes';
import { ParamsDictionary } from 'express-serve-static-core';
import { RateLimiter } from 'limiter';

import UserDao from '../daos/User/UserDao.mock';
import { paramMissingError } from '../shared/constants';
import { thyShallNotPass } from './incoming-request-limiter';
import { enqeueRequest } from './enqueComponent';

const q = require('better-queue');

// Init shared
const router = Router();
const userDao = new UserDao();
const limiter = new RateLimiter(15, 'second', true);
const delegateQ = new q(helper, { concurrent: 1 });

/******************************************************************************
 *                      Get All Users - "GET /api/users/all"
 ******************************************************************************/

router.get('/all', thyShallNotPass, enqeueRequest, async (req: Request, res: Response) => {

    // delegateQ
    // .push({req, res})
    // .on('finish', (result: any[]) => {
    //     return res.jsonp(result);
    // })
    // .on('failed', (err: Error) => {
    //     if (err.message == '429') {
    //         return res.status(429).send('Too many request');
    //     } else {
    //         return res.status(400).send(err.message);
    //     }
    // });

    const users = await userDao.getAll();
    res.jsonp(users);
});


/******************************************************************************
 *                       Add One - "POST /api/users/add"
 ******************************************************************************/

router.post('/add', async (req: Request, res: Response) => {
    const { user } = req.body;
    if (!user) {
        return res.status(BAD_REQUEST).json({
            error: paramMissingError,
        });
    }
    await userDao.add(user);
    return res.status(CREATED).end();
});


/******************************************************************************
 *                       Update - "PUT /api/users/update"
 ******************************************************************************/

router.put('/update', async (req: Request, res: Response) => {
    const { user } = req.body;
    if (!user) {
        return res.status(BAD_REQUEST).json({
            error: paramMissingError,
        });
    }
    user.id = Number(user.id);
    await userDao.update(user);
    return res.status(OK).end();
});


/******************************************************************************
 *                    Delete - "DELETE /api/users/delete/:id"
 ******************************************************************************/

router.delete('/delete/:id', async (req: Request, res: Response) => {
    const { id } = req.params as ParamsDictionary;
    await userDao.delete(Number(id));
    return res.status(OK).end();
});

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

                  const users = await userDao.getAll();
                  cb(null, users);
              } catch(e) {
                cb(new Error('400'), null);
              }
          }
    });
}

/******************************************************************************
 *                                     Export
 ******************************************************************************/

export default router;
