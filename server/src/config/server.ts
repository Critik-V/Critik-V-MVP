// -------------------- IMPORTS -------------------- //
import { Application } from 'express';
import http from 'node:http';
import logger from '../utils/logger';
import env from './env';
// -------------------- MAIN -------------------- //
const server = (app: Application) => {
	const PORT: number = Number(env.SERVER_PORT) || 5000;
	const HOST: string = 'localhost';

	const httpServer = http.createServer(app);
	httpServer.listen({ port: PORT, hostname: HOST }, async () => {
		try {
			logger.successServerLogger();
		} catch (error) {
			logger.errorServerLogger();
			httpServer.close();
			process.exit(1);
		}
	});
};
// -------------------- EXPORTS -------------------- //
export default server;
