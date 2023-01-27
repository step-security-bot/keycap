import mitt from 'mitt';

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type Events = {
  'save:note'?: Partial<{ force: boolean }>
};

const emitter = mitt<Events>();

export default () => {
  return { ...emitter };
};
