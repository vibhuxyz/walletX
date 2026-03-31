
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model LoginAttempt
 * 
 */
export type LoginAttempt = $Result.DefaultSelection<Prisma.$LoginAttemptPayload>
/**
 * Model EmailVerificationLog
 * 
 */
export type EmailVerificationLog = $Result.DefaultSelection<Prisma.$EmailVerificationLogPayload>
/**
 * Model DeviceVerificationLog
 * 
 */
export type DeviceVerificationLog = $Result.DefaultSelection<Prisma.$DeviceVerificationLogPayload>
/**
 * Model ApiRequestLog
 * 
 */
export type ApiRequestLog = $Result.DefaultSelection<Prisma.$ApiRequestLogPayload>

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more LoginAttempts
 * const loginAttempts = await prisma.loginAttempt.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more LoginAttempts
   * const loginAttempts = await prisma.loginAttempt.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P]): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number }): $Utils.JsPromise<R>

  /**
   * Executes a raw MongoDB command and returns the result of it.
   * @example
   * ```
   * const user = await prisma.$runCommandRaw({
   *   aggregate: 'User',
   *   pipeline: [{ $match: { name: 'Bob' } }, { $project: { email: true, _id: false } }],
   *   explain: false,
   * })
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $runCommandRaw(command: Prisma.InputJsonObject): Prisma.PrismaPromise<Prisma.JsonObject>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.loginAttempt`: Exposes CRUD operations for the **LoginAttempt** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more LoginAttempts
    * const loginAttempts = await prisma.loginAttempt.findMany()
    * ```
    */
  get loginAttempt(): Prisma.LoginAttemptDelegate<ExtArgs>;

  /**
   * `prisma.emailVerificationLog`: Exposes CRUD operations for the **EmailVerificationLog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more EmailVerificationLogs
    * const emailVerificationLogs = await prisma.emailVerificationLog.findMany()
    * ```
    */
  get emailVerificationLog(): Prisma.EmailVerificationLogDelegate<ExtArgs>;

  /**
   * `prisma.deviceVerificationLog`: Exposes CRUD operations for the **DeviceVerificationLog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DeviceVerificationLogs
    * const deviceVerificationLogs = await prisma.deviceVerificationLog.findMany()
    * ```
    */
  get deviceVerificationLog(): Prisma.DeviceVerificationLogDelegate<ExtArgs>;

  /**
   * `prisma.apiRequestLog`: Exposes CRUD operations for the **ApiRequestLog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ApiRequestLogs
    * const apiRequestLogs = await prisma.apiRequestLog.findMany()
    * ```
    */
  get apiRequestLog(): Prisma.ApiRequestLogDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 5.22.0
   * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    LoginAttempt: 'LoginAttempt',
    EmailVerificationLog: 'EmailVerificationLog',
    DeviceVerificationLog: 'DeviceVerificationLog',
    ApiRequestLog: 'ApiRequestLog'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs, clientOptions: PrismaClientOptions }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], this['params']['clientOptions']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> = {
    meta: {
      modelProps: "loginAttempt" | "emailVerificationLog" | "deviceVerificationLog" | "apiRequestLog"
      txIsolationLevel: never
    }
    model: {
      LoginAttempt: {
        payload: Prisma.$LoginAttemptPayload<ExtArgs>
        fields: Prisma.LoginAttemptFieldRefs
        operations: {
          findUnique: {
            args: Prisma.LoginAttemptFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LoginAttemptPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.LoginAttemptFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LoginAttemptPayload>
          }
          findFirst: {
            args: Prisma.LoginAttemptFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LoginAttemptPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.LoginAttemptFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LoginAttemptPayload>
          }
          findMany: {
            args: Prisma.LoginAttemptFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LoginAttemptPayload>[]
          }
          create: {
            args: Prisma.LoginAttemptCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LoginAttemptPayload>
          }
          createMany: {
            args: Prisma.LoginAttemptCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.LoginAttemptDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LoginAttemptPayload>
          }
          update: {
            args: Prisma.LoginAttemptUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LoginAttemptPayload>
          }
          deleteMany: {
            args: Prisma.LoginAttemptDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.LoginAttemptUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.LoginAttemptUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LoginAttemptPayload>
          }
          aggregate: {
            args: Prisma.LoginAttemptAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateLoginAttempt>
          }
          groupBy: {
            args: Prisma.LoginAttemptGroupByArgs<ExtArgs>
            result: $Utils.Optional<LoginAttemptGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.LoginAttemptFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.LoginAttemptAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.LoginAttemptCountArgs<ExtArgs>
            result: $Utils.Optional<LoginAttemptCountAggregateOutputType> | number
          }
        }
      }
      EmailVerificationLog: {
        payload: Prisma.$EmailVerificationLogPayload<ExtArgs>
        fields: Prisma.EmailVerificationLogFieldRefs
        operations: {
          findUnique: {
            args: Prisma.EmailVerificationLogFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailVerificationLogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.EmailVerificationLogFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailVerificationLogPayload>
          }
          findFirst: {
            args: Prisma.EmailVerificationLogFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailVerificationLogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.EmailVerificationLogFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailVerificationLogPayload>
          }
          findMany: {
            args: Prisma.EmailVerificationLogFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailVerificationLogPayload>[]
          }
          create: {
            args: Prisma.EmailVerificationLogCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailVerificationLogPayload>
          }
          createMany: {
            args: Prisma.EmailVerificationLogCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.EmailVerificationLogDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailVerificationLogPayload>
          }
          update: {
            args: Prisma.EmailVerificationLogUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailVerificationLogPayload>
          }
          deleteMany: {
            args: Prisma.EmailVerificationLogDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.EmailVerificationLogUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.EmailVerificationLogUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailVerificationLogPayload>
          }
          aggregate: {
            args: Prisma.EmailVerificationLogAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateEmailVerificationLog>
          }
          groupBy: {
            args: Prisma.EmailVerificationLogGroupByArgs<ExtArgs>
            result: $Utils.Optional<EmailVerificationLogGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.EmailVerificationLogFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.EmailVerificationLogAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.EmailVerificationLogCountArgs<ExtArgs>
            result: $Utils.Optional<EmailVerificationLogCountAggregateOutputType> | number
          }
        }
      }
      DeviceVerificationLog: {
        payload: Prisma.$DeviceVerificationLogPayload<ExtArgs>
        fields: Prisma.DeviceVerificationLogFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DeviceVerificationLogFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeviceVerificationLogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DeviceVerificationLogFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeviceVerificationLogPayload>
          }
          findFirst: {
            args: Prisma.DeviceVerificationLogFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeviceVerificationLogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DeviceVerificationLogFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeviceVerificationLogPayload>
          }
          findMany: {
            args: Prisma.DeviceVerificationLogFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeviceVerificationLogPayload>[]
          }
          create: {
            args: Prisma.DeviceVerificationLogCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeviceVerificationLogPayload>
          }
          createMany: {
            args: Prisma.DeviceVerificationLogCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.DeviceVerificationLogDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeviceVerificationLogPayload>
          }
          update: {
            args: Prisma.DeviceVerificationLogUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeviceVerificationLogPayload>
          }
          deleteMany: {
            args: Prisma.DeviceVerificationLogDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DeviceVerificationLogUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.DeviceVerificationLogUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeviceVerificationLogPayload>
          }
          aggregate: {
            args: Prisma.DeviceVerificationLogAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDeviceVerificationLog>
          }
          groupBy: {
            args: Prisma.DeviceVerificationLogGroupByArgs<ExtArgs>
            result: $Utils.Optional<DeviceVerificationLogGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.DeviceVerificationLogFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.DeviceVerificationLogAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.DeviceVerificationLogCountArgs<ExtArgs>
            result: $Utils.Optional<DeviceVerificationLogCountAggregateOutputType> | number
          }
        }
      }
      ApiRequestLog: {
        payload: Prisma.$ApiRequestLogPayload<ExtArgs>
        fields: Prisma.ApiRequestLogFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ApiRequestLogFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiRequestLogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ApiRequestLogFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiRequestLogPayload>
          }
          findFirst: {
            args: Prisma.ApiRequestLogFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiRequestLogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ApiRequestLogFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiRequestLogPayload>
          }
          findMany: {
            args: Prisma.ApiRequestLogFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiRequestLogPayload>[]
          }
          create: {
            args: Prisma.ApiRequestLogCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiRequestLogPayload>
          }
          createMany: {
            args: Prisma.ApiRequestLogCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.ApiRequestLogDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiRequestLogPayload>
          }
          update: {
            args: Prisma.ApiRequestLogUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiRequestLogPayload>
          }
          deleteMany: {
            args: Prisma.ApiRequestLogDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ApiRequestLogUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ApiRequestLogUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiRequestLogPayload>
          }
          aggregate: {
            args: Prisma.ApiRequestLogAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateApiRequestLog>
          }
          groupBy: {
            args: Prisma.ApiRequestLogGroupByArgs<ExtArgs>
            result: $Utils.Optional<ApiRequestLogGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.ApiRequestLogFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.ApiRequestLogAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.ApiRequestLogCountArgs<ExtArgs>
            result: $Utils.Optional<ApiRequestLogCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $runCommandRaw: {
          args: Prisma.InputJsonObject,
          result: Prisma.JsonObject
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
    }
  }


  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */



  /**
   * Models
   */

  /**
   * Model LoginAttempt
   */

  export type AggregateLoginAttempt = {
    _count: LoginAttemptCountAggregateOutputType | null
    _min: LoginAttemptMinAggregateOutputType | null
    _max: LoginAttemptMaxAggregateOutputType | null
  }

  export type LoginAttemptMinAggregateOutputType = {
    id: string | null
    email: string | null
    ip: string | null
    deviceId: string | null
    deviceName: string | null
    success: boolean | null
    reason: string | null
    userAgent: string | null
    timestamp: Date | null
  }

  export type LoginAttemptMaxAggregateOutputType = {
    id: string | null
    email: string | null
    ip: string | null
    deviceId: string | null
    deviceName: string | null
    success: boolean | null
    reason: string | null
    userAgent: string | null
    timestamp: Date | null
  }

  export type LoginAttemptCountAggregateOutputType = {
    id: number
    email: number
    ip: number
    deviceId: number
    deviceName: number
    success: number
    reason: number
    userAgent: number
    timestamp: number
    _all: number
  }


  export type LoginAttemptMinAggregateInputType = {
    id?: true
    email?: true
    ip?: true
    deviceId?: true
    deviceName?: true
    success?: true
    reason?: true
    userAgent?: true
    timestamp?: true
  }

  export type LoginAttemptMaxAggregateInputType = {
    id?: true
    email?: true
    ip?: true
    deviceId?: true
    deviceName?: true
    success?: true
    reason?: true
    userAgent?: true
    timestamp?: true
  }

  export type LoginAttemptCountAggregateInputType = {
    id?: true
    email?: true
    ip?: true
    deviceId?: true
    deviceName?: true
    success?: true
    reason?: true
    userAgent?: true
    timestamp?: true
    _all?: true
  }

  export type LoginAttemptAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LoginAttempt to aggregate.
     */
    where?: LoginAttemptWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LoginAttempts to fetch.
     */
    orderBy?: LoginAttemptOrderByWithRelationInput | LoginAttemptOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: LoginAttemptWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LoginAttempts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LoginAttempts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned LoginAttempts
    **/
    _count?: true | LoginAttemptCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: LoginAttemptMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: LoginAttemptMaxAggregateInputType
  }

  export type GetLoginAttemptAggregateType<T extends LoginAttemptAggregateArgs> = {
        [P in keyof T & keyof AggregateLoginAttempt]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateLoginAttempt[P]>
      : GetScalarType<T[P], AggregateLoginAttempt[P]>
  }




  export type LoginAttemptGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LoginAttemptWhereInput
    orderBy?: LoginAttemptOrderByWithAggregationInput | LoginAttemptOrderByWithAggregationInput[]
    by: LoginAttemptScalarFieldEnum[] | LoginAttemptScalarFieldEnum
    having?: LoginAttemptScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: LoginAttemptCountAggregateInputType | true
    _min?: LoginAttemptMinAggregateInputType
    _max?: LoginAttemptMaxAggregateInputType
  }

  export type LoginAttemptGroupByOutputType = {
    id: string
    email: string
    ip: string
    deviceId: string
    deviceName: string
    success: boolean
    reason: string | null
    userAgent: string
    timestamp: Date
    _count: LoginAttemptCountAggregateOutputType | null
    _min: LoginAttemptMinAggregateOutputType | null
    _max: LoginAttemptMaxAggregateOutputType | null
  }

  type GetLoginAttemptGroupByPayload<T extends LoginAttemptGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<LoginAttemptGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof LoginAttemptGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], LoginAttemptGroupByOutputType[P]>
            : GetScalarType<T[P], LoginAttemptGroupByOutputType[P]>
        }
      >
    >


  export type LoginAttemptSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    ip?: boolean
    deviceId?: boolean
    deviceName?: boolean
    success?: boolean
    reason?: boolean
    userAgent?: boolean
    timestamp?: boolean
  }, ExtArgs["result"]["loginAttempt"]>


  export type LoginAttemptSelectScalar = {
    id?: boolean
    email?: boolean
    ip?: boolean
    deviceId?: boolean
    deviceName?: boolean
    success?: boolean
    reason?: boolean
    userAgent?: boolean
    timestamp?: boolean
  }


  export type $LoginAttemptPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "LoginAttempt"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      ip: string
      deviceId: string
      deviceName: string
      success: boolean
      reason: string | null
      userAgent: string
      timestamp: Date
    }, ExtArgs["result"]["loginAttempt"]>
    composites: {}
  }

  type LoginAttemptGetPayload<S extends boolean | null | undefined | LoginAttemptDefaultArgs> = $Result.GetResult<Prisma.$LoginAttemptPayload, S>

  type LoginAttemptCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<LoginAttemptFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: LoginAttemptCountAggregateInputType | true
    }

  export interface LoginAttemptDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['LoginAttempt'], meta: { name: 'LoginAttempt' } }
    /**
     * Find zero or one LoginAttempt that matches the filter.
     * @param {LoginAttemptFindUniqueArgs} args - Arguments to find a LoginAttempt
     * @example
     * // Get one LoginAttempt
     * const loginAttempt = await prisma.loginAttempt.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends LoginAttemptFindUniqueArgs>(args: SelectSubset<T, LoginAttemptFindUniqueArgs<ExtArgs>>): Prisma__LoginAttemptClient<$Result.GetResult<Prisma.$LoginAttemptPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one LoginAttempt that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {LoginAttemptFindUniqueOrThrowArgs} args - Arguments to find a LoginAttempt
     * @example
     * // Get one LoginAttempt
     * const loginAttempt = await prisma.loginAttempt.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends LoginAttemptFindUniqueOrThrowArgs>(args: SelectSubset<T, LoginAttemptFindUniqueOrThrowArgs<ExtArgs>>): Prisma__LoginAttemptClient<$Result.GetResult<Prisma.$LoginAttemptPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first LoginAttempt that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LoginAttemptFindFirstArgs} args - Arguments to find a LoginAttempt
     * @example
     * // Get one LoginAttempt
     * const loginAttempt = await prisma.loginAttempt.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends LoginAttemptFindFirstArgs>(args?: SelectSubset<T, LoginAttemptFindFirstArgs<ExtArgs>>): Prisma__LoginAttemptClient<$Result.GetResult<Prisma.$LoginAttemptPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first LoginAttempt that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LoginAttemptFindFirstOrThrowArgs} args - Arguments to find a LoginAttempt
     * @example
     * // Get one LoginAttempt
     * const loginAttempt = await prisma.loginAttempt.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends LoginAttemptFindFirstOrThrowArgs>(args?: SelectSubset<T, LoginAttemptFindFirstOrThrowArgs<ExtArgs>>): Prisma__LoginAttemptClient<$Result.GetResult<Prisma.$LoginAttemptPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more LoginAttempts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LoginAttemptFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all LoginAttempts
     * const loginAttempts = await prisma.loginAttempt.findMany()
     * 
     * // Get first 10 LoginAttempts
     * const loginAttempts = await prisma.loginAttempt.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const loginAttemptWithIdOnly = await prisma.loginAttempt.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends LoginAttemptFindManyArgs>(args?: SelectSubset<T, LoginAttemptFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LoginAttemptPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a LoginAttempt.
     * @param {LoginAttemptCreateArgs} args - Arguments to create a LoginAttempt.
     * @example
     * // Create one LoginAttempt
     * const LoginAttempt = await prisma.loginAttempt.create({
     *   data: {
     *     // ... data to create a LoginAttempt
     *   }
     * })
     * 
     */
    create<T extends LoginAttemptCreateArgs>(args: SelectSubset<T, LoginAttemptCreateArgs<ExtArgs>>): Prisma__LoginAttemptClient<$Result.GetResult<Prisma.$LoginAttemptPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many LoginAttempts.
     * @param {LoginAttemptCreateManyArgs} args - Arguments to create many LoginAttempts.
     * @example
     * // Create many LoginAttempts
     * const loginAttempt = await prisma.loginAttempt.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends LoginAttemptCreateManyArgs>(args?: SelectSubset<T, LoginAttemptCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a LoginAttempt.
     * @param {LoginAttemptDeleteArgs} args - Arguments to delete one LoginAttempt.
     * @example
     * // Delete one LoginAttempt
     * const LoginAttempt = await prisma.loginAttempt.delete({
     *   where: {
     *     // ... filter to delete one LoginAttempt
     *   }
     * })
     * 
     */
    delete<T extends LoginAttemptDeleteArgs>(args: SelectSubset<T, LoginAttemptDeleteArgs<ExtArgs>>): Prisma__LoginAttemptClient<$Result.GetResult<Prisma.$LoginAttemptPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one LoginAttempt.
     * @param {LoginAttemptUpdateArgs} args - Arguments to update one LoginAttempt.
     * @example
     * // Update one LoginAttempt
     * const loginAttempt = await prisma.loginAttempt.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends LoginAttemptUpdateArgs>(args: SelectSubset<T, LoginAttemptUpdateArgs<ExtArgs>>): Prisma__LoginAttemptClient<$Result.GetResult<Prisma.$LoginAttemptPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more LoginAttempts.
     * @param {LoginAttemptDeleteManyArgs} args - Arguments to filter LoginAttempts to delete.
     * @example
     * // Delete a few LoginAttempts
     * const { count } = await prisma.loginAttempt.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends LoginAttemptDeleteManyArgs>(args?: SelectSubset<T, LoginAttemptDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more LoginAttempts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LoginAttemptUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many LoginAttempts
     * const loginAttempt = await prisma.loginAttempt.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends LoginAttemptUpdateManyArgs>(args: SelectSubset<T, LoginAttemptUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one LoginAttempt.
     * @param {LoginAttemptUpsertArgs} args - Arguments to update or create a LoginAttempt.
     * @example
     * // Update or create a LoginAttempt
     * const loginAttempt = await prisma.loginAttempt.upsert({
     *   create: {
     *     // ... data to create a LoginAttempt
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the LoginAttempt we want to update
     *   }
     * })
     */
    upsert<T extends LoginAttemptUpsertArgs>(args: SelectSubset<T, LoginAttemptUpsertArgs<ExtArgs>>): Prisma__LoginAttemptClient<$Result.GetResult<Prisma.$LoginAttemptPayload<ExtArgs>, T, "upsert">, never, ExtArgs>

    /**
     * Find zero or more LoginAttempts that matches the filter.
     * @param {LoginAttemptFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const loginAttempt = await prisma.loginAttempt.findRaw({
     *   filter: { age: { $gt: 25 } } 
     * })
     */
    findRaw(args?: LoginAttemptFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a LoginAttempt.
     * @param {LoginAttemptAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const loginAttempt = await prisma.loginAttempt.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: LoginAttemptAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of LoginAttempts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LoginAttemptCountArgs} args - Arguments to filter LoginAttempts to count.
     * @example
     * // Count the number of LoginAttempts
     * const count = await prisma.loginAttempt.count({
     *   where: {
     *     // ... the filter for the LoginAttempts we want to count
     *   }
     * })
    **/
    count<T extends LoginAttemptCountArgs>(
      args?: Subset<T, LoginAttemptCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], LoginAttemptCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a LoginAttempt.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LoginAttemptAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends LoginAttemptAggregateArgs>(args: Subset<T, LoginAttemptAggregateArgs>): Prisma.PrismaPromise<GetLoginAttemptAggregateType<T>>

    /**
     * Group by LoginAttempt.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LoginAttemptGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends LoginAttemptGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: LoginAttemptGroupByArgs['orderBy'] }
        : { orderBy?: LoginAttemptGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, LoginAttemptGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetLoginAttemptGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the LoginAttempt model
   */
  readonly fields: LoginAttemptFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for LoginAttempt.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__LoginAttemptClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the LoginAttempt model
   */ 
  interface LoginAttemptFieldRefs {
    readonly id: FieldRef<"LoginAttempt", 'String'>
    readonly email: FieldRef<"LoginAttempt", 'String'>
    readonly ip: FieldRef<"LoginAttempt", 'String'>
    readonly deviceId: FieldRef<"LoginAttempt", 'String'>
    readonly deviceName: FieldRef<"LoginAttempt", 'String'>
    readonly success: FieldRef<"LoginAttempt", 'Boolean'>
    readonly reason: FieldRef<"LoginAttempt", 'String'>
    readonly userAgent: FieldRef<"LoginAttempt", 'String'>
    readonly timestamp: FieldRef<"LoginAttempt", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * LoginAttempt findUnique
   */
  export type LoginAttemptFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LoginAttempt
     */
    select?: LoginAttemptSelect<ExtArgs> | null
    /**
     * Filter, which LoginAttempt to fetch.
     */
    where: LoginAttemptWhereUniqueInput
  }

  /**
   * LoginAttempt findUniqueOrThrow
   */
  export type LoginAttemptFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LoginAttempt
     */
    select?: LoginAttemptSelect<ExtArgs> | null
    /**
     * Filter, which LoginAttempt to fetch.
     */
    where: LoginAttemptWhereUniqueInput
  }

  /**
   * LoginAttempt findFirst
   */
  export type LoginAttemptFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LoginAttempt
     */
    select?: LoginAttemptSelect<ExtArgs> | null
    /**
     * Filter, which LoginAttempt to fetch.
     */
    where?: LoginAttemptWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LoginAttempts to fetch.
     */
    orderBy?: LoginAttemptOrderByWithRelationInput | LoginAttemptOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LoginAttempts.
     */
    cursor?: LoginAttemptWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LoginAttempts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LoginAttempts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LoginAttempts.
     */
    distinct?: LoginAttemptScalarFieldEnum | LoginAttemptScalarFieldEnum[]
  }

  /**
   * LoginAttempt findFirstOrThrow
   */
  export type LoginAttemptFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LoginAttempt
     */
    select?: LoginAttemptSelect<ExtArgs> | null
    /**
     * Filter, which LoginAttempt to fetch.
     */
    where?: LoginAttemptWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LoginAttempts to fetch.
     */
    orderBy?: LoginAttemptOrderByWithRelationInput | LoginAttemptOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LoginAttempts.
     */
    cursor?: LoginAttemptWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LoginAttempts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LoginAttempts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LoginAttempts.
     */
    distinct?: LoginAttemptScalarFieldEnum | LoginAttemptScalarFieldEnum[]
  }

  /**
   * LoginAttempt findMany
   */
  export type LoginAttemptFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LoginAttempt
     */
    select?: LoginAttemptSelect<ExtArgs> | null
    /**
     * Filter, which LoginAttempts to fetch.
     */
    where?: LoginAttemptWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LoginAttempts to fetch.
     */
    orderBy?: LoginAttemptOrderByWithRelationInput | LoginAttemptOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing LoginAttempts.
     */
    cursor?: LoginAttemptWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LoginAttempts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LoginAttempts.
     */
    skip?: number
    distinct?: LoginAttemptScalarFieldEnum | LoginAttemptScalarFieldEnum[]
  }

  /**
   * LoginAttempt create
   */
  export type LoginAttemptCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LoginAttempt
     */
    select?: LoginAttemptSelect<ExtArgs> | null
    /**
     * The data needed to create a LoginAttempt.
     */
    data: XOR<LoginAttemptCreateInput, LoginAttemptUncheckedCreateInput>
  }

  /**
   * LoginAttempt createMany
   */
  export type LoginAttemptCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many LoginAttempts.
     */
    data: LoginAttemptCreateManyInput | LoginAttemptCreateManyInput[]
  }

  /**
   * LoginAttempt update
   */
  export type LoginAttemptUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LoginAttempt
     */
    select?: LoginAttemptSelect<ExtArgs> | null
    /**
     * The data needed to update a LoginAttempt.
     */
    data: XOR<LoginAttemptUpdateInput, LoginAttemptUncheckedUpdateInput>
    /**
     * Choose, which LoginAttempt to update.
     */
    where: LoginAttemptWhereUniqueInput
  }

  /**
   * LoginAttempt updateMany
   */
  export type LoginAttemptUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update LoginAttempts.
     */
    data: XOR<LoginAttemptUpdateManyMutationInput, LoginAttemptUncheckedUpdateManyInput>
    /**
     * Filter which LoginAttempts to update
     */
    where?: LoginAttemptWhereInput
  }

  /**
   * LoginAttempt upsert
   */
  export type LoginAttemptUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LoginAttempt
     */
    select?: LoginAttemptSelect<ExtArgs> | null
    /**
     * The filter to search for the LoginAttempt to update in case it exists.
     */
    where: LoginAttemptWhereUniqueInput
    /**
     * In case the LoginAttempt found by the `where` argument doesn't exist, create a new LoginAttempt with this data.
     */
    create: XOR<LoginAttemptCreateInput, LoginAttemptUncheckedCreateInput>
    /**
     * In case the LoginAttempt was found with the provided `where` argument, update it with this data.
     */
    update: XOR<LoginAttemptUpdateInput, LoginAttemptUncheckedUpdateInput>
  }

  /**
   * LoginAttempt delete
   */
  export type LoginAttemptDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LoginAttempt
     */
    select?: LoginAttemptSelect<ExtArgs> | null
    /**
     * Filter which LoginAttempt to delete.
     */
    where: LoginAttemptWhereUniqueInput
  }

  /**
   * LoginAttempt deleteMany
   */
  export type LoginAttemptDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LoginAttempts to delete
     */
    where?: LoginAttemptWhereInput
  }

  /**
   * LoginAttempt findRaw
   */
  export type LoginAttemptFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * LoginAttempt aggregateRaw
   */
  export type LoginAttemptAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * LoginAttempt without action
   */
  export type LoginAttemptDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LoginAttempt
     */
    select?: LoginAttemptSelect<ExtArgs> | null
  }


  /**
   * Model EmailVerificationLog
   */

  export type AggregateEmailVerificationLog = {
    _count: EmailVerificationLogCountAggregateOutputType | null
    _min: EmailVerificationLogMinAggregateOutputType | null
    _max: EmailVerificationLogMaxAggregateOutputType | null
  }

  export type EmailVerificationLogMinAggregateOutputType = {
    id: string | null
    email: string | null
    ip: string | null
    deviceId: string | null
    success: boolean | null
    otpSentAt: Date | null
    verifiedAt: Date | null
    timestamp: Date | null
  }

  export type EmailVerificationLogMaxAggregateOutputType = {
    id: string | null
    email: string | null
    ip: string | null
    deviceId: string | null
    success: boolean | null
    otpSentAt: Date | null
    verifiedAt: Date | null
    timestamp: Date | null
  }

  export type EmailVerificationLogCountAggregateOutputType = {
    id: number
    email: number
    ip: number
    deviceId: number
    success: number
    otpSentAt: number
    verifiedAt: number
    timestamp: number
    _all: number
  }


  export type EmailVerificationLogMinAggregateInputType = {
    id?: true
    email?: true
    ip?: true
    deviceId?: true
    success?: true
    otpSentAt?: true
    verifiedAt?: true
    timestamp?: true
  }

  export type EmailVerificationLogMaxAggregateInputType = {
    id?: true
    email?: true
    ip?: true
    deviceId?: true
    success?: true
    otpSentAt?: true
    verifiedAt?: true
    timestamp?: true
  }

  export type EmailVerificationLogCountAggregateInputType = {
    id?: true
    email?: true
    ip?: true
    deviceId?: true
    success?: true
    otpSentAt?: true
    verifiedAt?: true
    timestamp?: true
    _all?: true
  }

  export type EmailVerificationLogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which EmailVerificationLog to aggregate.
     */
    where?: EmailVerificationLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EmailVerificationLogs to fetch.
     */
    orderBy?: EmailVerificationLogOrderByWithRelationInput | EmailVerificationLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: EmailVerificationLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EmailVerificationLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EmailVerificationLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned EmailVerificationLogs
    **/
    _count?: true | EmailVerificationLogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: EmailVerificationLogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: EmailVerificationLogMaxAggregateInputType
  }

  export type GetEmailVerificationLogAggregateType<T extends EmailVerificationLogAggregateArgs> = {
        [P in keyof T & keyof AggregateEmailVerificationLog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateEmailVerificationLog[P]>
      : GetScalarType<T[P], AggregateEmailVerificationLog[P]>
  }




  export type EmailVerificationLogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EmailVerificationLogWhereInput
    orderBy?: EmailVerificationLogOrderByWithAggregationInput | EmailVerificationLogOrderByWithAggregationInput[]
    by: EmailVerificationLogScalarFieldEnum[] | EmailVerificationLogScalarFieldEnum
    having?: EmailVerificationLogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: EmailVerificationLogCountAggregateInputType | true
    _min?: EmailVerificationLogMinAggregateInputType
    _max?: EmailVerificationLogMaxAggregateInputType
  }

  export type EmailVerificationLogGroupByOutputType = {
    id: string
    email: string
    ip: string
    deviceId: string
    success: boolean
    otpSentAt: Date
    verifiedAt: Date | null
    timestamp: Date
    _count: EmailVerificationLogCountAggregateOutputType | null
    _min: EmailVerificationLogMinAggregateOutputType | null
    _max: EmailVerificationLogMaxAggregateOutputType | null
  }

  type GetEmailVerificationLogGroupByPayload<T extends EmailVerificationLogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<EmailVerificationLogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof EmailVerificationLogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], EmailVerificationLogGroupByOutputType[P]>
            : GetScalarType<T[P], EmailVerificationLogGroupByOutputType[P]>
        }
      >
    >


  export type EmailVerificationLogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    ip?: boolean
    deviceId?: boolean
    success?: boolean
    otpSentAt?: boolean
    verifiedAt?: boolean
    timestamp?: boolean
  }, ExtArgs["result"]["emailVerificationLog"]>


  export type EmailVerificationLogSelectScalar = {
    id?: boolean
    email?: boolean
    ip?: boolean
    deviceId?: boolean
    success?: boolean
    otpSentAt?: boolean
    verifiedAt?: boolean
    timestamp?: boolean
  }


  export type $EmailVerificationLogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "EmailVerificationLog"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      ip: string
      deviceId: string
      success: boolean
      otpSentAt: Date
      verifiedAt: Date | null
      timestamp: Date
    }, ExtArgs["result"]["emailVerificationLog"]>
    composites: {}
  }

  type EmailVerificationLogGetPayload<S extends boolean | null | undefined | EmailVerificationLogDefaultArgs> = $Result.GetResult<Prisma.$EmailVerificationLogPayload, S>

  type EmailVerificationLogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<EmailVerificationLogFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: EmailVerificationLogCountAggregateInputType | true
    }

  export interface EmailVerificationLogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['EmailVerificationLog'], meta: { name: 'EmailVerificationLog' } }
    /**
     * Find zero or one EmailVerificationLog that matches the filter.
     * @param {EmailVerificationLogFindUniqueArgs} args - Arguments to find a EmailVerificationLog
     * @example
     * // Get one EmailVerificationLog
     * const emailVerificationLog = await prisma.emailVerificationLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends EmailVerificationLogFindUniqueArgs>(args: SelectSubset<T, EmailVerificationLogFindUniqueArgs<ExtArgs>>): Prisma__EmailVerificationLogClient<$Result.GetResult<Prisma.$EmailVerificationLogPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one EmailVerificationLog that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {EmailVerificationLogFindUniqueOrThrowArgs} args - Arguments to find a EmailVerificationLog
     * @example
     * // Get one EmailVerificationLog
     * const emailVerificationLog = await prisma.emailVerificationLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends EmailVerificationLogFindUniqueOrThrowArgs>(args: SelectSubset<T, EmailVerificationLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma__EmailVerificationLogClient<$Result.GetResult<Prisma.$EmailVerificationLogPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first EmailVerificationLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmailVerificationLogFindFirstArgs} args - Arguments to find a EmailVerificationLog
     * @example
     * // Get one EmailVerificationLog
     * const emailVerificationLog = await prisma.emailVerificationLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends EmailVerificationLogFindFirstArgs>(args?: SelectSubset<T, EmailVerificationLogFindFirstArgs<ExtArgs>>): Prisma__EmailVerificationLogClient<$Result.GetResult<Prisma.$EmailVerificationLogPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first EmailVerificationLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmailVerificationLogFindFirstOrThrowArgs} args - Arguments to find a EmailVerificationLog
     * @example
     * // Get one EmailVerificationLog
     * const emailVerificationLog = await prisma.emailVerificationLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends EmailVerificationLogFindFirstOrThrowArgs>(args?: SelectSubset<T, EmailVerificationLogFindFirstOrThrowArgs<ExtArgs>>): Prisma__EmailVerificationLogClient<$Result.GetResult<Prisma.$EmailVerificationLogPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more EmailVerificationLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmailVerificationLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all EmailVerificationLogs
     * const emailVerificationLogs = await prisma.emailVerificationLog.findMany()
     * 
     * // Get first 10 EmailVerificationLogs
     * const emailVerificationLogs = await prisma.emailVerificationLog.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const emailVerificationLogWithIdOnly = await prisma.emailVerificationLog.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends EmailVerificationLogFindManyArgs>(args?: SelectSubset<T, EmailVerificationLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmailVerificationLogPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a EmailVerificationLog.
     * @param {EmailVerificationLogCreateArgs} args - Arguments to create a EmailVerificationLog.
     * @example
     * // Create one EmailVerificationLog
     * const EmailVerificationLog = await prisma.emailVerificationLog.create({
     *   data: {
     *     // ... data to create a EmailVerificationLog
     *   }
     * })
     * 
     */
    create<T extends EmailVerificationLogCreateArgs>(args: SelectSubset<T, EmailVerificationLogCreateArgs<ExtArgs>>): Prisma__EmailVerificationLogClient<$Result.GetResult<Prisma.$EmailVerificationLogPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many EmailVerificationLogs.
     * @param {EmailVerificationLogCreateManyArgs} args - Arguments to create many EmailVerificationLogs.
     * @example
     * // Create many EmailVerificationLogs
     * const emailVerificationLog = await prisma.emailVerificationLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends EmailVerificationLogCreateManyArgs>(args?: SelectSubset<T, EmailVerificationLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a EmailVerificationLog.
     * @param {EmailVerificationLogDeleteArgs} args - Arguments to delete one EmailVerificationLog.
     * @example
     * // Delete one EmailVerificationLog
     * const EmailVerificationLog = await prisma.emailVerificationLog.delete({
     *   where: {
     *     // ... filter to delete one EmailVerificationLog
     *   }
     * })
     * 
     */
    delete<T extends EmailVerificationLogDeleteArgs>(args: SelectSubset<T, EmailVerificationLogDeleteArgs<ExtArgs>>): Prisma__EmailVerificationLogClient<$Result.GetResult<Prisma.$EmailVerificationLogPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one EmailVerificationLog.
     * @param {EmailVerificationLogUpdateArgs} args - Arguments to update one EmailVerificationLog.
     * @example
     * // Update one EmailVerificationLog
     * const emailVerificationLog = await prisma.emailVerificationLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends EmailVerificationLogUpdateArgs>(args: SelectSubset<T, EmailVerificationLogUpdateArgs<ExtArgs>>): Prisma__EmailVerificationLogClient<$Result.GetResult<Prisma.$EmailVerificationLogPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more EmailVerificationLogs.
     * @param {EmailVerificationLogDeleteManyArgs} args - Arguments to filter EmailVerificationLogs to delete.
     * @example
     * // Delete a few EmailVerificationLogs
     * const { count } = await prisma.emailVerificationLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends EmailVerificationLogDeleteManyArgs>(args?: SelectSubset<T, EmailVerificationLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more EmailVerificationLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmailVerificationLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many EmailVerificationLogs
     * const emailVerificationLog = await prisma.emailVerificationLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends EmailVerificationLogUpdateManyArgs>(args: SelectSubset<T, EmailVerificationLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one EmailVerificationLog.
     * @param {EmailVerificationLogUpsertArgs} args - Arguments to update or create a EmailVerificationLog.
     * @example
     * // Update or create a EmailVerificationLog
     * const emailVerificationLog = await prisma.emailVerificationLog.upsert({
     *   create: {
     *     // ... data to create a EmailVerificationLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the EmailVerificationLog we want to update
     *   }
     * })
     */
    upsert<T extends EmailVerificationLogUpsertArgs>(args: SelectSubset<T, EmailVerificationLogUpsertArgs<ExtArgs>>): Prisma__EmailVerificationLogClient<$Result.GetResult<Prisma.$EmailVerificationLogPayload<ExtArgs>, T, "upsert">, never, ExtArgs>

    /**
     * Find zero or more EmailVerificationLogs that matches the filter.
     * @param {EmailVerificationLogFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const emailVerificationLog = await prisma.emailVerificationLog.findRaw({
     *   filter: { age: { $gt: 25 } } 
     * })
     */
    findRaw(args?: EmailVerificationLogFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a EmailVerificationLog.
     * @param {EmailVerificationLogAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const emailVerificationLog = await prisma.emailVerificationLog.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: EmailVerificationLogAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of EmailVerificationLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmailVerificationLogCountArgs} args - Arguments to filter EmailVerificationLogs to count.
     * @example
     * // Count the number of EmailVerificationLogs
     * const count = await prisma.emailVerificationLog.count({
     *   where: {
     *     // ... the filter for the EmailVerificationLogs we want to count
     *   }
     * })
    **/
    count<T extends EmailVerificationLogCountArgs>(
      args?: Subset<T, EmailVerificationLogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], EmailVerificationLogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a EmailVerificationLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmailVerificationLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends EmailVerificationLogAggregateArgs>(args: Subset<T, EmailVerificationLogAggregateArgs>): Prisma.PrismaPromise<GetEmailVerificationLogAggregateType<T>>

    /**
     * Group by EmailVerificationLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmailVerificationLogGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends EmailVerificationLogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: EmailVerificationLogGroupByArgs['orderBy'] }
        : { orderBy?: EmailVerificationLogGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, EmailVerificationLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEmailVerificationLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the EmailVerificationLog model
   */
  readonly fields: EmailVerificationLogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for EmailVerificationLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__EmailVerificationLogClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the EmailVerificationLog model
   */ 
  interface EmailVerificationLogFieldRefs {
    readonly id: FieldRef<"EmailVerificationLog", 'String'>
    readonly email: FieldRef<"EmailVerificationLog", 'String'>
    readonly ip: FieldRef<"EmailVerificationLog", 'String'>
    readonly deviceId: FieldRef<"EmailVerificationLog", 'String'>
    readonly success: FieldRef<"EmailVerificationLog", 'Boolean'>
    readonly otpSentAt: FieldRef<"EmailVerificationLog", 'DateTime'>
    readonly verifiedAt: FieldRef<"EmailVerificationLog", 'DateTime'>
    readonly timestamp: FieldRef<"EmailVerificationLog", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * EmailVerificationLog findUnique
   */
  export type EmailVerificationLogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailVerificationLog
     */
    select?: EmailVerificationLogSelect<ExtArgs> | null
    /**
     * Filter, which EmailVerificationLog to fetch.
     */
    where: EmailVerificationLogWhereUniqueInput
  }

  /**
   * EmailVerificationLog findUniqueOrThrow
   */
  export type EmailVerificationLogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailVerificationLog
     */
    select?: EmailVerificationLogSelect<ExtArgs> | null
    /**
     * Filter, which EmailVerificationLog to fetch.
     */
    where: EmailVerificationLogWhereUniqueInput
  }

  /**
   * EmailVerificationLog findFirst
   */
  export type EmailVerificationLogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailVerificationLog
     */
    select?: EmailVerificationLogSelect<ExtArgs> | null
    /**
     * Filter, which EmailVerificationLog to fetch.
     */
    where?: EmailVerificationLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EmailVerificationLogs to fetch.
     */
    orderBy?: EmailVerificationLogOrderByWithRelationInput | EmailVerificationLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for EmailVerificationLogs.
     */
    cursor?: EmailVerificationLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EmailVerificationLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EmailVerificationLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of EmailVerificationLogs.
     */
    distinct?: EmailVerificationLogScalarFieldEnum | EmailVerificationLogScalarFieldEnum[]
  }

  /**
   * EmailVerificationLog findFirstOrThrow
   */
  export type EmailVerificationLogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailVerificationLog
     */
    select?: EmailVerificationLogSelect<ExtArgs> | null
    /**
     * Filter, which EmailVerificationLog to fetch.
     */
    where?: EmailVerificationLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EmailVerificationLogs to fetch.
     */
    orderBy?: EmailVerificationLogOrderByWithRelationInput | EmailVerificationLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for EmailVerificationLogs.
     */
    cursor?: EmailVerificationLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EmailVerificationLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EmailVerificationLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of EmailVerificationLogs.
     */
    distinct?: EmailVerificationLogScalarFieldEnum | EmailVerificationLogScalarFieldEnum[]
  }

  /**
   * EmailVerificationLog findMany
   */
  export type EmailVerificationLogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailVerificationLog
     */
    select?: EmailVerificationLogSelect<ExtArgs> | null
    /**
     * Filter, which EmailVerificationLogs to fetch.
     */
    where?: EmailVerificationLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EmailVerificationLogs to fetch.
     */
    orderBy?: EmailVerificationLogOrderByWithRelationInput | EmailVerificationLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing EmailVerificationLogs.
     */
    cursor?: EmailVerificationLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EmailVerificationLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EmailVerificationLogs.
     */
    skip?: number
    distinct?: EmailVerificationLogScalarFieldEnum | EmailVerificationLogScalarFieldEnum[]
  }

  /**
   * EmailVerificationLog create
   */
  export type EmailVerificationLogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailVerificationLog
     */
    select?: EmailVerificationLogSelect<ExtArgs> | null
    /**
     * The data needed to create a EmailVerificationLog.
     */
    data: XOR<EmailVerificationLogCreateInput, EmailVerificationLogUncheckedCreateInput>
  }

  /**
   * EmailVerificationLog createMany
   */
  export type EmailVerificationLogCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many EmailVerificationLogs.
     */
    data: EmailVerificationLogCreateManyInput | EmailVerificationLogCreateManyInput[]
  }

  /**
   * EmailVerificationLog update
   */
  export type EmailVerificationLogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailVerificationLog
     */
    select?: EmailVerificationLogSelect<ExtArgs> | null
    /**
     * The data needed to update a EmailVerificationLog.
     */
    data: XOR<EmailVerificationLogUpdateInput, EmailVerificationLogUncheckedUpdateInput>
    /**
     * Choose, which EmailVerificationLog to update.
     */
    where: EmailVerificationLogWhereUniqueInput
  }

  /**
   * EmailVerificationLog updateMany
   */
  export type EmailVerificationLogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update EmailVerificationLogs.
     */
    data: XOR<EmailVerificationLogUpdateManyMutationInput, EmailVerificationLogUncheckedUpdateManyInput>
    /**
     * Filter which EmailVerificationLogs to update
     */
    where?: EmailVerificationLogWhereInput
  }

  /**
   * EmailVerificationLog upsert
   */
  export type EmailVerificationLogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailVerificationLog
     */
    select?: EmailVerificationLogSelect<ExtArgs> | null
    /**
     * The filter to search for the EmailVerificationLog to update in case it exists.
     */
    where: EmailVerificationLogWhereUniqueInput
    /**
     * In case the EmailVerificationLog found by the `where` argument doesn't exist, create a new EmailVerificationLog with this data.
     */
    create: XOR<EmailVerificationLogCreateInput, EmailVerificationLogUncheckedCreateInput>
    /**
     * In case the EmailVerificationLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<EmailVerificationLogUpdateInput, EmailVerificationLogUncheckedUpdateInput>
  }

  /**
   * EmailVerificationLog delete
   */
  export type EmailVerificationLogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailVerificationLog
     */
    select?: EmailVerificationLogSelect<ExtArgs> | null
    /**
     * Filter which EmailVerificationLog to delete.
     */
    where: EmailVerificationLogWhereUniqueInput
  }

  /**
   * EmailVerificationLog deleteMany
   */
  export type EmailVerificationLogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which EmailVerificationLogs to delete
     */
    where?: EmailVerificationLogWhereInput
  }

  /**
   * EmailVerificationLog findRaw
   */
  export type EmailVerificationLogFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * EmailVerificationLog aggregateRaw
   */
  export type EmailVerificationLogAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * EmailVerificationLog without action
   */
  export type EmailVerificationLogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailVerificationLog
     */
    select?: EmailVerificationLogSelect<ExtArgs> | null
  }


  /**
   * Model DeviceVerificationLog
   */

  export type AggregateDeviceVerificationLog = {
    _count: DeviceVerificationLogCountAggregateOutputType | null
    _min: DeviceVerificationLogMinAggregateOutputType | null
    _max: DeviceVerificationLogMaxAggregateOutputType | null
  }

  export type DeviceVerificationLogMinAggregateOutputType = {
    id: string | null
    userId: string | null
    deviceId: string | null
    ip: string | null
    action: string | null
    deviceName: string | null
    timestamp: Date | null
  }

  export type DeviceVerificationLogMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    deviceId: string | null
    ip: string | null
    action: string | null
    deviceName: string | null
    timestamp: Date | null
  }

  export type DeviceVerificationLogCountAggregateOutputType = {
    id: number
    userId: number
    deviceId: number
    ip: number
    action: number
    deviceName: number
    timestamp: number
    _all: number
  }


  export type DeviceVerificationLogMinAggregateInputType = {
    id?: true
    userId?: true
    deviceId?: true
    ip?: true
    action?: true
    deviceName?: true
    timestamp?: true
  }

  export type DeviceVerificationLogMaxAggregateInputType = {
    id?: true
    userId?: true
    deviceId?: true
    ip?: true
    action?: true
    deviceName?: true
    timestamp?: true
  }

  export type DeviceVerificationLogCountAggregateInputType = {
    id?: true
    userId?: true
    deviceId?: true
    ip?: true
    action?: true
    deviceName?: true
    timestamp?: true
    _all?: true
  }

  export type DeviceVerificationLogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DeviceVerificationLog to aggregate.
     */
    where?: DeviceVerificationLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DeviceVerificationLogs to fetch.
     */
    orderBy?: DeviceVerificationLogOrderByWithRelationInput | DeviceVerificationLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DeviceVerificationLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DeviceVerificationLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DeviceVerificationLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DeviceVerificationLogs
    **/
    _count?: true | DeviceVerificationLogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DeviceVerificationLogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DeviceVerificationLogMaxAggregateInputType
  }

  export type GetDeviceVerificationLogAggregateType<T extends DeviceVerificationLogAggregateArgs> = {
        [P in keyof T & keyof AggregateDeviceVerificationLog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDeviceVerificationLog[P]>
      : GetScalarType<T[P], AggregateDeviceVerificationLog[P]>
  }




  export type DeviceVerificationLogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DeviceVerificationLogWhereInput
    orderBy?: DeviceVerificationLogOrderByWithAggregationInput | DeviceVerificationLogOrderByWithAggregationInput[]
    by: DeviceVerificationLogScalarFieldEnum[] | DeviceVerificationLogScalarFieldEnum
    having?: DeviceVerificationLogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DeviceVerificationLogCountAggregateInputType | true
    _min?: DeviceVerificationLogMinAggregateInputType
    _max?: DeviceVerificationLogMaxAggregateInputType
  }

  export type DeviceVerificationLogGroupByOutputType = {
    id: string
    userId: string
    deviceId: string
    ip: string
    action: string
    deviceName: string
    timestamp: Date
    _count: DeviceVerificationLogCountAggregateOutputType | null
    _min: DeviceVerificationLogMinAggregateOutputType | null
    _max: DeviceVerificationLogMaxAggregateOutputType | null
  }

  type GetDeviceVerificationLogGroupByPayload<T extends DeviceVerificationLogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DeviceVerificationLogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DeviceVerificationLogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DeviceVerificationLogGroupByOutputType[P]>
            : GetScalarType<T[P], DeviceVerificationLogGroupByOutputType[P]>
        }
      >
    >


  export type DeviceVerificationLogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    deviceId?: boolean
    ip?: boolean
    action?: boolean
    deviceName?: boolean
    timestamp?: boolean
  }, ExtArgs["result"]["deviceVerificationLog"]>


  export type DeviceVerificationLogSelectScalar = {
    id?: boolean
    userId?: boolean
    deviceId?: boolean
    ip?: boolean
    action?: boolean
    deviceName?: boolean
    timestamp?: boolean
  }


  export type $DeviceVerificationLogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "DeviceVerificationLog"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      deviceId: string
      ip: string
      action: string
      deviceName: string
      timestamp: Date
    }, ExtArgs["result"]["deviceVerificationLog"]>
    composites: {}
  }

  type DeviceVerificationLogGetPayload<S extends boolean | null | undefined | DeviceVerificationLogDefaultArgs> = $Result.GetResult<Prisma.$DeviceVerificationLogPayload, S>

  type DeviceVerificationLogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<DeviceVerificationLogFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: DeviceVerificationLogCountAggregateInputType | true
    }

  export interface DeviceVerificationLogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['DeviceVerificationLog'], meta: { name: 'DeviceVerificationLog' } }
    /**
     * Find zero or one DeviceVerificationLog that matches the filter.
     * @param {DeviceVerificationLogFindUniqueArgs} args - Arguments to find a DeviceVerificationLog
     * @example
     * // Get one DeviceVerificationLog
     * const deviceVerificationLog = await prisma.deviceVerificationLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DeviceVerificationLogFindUniqueArgs>(args: SelectSubset<T, DeviceVerificationLogFindUniqueArgs<ExtArgs>>): Prisma__DeviceVerificationLogClient<$Result.GetResult<Prisma.$DeviceVerificationLogPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one DeviceVerificationLog that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {DeviceVerificationLogFindUniqueOrThrowArgs} args - Arguments to find a DeviceVerificationLog
     * @example
     * // Get one DeviceVerificationLog
     * const deviceVerificationLog = await prisma.deviceVerificationLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DeviceVerificationLogFindUniqueOrThrowArgs>(args: SelectSubset<T, DeviceVerificationLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DeviceVerificationLogClient<$Result.GetResult<Prisma.$DeviceVerificationLogPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first DeviceVerificationLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeviceVerificationLogFindFirstArgs} args - Arguments to find a DeviceVerificationLog
     * @example
     * // Get one DeviceVerificationLog
     * const deviceVerificationLog = await prisma.deviceVerificationLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DeviceVerificationLogFindFirstArgs>(args?: SelectSubset<T, DeviceVerificationLogFindFirstArgs<ExtArgs>>): Prisma__DeviceVerificationLogClient<$Result.GetResult<Prisma.$DeviceVerificationLogPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first DeviceVerificationLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeviceVerificationLogFindFirstOrThrowArgs} args - Arguments to find a DeviceVerificationLog
     * @example
     * // Get one DeviceVerificationLog
     * const deviceVerificationLog = await prisma.deviceVerificationLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DeviceVerificationLogFindFirstOrThrowArgs>(args?: SelectSubset<T, DeviceVerificationLogFindFirstOrThrowArgs<ExtArgs>>): Prisma__DeviceVerificationLogClient<$Result.GetResult<Prisma.$DeviceVerificationLogPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more DeviceVerificationLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeviceVerificationLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DeviceVerificationLogs
     * const deviceVerificationLogs = await prisma.deviceVerificationLog.findMany()
     * 
     * // Get first 10 DeviceVerificationLogs
     * const deviceVerificationLogs = await prisma.deviceVerificationLog.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const deviceVerificationLogWithIdOnly = await prisma.deviceVerificationLog.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DeviceVerificationLogFindManyArgs>(args?: SelectSubset<T, DeviceVerificationLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DeviceVerificationLogPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a DeviceVerificationLog.
     * @param {DeviceVerificationLogCreateArgs} args - Arguments to create a DeviceVerificationLog.
     * @example
     * // Create one DeviceVerificationLog
     * const DeviceVerificationLog = await prisma.deviceVerificationLog.create({
     *   data: {
     *     // ... data to create a DeviceVerificationLog
     *   }
     * })
     * 
     */
    create<T extends DeviceVerificationLogCreateArgs>(args: SelectSubset<T, DeviceVerificationLogCreateArgs<ExtArgs>>): Prisma__DeviceVerificationLogClient<$Result.GetResult<Prisma.$DeviceVerificationLogPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many DeviceVerificationLogs.
     * @param {DeviceVerificationLogCreateManyArgs} args - Arguments to create many DeviceVerificationLogs.
     * @example
     * // Create many DeviceVerificationLogs
     * const deviceVerificationLog = await prisma.deviceVerificationLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DeviceVerificationLogCreateManyArgs>(args?: SelectSubset<T, DeviceVerificationLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a DeviceVerificationLog.
     * @param {DeviceVerificationLogDeleteArgs} args - Arguments to delete one DeviceVerificationLog.
     * @example
     * // Delete one DeviceVerificationLog
     * const DeviceVerificationLog = await prisma.deviceVerificationLog.delete({
     *   where: {
     *     // ... filter to delete one DeviceVerificationLog
     *   }
     * })
     * 
     */
    delete<T extends DeviceVerificationLogDeleteArgs>(args: SelectSubset<T, DeviceVerificationLogDeleteArgs<ExtArgs>>): Prisma__DeviceVerificationLogClient<$Result.GetResult<Prisma.$DeviceVerificationLogPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one DeviceVerificationLog.
     * @param {DeviceVerificationLogUpdateArgs} args - Arguments to update one DeviceVerificationLog.
     * @example
     * // Update one DeviceVerificationLog
     * const deviceVerificationLog = await prisma.deviceVerificationLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DeviceVerificationLogUpdateArgs>(args: SelectSubset<T, DeviceVerificationLogUpdateArgs<ExtArgs>>): Prisma__DeviceVerificationLogClient<$Result.GetResult<Prisma.$DeviceVerificationLogPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more DeviceVerificationLogs.
     * @param {DeviceVerificationLogDeleteManyArgs} args - Arguments to filter DeviceVerificationLogs to delete.
     * @example
     * // Delete a few DeviceVerificationLogs
     * const { count } = await prisma.deviceVerificationLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DeviceVerificationLogDeleteManyArgs>(args?: SelectSubset<T, DeviceVerificationLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DeviceVerificationLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeviceVerificationLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DeviceVerificationLogs
     * const deviceVerificationLog = await prisma.deviceVerificationLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DeviceVerificationLogUpdateManyArgs>(args: SelectSubset<T, DeviceVerificationLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one DeviceVerificationLog.
     * @param {DeviceVerificationLogUpsertArgs} args - Arguments to update or create a DeviceVerificationLog.
     * @example
     * // Update or create a DeviceVerificationLog
     * const deviceVerificationLog = await prisma.deviceVerificationLog.upsert({
     *   create: {
     *     // ... data to create a DeviceVerificationLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DeviceVerificationLog we want to update
     *   }
     * })
     */
    upsert<T extends DeviceVerificationLogUpsertArgs>(args: SelectSubset<T, DeviceVerificationLogUpsertArgs<ExtArgs>>): Prisma__DeviceVerificationLogClient<$Result.GetResult<Prisma.$DeviceVerificationLogPayload<ExtArgs>, T, "upsert">, never, ExtArgs>

    /**
     * Find zero or more DeviceVerificationLogs that matches the filter.
     * @param {DeviceVerificationLogFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const deviceVerificationLog = await prisma.deviceVerificationLog.findRaw({
     *   filter: { age: { $gt: 25 } } 
     * })
     */
    findRaw(args?: DeviceVerificationLogFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a DeviceVerificationLog.
     * @param {DeviceVerificationLogAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const deviceVerificationLog = await prisma.deviceVerificationLog.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: DeviceVerificationLogAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of DeviceVerificationLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeviceVerificationLogCountArgs} args - Arguments to filter DeviceVerificationLogs to count.
     * @example
     * // Count the number of DeviceVerificationLogs
     * const count = await prisma.deviceVerificationLog.count({
     *   where: {
     *     // ... the filter for the DeviceVerificationLogs we want to count
     *   }
     * })
    **/
    count<T extends DeviceVerificationLogCountArgs>(
      args?: Subset<T, DeviceVerificationLogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DeviceVerificationLogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DeviceVerificationLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeviceVerificationLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DeviceVerificationLogAggregateArgs>(args: Subset<T, DeviceVerificationLogAggregateArgs>): Prisma.PrismaPromise<GetDeviceVerificationLogAggregateType<T>>

    /**
     * Group by DeviceVerificationLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeviceVerificationLogGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DeviceVerificationLogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DeviceVerificationLogGroupByArgs['orderBy'] }
        : { orderBy?: DeviceVerificationLogGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DeviceVerificationLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDeviceVerificationLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the DeviceVerificationLog model
   */
  readonly fields: DeviceVerificationLogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DeviceVerificationLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DeviceVerificationLogClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the DeviceVerificationLog model
   */ 
  interface DeviceVerificationLogFieldRefs {
    readonly id: FieldRef<"DeviceVerificationLog", 'String'>
    readonly userId: FieldRef<"DeviceVerificationLog", 'String'>
    readonly deviceId: FieldRef<"DeviceVerificationLog", 'String'>
    readonly ip: FieldRef<"DeviceVerificationLog", 'String'>
    readonly action: FieldRef<"DeviceVerificationLog", 'String'>
    readonly deviceName: FieldRef<"DeviceVerificationLog", 'String'>
    readonly timestamp: FieldRef<"DeviceVerificationLog", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * DeviceVerificationLog findUnique
   */
  export type DeviceVerificationLogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeviceVerificationLog
     */
    select?: DeviceVerificationLogSelect<ExtArgs> | null
    /**
     * Filter, which DeviceVerificationLog to fetch.
     */
    where: DeviceVerificationLogWhereUniqueInput
  }

  /**
   * DeviceVerificationLog findUniqueOrThrow
   */
  export type DeviceVerificationLogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeviceVerificationLog
     */
    select?: DeviceVerificationLogSelect<ExtArgs> | null
    /**
     * Filter, which DeviceVerificationLog to fetch.
     */
    where: DeviceVerificationLogWhereUniqueInput
  }

  /**
   * DeviceVerificationLog findFirst
   */
  export type DeviceVerificationLogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeviceVerificationLog
     */
    select?: DeviceVerificationLogSelect<ExtArgs> | null
    /**
     * Filter, which DeviceVerificationLog to fetch.
     */
    where?: DeviceVerificationLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DeviceVerificationLogs to fetch.
     */
    orderBy?: DeviceVerificationLogOrderByWithRelationInput | DeviceVerificationLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DeviceVerificationLogs.
     */
    cursor?: DeviceVerificationLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DeviceVerificationLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DeviceVerificationLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DeviceVerificationLogs.
     */
    distinct?: DeviceVerificationLogScalarFieldEnum | DeviceVerificationLogScalarFieldEnum[]
  }

  /**
   * DeviceVerificationLog findFirstOrThrow
   */
  export type DeviceVerificationLogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeviceVerificationLog
     */
    select?: DeviceVerificationLogSelect<ExtArgs> | null
    /**
     * Filter, which DeviceVerificationLog to fetch.
     */
    where?: DeviceVerificationLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DeviceVerificationLogs to fetch.
     */
    orderBy?: DeviceVerificationLogOrderByWithRelationInput | DeviceVerificationLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DeviceVerificationLogs.
     */
    cursor?: DeviceVerificationLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DeviceVerificationLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DeviceVerificationLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DeviceVerificationLogs.
     */
    distinct?: DeviceVerificationLogScalarFieldEnum | DeviceVerificationLogScalarFieldEnum[]
  }

  /**
   * DeviceVerificationLog findMany
   */
  export type DeviceVerificationLogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeviceVerificationLog
     */
    select?: DeviceVerificationLogSelect<ExtArgs> | null
    /**
     * Filter, which DeviceVerificationLogs to fetch.
     */
    where?: DeviceVerificationLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DeviceVerificationLogs to fetch.
     */
    orderBy?: DeviceVerificationLogOrderByWithRelationInput | DeviceVerificationLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DeviceVerificationLogs.
     */
    cursor?: DeviceVerificationLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DeviceVerificationLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DeviceVerificationLogs.
     */
    skip?: number
    distinct?: DeviceVerificationLogScalarFieldEnum | DeviceVerificationLogScalarFieldEnum[]
  }

  /**
   * DeviceVerificationLog create
   */
  export type DeviceVerificationLogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeviceVerificationLog
     */
    select?: DeviceVerificationLogSelect<ExtArgs> | null
    /**
     * The data needed to create a DeviceVerificationLog.
     */
    data: XOR<DeviceVerificationLogCreateInput, DeviceVerificationLogUncheckedCreateInput>
  }

  /**
   * DeviceVerificationLog createMany
   */
  export type DeviceVerificationLogCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many DeviceVerificationLogs.
     */
    data: DeviceVerificationLogCreateManyInput | DeviceVerificationLogCreateManyInput[]
  }

  /**
   * DeviceVerificationLog update
   */
  export type DeviceVerificationLogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeviceVerificationLog
     */
    select?: DeviceVerificationLogSelect<ExtArgs> | null
    /**
     * The data needed to update a DeviceVerificationLog.
     */
    data: XOR<DeviceVerificationLogUpdateInput, DeviceVerificationLogUncheckedUpdateInput>
    /**
     * Choose, which DeviceVerificationLog to update.
     */
    where: DeviceVerificationLogWhereUniqueInput
  }

  /**
   * DeviceVerificationLog updateMany
   */
  export type DeviceVerificationLogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update DeviceVerificationLogs.
     */
    data: XOR<DeviceVerificationLogUpdateManyMutationInput, DeviceVerificationLogUncheckedUpdateManyInput>
    /**
     * Filter which DeviceVerificationLogs to update
     */
    where?: DeviceVerificationLogWhereInput
  }

  /**
   * DeviceVerificationLog upsert
   */
  export type DeviceVerificationLogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeviceVerificationLog
     */
    select?: DeviceVerificationLogSelect<ExtArgs> | null
    /**
     * The filter to search for the DeviceVerificationLog to update in case it exists.
     */
    where: DeviceVerificationLogWhereUniqueInput
    /**
     * In case the DeviceVerificationLog found by the `where` argument doesn't exist, create a new DeviceVerificationLog with this data.
     */
    create: XOR<DeviceVerificationLogCreateInput, DeviceVerificationLogUncheckedCreateInput>
    /**
     * In case the DeviceVerificationLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DeviceVerificationLogUpdateInput, DeviceVerificationLogUncheckedUpdateInput>
  }

  /**
   * DeviceVerificationLog delete
   */
  export type DeviceVerificationLogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeviceVerificationLog
     */
    select?: DeviceVerificationLogSelect<ExtArgs> | null
    /**
     * Filter which DeviceVerificationLog to delete.
     */
    where: DeviceVerificationLogWhereUniqueInput
  }

  /**
   * DeviceVerificationLog deleteMany
   */
  export type DeviceVerificationLogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DeviceVerificationLogs to delete
     */
    where?: DeviceVerificationLogWhereInput
  }

  /**
   * DeviceVerificationLog findRaw
   */
  export type DeviceVerificationLogFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * DeviceVerificationLog aggregateRaw
   */
  export type DeviceVerificationLogAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * DeviceVerificationLog without action
   */
  export type DeviceVerificationLogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeviceVerificationLog
     */
    select?: DeviceVerificationLogSelect<ExtArgs> | null
  }


  /**
   * Model ApiRequestLog
   */

  export type AggregateApiRequestLog = {
    _count: ApiRequestLogCountAggregateOutputType | null
    _avg: ApiRequestLogAvgAggregateOutputType | null
    _sum: ApiRequestLogSumAggregateOutputType | null
    _min: ApiRequestLogMinAggregateOutputType | null
    _max: ApiRequestLogMaxAggregateOutputType | null
  }

  export type ApiRequestLogAvgAggregateOutputType = {
    statusCode: number | null
    duration: number | null
  }

  export type ApiRequestLogSumAggregateOutputType = {
    statusCode: number | null
    duration: number | null
  }

  export type ApiRequestLogMinAggregateOutputType = {
    id: string | null
    requestId: string | null
    method: string | null
    path: string | null
    statusCode: number | null
    duration: number | null
    userId: string | null
    ip: string | null
    userAgent: string | null
    timestamp: Date | null
  }

  export type ApiRequestLogMaxAggregateOutputType = {
    id: string | null
    requestId: string | null
    method: string | null
    path: string | null
    statusCode: number | null
    duration: number | null
    userId: string | null
    ip: string | null
    userAgent: string | null
    timestamp: Date | null
  }

  export type ApiRequestLogCountAggregateOutputType = {
    id: number
    requestId: number
    method: number
    path: number
    statusCode: number
    duration: number
    userId: number
    ip: number
    userAgent: number
    timestamp: number
    _all: number
  }


  export type ApiRequestLogAvgAggregateInputType = {
    statusCode?: true
    duration?: true
  }

  export type ApiRequestLogSumAggregateInputType = {
    statusCode?: true
    duration?: true
  }

  export type ApiRequestLogMinAggregateInputType = {
    id?: true
    requestId?: true
    method?: true
    path?: true
    statusCode?: true
    duration?: true
    userId?: true
    ip?: true
    userAgent?: true
    timestamp?: true
  }

  export type ApiRequestLogMaxAggregateInputType = {
    id?: true
    requestId?: true
    method?: true
    path?: true
    statusCode?: true
    duration?: true
    userId?: true
    ip?: true
    userAgent?: true
    timestamp?: true
  }

  export type ApiRequestLogCountAggregateInputType = {
    id?: true
    requestId?: true
    method?: true
    path?: true
    statusCode?: true
    duration?: true
    userId?: true
    ip?: true
    userAgent?: true
    timestamp?: true
    _all?: true
  }

  export type ApiRequestLogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ApiRequestLog to aggregate.
     */
    where?: ApiRequestLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ApiRequestLogs to fetch.
     */
    orderBy?: ApiRequestLogOrderByWithRelationInput | ApiRequestLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ApiRequestLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ApiRequestLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ApiRequestLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ApiRequestLogs
    **/
    _count?: true | ApiRequestLogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ApiRequestLogAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ApiRequestLogSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ApiRequestLogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ApiRequestLogMaxAggregateInputType
  }

  export type GetApiRequestLogAggregateType<T extends ApiRequestLogAggregateArgs> = {
        [P in keyof T & keyof AggregateApiRequestLog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateApiRequestLog[P]>
      : GetScalarType<T[P], AggregateApiRequestLog[P]>
  }




  export type ApiRequestLogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ApiRequestLogWhereInput
    orderBy?: ApiRequestLogOrderByWithAggregationInput | ApiRequestLogOrderByWithAggregationInput[]
    by: ApiRequestLogScalarFieldEnum[] | ApiRequestLogScalarFieldEnum
    having?: ApiRequestLogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ApiRequestLogCountAggregateInputType | true
    _avg?: ApiRequestLogAvgAggregateInputType
    _sum?: ApiRequestLogSumAggregateInputType
    _min?: ApiRequestLogMinAggregateInputType
    _max?: ApiRequestLogMaxAggregateInputType
  }

  export type ApiRequestLogGroupByOutputType = {
    id: string
    requestId: string
    method: string
    path: string
    statusCode: number
    duration: number
    userId: string | null
    ip: string
    userAgent: string | null
    timestamp: Date
    _count: ApiRequestLogCountAggregateOutputType | null
    _avg: ApiRequestLogAvgAggregateOutputType | null
    _sum: ApiRequestLogSumAggregateOutputType | null
    _min: ApiRequestLogMinAggregateOutputType | null
    _max: ApiRequestLogMaxAggregateOutputType | null
  }

  type GetApiRequestLogGroupByPayload<T extends ApiRequestLogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ApiRequestLogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ApiRequestLogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ApiRequestLogGroupByOutputType[P]>
            : GetScalarType<T[P], ApiRequestLogGroupByOutputType[P]>
        }
      >
    >


  export type ApiRequestLogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    requestId?: boolean
    method?: boolean
    path?: boolean
    statusCode?: boolean
    duration?: boolean
    userId?: boolean
    ip?: boolean
    userAgent?: boolean
    timestamp?: boolean
  }, ExtArgs["result"]["apiRequestLog"]>


  export type ApiRequestLogSelectScalar = {
    id?: boolean
    requestId?: boolean
    method?: boolean
    path?: boolean
    statusCode?: boolean
    duration?: boolean
    userId?: boolean
    ip?: boolean
    userAgent?: boolean
    timestamp?: boolean
  }


  export type $ApiRequestLogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ApiRequestLog"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      requestId: string
      method: string
      path: string
      statusCode: number
      duration: number
      userId: string | null
      ip: string
      userAgent: string | null
      timestamp: Date
    }, ExtArgs["result"]["apiRequestLog"]>
    composites: {}
  }

  type ApiRequestLogGetPayload<S extends boolean | null | undefined | ApiRequestLogDefaultArgs> = $Result.GetResult<Prisma.$ApiRequestLogPayload, S>

  type ApiRequestLogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ApiRequestLogFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ApiRequestLogCountAggregateInputType | true
    }

  export interface ApiRequestLogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ApiRequestLog'], meta: { name: 'ApiRequestLog' } }
    /**
     * Find zero or one ApiRequestLog that matches the filter.
     * @param {ApiRequestLogFindUniqueArgs} args - Arguments to find a ApiRequestLog
     * @example
     * // Get one ApiRequestLog
     * const apiRequestLog = await prisma.apiRequestLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ApiRequestLogFindUniqueArgs>(args: SelectSubset<T, ApiRequestLogFindUniqueArgs<ExtArgs>>): Prisma__ApiRequestLogClient<$Result.GetResult<Prisma.$ApiRequestLogPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ApiRequestLog that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ApiRequestLogFindUniqueOrThrowArgs} args - Arguments to find a ApiRequestLog
     * @example
     * // Get one ApiRequestLog
     * const apiRequestLog = await prisma.apiRequestLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ApiRequestLogFindUniqueOrThrowArgs>(args: SelectSubset<T, ApiRequestLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ApiRequestLogClient<$Result.GetResult<Prisma.$ApiRequestLogPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ApiRequestLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiRequestLogFindFirstArgs} args - Arguments to find a ApiRequestLog
     * @example
     * // Get one ApiRequestLog
     * const apiRequestLog = await prisma.apiRequestLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ApiRequestLogFindFirstArgs>(args?: SelectSubset<T, ApiRequestLogFindFirstArgs<ExtArgs>>): Prisma__ApiRequestLogClient<$Result.GetResult<Prisma.$ApiRequestLogPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ApiRequestLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiRequestLogFindFirstOrThrowArgs} args - Arguments to find a ApiRequestLog
     * @example
     * // Get one ApiRequestLog
     * const apiRequestLog = await prisma.apiRequestLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ApiRequestLogFindFirstOrThrowArgs>(args?: SelectSubset<T, ApiRequestLogFindFirstOrThrowArgs<ExtArgs>>): Prisma__ApiRequestLogClient<$Result.GetResult<Prisma.$ApiRequestLogPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ApiRequestLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiRequestLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ApiRequestLogs
     * const apiRequestLogs = await prisma.apiRequestLog.findMany()
     * 
     * // Get first 10 ApiRequestLogs
     * const apiRequestLogs = await prisma.apiRequestLog.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const apiRequestLogWithIdOnly = await prisma.apiRequestLog.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ApiRequestLogFindManyArgs>(args?: SelectSubset<T, ApiRequestLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ApiRequestLogPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ApiRequestLog.
     * @param {ApiRequestLogCreateArgs} args - Arguments to create a ApiRequestLog.
     * @example
     * // Create one ApiRequestLog
     * const ApiRequestLog = await prisma.apiRequestLog.create({
     *   data: {
     *     // ... data to create a ApiRequestLog
     *   }
     * })
     * 
     */
    create<T extends ApiRequestLogCreateArgs>(args: SelectSubset<T, ApiRequestLogCreateArgs<ExtArgs>>): Prisma__ApiRequestLogClient<$Result.GetResult<Prisma.$ApiRequestLogPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ApiRequestLogs.
     * @param {ApiRequestLogCreateManyArgs} args - Arguments to create many ApiRequestLogs.
     * @example
     * // Create many ApiRequestLogs
     * const apiRequestLog = await prisma.apiRequestLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ApiRequestLogCreateManyArgs>(args?: SelectSubset<T, ApiRequestLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a ApiRequestLog.
     * @param {ApiRequestLogDeleteArgs} args - Arguments to delete one ApiRequestLog.
     * @example
     * // Delete one ApiRequestLog
     * const ApiRequestLog = await prisma.apiRequestLog.delete({
     *   where: {
     *     // ... filter to delete one ApiRequestLog
     *   }
     * })
     * 
     */
    delete<T extends ApiRequestLogDeleteArgs>(args: SelectSubset<T, ApiRequestLogDeleteArgs<ExtArgs>>): Prisma__ApiRequestLogClient<$Result.GetResult<Prisma.$ApiRequestLogPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ApiRequestLog.
     * @param {ApiRequestLogUpdateArgs} args - Arguments to update one ApiRequestLog.
     * @example
     * // Update one ApiRequestLog
     * const apiRequestLog = await prisma.apiRequestLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ApiRequestLogUpdateArgs>(args: SelectSubset<T, ApiRequestLogUpdateArgs<ExtArgs>>): Prisma__ApiRequestLogClient<$Result.GetResult<Prisma.$ApiRequestLogPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ApiRequestLogs.
     * @param {ApiRequestLogDeleteManyArgs} args - Arguments to filter ApiRequestLogs to delete.
     * @example
     * // Delete a few ApiRequestLogs
     * const { count } = await prisma.apiRequestLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ApiRequestLogDeleteManyArgs>(args?: SelectSubset<T, ApiRequestLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ApiRequestLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiRequestLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ApiRequestLogs
     * const apiRequestLog = await prisma.apiRequestLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ApiRequestLogUpdateManyArgs>(args: SelectSubset<T, ApiRequestLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ApiRequestLog.
     * @param {ApiRequestLogUpsertArgs} args - Arguments to update or create a ApiRequestLog.
     * @example
     * // Update or create a ApiRequestLog
     * const apiRequestLog = await prisma.apiRequestLog.upsert({
     *   create: {
     *     // ... data to create a ApiRequestLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ApiRequestLog we want to update
     *   }
     * })
     */
    upsert<T extends ApiRequestLogUpsertArgs>(args: SelectSubset<T, ApiRequestLogUpsertArgs<ExtArgs>>): Prisma__ApiRequestLogClient<$Result.GetResult<Prisma.$ApiRequestLogPayload<ExtArgs>, T, "upsert">, never, ExtArgs>

    /**
     * Find zero or more ApiRequestLogs that matches the filter.
     * @param {ApiRequestLogFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const apiRequestLog = await prisma.apiRequestLog.findRaw({
     *   filter: { age: { $gt: 25 } } 
     * })
     */
    findRaw(args?: ApiRequestLogFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a ApiRequestLog.
     * @param {ApiRequestLogAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const apiRequestLog = await prisma.apiRequestLog.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: ApiRequestLogAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of ApiRequestLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiRequestLogCountArgs} args - Arguments to filter ApiRequestLogs to count.
     * @example
     * // Count the number of ApiRequestLogs
     * const count = await prisma.apiRequestLog.count({
     *   where: {
     *     // ... the filter for the ApiRequestLogs we want to count
     *   }
     * })
    **/
    count<T extends ApiRequestLogCountArgs>(
      args?: Subset<T, ApiRequestLogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ApiRequestLogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ApiRequestLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiRequestLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ApiRequestLogAggregateArgs>(args: Subset<T, ApiRequestLogAggregateArgs>): Prisma.PrismaPromise<GetApiRequestLogAggregateType<T>>

    /**
     * Group by ApiRequestLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiRequestLogGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ApiRequestLogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ApiRequestLogGroupByArgs['orderBy'] }
        : { orderBy?: ApiRequestLogGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ApiRequestLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetApiRequestLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ApiRequestLog model
   */
  readonly fields: ApiRequestLogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ApiRequestLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ApiRequestLogClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ApiRequestLog model
   */ 
  interface ApiRequestLogFieldRefs {
    readonly id: FieldRef<"ApiRequestLog", 'String'>
    readonly requestId: FieldRef<"ApiRequestLog", 'String'>
    readonly method: FieldRef<"ApiRequestLog", 'String'>
    readonly path: FieldRef<"ApiRequestLog", 'String'>
    readonly statusCode: FieldRef<"ApiRequestLog", 'Int'>
    readonly duration: FieldRef<"ApiRequestLog", 'Int'>
    readonly userId: FieldRef<"ApiRequestLog", 'String'>
    readonly ip: FieldRef<"ApiRequestLog", 'String'>
    readonly userAgent: FieldRef<"ApiRequestLog", 'String'>
    readonly timestamp: FieldRef<"ApiRequestLog", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ApiRequestLog findUnique
   */
  export type ApiRequestLogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiRequestLog
     */
    select?: ApiRequestLogSelect<ExtArgs> | null
    /**
     * Filter, which ApiRequestLog to fetch.
     */
    where: ApiRequestLogWhereUniqueInput
  }

  /**
   * ApiRequestLog findUniqueOrThrow
   */
  export type ApiRequestLogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiRequestLog
     */
    select?: ApiRequestLogSelect<ExtArgs> | null
    /**
     * Filter, which ApiRequestLog to fetch.
     */
    where: ApiRequestLogWhereUniqueInput
  }

  /**
   * ApiRequestLog findFirst
   */
  export type ApiRequestLogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiRequestLog
     */
    select?: ApiRequestLogSelect<ExtArgs> | null
    /**
     * Filter, which ApiRequestLog to fetch.
     */
    where?: ApiRequestLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ApiRequestLogs to fetch.
     */
    orderBy?: ApiRequestLogOrderByWithRelationInput | ApiRequestLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ApiRequestLogs.
     */
    cursor?: ApiRequestLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ApiRequestLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ApiRequestLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ApiRequestLogs.
     */
    distinct?: ApiRequestLogScalarFieldEnum | ApiRequestLogScalarFieldEnum[]
  }

  /**
   * ApiRequestLog findFirstOrThrow
   */
  export type ApiRequestLogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiRequestLog
     */
    select?: ApiRequestLogSelect<ExtArgs> | null
    /**
     * Filter, which ApiRequestLog to fetch.
     */
    where?: ApiRequestLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ApiRequestLogs to fetch.
     */
    orderBy?: ApiRequestLogOrderByWithRelationInput | ApiRequestLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ApiRequestLogs.
     */
    cursor?: ApiRequestLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ApiRequestLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ApiRequestLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ApiRequestLogs.
     */
    distinct?: ApiRequestLogScalarFieldEnum | ApiRequestLogScalarFieldEnum[]
  }

  /**
   * ApiRequestLog findMany
   */
  export type ApiRequestLogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiRequestLog
     */
    select?: ApiRequestLogSelect<ExtArgs> | null
    /**
     * Filter, which ApiRequestLogs to fetch.
     */
    where?: ApiRequestLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ApiRequestLogs to fetch.
     */
    orderBy?: ApiRequestLogOrderByWithRelationInput | ApiRequestLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ApiRequestLogs.
     */
    cursor?: ApiRequestLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ApiRequestLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ApiRequestLogs.
     */
    skip?: number
    distinct?: ApiRequestLogScalarFieldEnum | ApiRequestLogScalarFieldEnum[]
  }

  /**
   * ApiRequestLog create
   */
  export type ApiRequestLogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiRequestLog
     */
    select?: ApiRequestLogSelect<ExtArgs> | null
    /**
     * The data needed to create a ApiRequestLog.
     */
    data: XOR<ApiRequestLogCreateInput, ApiRequestLogUncheckedCreateInput>
  }

  /**
   * ApiRequestLog createMany
   */
  export type ApiRequestLogCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ApiRequestLogs.
     */
    data: ApiRequestLogCreateManyInput | ApiRequestLogCreateManyInput[]
  }

  /**
   * ApiRequestLog update
   */
  export type ApiRequestLogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiRequestLog
     */
    select?: ApiRequestLogSelect<ExtArgs> | null
    /**
     * The data needed to update a ApiRequestLog.
     */
    data: XOR<ApiRequestLogUpdateInput, ApiRequestLogUncheckedUpdateInput>
    /**
     * Choose, which ApiRequestLog to update.
     */
    where: ApiRequestLogWhereUniqueInput
  }

  /**
   * ApiRequestLog updateMany
   */
  export type ApiRequestLogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ApiRequestLogs.
     */
    data: XOR<ApiRequestLogUpdateManyMutationInput, ApiRequestLogUncheckedUpdateManyInput>
    /**
     * Filter which ApiRequestLogs to update
     */
    where?: ApiRequestLogWhereInput
  }

  /**
   * ApiRequestLog upsert
   */
  export type ApiRequestLogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiRequestLog
     */
    select?: ApiRequestLogSelect<ExtArgs> | null
    /**
     * The filter to search for the ApiRequestLog to update in case it exists.
     */
    where: ApiRequestLogWhereUniqueInput
    /**
     * In case the ApiRequestLog found by the `where` argument doesn't exist, create a new ApiRequestLog with this data.
     */
    create: XOR<ApiRequestLogCreateInput, ApiRequestLogUncheckedCreateInput>
    /**
     * In case the ApiRequestLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ApiRequestLogUpdateInput, ApiRequestLogUncheckedUpdateInput>
  }

  /**
   * ApiRequestLog delete
   */
  export type ApiRequestLogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiRequestLog
     */
    select?: ApiRequestLogSelect<ExtArgs> | null
    /**
     * Filter which ApiRequestLog to delete.
     */
    where: ApiRequestLogWhereUniqueInput
  }

  /**
   * ApiRequestLog deleteMany
   */
  export type ApiRequestLogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ApiRequestLogs to delete
     */
    where?: ApiRequestLogWhereInput
  }

  /**
   * ApiRequestLog findRaw
   */
  export type ApiRequestLogFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * ApiRequestLog aggregateRaw
   */
  export type ApiRequestLogAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * ApiRequestLog without action
   */
  export type ApiRequestLogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiRequestLog
     */
    select?: ApiRequestLogSelect<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const LoginAttemptScalarFieldEnum: {
    id: 'id',
    email: 'email',
    ip: 'ip',
    deviceId: 'deviceId',
    deviceName: 'deviceName',
    success: 'success',
    reason: 'reason',
    userAgent: 'userAgent',
    timestamp: 'timestamp'
  };

  export type LoginAttemptScalarFieldEnum = (typeof LoginAttemptScalarFieldEnum)[keyof typeof LoginAttemptScalarFieldEnum]


  export const EmailVerificationLogScalarFieldEnum: {
    id: 'id',
    email: 'email',
    ip: 'ip',
    deviceId: 'deviceId',
    success: 'success',
    otpSentAt: 'otpSentAt',
    verifiedAt: 'verifiedAt',
    timestamp: 'timestamp'
  };

  export type EmailVerificationLogScalarFieldEnum = (typeof EmailVerificationLogScalarFieldEnum)[keyof typeof EmailVerificationLogScalarFieldEnum]


  export const DeviceVerificationLogScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    deviceId: 'deviceId',
    ip: 'ip',
    action: 'action',
    deviceName: 'deviceName',
    timestamp: 'timestamp'
  };

  export type DeviceVerificationLogScalarFieldEnum = (typeof DeviceVerificationLogScalarFieldEnum)[keyof typeof DeviceVerificationLogScalarFieldEnum]


  export const ApiRequestLogScalarFieldEnum: {
    id: 'id',
    requestId: 'requestId',
    method: 'method',
    path: 'path',
    statusCode: 'statusCode',
    duration: 'duration',
    userId: 'userId',
    ip: 'ip',
    userAgent: 'userAgent',
    timestamp: 'timestamp'
  };

  export type ApiRequestLogScalarFieldEnum = (typeof ApiRequestLogScalarFieldEnum)[keyof typeof ApiRequestLogScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type LoginAttemptWhereInput = {
    AND?: LoginAttemptWhereInput | LoginAttemptWhereInput[]
    OR?: LoginAttemptWhereInput[]
    NOT?: LoginAttemptWhereInput | LoginAttemptWhereInput[]
    id?: StringFilter<"LoginAttempt"> | string
    email?: StringFilter<"LoginAttempt"> | string
    ip?: StringFilter<"LoginAttempt"> | string
    deviceId?: StringFilter<"LoginAttempt"> | string
    deviceName?: StringFilter<"LoginAttempt"> | string
    success?: BoolFilter<"LoginAttempt"> | boolean
    reason?: StringNullableFilter<"LoginAttempt"> | string | null
    userAgent?: StringFilter<"LoginAttempt"> | string
    timestamp?: DateTimeFilter<"LoginAttempt"> | Date | string
  }

  export type LoginAttemptOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    ip?: SortOrder
    deviceId?: SortOrder
    deviceName?: SortOrder
    success?: SortOrder
    reason?: SortOrder
    userAgent?: SortOrder
    timestamp?: SortOrder
  }

  export type LoginAttemptWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: LoginAttemptWhereInput | LoginAttemptWhereInput[]
    OR?: LoginAttemptWhereInput[]
    NOT?: LoginAttemptWhereInput | LoginAttemptWhereInput[]
    email?: StringFilter<"LoginAttempt"> | string
    ip?: StringFilter<"LoginAttempt"> | string
    deviceId?: StringFilter<"LoginAttempt"> | string
    deviceName?: StringFilter<"LoginAttempt"> | string
    success?: BoolFilter<"LoginAttempt"> | boolean
    reason?: StringNullableFilter<"LoginAttempt"> | string | null
    userAgent?: StringFilter<"LoginAttempt"> | string
    timestamp?: DateTimeFilter<"LoginAttempt"> | Date | string
  }, "id">

  export type LoginAttemptOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    ip?: SortOrder
    deviceId?: SortOrder
    deviceName?: SortOrder
    success?: SortOrder
    reason?: SortOrder
    userAgent?: SortOrder
    timestamp?: SortOrder
    _count?: LoginAttemptCountOrderByAggregateInput
    _max?: LoginAttemptMaxOrderByAggregateInput
    _min?: LoginAttemptMinOrderByAggregateInput
  }

  export type LoginAttemptScalarWhereWithAggregatesInput = {
    AND?: LoginAttemptScalarWhereWithAggregatesInput | LoginAttemptScalarWhereWithAggregatesInput[]
    OR?: LoginAttemptScalarWhereWithAggregatesInput[]
    NOT?: LoginAttemptScalarWhereWithAggregatesInput | LoginAttemptScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"LoginAttempt"> | string
    email?: StringWithAggregatesFilter<"LoginAttempt"> | string
    ip?: StringWithAggregatesFilter<"LoginAttempt"> | string
    deviceId?: StringWithAggregatesFilter<"LoginAttempt"> | string
    deviceName?: StringWithAggregatesFilter<"LoginAttempt"> | string
    success?: BoolWithAggregatesFilter<"LoginAttempt"> | boolean
    reason?: StringNullableWithAggregatesFilter<"LoginAttempt"> | string | null
    userAgent?: StringWithAggregatesFilter<"LoginAttempt"> | string
    timestamp?: DateTimeWithAggregatesFilter<"LoginAttempt"> | Date | string
  }

  export type EmailVerificationLogWhereInput = {
    AND?: EmailVerificationLogWhereInput | EmailVerificationLogWhereInput[]
    OR?: EmailVerificationLogWhereInput[]
    NOT?: EmailVerificationLogWhereInput | EmailVerificationLogWhereInput[]
    id?: StringFilter<"EmailVerificationLog"> | string
    email?: StringFilter<"EmailVerificationLog"> | string
    ip?: StringFilter<"EmailVerificationLog"> | string
    deviceId?: StringFilter<"EmailVerificationLog"> | string
    success?: BoolFilter<"EmailVerificationLog"> | boolean
    otpSentAt?: DateTimeFilter<"EmailVerificationLog"> | Date | string
    verifiedAt?: DateTimeNullableFilter<"EmailVerificationLog"> | Date | string | null
    timestamp?: DateTimeFilter<"EmailVerificationLog"> | Date | string
  }

  export type EmailVerificationLogOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    ip?: SortOrder
    deviceId?: SortOrder
    success?: SortOrder
    otpSentAt?: SortOrder
    verifiedAt?: SortOrder
    timestamp?: SortOrder
  }

  export type EmailVerificationLogWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: EmailVerificationLogWhereInput | EmailVerificationLogWhereInput[]
    OR?: EmailVerificationLogWhereInput[]
    NOT?: EmailVerificationLogWhereInput | EmailVerificationLogWhereInput[]
    email?: StringFilter<"EmailVerificationLog"> | string
    ip?: StringFilter<"EmailVerificationLog"> | string
    deviceId?: StringFilter<"EmailVerificationLog"> | string
    success?: BoolFilter<"EmailVerificationLog"> | boolean
    otpSentAt?: DateTimeFilter<"EmailVerificationLog"> | Date | string
    verifiedAt?: DateTimeNullableFilter<"EmailVerificationLog"> | Date | string | null
    timestamp?: DateTimeFilter<"EmailVerificationLog"> | Date | string
  }, "id">

  export type EmailVerificationLogOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    ip?: SortOrder
    deviceId?: SortOrder
    success?: SortOrder
    otpSentAt?: SortOrder
    verifiedAt?: SortOrder
    timestamp?: SortOrder
    _count?: EmailVerificationLogCountOrderByAggregateInput
    _max?: EmailVerificationLogMaxOrderByAggregateInput
    _min?: EmailVerificationLogMinOrderByAggregateInput
  }

  export type EmailVerificationLogScalarWhereWithAggregatesInput = {
    AND?: EmailVerificationLogScalarWhereWithAggregatesInput | EmailVerificationLogScalarWhereWithAggregatesInput[]
    OR?: EmailVerificationLogScalarWhereWithAggregatesInput[]
    NOT?: EmailVerificationLogScalarWhereWithAggregatesInput | EmailVerificationLogScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"EmailVerificationLog"> | string
    email?: StringWithAggregatesFilter<"EmailVerificationLog"> | string
    ip?: StringWithAggregatesFilter<"EmailVerificationLog"> | string
    deviceId?: StringWithAggregatesFilter<"EmailVerificationLog"> | string
    success?: BoolWithAggregatesFilter<"EmailVerificationLog"> | boolean
    otpSentAt?: DateTimeWithAggregatesFilter<"EmailVerificationLog"> | Date | string
    verifiedAt?: DateTimeNullableWithAggregatesFilter<"EmailVerificationLog"> | Date | string | null
    timestamp?: DateTimeWithAggregatesFilter<"EmailVerificationLog"> | Date | string
  }

  export type DeviceVerificationLogWhereInput = {
    AND?: DeviceVerificationLogWhereInput | DeviceVerificationLogWhereInput[]
    OR?: DeviceVerificationLogWhereInput[]
    NOT?: DeviceVerificationLogWhereInput | DeviceVerificationLogWhereInput[]
    id?: StringFilter<"DeviceVerificationLog"> | string
    userId?: StringFilter<"DeviceVerificationLog"> | string
    deviceId?: StringFilter<"DeviceVerificationLog"> | string
    ip?: StringFilter<"DeviceVerificationLog"> | string
    action?: StringFilter<"DeviceVerificationLog"> | string
    deviceName?: StringFilter<"DeviceVerificationLog"> | string
    timestamp?: DateTimeFilter<"DeviceVerificationLog"> | Date | string
  }

  export type DeviceVerificationLogOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    deviceId?: SortOrder
    ip?: SortOrder
    action?: SortOrder
    deviceName?: SortOrder
    timestamp?: SortOrder
  }

  export type DeviceVerificationLogWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: DeviceVerificationLogWhereInput | DeviceVerificationLogWhereInput[]
    OR?: DeviceVerificationLogWhereInput[]
    NOT?: DeviceVerificationLogWhereInput | DeviceVerificationLogWhereInput[]
    userId?: StringFilter<"DeviceVerificationLog"> | string
    deviceId?: StringFilter<"DeviceVerificationLog"> | string
    ip?: StringFilter<"DeviceVerificationLog"> | string
    action?: StringFilter<"DeviceVerificationLog"> | string
    deviceName?: StringFilter<"DeviceVerificationLog"> | string
    timestamp?: DateTimeFilter<"DeviceVerificationLog"> | Date | string
  }, "id">

  export type DeviceVerificationLogOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    deviceId?: SortOrder
    ip?: SortOrder
    action?: SortOrder
    deviceName?: SortOrder
    timestamp?: SortOrder
    _count?: DeviceVerificationLogCountOrderByAggregateInput
    _max?: DeviceVerificationLogMaxOrderByAggregateInput
    _min?: DeviceVerificationLogMinOrderByAggregateInput
  }

  export type DeviceVerificationLogScalarWhereWithAggregatesInput = {
    AND?: DeviceVerificationLogScalarWhereWithAggregatesInput | DeviceVerificationLogScalarWhereWithAggregatesInput[]
    OR?: DeviceVerificationLogScalarWhereWithAggregatesInput[]
    NOT?: DeviceVerificationLogScalarWhereWithAggregatesInput | DeviceVerificationLogScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"DeviceVerificationLog"> | string
    userId?: StringWithAggregatesFilter<"DeviceVerificationLog"> | string
    deviceId?: StringWithAggregatesFilter<"DeviceVerificationLog"> | string
    ip?: StringWithAggregatesFilter<"DeviceVerificationLog"> | string
    action?: StringWithAggregatesFilter<"DeviceVerificationLog"> | string
    deviceName?: StringWithAggregatesFilter<"DeviceVerificationLog"> | string
    timestamp?: DateTimeWithAggregatesFilter<"DeviceVerificationLog"> | Date | string
  }

  export type ApiRequestLogWhereInput = {
    AND?: ApiRequestLogWhereInput | ApiRequestLogWhereInput[]
    OR?: ApiRequestLogWhereInput[]
    NOT?: ApiRequestLogWhereInput | ApiRequestLogWhereInput[]
    id?: StringFilter<"ApiRequestLog"> | string
    requestId?: StringFilter<"ApiRequestLog"> | string
    method?: StringFilter<"ApiRequestLog"> | string
    path?: StringFilter<"ApiRequestLog"> | string
    statusCode?: IntFilter<"ApiRequestLog"> | number
    duration?: IntFilter<"ApiRequestLog"> | number
    userId?: StringNullableFilter<"ApiRequestLog"> | string | null
    ip?: StringFilter<"ApiRequestLog"> | string
    userAgent?: StringNullableFilter<"ApiRequestLog"> | string | null
    timestamp?: DateTimeFilter<"ApiRequestLog"> | Date | string
  }

  export type ApiRequestLogOrderByWithRelationInput = {
    id?: SortOrder
    requestId?: SortOrder
    method?: SortOrder
    path?: SortOrder
    statusCode?: SortOrder
    duration?: SortOrder
    userId?: SortOrder
    ip?: SortOrder
    userAgent?: SortOrder
    timestamp?: SortOrder
  }

  export type ApiRequestLogWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ApiRequestLogWhereInput | ApiRequestLogWhereInput[]
    OR?: ApiRequestLogWhereInput[]
    NOT?: ApiRequestLogWhereInput | ApiRequestLogWhereInput[]
    requestId?: StringFilter<"ApiRequestLog"> | string
    method?: StringFilter<"ApiRequestLog"> | string
    path?: StringFilter<"ApiRequestLog"> | string
    statusCode?: IntFilter<"ApiRequestLog"> | number
    duration?: IntFilter<"ApiRequestLog"> | number
    userId?: StringNullableFilter<"ApiRequestLog"> | string | null
    ip?: StringFilter<"ApiRequestLog"> | string
    userAgent?: StringNullableFilter<"ApiRequestLog"> | string | null
    timestamp?: DateTimeFilter<"ApiRequestLog"> | Date | string
  }, "id">

  export type ApiRequestLogOrderByWithAggregationInput = {
    id?: SortOrder
    requestId?: SortOrder
    method?: SortOrder
    path?: SortOrder
    statusCode?: SortOrder
    duration?: SortOrder
    userId?: SortOrder
    ip?: SortOrder
    userAgent?: SortOrder
    timestamp?: SortOrder
    _count?: ApiRequestLogCountOrderByAggregateInput
    _avg?: ApiRequestLogAvgOrderByAggregateInput
    _max?: ApiRequestLogMaxOrderByAggregateInput
    _min?: ApiRequestLogMinOrderByAggregateInput
    _sum?: ApiRequestLogSumOrderByAggregateInput
  }

  export type ApiRequestLogScalarWhereWithAggregatesInput = {
    AND?: ApiRequestLogScalarWhereWithAggregatesInput | ApiRequestLogScalarWhereWithAggregatesInput[]
    OR?: ApiRequestLogScalarWhereWithAggregatesInput[]
    NOT?: ApiRequestLogScalarWhereWithAggregatesInput | ApiRequestLogScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ApiRequestLog"> | string
    requestId?: StringWithAggregatesFilter<"ApiRequestLog"> | string
    method?: StringWithAggregatesFilter<"ApiRequestLog"> | string
    path?: StringWithAggregatesFilter<"ApiRequestLog"> | string
    statusCode?: IntWithAggregatesFilter<"ApiRequestLog"> | number
    duration?: IntWithAggregatesFilter<"ApiRequestLog"> | number
    userId?: StringNullableWithAggregatesFilter<"ApiRequestLog"> | string | null
    ip?: StringWithAggregatesFilter<"ApiRequestLog"> | string
    userAgent?: StringNullableWithAggregatesFilter<"ApiRequestLog"> | string | null
    timestamp?: DateTimeWithAggregatesFilter<"ApiRequestLog"> | Date | string
  }

  export type LoginAttemptCreateInput = {
    id?: string
    email: string
    ip: string
    deviceId: string
    deviceName: string
    success: boolean
    reason?: string | null
    userAgent: string
    timestamp: Date | string
  }

  export type LoginAttemptUncheckedCreateInput = {
    id?: string
    email: string
    ip: string
    deviceId: string
    deviceName: string
    success: boolean
    reason?: string | null
    userAgent: string
    timestamp: Date | string
  }

  export type LoginAttemptUpdateInput = {
    email?: StringFieldUpdateOperationsInput | string
    ip?: StringFieldUpdateOperationsInput | string
    deviceId?: StringFieldUpdateOperationsInput | string
    deviceName?: StringFieldUpdateOperationsInput | string
    success?: BoolFieldUpdateOperationsInput | boolean
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LoginAttemptUncheckedUpdateInput = {
    email?: StringFieldUpdateOperationsInput | string
    ip?: StringFieldUpdateOperationsInput | string
    deviceId?: StringFieldUpdateOperationsInput | string
    deviceName?: StringFieldUpdateOperationsInput | string
    success?: BoolFieldUpdateOperationsInput | boolean
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LoginAttemptCreateManyInput = {
    id?: string
    email: string
    ip: string
    deviceId: string
    deviceName: string
    success: boolean
    reason?: string | null
    userAgent: string
    timestamp: Date | string
  }

  export type LoginAttemptUpdateManyMutationInput = {
    email?: StringFieldUpdateOperationsInput | string
    ip?: StringFieldUpdateOperationsInput | string
    deviceId?: StringFieldUpdateOperationsInput | string
    deviceName?: StringFieldUpdateOperationsInput | string
    success?: BoolFieldUpdateOperationsInput | boolean
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LoginAttemptUncheckedUpdateManyInput = {
    email?: StringFieldUpdateOperationsInput | string
    ip?: StringFieldUpdateOperationsInput | string
    deviceId?: StringFieldUpdateOperationsInput | string
    deviceName?: StringFieldUpdateOperationsInput | string
    success?: BoolFieldUpdateOperationsInput | boolean
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EmailVerificationLogCreateInput = {
    id?: string
    email: string
    ip: string
    deviceId: string
    success: boolean
    otpSentAt: Date | string
    verifiedAt?: Date | string | null
    timestamp: Date | string
  }

  export type EmailVerificationLogUncheckedCreateInput = {
    id?: string
    email: string
    ip: string
    deviceId: string
    success: boolean
    otpSentAt: Date | string
    verifiedAt?: Date | string | null
    timestamp: Date | string
  }

  export type EmailVerificationLogUpdateInput = {
    email?: StringFieldUpdateOperationsInput | string
    ip?: StringFieldUpdateOperationsInput | string
    deviceId?: StringFieldUpdateOperationsInput | string
    success?: BoolFieldUpdateOperationsInput | boolean
    otpSentAt?: DateTimeFieldUpdateOperationsInput | Date | string
    verifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EmailVerificationLogUncheckedUpdateInput = {
    email?: StringFieldUpdateOperationsInput | string
    ip?: StringFieldUpdateOperationsInput | string
    deviceId?: StringFieldUpdateOperationsInput | string
    success?: BoolFieldUpdateOperationsInput | boolean
    otpSentAt?: DateTimeFieldUpdateOperationsInput | Date | string
    verifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EmailVerificationLogCreateManyInput = {
    id?: string
    email: string
    ip: string
    deviceId: string
    success: boolean
    otpSentAt: Date | string
    verifiedAt?: Date | string | null
    timestamp: Date | string
  }

  export type EmailVerificationLogUpdateManyMutationInput = {
    email?: StringFieldUpdateOperationsInput | string
    ip?: StringFieldUpdateOperationsInput | string
    deviceId?: StringFieldUpdateOperationsInput | string
    success?: BoolFieldUpdateOperationsInput | boolean
    otpSentAt?: DateTimeFieldUpdateOperationsInput | Date | string
    verifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EmailVerificationLogUncheckedUpdateManyInput = {
    email?: StringFieldUpdateOperationsInput | string
    ip?: StringFieldUpdateOperationsInput | string
    deviceId?: StringFieldUpdateOperationsInput | string
    success?: BoolFieldUpdateOperationsInput | boolean
    otpSentAt?: DateTimeFieldUpdateOperationsInput | Date | string
    verifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DeviceVerificationLogCreateInput = {
    id?: string
    userId: string
    deviceId: string
    ip: string
    action: string
    deviceName: string
    timestamp: Date | string
  }

  export type DeviceVerificationLogUncheckedCreateInput = {
    id?: string
    userId: string
    deviceId: string
    ip: string
    action: string
    deviceName: string
    timestamp: Date | string
  }

  export type DeviceVerificationLogUpdateInput = {
    userId?: StringFieldUpdateOperationsInput | string
    deviceId?: StringFieldUpdateOperationsInput | string
    ip?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    deviceName?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DeviceVerificationLogUncheckedUpdateInput = {
    userId?: StringFieldUpdateOperationsInput | string
    deviceId?: StringFieldUpdateOperationsInput | string
    ip?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    deviceName?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DeviceVerificationLogCreateManyInput = {
    id?: string
    userId: string
    deviceId: string
    ip: string
    action: string
    deviceName: string
    timestamp: Date | string
  }

  export type DeviceVerificationLogUpdateManyMutationInput = {
    userId?: StringFieldUpdateOperationsInput | string
    deviceId?: StringFieldUpdateOperationsInput | string
    ip?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    deviceName?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DeviceVerificationLogUncheckedUpdateManyInput = {
    userId?: StringFieldUpdateOperationsInput | string
    deviceId?: StringFieldUpdateOperationsInput | string
    ip?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    deviceName?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ApiRequestLogCreateInput = {
    id?: string
    requestId: string
    method: string
    path: string
    statusCode: number
    duration: number
    userId?: string | null
    ip: string
    userAgent?: string | null
    timestamp: Date | string
  }

  export type ApiRequestLogUncheckedCreateInput = {
    id?: string
    requestId: string
    method: string
    path: string
    statusCode: number
    duration: number
    userId?: string | null
    ip: string
    userAgent?: string | null
    timestamp: Date | string
  }

  export type ApiRequestLogUpdateInput = {
    requestId?: StringFieldUpdateOperationsInput | string
    method?: StringFieldUpdateOperationsInput | string
    path?: StringFieldUpdateOperationsInput | string
    statusCode?: IntFieldUpdateOperationsInput | number
    duration?: IntFieldUpdateOperationsInput | number
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    ip?: StringFieldUpdateOperationsInput | string
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ApiRequestLogUncheckedUpdateInput = {
    requestId?: StringFieldUpdateOperationsInput | string
    method?: StringFieldUpdateOperationsInput | string
    path?: StringFieldUpdateOperationsInput | string
    statusCode?: IntFieldUpdateOperationsInput | number
    duration?: IntFieldUpdateOperationsInput | number
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    ip?: StringFieldUpdateOperationsInput | string
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ApiRequestLogCreateManyInput = {
    id?: string
    requestId: string
    method: string
    path: string
    statusCode: number
    duration: number
    userId?: string | null
    ip: string
    userAgent?: string | null
    timestamp: Date | string
  }

  export type ApiRequestLogUpdateManyMutationInput = {
    requestId?: StringFieldUpdateOperationsInput | string
    method?: StringFieldUpdateOperationsInput | string
    path?: StringFieldUpdateOperationsInput | string
    statusCode?: IntFieldUpdateOperationsInput | number
    duration?: IntFieldUpdateOperationsInput | number
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    ip?: StringFieldUpdateOperationsInput | string
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ApiRequestLogUncheckedUpdateManyInput = {
    requestId?: StringFieldUpdateOperationsInput | string
    method?: StringFieldUpdateOperationsInput | string
    path?: StringFieldUpdateOperationsInput | string
    statusCode?: IntFieldUpdateOperationsInput | number
    duration?: IntFieldUpdateOperationsInput | number
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    ip?: StringFieldUpdateOperationsInput | string
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
    isSet?: boolean
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type LoginAttemptCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    ip?: SortOrder
    deviceId?: SortOrder
    deviceName?: SortOrder
    success?: SortOrder
    reason?: SortOrder
    userAgent?: SortOrder
    timestamp?: SortOrder
  }

  export type LoginAttemptMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    ip?: SortOrder
    deviceId?: SortOrder
    deviceName?: SortOrder
    success?: SortOrder
    reason?: SortOrder
    userAgent?: SortOrder
    timestamp?: SortOrder
  }

  export type LoginAttemptMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    ip?: SortOrder
    deviceId?: SortOrder
    deviceName?: SortOrder
    success?: SortOrder
    reason?: SortOrder
    userAgent?: SortOrder
    timestamp?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
    isSet?: boolean
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
    isSet?: boolean
  }

  export type EmailVerificationLogCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    ip?: SortOrder
    deviceId?: SortOrder
    success?: SortOrder
    otpSentAt?: SortOrder
    verifiedAt?: SortOrder
    timestamp?: SortOrder
  }

  export type EmailVerificationLogMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    ip?: SortOrder
    deviceId?: SortOrder
    success?: SortOrder
    otpSentAt?: SortOrder
    verifiedAt?: SortOrder
    timestamp?: SortOrder
  }

  export type EmailVerificationLogMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    ip?: SortOrder
    deviceId?: SortOrder
    success?: SortOrder
    otpSentAt?: SortOrder
    verifiedAt?: SortOrder
    timestamp?: SortOrder
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
    isSet?: boolean
  }

  export type DeviceVerificationLogCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    deviceId?: SortOrder
    ip?: SortOrder
    action?: SortOrder
    deviceName?: SortOrder
    timestamp?: SortOrder
  }

  export type DeviceVerificationLogMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    deviceId?: SortOrder
    ip?: SortOrder
    action?: SortOrder
    deviceName?: SortOrder
    timestamp?: SortOrder
  }

  export type DeviceVerificationLogMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    deviceId?: SortOrder
    ip?: SortOrder
    action?: SortOrder
    deviceName?: SortOrder
    timestamp?: SortOrder
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type ApiRequestLogCountOrderByAggregateInput = {
    id?: SortOrder
    requestId?: SortOrder
    method?: SortOrder
    path?: SortOrder
    statusCode?: SortOrder
    duration?: SortOrder
    userId?: SortOrder
    ip?: SortOrder
    userAgent?: SortOrder
    timestamp?: SortOrder
  }

  export type ApiRequestLogAvgOrderByAggregateInput = {
    statusCode?: SortOrder
    duration?: SortOrder
  }

  export type ApiRequestLogMaxOrderByAggregateInput = {
    id?: SortOrder
    requestId?: SortOrder
    method?: SortOrder
    path?: SortOrder
    statusCode?: SortOrder
    duration?: SortOrder
    userId?: SortOrder
    ip?: SortOrder
    userAgent?: SortOrder
    timestamp?: SortOrder
  }

  export type ApiRequestLogMinOrderByAggregateInput = {
    id?: SortOrder
    requestId?: SortOrder
    method?: SortOrder
    path?: SortOrder
    statusCode?: SortOrder
    duration?: SortOrder
    userId?: SortOrder
    ip?: SortOrder
    userAgent?: SortOrder
    timestamp?: SortOrder
  }

  export type ApiRequestLogSumOrderByAggregateInput = {
    statusCode?: SortOrder
    duration?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
    unset?: boolean
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
    unset?: boolean
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
    isSet?: boolean
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
    isSet?: boolean
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
    isSet?: boolean
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
    isSet?: boolean
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
    isSet?: boolean
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use LoginAttemptDefaultArgs instead
     */
    export type LoginAttemptArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = LoginAttemptDefaultArgs<ExtArgs>
    /**
     * @deprecated Use EmailVerificationLogDefaultArgs instead
     */
    export type EmailVerificationLogArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = EmailVerificationLogDefaultArgs<ExtArgs>
    /**
     * @deprecated Use DeviceVerificationLogDefaultArgs instead
     */
    export type DeviceVerificationLogArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = DeviceVerificationLogDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ApiRequestLogDefaultArgs instead
     */
    export type ApiRequestLogArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ApiRequestLogDefaultArgs<ExtArgs>

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}