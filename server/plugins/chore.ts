import { setSuretypeOptions } from 'suretype';

import '~/polyfills/array-at';

function toJSON(this: bigint) {
  return this.toString();
}

// eslint-disable-next-line no-extend-native
Object.defineProperty(
  BigInt.prototype,
  'toJSON',
  {
    value: toJSON,
    writable: true,
    enumerable: false,
    configurable: true,
  },
);

setSuretypeOptions({ colors: false, location: false });

export default defineNitroPlugin((nitro) => {
  nitro.hooks.hookOnce('close', () => {
    const kysely = getKysely();

    kysely.destroy();
  });
});
