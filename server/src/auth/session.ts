import session from 'express-session';
import { env } from '../config';

// appSession is an instance of the express-session middleware that takes an object with the following properties:
// secret: a string that is used to sign the session ID cookie.
// resave: a boolean that determines whether the session should be saved to the session store on every request.
// saveUninitialized: a boolean that determines whether a session should be created for every request.
const appSession = session({
	secret: `${env.SESSION_SECRET}`,
	resave: true,
	saveUninitialized: true,
});

export default appSession;
