import { createPlugin } from 'fluse';
import * as txtgen from 'txtgen';

export function txtgenPlugin() {
  return createPlugin<typeof txtgen>({
    name: 'txtgen',
    version: '^1.0.0',
    execute(next) {
      return next(txtgen);
    },
  });
}
