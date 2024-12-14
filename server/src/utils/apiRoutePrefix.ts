import { env } from '../config';

// apiRoutePrefix function takes a route string and returns a string
//with the API_ROUTE_PREFIX environment variable prepended to it.
const apiRoutePrefix = (route: string): string => {
	return `/${env.API_ROUTE_PREFIX}/${route}`;
};

export default apiRoutePrefix;
