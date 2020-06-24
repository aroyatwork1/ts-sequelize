import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import helmet from 'helmet';

import express, { Request, Response, NextFunction } from 'express';
import { BAD_REQUEST } from 'http-status-codes';
import 'express-async-errors';

import BaseRouter from './routes';
import logger from './shared/Logger';

import { DBConnection } from './database/DBConnection';
import { EventEmitter } from 'events';

// Global Config Init
const delegateData = [
    {
        id: 1,
        delegateName: 'some-delegate-1',
        delegateEmail: 'delegate1@company.com',
    },
    {
        id: 2,
        delegateName: 'some-delegate-1',
        delegateEmail: 'delegate12@company.com',
    },
    {
        id: 3,
        delegateName: 'some-delegate-1',
        delegateEmail: 'delegate13@company.com',
    },
    {
        id: 4,
        delegateName: 'some-delegate-1',
        delegateEmail: 'delegate14@company.com',
    },
    {
        id: 5,
        delegateName: 'some-delegate-1',
        delegateEmail: 'delegate15@company.com',
    },
    {
        id: 6,
        delegateName: 'some-delegate-1',
        delegateEmail: 'delegate16@company.com',
    },
    {
        id: 7,
        delegateName: 'some-delegate-1',
        delegateEmail: 'delegate17@company.com',
    },
    {
        id: 8,
        delegateName: 'some-delegate-1',
        delegateEmail: 'delegate18@company.com',
    },
];

(global as any).delegateAcounts = delegateData;
(global as any).emitter = new EventEmitter();

// Init express
const app = express();


/************************************************************************************
 *                              Set basic express settings
 ***********************************************************************************/

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

// Show routes called in console during development
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Security
if (process.env.NODE_ENV === 'production') {
    app.use(helmet());
}

// Add APIs
app.use('/api', BaseRouter);

// Print API errors
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message, err);
    return res.status(BAD_REQUEST).json({
        error: err.message,
    });
});

/************************************************************************************
 *                              Serve front-end content
 ***********************************************************************************/

const viewsDir = path.join(__dirname, 'views');
app.set('views', viewsDir);
const staticDir = path.join(__dirname, 'public');
app.use(express.static(staticDir));
app.get('*', (req: Request, res: Response) => {
    res.sendFile('index.html', {root: viewsDir});
});

// Export express instance
export default app;
