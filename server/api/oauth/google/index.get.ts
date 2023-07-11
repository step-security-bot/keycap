export default defineEventHandler(async (event) => {
  const { code, state } = getQuery(event);

  if (!code || !state)
    return sendOAuthRedirect(event, OAuthProvider.Google);

  if (state !== getCookie(event, 'state'))
    return createError({ statusCode: 422 });

  const googleUser = await getGoogleUserWithEvent(event)
    .catch(() => null);

  // TODO: better error handling
  if (!googleUser)
    return sendRedirect(event, '');

  const user = await getOrCreateUserFromSocialAuth(
    normalizeGoogleUser(googleUser),
  )
    .catch(() => null);

  // TODO: better error handling
  if (!user)
    return sendRedirect(event, '/');

  await setAuthCookies(event, user);

  return sendRedirect(event, `/@${user.username}`);
});