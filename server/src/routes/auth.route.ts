import { Router } from 'express';
import { apiRoutePrefix, statusCodes } from '../utils';
import passport from 'passport';
import { User } from '@prisma/client';
import { env } from '../config';

const router = Router();

router
	.route(apiRoutePrefix('login'))
	.get(passport.authenticate('google', { scope: ['profile', 'email'] }));

router.route('/auth/google/callback').get(
	passport.authenticate('google', {
		successRedirect: env.CLIENT_ORIGIN,
		failureRedirect: env.CLIENT_ORIGIN + '/login',
	})
);

router.route(apiRoutePrefix('logout')).get((req, res) => {
	req.logout(() => {});
	res.clearCookie('connect.sid');
	res.status(200).json({ message: 'logged out' });
});

router.route(apiRoutePrefix('is-authenticated')).get((req, res) => {
	if (req.isAuthenticated())
		return res.status(statusCodes.OK).json({ isAuth: true });

	return res.status(statusCodes.UNAUTHORIZED).json({ isAuth: false });
});

router.route(apiRoutePrefix('user')).get((req, res) => {
	if (req.isAuthenticated()) {
		console.log('User authenticated');
		const user = req.user as User;
		user.oauthId = '';
		return res.status(200).json(req.user);
	}
	console.log('User not authenticated');
	return res.status(401).json({ message: 'User not authenticated' });
});

export default router;
