import { AbstractSchema } from './AbstractSchema';

export class EntityMap implements Map<AbstractSchema<any>, any>{
  set<T extends object>(schema: AbstractSchema<T>, entity: T): void {

  }
}