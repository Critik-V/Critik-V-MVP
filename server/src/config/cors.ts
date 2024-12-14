import { CorsOptions } from 'cors';
import env from './env';

const originList = [`${env.CLIENT_ORIGIN}`];

const corsAllowedHeadersList: string[] = [
	'Content-Type',
	'Authorization',
	'Set-Cookie',
	'Cookie',
	'Access-Control-Allow-Origin',
	'Access-Control-Allow-Credentials',
	'Access-Control-Allow-Headers',
	'Access-Control-Allow-Methods',
];

const corsOptions: CorsOptions = {
	origin: originList,
	optionsSuccessStatus: 200,
	methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
	allowedHeaders: corsAllowedHeadersList,
	credentials: true,
};

export default corsOptions;
