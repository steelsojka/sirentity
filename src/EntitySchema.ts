import { AbstractSchema } from './AbstractSchema';
import { Normalizer, NormalizeArgs } from './Normalizer';

export type StringKeys<T extends object> = {
  [K in keyof T]: T[K] extends string ? K : never
}[keyof T];

export type EntitySchemaMap<T extends object> = { [K in keyof T]?: T[K] extends object ? AbstractSchema<T[K]> : never };

export interface EntitySchemaConfig<T extends object> {
  name: string;
  id: StringKeys<T> | ((entity: T) => string);
  schemas?: EntitySchemaMap<T>;
}

export class EntitySchema<T extends object> extends AbstractSchema<T> {
  readonly name: string;

  protected schemas: EntitySchemaMap<T>;
  protected idFactory: (entity: T) => string;

  constructor(config: EntitySchemaConfig<T>) {
    super();

    this.schemas = config.schemas || {};
    this.name = config.name;
    this.idFactory = typeof config.id === 'string'
      ? e => e[config.id as StringKeys<T>] as any
      : config.id;
  }

  getId(entity: T): string {
    return this.idFactory(entity);
  }

  normalize(normalizer: Normalizer, args: NormalizeArgs<T>): string {
    const { entity } = args;
    const id = this.idFactory(entity);
    const result = { ...entity as object } as T;

    for (const key of Object.keys(this.schemas)) {
      result[key] = normalizer.normalize({
        schema: this.schemas[key],
        entity: result[key],
        parentSchema: this,
        parentEntity: entity
      });
    }

    normalizer.addEntity(this.name, id, result);

    return id;
  }

  denormalize(normalizer: Normalizer): void {

  }

  defineSchemas(schemas: EntitySchemaMap<T>): void {
    this.schemas = {
      ...this.schemas as object,
      ...schemas as object
    };
  }
}