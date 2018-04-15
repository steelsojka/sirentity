import { AbstractSchema } from './AbstractSchema';
import { EntitySchema } from './EntitySchema';
import { NormalizeContext } from './NormalizeContext';

export type EntitiesMap = { [key: string]: { [key: string]: object } };

export interface AddEntityArgs<T extends object> {
  schema: AbstractSchema<T>;
  id: string;
  parentSchema: AbstractSchema<any> | null;
  parentEntity: any;
  entity: T;
}

export class Normalizer {
  protected entities: EntitiesMap = {};
  protected readonly PARENT_REF_KEY = '@entities/parentRefs';
  protected readonly CHILD_REF_KEY = '@entities/childRefs';
  protected readonly COUNT_KEY = '@entities/count';

  addEntity<T extends object>(args: {
    schema: EntitySchema<T>;
    id: string;
    parentSchema: EntitySchema<any> | null;
    parentEntity: any;
    entity: T;
  }): void {
    const { schema, id, parentSchema, parentEntity, entity } = args;

    if (!this.entities[schema.name]) {
      this.entities[schema.name] = {};
    }

    if (parentSchema && parentEntity) {
      const parentId = parentSchema.getId(parentEntity);
      const parentName = parentSchema.name;

      this.addRef(this.PARENT_REF_KEY, parentName, parentId, entity)
      this.addRef(this.CHILD_REF_KEY, schema.name, id, parentEntity);
    }

    this.entities[schema.name][id] = entity;
  }

  removeEntity<T extends object>(schema: EntitySchema<T>, id: string): void {
    const entity = this.getEntity(schema.name, id);

    if (!entity) {
      return;
    }

    const parentRefs = entity[this.PARENT_REF_KEY];

    if (parentRefs) {
      if (parentRefs[this.COUNT_KEY]) {
        throw new Error('Can not remove child entity while a parent references it.');
      }
    }
  }

  normalize<T extends object>(schema: AbstractSchema<T>, entity: T): string | null | undefined {
    return (new NormalizeContext(this.addEntity.bind(this))).normalize({
      entity, schema,
      parentEntity: null,
      parentSchema: null
    });
  }

  getEntity<T extends object>(name: string, id: string): T | null {
    return (this.entities[name] && this.entities[name][id] as T) || null;
  }

  private addRef<T extends object>(key: string, name: string, id: string, entity: T): void {
    this.initEntityRefs(key, name, entity);

    const refMap = entity[key];
    const refs = refMap[name] as Set<string>;

    refs.add(id);
    refMap[this.COUNT_KEY] = refMap[this.COUNT_KEY] ? refMap[this.COUNT_KEY] + 1 : 1;
  }

  private removeRef<T extends object>(key: string, name: string, id: string, entity: T): void {
    if (!entity[key] || !entity[key][name]) {
      return;
    }

    const refMap = entity[key];
    const refs = refMap[name] as Set<string>;

    refs.delete(id);
    refMap[this.COUNT_KEY] =- 1;
  }

  private getEntityRefs<T extends object>(key: string, name: string, entity: T): { [key: string]: Set<string> } {
    return (entity[key] && entity[key][name]) || null;
  }

  private initEntityRefs<T extends object>(key: string, name: string, entity: T): void {
    if (!entity[key]) {
      Object.defineProperty(entity, key, {
        configurable: true,
        writable: true,
        enumerable: false,
        value: {}
      });
    }

    if (!entity[key][name]) {
      entity[key][name] = new Set();
    }
  }
}