import { withoutLeadingSlash } from 'ufo';

import type { RouteLocationNamedRaw } from 'vue-router';
import type { FolderOrNote, NoteMinimal } from '~/composables/store';

import { blankNoteName } from '~/assets/constants';

export function generateItemRouteParams(item: FolderOrNote): RouteLocationNamedRaw {
  const isFolder = 'root' in item;

  const routeName = isFolder ? blankNoteName : (item as NoteMinimal).name;
  const routeFolders = withoutLeadingSlash(item.path)
    .split('/')
    .slice(1)
    // removing last item in array if item is note
    .filter((_, i, array) => isFolder ? true : i !== array.length - 1)
    .map(decodeURIComponent);

  return {
    name: '@user-folders-note',
    params: { folders: routeFolders, note: routeName },
  };
}