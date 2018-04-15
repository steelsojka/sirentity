export type FuncArg1<T> = T extends (a: infer A) => any ? A : never;
export type FuncArg2<T> = T extends (a: any, b: infer B) => any ? B : never;