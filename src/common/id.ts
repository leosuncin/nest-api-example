import { type InferIds, type InferPrefixes, Pika } from 'pika-id';

export const id = new Pika(['category', 'brand', 'product']);

export type Id<Prefix extends InferPrefixes<typeof id>> =
  `${Prefix}_${string}` extends InferIds<typeof id>
    ? `${Prefix}_${string}`
    : never;
