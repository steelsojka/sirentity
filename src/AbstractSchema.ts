import { Normalizer } from './Normalizer';
import { NormalizeContext, NormalizeArgs } from './NormalizeContext';

export abstract class AbstractSchema<T extends object> {
  abstract normalize(context: NormalizeContext, args: NormalizeArgs<T>): string;
  abstract denormalize(context: Normalizer): void;
}