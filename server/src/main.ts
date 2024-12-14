import express, { Application } from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import { apiRoutePrefix, statusCodes } from './utils';
import { appSession, passport } from './auth';
import { corsOption } from './config';
import expressListRoutes from 'express-list-routes';
import { NextFunction, Request, Response } from 'express';
import { database, env, server } from './config';
import { ErrorHandlers, ErrorsMessages, Panic } from './errors';
import {
	authRouter,
	commentRouter,
	notifRouter,
	postRouter,
	userRouter,
} from './routes';

// create express app
const app: Application = express();

// middlewares setup
app.use(cors(corsOption));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.ENV === 'production' ? 'combined' : 'dev'));
app.use(helmet());

// serve static files
app.use(
	apiRoutePrefix('resumes'),
	express.static(env.STATIC_FILES_PATH || 'public')
);

// session and passport middleware
app.use(appSession);
app.use(passport.initialize());
app.use(passport.session());

// connect to database
database();

// declare all routes
app.use('/', authRouter);
app.use(apiRoutePrefix('users'), userRouter);
app.use(apiRoutePrefix('posts'), postRouter);
app.use(apiRoutePrefix('comments'), commentRouter);
app.use(apiRoutePrefix('notifications'), notifRouter);

app.all('*', (req: Request, res: Response, next: NextFunction) =>
	next(new Panic(ErrorsMessages.PATH_NOT_FOUND, statusCodes.NOT_FOUND))
);

// error middleware handler
app.use(ErrorHandlers);

// list all routes in terminal when in development mode
if (env.NODE_ENV === 'development') {
	expressListRoutes(authRouter, {
		spacer: 15,
	});
	expressListRoutes(userRouter, {
		prefix: apiRoutePrefix('users'),
		spacer: 15,
	});
	expressListRoutes(postRouter, {
		prefix: apiRoutePrefix('posts'),
		spacer: 15,
	});
	expressListRoutes(commentRouter, {
		prefix: apiRoutePrefix('comments'),
		spacer: 15,
	});
	expressListRoutes(notifRouter, {
		prefix: apiRoutePrefix('notifications'),
		spacer: 15,
	});
}

// start the server
server(app);
