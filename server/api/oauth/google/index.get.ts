import { destr } from 'destr';
import { withQuery } from 'ufo';

import type { GoogleUserRes } from '~/types/server-google';

export default defineEventHandler(async (event) => {
  let user = event.context.user;

  if (user)
    return sendRedirect(event, `/@${user.username}`);

  const query = getQuery(event);

  await assertNoOAuthErrors(event);

  if (!query.code)
    return sendOAuthRedirect(event, OAuthProvider.Google);

  const googleUser = destr<GoogleUserRes>(query.socialUser) || await getGoogleUserWithEvent(event)
    .catch(async (err) => {
      await event.context.logger.error({ err, msg: 'getGoogleUserWithEvent failed' });
    });

  const userValidation = useSocialUserValidator(googleUser);

  if (!userValidation.ok) {
    await event.context.logger.error({ err: userValidation.errors, msg: 'social user validation failed' });

    return sendRedirect(event, '/');
  }

  const prisma = getPrisma();

  if (!query.socialUser) {
    const oauth = await prisma.oAuth.findFirst({
      where: { id: googleUser.id },
      select: {
        user: { select: { id: true, email: true, username: true } },
      },
    });

    user = oauth?.user || null;
  }

  let username: string;

  if (!user) {
    username = query.username?.toString().trim() || '';
    const isUsernameValid = useUsernameValidator(username).ok
      && !(await checkIfUsernameTaken(username!));

    if (!isUsernameValid) {
      query.provider = OAuthProvider.Google.toLowerCase();
      query.username = undefined;
      query.socialUser = googleUser;
      query.usernameTaken = await checkIfUsernameTaken(username!) ? username : '';

      return sendRedirect(event,
        withQuery('/oauth/ask-username', query),
      );
    }
  }
  else {
    username = user.username;
  }

  user = await updateOrCreateUserFromSocialAuth(
    normalizeGoogleUser(googleUser, { username }),
  )
    .catch(async (err) => {
      await event.context.logger.error({ err, msg: 'updateOrCreateUserFromSocialAuth failed' });

      return null;
    });

  if (!user)
    return sendRedirect(event, '/');

  await Promise.all([
    setAuthCookies(event, user),
    removeFunctionCache(`${username}-taken`),
  ]);

  return sendRedirect(event, `/@${user.username}`);
});
