import { Strategy } from 'passport-google-oauth20';
import { db } from '../config';
import env from '../config/env';

const GoogleStrategy = new Strategy(
	{
		clientID: `${env.GOOGLE_CLIENT_ID}`,
		clientSecret: `${env.GOOGLE_CLIENT_SECRET}`,
		callbackURL: `${env.GOOGLE_CALLBACK_URL}`,
	},
	async (accessToken, refreshToken, profile, done) => {
		const user = await db.user.findUnique({ where: { oauthId: profile.id } });
		if (!user) {
			const newUser = await db.user.create({
				data: {
					oauthId: profile.id,
					fullname: profile.displayName,
					profilePic: profile.photos?.[0]?.value ?? '',
				},
			});
			return done(null, newUser);
		}
		return done(null, profile);
	}
);

export default GoogleStrategy;
