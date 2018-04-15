import { AbstractSchema } from './AbstractSchema';
import { AddEntityArgs } from './Normalizer';

export interface NormalizeArgs<T extends object, P extends object = object> {
  schema: AbstractSchema<T>;
  entity: T;
  parentSchema: AbstractSchema<P> | null;
  parentEntity: P | null;
}

export class NormalizeContext {
  constructor(
    public readonly addEntity: <T extends object>(args: AddEntityArgs<T>) => void
  ) {}

  normalize<T extends object>(args: NormalizeArgs<T>): string | null | undefined {
    const { entity, schema } = args;

    if (!entity) {
      return entity;
    }

    return schema.normalize(this, args);
  }
}
