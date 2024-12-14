// // -------------------- IMPORTS -------------------- //
// import express, { Application } from 'express';
// import morgan from 'morgan';
// import helmet from 'helmet';
// import { appSession, passport } from './auth';
// import cors from 'cors';
// import { corsOption, env } from './config';
// import { apiRoutePrefix } from './utils';
// // -------------------- CONFIG -------------------- //
// const app: Application = express();
// // -------------------- MIDDLEWARES -------------------- //
// app.use(cors(corsOption));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(morgan(env.ENV === 'production' ? 'combined' : 'dev'));
// app.use(helmet());
// // -------------------- FILES -------------------- //
// app.use(
// 	apiRoutePrefix('resumes'),
// 	express.static(env.STATIC_FILES_PATH || 'public')
// );
// // -------------------- GOOGLE AUTH -------------------- //
// app.use(appSession);
// app.use(passport.initialize());
// app.use(passport.session());

// // -------------------- EXPORTS -------------------- //
// export default app;
