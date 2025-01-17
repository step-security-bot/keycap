export default defineEventHandler(async (event) => {
  const user = event.context.user!;
  const timer = event.context.timer!;

  const prisma = getPrisma();

  const path = getRouterParam(event, 'path') || '';

  const folderPath = generateFolderPath(user.username, path);

  const selectParams = getFolderSelectParamsFromEvent(event);

  timer.start('db');
  const folder = await prisma.folder.findFirst({
    where: { path: folderPath, ownerId: user.id },
    select: { ...selectParams },
  }).catch(async (err) => {
    await event.context.logger.error({ err, msg: 'folder.findFirst failed' });
  });
  timer.end();

  if (!folder)
    throw createError({ statusCode: 404 });

  timer.appendHeader(event);

  return folder;
});
