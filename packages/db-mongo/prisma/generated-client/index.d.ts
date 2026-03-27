
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
 * Model admins
 * 
 */
export type admins = $Result.DefaultSelection<Prisma.$adminsPayload>
/**
 * Model images
 * 
 */
export type images = $Result.DefaultSelection<Prisma.$imagesPayload>
/**
 * Model users
 * 
 */
export type users = $Result.DefaultSelection<Prisma.$usersPayload>
/**
 * Model discount_codes
 * 
 */
export type discount_codes = $Result.DefaultSelection<Prisma.$discount_codesPayload>
/**
 * Model coupon_usages
 * 
 */
export type coupon_usages = $Result.DefaultSelection<Prisma.$coupon_usagesPayload>
/**
 * Model sellers
 * 
 */
export type sellers = $Result.DefaultSelection<Prisma.$sellersPayload>
/**
 * Model staffs
 * 
 */
export type staffs = $Result.DefaultSelection<Prisma.$staffsPayload>
/**
 * Model stores
 * 
 */
export type stores = $Result.DefaultSelection<Prisma.$storesPayload>
/**
 * Model favorites
 * 
 */
export type favorites = $Result.DefaultSelection<Prisma.$favoritesPayload>
/**
 * Model site_config
 * 
 */
export type site_config = $Result.DefaultSelection<Prisma.$site_configPayload>
/**
 * Model products
 * 
 */
export type products = $Result.DefaultSelection<Prisma.$productsPayload>
/**
 * Model banners
 * 
 */
export type banners = $Result.DefaultSelection<Prisma.$bannersPayload>
/**
 * Model seller_events
 * 
 */
export type seller_events = $Result.DefaultSelection<Prisma.$seller_eventsPayload>
/**
 * Model SignupAccessCode
 * 
 */
export type SignupAccessCode = $Result.DefaultSelection<Prisma.$SignupAccessCodePayload>

/**
 * Enums
 */
export namespace $Enums {
  export const ImageType: {
  PRODUCT: 'PRODUCT',
  USER_AVATAR: 'USER_AVATAR',
  STORE_AVATAR: 'STORE_AVATAR'
};

export type ImageType = (typeof ImageType)[keyof typeof ImageType]


export const productStatus: {
  Active: 'Active',
  NonActive: 'NonActive'
};

export type productStatus = (typeof productStatus)[keyof typeof productStatus]


export const sellerEventType: {
  FREE_DELIVERY: 'FREE_DELIVERY',
  DISCOUNT: 'DISCOUNT',
  FLASH_SALE: 'FLASH_SALE'
};

export type sellerEventType = (typeof sellerEventType)[keyof typeof sellerEventType]

}

export type ImageType = $Enums.ImageType

export const ImageType: typeof $Enums.ImageType

export type productStatus = $Enums.productStatus

export const productStatus: typeof $Enums.productStatus

export type sellerEventType = $Enums.sellerEventType

export const sellerEventType: typeof $Enums.sellerEventType

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Admins
 * const admins = await prisma.admins.findMany()
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
   * // Fetch zero or more Admins
   * const admins = await prisma.admins.findMany()
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
   * `prisma.admins`: Exposes CRUD operations for the **admins** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Admins
    * const admins = await prisma.admins.findMany()
    * ```
    */
  get admins(): Prisma.adminsDelegate<ExtArgs>;

  /**
   * `prisma.images`: Exposes CRUD operations for the **images** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Images
    * const images = await prisma.images.findMany()
    * ```
    */
  get images(): Prisma.imagesDelegate<ExtArgs>;

  /**
   * `prisma.users`: Exposes CRUD operations for the **users** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.users.findMany()
    * ```
    */
  get users(): Prisma.usersDelegate<ExtArgs>;

  /**
   * `prisma.discount_codes`: Exposes CRUD operations for the **discount_codes** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Discount_codes
    * const discount_codes = await prisma.discount_codes.findMany()
    * ```
    */
  get discount_codes(): Prisma.discount_codesDelegate<ExtArgs>;

  /**
   * `prisma.coupon_usages`: Exposes CRUD operations for the **coupon_usages** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Coupon_usages
    * const coupon_usages = await prisma.coupon_usages.findMany()
    * ```
    */
  get coupon_usages(): Prisma.coupon_usagesDelegate<ExtArgs>;

  /**
   * `prisma.sellers`: Exposes CRUD operations for the **sellers** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Sellers
    * const sellers = await prisma.sellers.findMany()
    * ```
    */
  get sellers(): Prisma.sellersDelegate<ExtArgs>;

  /**
   * `prisma.staffs`: Exposes CRUD operations for the **staffs** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Staffs
    * const staffs = await prisma.staffs.findMany()
    * ```
    */
  get staffs(): Prisma.staffsDelegate<ExtArgs>;

  /**
   * `prisma.stores`: Exposes CRUD operations for the **stores** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Stores
    * const stores = await prisma.stores.findMany()
    * ```
    */
  get stores(): Prisma.storesDelegate<ExtArgs>;

  /**
   * `prisma.favorites`: Exposes CRUD operations for the **favorites** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Favorites
    * const favorites = await prisma.favorites.findMany()
    * ```
    */
  get favorites(): Prisma.favoritesDelegate<ExtArgs>;

  /**
   * `prisma.site_config`: Exposes CRUD operations for the **site_config** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Site_configs
    * const site_configs = await prisma.site_config.findMany()
    * ```
    */
  get site_config(): Prisma.site_configDelegate<ExtArgs>;

  /**
   * `prisma.products`: Exposes CRUD operations for the **products** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Products
    * const products = await prisma.products.findMany()
    * ```
    */
  get products(): Prisma.productsDelegate<ExtArgs>;

  /**
   * `prisma.banners`: Exposes CRUD operations for the **banners** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Banners
    * const banners = await prisma.banners.findMany()
    * ```
    */
  get banners(): Prisma.bannersDelegate<ExtArgs>;

  /**
   * `prisma.seller_events`: Exposes CRUD operations for the **seller_events** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Seller_events
    * const seller_events = await prisma.seller_events.findMany()
    * ```
    */
  get seller_events(): Prisma.seller_eventsDelegate<ExtArgs>;

  /**
   * `prisma.signupAccessCode`: Exposes CRUD operations for the **SignupAccessCode** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SignupAccessCodes
    * const signupAccessCodes = await prisma.signupAccessCode.findMany()
    * ```
    */
  get signupAccessCode(): Prisma.SignupAccessCodeDelegate<ExtArgs>;
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
    admins: 'admins',
    images: 'images',
    users: 'users',
    discount_codes: 'discount_codes',
    coupon_usages: 'coupon_usages',
    sellers: 'sellers',
    staffs: 'staffs',
    stores: 'stores',
    favorites: 'favorites',
    site_config: 'site_config',
    products: 'products',
    banners: 'banners',
    seller_events: 'seller_events',
    SignupAccessCode: 'SignupAccessCode'
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
      modelProps: "admins" | "images" | "users" | "discount_codes" | "coupon_usages" | "sellers" | "staffs" | "stores" | "favorites" | "site_config" | "products" | "banners" | "seller_events" | "signupAccessCode"
      txIsolationLevel: never
    }
    model: {
      admins: {
        payload: Prisma.$adminsPayload<ExtArgs>
        fields: Prisma.adminsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.adminsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$adminsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.adminsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$adminsPayload>
          }
          findFirst: {
            args: Prisma.adminsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$adminsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.adminsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$adminsPayload>
          }
          findMany: {
            args: Prisma.adminsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$adminsPayload>[]
          }
          create: {
            args: Prisma.adminsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$adminsPayload>
          }
          createMany: {
            args: Prisma.adminsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.adminsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$adminsPayload>
          }
          update: {
            args: Prisma.adminsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$adminsPayload>
          }
          deleteMany: {
            args: Prisma.adminsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.adminsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.adminsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$adminsPayload>
          }
          aggregate: {
            args: Prisma.AdminsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAdmins>
          }
          groupBy: {
            args: Prisma.adminsGroupByArgs<ExtArgs>
            result: $Utils.Optional<AdminsGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.adminsFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.adminsAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.adminsCountArgs<ExtArgs>
            result: $Utils.Optional<AdminsCountAggregateOutputType> | number
          }
        }
      }
      images: {
        payload: Prisma.$imagesPayload<ExtArgs>
        fields: Prisma.imagesFieldRefs
        operations: {
          findUnique: {
            args: Prisma.imagesFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$imagesPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.imagesFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$imagesPayload>
          }
          findFirst: {
            args: Prisma.imagesFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$imagesPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.imagesFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$imagesPayload>
          }
          findMany: {
            args: Prisma.imagesFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$imagesPayload>[]
          }
          create: {
            args: Prisma.imagesCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$imagesPayload>
          }
          createMany: {
            args: Prisma.imagesCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.imagesDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$imagesPayload>
          }
          update: {
            args: Prisma.imagesUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$imagesPayload>
          }
          deleteMany: {
            args: Prisma.imagesDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.imagesUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.imagesUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$imagesPayload>
          }
          aggregate: {
            args: Prisma.ImagesAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateImages>
          }
          groupBy: {
            args: Prisma.imagesGroupByArgs<ExtArgs>
            result: $Utils.Optional<ImagesGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.imagesFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.imagesAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.imagesCountArgs<ExtArgs>
            result: $Utils.Optional<ImagesCountAggregateOutputType> | number
          }
        }
      }
      users: {
        payload: Prisma.$usersPayload<ExtArgs>
        fields: Prisma.usersFieldRefs
        operations: {
          findUnique: {
            args: Prisma.usersFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usersPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.usersFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usersPayload>
          }
          findFirst: {
            args: Prisma.usersFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usersPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.usersFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usersPayload>
          }
          findMany: {
            args: Prisma.usersFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usersPayload>[]
          }
          create: {
            args: Prisma.usersCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usersPayload>
          }
          createMany: {
            args: Prisma.usersCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.usersDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usersPayload>
          }
          update: {
            args: Prisma.usersUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usersPayload>
          }
          deleteMany: {
            args: Prisma.usersDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.usersUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.usersUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usersPayload>
          }
          aggregate: {
            args: Prisma.UsersAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUsers>
          }
          groupBy: {
            args: Prisma.usersGroupByArgs<ExtArgs>
            result: $Utils.Optional<UsersGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.usersFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.usersAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.usersCountArgs<ExtArgs>
            result: $Utils.Optional<UsersCountAggregateOutputType> | number
          }
        }
      }
      discount_codes: {
        payload: Prisma.$discount_codesPayload<ExtArgs>
        fields: Prisma.discount_codesFieldRefs
        operations: {
          findUnique: {
            args: Prisma.discount_codesFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$discount_codesPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.discount_codesFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$discount_codesPayload>
          }
          findFirst: {
            args: Prisma.discount_codesFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$discount_codesPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.discount_codesFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$discount_codesPayload>
          }
          findMany: {
            args: Prisma.discount_codesFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$discount_codesPayload>[]
          }
          create: {
            args: Prisma.discount_codesCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$discount_codesPayload>
          }
          createMany: {
            args: Prisma.discount_codesCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.discount_codesDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$discount_codesPayload>
          }
          update: {
            args: Prisma.discount_codesUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$discount_codesPayload>
          }
          deleteMany: {
            args: Prisma.discount_codesDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.discount_codesUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.discount_codesUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$discount_codesPayload>
          }
          aggregate: {
            args: Prisma.Discount_codesAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDiscount_codes>
          }
          groupBy: {
            args: Prisma.discount_codesGroupByArgs<ExtArgs>
            result: $Utils.Optional<Discount_codesGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.discount_codesFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.discount_codesAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.discount_codesCountArgs<ExtArgs>
            result: $Utils.Optional<Discount_codesCountAggregateOutputType> | number
          }
        }
      }
      coupon_usages: {
        payload: Prisma.$coupon_usagesPayload<ExtArgs>
        fields: Prisma.coupon_usagesFieldRefs
        operations: {
          findUnique: {
            args: Prisma.coupon_usagesFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$coupon_usagesPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.coupon_usagesFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$coupon_usagesPayload>
          }
          findFirst: {
            args: Prisma.coupon_usagesFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$coupon_usagesPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.coupon_usagesFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$coupon_usagesPayload>
          }
          findMany: {
            args: Prisma.coupon_usagesFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$coupon_usagesPayload>[]
          }
          create: {
            args: Prisma.coupon_usagesCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$coupon_usagesPayload>
          }
          createMany: {
            args: Prisma.coupon_usagesCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.coupon_usagesDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$coupon_usagesPayload>
          }
          update: {
            args: Prisma.coupon_usagesUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$coupon_usagesPayload>
          }
          deleteMany: {
            args: Prisma.coupon_usagesDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.coupon_usagesUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.coupon_usagesUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$coupon_usagesPayload>
          }
          aggregate: {
            args: Prisma.Coupon_usagesAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCoupon_usages>
          }
          groupBy: {
            args: Prisma.coupon_usagesGroupByArgs<ExtArgs>
            result: $Utils.Optional<Coupon_usagesGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.coupon_usagesFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.coupon_usagesAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.coupon_usagesCountArgs<ExtArgs>
            result: $Utils.Optional<Coupon_usagesCountAggregateOutputType> | number
          }
        }
      }
      sellers: {
        payload: Prisma.$sellersPayload<ExtArgs>
        fields: Prisma.sellersFieldRefs
        operations: {
          findUnique: {
            args: Prisma.sellersFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$sellersPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.sellersFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$sellersPayload>
          }
          findFirst: {
            args: Prisma.sellersFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$sellersPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.sellersFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$sellersPayload>
          }
          findMany: {
            args: Prisma.sellersFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$sellersPayload>[]
          }
          create: {
            args: Prisma.sellersCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$sellersPayload>
          }
          createMany: {
            args: Prisma.sellersCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.sellersDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$sellersPayload>
          }
          update: {
            args: Prisma.sellersUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$sellersPayload>
          }
          deleteMany: {
            args: Prisma.sellersDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.sellersUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.sellersUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$sellersPayload>
          }
          aggregate: {
            args: Prisma.SellersAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSellers>
          }
          groupBy: {
            args: Prisma.sellersGroupByArgs<ExtArgs>
            result: $Utils.Optional<SellersGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.sellersFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.sellersAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.sellersCountArgs<ExtArgs>
            result: $Utils.Optional<SellersCountAggregateOutputType> | number
          }
        }
      }
      staffs: {
        payload: Prisma.$staffsPayload<ExtArgs>
        fields: Prisma.staffsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.staffsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$staffsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.staffsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$staffsPayload>
          }
          findFirst: {
            args: Prisma.staffsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$staffsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.staffsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$staffsPayload>
          }
          findMany: {
            args: Prisma.staffsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$staffsPayload>[]
          }
          create: {
            args: Prisma.staffsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$staffsPayload>
          }
          createMany: {
            args: Prisma.staffsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.staffsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$staffsPayload>
          }
          update: {
            args: Prisma.staffsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$staffsPayload>
          }
          deleteMany: {
            args: Prisma.staffsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.staffsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.staffsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$staffsPayload>
          }
          aggregate: {
            args: Prisma.StaffsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateStaffs>
          }
          groupBy: {
            args: Prisma.staffsGroupByArgs<ExtArgs>
            result: $Utils.Optional<StaffsGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.staffsFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.staffsAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.staffsCountArgs<ExtArgs>
            result: $Utils.Optional<StaffsCountAggregateOutputType> | number
          }
        }
      }
      stores: {
        payload: Prisma.$storesPayload<ExtArgs>
        fields: Prisma.storesFieldRefs
        operations: {
          findUnique: {
            args: Prisma.storesFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$storesPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.storesFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$storesPayload>
          }
          findFirst: {
            args: Prisma.storesFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$storesPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.storesFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$storesPayload>
          }
          findMany: {
            args: Prisma.storesFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$storesPayload>[]
          }
          create: {
            args: Prisma.storesCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$storesPayload>
          }
          createMany: {
            args: Prisma.storesCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.storesDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$storesPayload>
          }
          update: {
            args: Prisma.storesUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$storesPayload>
          }
          deleteMany: {
            args: Prisma.storesDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.storesUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.storesUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$storesPayload>
          }
          aggregate: {
            args: Prisma.StoresAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateStores>
          }
          groupBy: {
            args: Prisma.storesGroupByArgs<ExtArgs>
            result: $Utils.Optional<StoresGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.storesFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.storesAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.storesCountArgs<ExtArgs>
            result: $Utils.Optional<StoresCountAggregateOutputType> | number
          }
        }
      }
      favorites: {
        payload: Prisma.$favoritesPayload<ExtArgs>
        fields: Prisma.favoritesFieldRefs
        operations: {
          findUnique: {
            args: Prisma.favoritesFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$favoritesPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.favoritesFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$favoritesPayload>
          }
          findFirst: {
            args: Prisma.favoritesFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$favoritesPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.favoritesFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$favoritesPayload>
          }
          findMany: {
            args: Prisma.favoritesFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$favoritesPayload>[]
          }
          create: {
            args: Prisma.favoritesCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$favoritesPayload>
          }
          createMany: {
            args: Prisma.favoritesCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.favoritesDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$favoritesPayload>
          }
          update: {
            args: Prisma.favoritesUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$favoritesPayload>
          }
          deleteMany: {
            args: Prisma.favoritesDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.favoritesUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.favoritesUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$favoritesPayload>
          }
          aggregate: {
            args: Prisma.FavoritesAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateFavorites>
          }
          groupBy: {
            args: Prisma.favoritesGroupByArgs<ExtArgs>
            result: $Utils.Optional<FavoritesGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.favoritesFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.favoritesAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.favoritesCountArgs<ExtArgs>
            result: $Utils.Optional<FavoritesCountAggregateOutputType> | number
          }
        }
      }
      site_config: {
        payload: Prisma.$site_configPayload<ExtArgs>
        fields: Prisma.site_configFieldRefs
        operations: {
          findUnique: {
            args: Prisma.site_configFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$site_configPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.site_configFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$site_configPayload>
          }
          findFirst: {
            args: Prisma.site_configFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$site_configPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.site_configFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$site_configPayload>
          }
          findMany: {
            args: Prisma.site_configFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$site_configPayload>[]
          }
          create: {
            args: Prisma.site_configCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$site_configPayload>
          }
          createMany: {
            args: Prisma.site_configCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.site_configDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$site_configPayload>
          }
          update: {
            args: Prisma.site_configUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$site_configPayload>
          }
          deleteMany: {
            args: Prisma.site_configDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.site_configUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.site_configUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$site_configPayload>
          }
          aggregate: {
            args: Prisma.Site_configAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSite_config>
          }
          groupBy: {
            args: Prisma.site_configGroupByArgs<ExtArgs>
            result: $Utils.Optional<Site_configGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.site_configFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.site_configAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.site_configCountArgs<ExtArgs>
            result: $Utils.Optional<Site_configCountAggregateOutputType> | number
          }
        }
      }
      products: {
        payload: Prisma.$productsPayload<ExtArgs>
        fields: Prisma.productsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.productsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$productsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.productsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$productsPayload>
          }
          findFirst: {
            args: Prisma.productsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$productsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.productsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$productsPayload>
          }
          findMany: {
            args: Prisma.productsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$productsPayload>[]
          }
          create: {
            args: Prisma.productsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$productsPayload>
          }
          createMany: {
            args: Prisma.productsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.productsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$productsPayload>
          }
          update: {
            args: Prisma.productsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$productsPayload>
          }
          deleteMany: {
            args: Prisma.productsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.productsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.productsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$productsPayload>
          }
          aggregate: {
            args: Prisma.ProductsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProducts>
          }
          groupBy: {
            args: Prisma.productsGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProductsGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.productsFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.productsAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.productsCountArgs<ExtArgs>
            result: $Utils.Optional<ProductsCountAggregateOutputType> | number
          }
        }
      }
      banners: {
        payload: Prisma.$bannersPayload<ExtArgs>
        fields: Prisma.bannersFieldRefs
        operations: {
          findUnique: {
            args: Prisma.bannersFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$bannersPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.bannersFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$bannersPayload>
          }
          findFirst: {
            args: Prisma.bannersFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$bannersPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.bannersFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$bannersPayload>
          }
          findMany: {
            args: Prisma.bannersFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$bannersPayload>[]
          }
          create: {
            args: Prisma.bannersCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$bannersPayload>
          }
          createMany: {
            args: Prisma.bannersCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.bannersDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$bannersPayload>
          }
          update: {
            args: Prisma.bannersUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$bannersPayload>
          }
          deleteMany: {
            args: Prisma.bannersDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.bannersUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.bannersUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$bannersPayload>
          }
          aggregate: {
            args: Prisma.BannersAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateBanners>
          }
          groupBy: {
            args: Prisma.bannersGroupByArgs<ExtArgs>
            result: $Utils.Optional<BannersGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.bannersFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.bannersAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.bannersCountArgs<ExtArgs>
            result: $Utils.Optional<BannersCountAggregateOutputType> | number
          }
        }
      }
      seller_events: {
        payload: Prisma.$seller_eventsPayload<ExtArgs>
        fields: Prisma.seller_eventsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.seller_eventsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$seller_eventsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.seller_eventsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$seller_eventsPayload>
          }
          findFirst: {
            args: Prisma.seller_eventsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$seller_eventsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.seller_eventsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$seller_eventsPayload>
          }
          findMany: {
            args: Prisma.seller_eventsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$seller_eventsPayload>[]
          }
          create: {
            args: Prisma.seller_eventsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$seller_eventsPayload>
          }
          createMany: {
            args: Prisma.seller_eventsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.seller_eventsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$seller_eventsPayload>
          }
          update: {
            args: Prisma.seller_eventsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$seller_eventsPayload>
          }
          deleteMany: {
            args: Prisma.seller_eventsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.seller_eventsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.seller_eventsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$seller_eventsPayload>
          }
          aggregate: {
            args: Prisma.Seller_eventsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSeller_events>
          }
          groupBy: {
            args: Prisma.seller_eventsGroupByArgs<ExtArgs>
            result: $Utils.Optional<Seller_eventsGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.seller_eventsFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.seller_eventsAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.seller_eventsCountArgs<ExtArgs>
            result: $Utils.Optional<Seller_eventsCountAggregateOutputType> | number
          }
        }
      }
      SignupAccessCode: {
        payload: Prisma.$SignupAccessCodePayload<ExtArgs>
        fields: Prisma.SignupAccessCodeFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SignupAccessCodeFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignupAccessCodePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SignupAccessCodeFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignupAccessCodePayload>
          }
          findFirst: {
            args: Prisma.SignupAccessCodeFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignupAccessCodePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SignupAccessCodeFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignupAccessCodePayload>
          }
          findMany: {
            args: Prisma.SignupAccessCodeFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignupAccessCodePayload>[]
          }
          create: {
            args: Prisma.SignupAccessCodeCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignupAccessCodePayload>
          }
          createMany: {
            args: Prisma.SignupAccessCodeCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.SignupAccessCodeDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignupAccessCodePayload>
          }
          update: {
            args: Prisma.SignupAccessCodeUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignupAccessCodePayload>
          }
          deleteMany: {
            args: Prisma.SignupAccessCodeDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SignupAccessCodeUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.SignupAccessCodeUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignupAccessCodePayload>
          }
          aggregate: {
            args: Prisma.SignupAccessCodeAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSignupAccessCode>
          }
          groupBy: {
            args: Prisma.SignupAccessCodeGroupByArgs<ExtArgs>
            result: $Utils.Optional<SignupAccessCodeGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.SignupAccessCodeFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.SignupAccessCodeAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.SignupAccessCodeCountArgs<ExtArgs>
            result: $Utils.Optional<SignupAccessCodeCountAggregateOutputType> | number
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
   * Count Type AdminsCountOutputType
   */

  export type AdminsCountOutputType = {
    products: number
    coupons: number
    banners: number
  }

  export type AdminsCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    products?: boolean | AdminsCountOutputTypeCountProductsArgs
    coupons?: boolean | AdminsCountOutputTypeCountCouponsArgs
    banners?: boolean | AdminsCountOutputTypeCountBannersArgs
  }

  // Custom InputTypes
  /**
   * AdminsCountOutputType without action
   */
  export type AdminsCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminsCountOutputType
     */
    select?: AdminsCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * AdminsCountOutputType without action
   */
  export type AdminsCountOutputTypeCountProductsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: productsWhereInput
  }

  /**
   * AdminsCountOutputType without action
   */
  export type AdminsCountOutputTypeCountCouponsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: discount_codesWhereInput
  }

  /**
   * AdminsCountOutputType without action
   */
  export type AdminsCountOutputTypeCountBannersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: bannersWhereInput
  }


  /**
   * Count Type ImagesCountOutputType
   */

  export type ImagesCountOutputType = {
    users: number
    stores: number
  }

  export type ImagesCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    users?: boolean | ImagesCountOutputTypeCountUsersArgs
    stores?: boolean | ImagesCountOutputTypeCountStoresArgs
  }

  // Custom InputTypes
  /**
   * ImagesCountOutputType without action
   */
  export type ImagesCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ImagesCountOutputType
     */
    select?: ImagesCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ImagesCountOutputType without action
   */
  export type ImagesCountOutputTypeCountUsersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: usersWhereInput
  }

  /**
   * ImagesCountOutputType without action
   */
  export type ImagesCountOutputTypeCountStoresArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: storesWhereInput
  }


  /**
   * Count Type UsersCountOutputType
   */

  export type UsersCountOutputType = {
    favorites: number
  }

  export type UsersCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    favorites?: boolean | UsersCountOutputTypeCountFavoritesArgs
  }

  // Custom InputTypes
  /**
   * UsersCountOutputType without action
   */
  export type UsersCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsersCountOutputType
     */
    select?: UsersCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UsersCountOutputType without action
   */
  export type UsersCountOutputTypeCountFavoritesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: favoritesWhereInput
  }


  /**
   * Count Type Discount_codesCountOutputType
   */

  export type Discount_codesCountOutputType = {
    usages: number
  }

  export type Discount_codesCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    usages?: boolean | Discount_codesCountOutputTypeCountUsagesArgs
  }

  // Custom InputTypes
  /**
   * Discount_codesCountOutputType without action
   */
  export type Discount_codesCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Discount_codesCountOutputType
     */
    select?: Discount_codesCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * Discount_codesCountOutputType without action
   */
  export type Discount_codesCountOutputTypeCountUsagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: coupon_usagesWhereInput
  }


  /**
   * Count Type SellersCountOutputType
   */

  export type SellersCountOutputType = {
    banners: number
    events: number
    coupons: number
    staffs: number
  }

  export type SellersCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    banners?: boolean | SellersCountOutputTypeCountBannersArgs
    events?: boolean | SellersCountOutputTypeCountEventsArgs
    coupons?: boolean | SellersCountOutputTypeCountCouponsArgs
    staffs?: boolean | SellersCountOutputTypeCountStaffsArgs
  }

  // Custom InputTypes
  /**
   * SellersCountOutputType without action
   */
  export type SellersCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SellersCountOutputType
     */
    select?: SellersCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * SellersCountOutputType without action
   */
  export type SellersCountOutputTypeCountBannersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: bannersWhereInput
  }

  /**
   * SellersCountOutputType without action
   */
  export type SellersCountOutputTypeCountEventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: seller_eventsWhereInput
  }

  /**
   * SellersCountOutputType without action
   */
  export type SellersCountOutputTypeCountCouponsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: discount_codesWhereInput
  }

  /**
   * SellersCountOutputType without action
   */
  export type SellersCountOutputTypeCountStaffsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: staffsWhereInput
  }


  /**
   * Count Type StoresCountOutputType
   */

  export type StoresCountOutputType = {
    products: number
  }

  export type StoresCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    products?: boolean | StoresCountOutputTypeCountProductsArgs
  }

  // Custom InputTypes
  /**
   * StoresCountOutputType without action
   */
  export type StoresCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StoresCountOutputType
     */
    select?: StoresCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * StoresCountOutputType without action
   */
  export type StoresCountOutputTypeCountProductsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: productsWhereInput
  }


  /**
   * Count Type ProductsCountOutputType
   */

  export type ProductsCountOutputType = {
    images: number
    favorites: number
    storeVariants: number
  }

  export type ProductsCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    images?: boolean | ProductsCountOutputTypeCountImagesArgs
    favorites?: boolean | ProductsCountOutputTypeCountFavoritesArgs
    storeVariants?: boolean | ProductsCountOutputTypeCountStoreVariantsArgs
  }

  // Custom InputTypes
  /**
   * ProductsCountOutputType without action
   */
  export type ProductsCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductsCountOutputType
     */
    select?: ProductsCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ProductsCountOutputType without action
   */
  export type ProductsCountOutputTypeCountImagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: imagesWhereInput
  }

  /**
   * ProductsCountOutputType without action
   */
  export type ProductsCountOutputTypeCountFavoritesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: favoritesWhereInput
  }

  /**
   * ProductsCountOutputType without action
   */
  export type ProductsCountOutputTypeCountStoreVariantsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: productsWhereInput
  }


  /**
   * Models
   */

  /**
   * Model admins
   */

  export type AggregateAdmins = {
    _count: AdminsCountAggregateOutputType | null
    _min: AdminsMinAggregateOutputType | null
    _max: AdminsMaxAggregateOutputType | null
  }

  export type AdminsMinAggregateOutputType = {
    id: string | null
    name: string | null
    email: string | null
    password: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AdminsMaxAggregateOutputType = {
    id: string | null
    name: string | null
    email: string | null
    password: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AdminsCountAggregateOutputType = {
    id: number
    name: number
    email: number
    password: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type AdminsMinAggregateInputType = {
    id?: true
    name?: true
    email?: true
    password?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AdminsMaxAggregateInputType = {
    id?: true
    name?: true
    email?: true
    password?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AdminsCountAggregateInputType = {
    id?: true
    name?: true
    email?: true
    password?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type AdminsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which admins to aggregate.
     */
    where?: adminsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of admins to fetch.
     */
    orderBy?: adminsOrderByWithRelationInput | adminsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: adminsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` admins from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` admins.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned admins
    **/
    _count?: true | AdminsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AdminsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AdminsMaxAggregateInputType
  }

  export type GetAdminsAggregateType<T extends AdminsAggregateArgs> = {
        [P in keyof T & keyof AggregateAdmins]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAdmins[P]>
      : GetScalarType<T[P], AggregateAdmins[P]>
  }




  export type adminsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: adminsWhereInput
    orderBy?: adminsOrderByWithAggregationInput | adminsOrderByWithAggregationInput[]
    by: AdminsScalarFieldEnum[] | AdminsScalarFieldEnum
    having?: adminsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AdminsCountAggregateInputType | true
    _min?: AdminsMinAggregateInputType
    _max?: AdminsMaxAggregateInputType
  }

  export type AdminsGroupByOutputType = {
    id: string
    name: string
    email: string
    password: string
    createdAt: Date
    updatedAt: Date
    _count: AdminsCountAggregateOutputType | null
    _min: AdminsMinAggregateOutputType | null
    _max: AdminsMaxAggregateOutputType | null
  }

  type GetAdminsGroupByPayload<T extends adminsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AdminsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AdminsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AdminsGroupByOutputType[P]>
            : GetScalarType<T[P], AdminsGroupByOutputType[P]>
        }
      >
    >


  export type adminsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    password?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    products?: boolean | admins$productsArgs<ExtArgs>
    coupons?: boolean | admins$couponsArgs<ExtArgs>
    banners?: boolean | admins$bannersArgs<ExtArgs>
    _count?: boolean | AdminsCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["admins"]>


  export type adminsSelectScalar = {
    id?: boolean
    name?: boolean
    email?: boolean
    password?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type adminsInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    products?: boolean | admins$productsArgs<ExtArgs>
    coupons?: boolean | admins$couponsArgs<ExtArgs>
    banners?: boolean | admins$bannersArgs<ExtArgs>
    _count?: boolean | AdminsCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $adminsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "admins"
    objects: {
      products: Prisma.$productsPayload<ExtArgs>[]
      coupons: Prisma.$discount_codesPayload<ExtArgs>[]
      banners: Prisma.$bannersPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      email: string
      password: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["admins"]>
    composites: {}
  }

  type adminsGetPayload<S extends boolean | null | undefined | adminsDefaultArgs> = $Result.GetResult<Prisma.$adminsPayload, S>

  type adminsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<adminsFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: AdminsCountAggregateInputType | true
    }

  export interface adminsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['admins'], meta: { name: 'admins' } }
    /**
     * Find zero or one Admins that matches the filter.
     * @param {adminsFindUniqueArgs} args - Arguments to find a Admins
     * @example
     * // Get one Admins
     * const admins = await prisma.admins.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends adminsFindUniqueArgs>(args: SelectSubset<T, adminsFindUniqueArgs<ExtArgs>>): Prisma__adminsClient<$Result.GetResult<Prisma.$adminsPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Admins that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {adminsFindUniqueOrThrowArgs} args - Arguments to find a Admins
     * @example
     * // Get one Admins
     * const admins = await prisma.admins.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends adminsFindUniqueOrThrowArgs>(args: SelectSubset<T, adminsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__adminsClient<$Result.GetResult<Prisma.$adminsPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Admins that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {adminsFindFirstArgs} args - Arguments to find a Admins
     * @example
     * // Get one Admins
     * const admins = await prisma.admins.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends adminsFindFirstArgs>(args?: SelectSubset<T, adminsFindFirstArgs<ExtArgs>>): Prisma__adminsClient<$Result.GetResult<Prisma.$adminsPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Admins that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {adminsFindFirstOrThrowArgs} args - Arguments to find a Admins
     * @example
     * // Get one Admins
     * const admins = await prisma.admins.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends adminsFindFirstOrThrowArgs>(args?: SelectSubset<T, adminsFindFirstOrThrowArgs<ExtArgs>>): Prisma__adminsClient<$Result.GetResult<Prisma.$adminsPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Admins that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {adminsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Admins
     * const admins = await prisma.admins.findMany()
     * 
     * // Get first 10 Admins
     * const admins = await prisma.admins.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const adminsWithIdOnly = await prisma.admins.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends adminsFindManyArgs>(args?: SelectSubset<T, adminsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$adminsPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Admins.
     * @param {adminsCreateArgs} args - Arguments to create a Admins.
     * @example
     * // Create one Admins
     * const Admins = await prisma.admins.create({
     *   data: {
     *     // ... data to create a Admins
     *   }
     * })
     * 
     */
    create<T extends adminsCreateArgs>(args: SelectSubset<T, adminsCreateArgs<ExtArgs>>): Prisma__adminsClient<$Result.GetResult<Prisma.$adminsPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Admins.
     * @param {adminsCreateManyArgs} args - Arguments to create many Admins.
     * @example
     * // Create many Admins
     * const admins = await prisma.admins.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends adminsCreateManyArgs>(args?: SelectSubset<T, adminsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Admins.
     * @param {adminsDeleteArgs} args - Arguments to delete one Admins.
     * @example
     * // Delete one Admins
     * const Admins = await prisma.admins.delete({
     *   where: {
     *     // ... filter to delete one Admins
     *   }
     * })
     * 
     */
    delete<T extends adminsDeleteArgs>(args: SelectSubset<T, adminsDeleteArgs<ExtArgs>>): Prisma__adminsClient<$Result.GetResult<Prisma.$adminsPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Admins.
     * @param {adminsUpdateArgs} args - Arguments to update one Admins.
     * @example
     * // Update one Admins
     * const admins = await prisma.admins.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends adminsUpdateArgs>(args: SelectSubset<T, adminsUpdateArgs<ExtArgs>>): Prisma__adminsClient<$Result.GetResult<Prisma.$adminsPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Admins.
     * @param {adminsDeleteManyArgs} args - Arguments to filter Admins to delete.
     * @example
     * // Delete a few Admins
     * const { count } = await prisma.admins.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends adminsDeleteManyArgs>(args?: SelectSubset<T, adminsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Admins.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {adminsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Admins
     * const admins = await prisma.admins.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends adminsUpdateManyArgs>(args: SelectSubset<T, adminsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Admins.
     * @param {adminsUpsertArgs} args - Arguments to update or create a Admins.
     * @example
     * // Update or create a Admins
     * const admins = await prisma.admins.upsert({
     *   create: {
     *     // ... data to create a Admins
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Admins we want to update
     *   }
     * })
     */
    upsert<T extends adminsUpsertArgs>(args: SelectSubset<T, adminsUpsertArgs<ExtArgs>>): Prisma__adminsClient<$Result.GetResult<Prisma.$adminsPayload<ExtArgs>, T, "upsert">, never, ExtArgs>

    /**
     * Find zero or more Admins that matches the filter.
     * @param {adminsFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const admins = await prisma.admins.findRaw({
     *   filter: { age: { $gt: 25 } } 
     * })
     */
    findRaw(args?: adminsFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a Admins.
     * @param {adminsAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const admins = await prisma.admins.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: adminsAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of Admins.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {adminsCountArgs} args - Arguments to filter Admins to count.
     * @example
     * // Count the number of Admins
     * const count = await prisma.admins.count({
     *   where: {
     *     // ... the filter for the Admins we want to count
     *   }
     * })
    **/
    count<T extends adminsCountArgs>(
      args?: Subset<T, adminsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AdminsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Admins.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdminsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends AdminsAggregateArgs>(args: Subset<T, AdminsAggregateArgs>): Prisma.PrismaPromise<GetAdminsAggregateType<T>>

    /**
     * Group by Admins.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {adminsGroupByArgs} args - Group by arguments.
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
      T extends adminsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: adminsGroupByArgs['orderBy'] }
        : { orderBy?: adminsGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, adminsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAdminsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the admins model
   */
  readonly fields: adminsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for admins.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__adminsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    products<T extends admins$productsArgs<ExtArgs> = {}>(args?: Subset<T, admins$productsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$productsPayload<ExtArgs>, T, "findMany"> | Null>
    coupons<T extends admins$couponsArgs<ExtArgs> = {}>(args?: Subset<T, admins$couponsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$discount_codesPayload<ExtArgs>, T, "findMany"> | Null>
    banners<T extends admins$bannersArgs<ExtArgs> = {}>(args?: Subset<T, admins$bannersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$bannersPayload<ExtArgs>, T, "findMany"> | Null>
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
   * Fields of the admins model
   */ 
  interface adminsFieldRefs {
    readonly id: FieldRef<"admins", 'String'>
    readonly name: FieldRef<"admins", 'String'>
    readonly email: FieldRef<"admins", 'String'>
    readonly password: FieldRef<"admins", 'String'>
    readonly createdAt: FieldRef<"admins", 'DateTime'>
    readonly updatedAt: FieldRef<"admins", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * admins findUnique
   */
  export type adminsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the admins
     */
    select?: adminsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: adminsInclude<ExtArgs> | null
    /**
     * Filter, which admins to fetch.
     */
    where: adminsWhereUniqueInput
  }

  /**
   * admins findUniqueOrThrow
   */
  export type adminsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the admins
     */
    select?: adminsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: adminsInclude<ExtArgs> | null
    /**
     * Filter, which admins to fetch.
     */
    where: adminsWhereUniqueInput
  }

  /**
   * admins findFirst
   */
  export type adminsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the admins
     */
    select?: adminsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: adminsInclude<ExtArgs> | null
    /**
     * Filter, which admins to fetch.
     */
    where?: adminsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of admins to fetch.
     */
    orderBy?: adminsOrderByWithRelationInput | adminsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for admins.
     */
    cursor?: adminsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` admins from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` admins.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of admins.
     */
    distinct?: AdminsScalarFieldEnum | AdminsScalarFieldEnum[]
  }

  /**
   * admins findFirstOrThrow
   */
  export type adminsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the admins
     */
    select?: adminsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: adminsInclude<ExtArgs> | null
    /**
     * Filter, which admins to fetch.
     */
    where?: adminsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of admins to fetch.
     */
    orderBy?: adminsOrderByWithRelationInput | adminsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for admins.
     */
    cursor?: adminsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` admins from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` admins.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of admins.
     */
    distinct?: AdminsScalarFieldEnum | AdminsScalarFieldEnum[]
  }

  /**
   * admins findMany
   */
  export type adminsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the admins
     */
    select?: adminsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: adminsInclude<ExtArgs> | null
    /**
     * Filter, which admins to fetch.
     */
    where?: adminsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of admins to fetch.
     */
    orderBy?: adminsOrderByWithRelationInput | adminsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing admins.
     */
    cursor?: adminsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` admins from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` admins.
     */
    skip?: number
    distinct?: AdminsScalarFieldEnum | AdminsScalarFieldEnum[]
  }

  /**
   * admins create
   */
  export type adminsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the admins
     */
    select?: adminsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: adminsInclude<ExtArgs> | null
    /**
     * The data needed to create a admins.
     */
    data: XOR<adminsCreateInput, adminsUncheckedCreateInput>
  }

  /**
   * admins createMany
   */
  export type adminsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many admins.
     */
    data: adminsCreateManyInput | adminsCreateManyInput[]
  }

  /**
   * admins update
   */
  export type adminsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the admins
     */
    select?: adminsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: adminsInclude<ExtArgs> | null
    /**
     * The data needed to update a admins.
     */
    data: XOR<adminsUpdateInput, adminsUncheckedUpdateInput>
    /**
     * Choose, which admins to update.
     */
    where: adminsWhereUniqueInput
  }

  /**
   * admins updateMany
   */
  export type adminsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update admins.
     */
    data: XOR<adminsUpdateManyMutationInput, adminsUncheckedUpdateManyInput>
    /**
     * Filter which admins to update
     */
    where?: adminsWhereInput
  }

  /**
   * admins upsert
   */
  export type adminsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the admins
     */
    select?: adminsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: adminsInclude<ExtArgs> | null
    /**
     * The filter to search for the admins to update in case it exists.
     */
    where: adminsWhereUniqueInput
    /**
     * In case the admins found by the `where` argument doesn't exist, create a new admins with this data.
     */
    create: XOR<adminsCreateInput, adminsUncheckedCreateInput>
    /**
     * In case the admins was found with the provided `where` argument, update it with this data.
     */
    update: XOR<adminsUpdateInput, adminsUncheckedUpdateInput>
  }

  /**
   * admins delete
   */
  export type adminsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the admins
     */
    select?: adminsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: adminsInclude<ExtArgs> | null
    /**
     * Filter which admins to delete.
     */
    where: adminsWhereUniqueInput
  }

  /**
   * admins deleteMany
   */
  export type adminsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which admins to delete
     */
    where?: adminsWhereInput
  }

  /**
   * admins findRaw
   */
  export type adminsFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
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
   * admins aggregateRaw
   */
  export type adminsAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
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
   * admins.products
   */
  export type admins$productsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the products
     */
    select?: productsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: productsInclude<ExtArgs> | null
    where?: productsWhereInput
    orderBy?: productsOrderByWithRelationInput | productsOrderByWithRelationInput[]
    cursor?: productsWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ProductsScalarFieldEnum | ProductsScalarFieldEnum[]
  }

  /**
   * admins.coupons
   */
  export type admins$couponsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the discount_codes
     */
    select?: discount_codesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: discount_codesInclude<ExtArgs> | null
    where?: discount_codesWhereInput
    orderBy?: discount_codesOrderByWithRelationInput | discount_codesOrderByWithRelationInput[]
    cursor?: discount_codesWhereUniqueInput
    take?: number
    skip?: number
    distinct?: Discount_codesScalarFieldEnum | Discount_codesScalarFieldEnum[]
  }

  /**
   * admins.banners
   */
  export type admins$bannersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the banners
     */
    select?: bannersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: bannersInclude<ExtArgs> | null
    where?: bannersWhereInput
    orderBy?: bannersOrderByWithRelationInput | bannersOrderByWithRelationInput[]
    cursor?: bannersWhereUniqueInput
    take?: number
    skip?: number
    distinct?: BannersScalarFieldEnum | BannersScalarFieldEnum[]
  }

  /**
   * admins without action
   */
  export type adminsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the admins
     */
    select?: adminsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: adminsInclude<ExtArgs> | null
  }


  /**
   * Model images
   */

  export type AggregateImages = {
    _count: ImagesCountAggregateOutputType | null
    _min: ImagesMinAggregateOutputType | null
    _max: ImagesMaxAggregateOutputType | null
  }

  export type ImagesMinAggregateOutputType = {
    id: string | null
    file_id: string | null
    url: string | null
    type: $Enums.ImageType | null
    productId: string | null
    createdAt: Date | null
  }

  export type ImagesMaxAggregateOutputType = {
    id: string | null
    file_id: string | null
    url: string | null
    type: $Enums.ImageType | null
    productId: string | null
    createdAt: Date | null
  }

  export type ImagesCountAggregateOutputType = {
    id: number
    file_id: number
    url: number
    type: number
    productId: number
    createdAt: number
    _all: number
  }


  export type ImagesMinAggregateInputType = {
    id?: true
    file_id?: true
    url?: true
    type?: true
    productId?: true
    createdAt?: true
  }

  export type ImagesMaxAggregateInputType = {
    id?: true
    file_id?: true
    url?: true
    type?: true
    productId?: true
    createdAt?: true
  }

  export type ImagesCountAggregateInputType = {
    id?: true
    file_id?: true
    url?: true
    type?: true
    productId?: true
    createdAt?: true
    _all?: true
  }

  export type ImagesAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which images to aggregate.
     */
    where?: imagesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of images to fetch.
     */
    orderBy?: imagesOrderByWithRelationInput | imagesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: imagesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` images from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` images.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned images
    **/
    _count?: true | ImagesCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ImagesMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ImagesMaxAggregateInputType
  }

  export type GetImagesAggregateType<T extends ImagesAggregateArgs> = {
        [P in keyof T & keyof AggregateImages]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateImages[P]>
      : GetScalarType<T[P], AggregateImages[P]>
  }




  export type imagesGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: imagesWhereInput
    orderBy?: imagesOrderByWithAggregationInput | imagesOrderByWithAggregationInput[]
    by: ImagesScalarFieldEnum[] | ImagesScalarFieldEnum
    having?: imagesScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ImagesCountAggregateInputType | true
    _min?: ImagesMinAggregateInputType
    _max?: ImagesMaxAggregateInputType
  }

  export type ImagesGroupByOutputType = {
    id: string
    file_id: string
    url: string
    type: $Enums.ImageType
    productId: string | null
    createdAt: Date
    _count: ImagesCountAggregateOutputType | null
    _min: ImagesMinAggregateOutputType | null
    _max: ImagesMaxAggregateOutputType | null
  }

  type GetImagesGroupByPayload<T extends imagesGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ImagesGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ImagesGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ImagesGroupByOutputType[P]>
            : GetScalarType<T[P], ImagesGroupByOutputType[P]>
        }
      >
    >


  export type imagesSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    file_id?: boolean
    url?: boolean
    type?: boolean
    productId?: boolean
    createdAt?: boolean
    product?: boolean | images$productArgs<ExtArgs>
    users?: boolean | images$usersArgs<ExtArgs>
    stores?: boolean | images$storesArgs<ExtArgs>
    _count?: boolean | ImagesCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["images"]>


  export type imagesSelectScalar = {
    id?: boolean
    file_id?: boolean
    url?: boolean
    type?: boolean
    productId?: boolean
    createdAt?: boolean
  }

  export type imagesInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    product?: boolean | images$productArgs<ExtArgs>
    users?: boolean | images$usersArgs<ExtArgs>
    stores?: boolean | images$storesArgs<ExtArgs>
    _count?: boolean | ImagesCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $imagesPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "images"
    objects: {
      product: Prisma.$productsPayload<ExtArgs> | null
      users: Prisma.$usersPayload<ExtArgs>[]
      stores: Prisma.$storesPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      file_id: string
      url: string
      type: $Enums.ImageType
      productId: string | null
      createdAt: Date
    }, ExtArgs["result"]["images"]>
    composites: {}
  }

  type imagesGetPayload<S extends boolean | null | undefined | imagesDefaultArgs> = $Result.GetResult<Prisma.$imagesPayload, S>

  type imagesCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<imagesFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ImagesCountAggregateInputType | true
    }

  export interface imagesDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['images'], meta: { name: 'images' } }
    /**
     * Find zero or one Images that matches the filter.
     * @param {imagesFindUniqueArgs} args - Arguments to find a Images
     * @example
     * // Get one Images
     * const images = await prisma.images.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends imagesFindUniqueArgs>(args: SelectSubset<T, imagesFindUniqueArgs<ExtArgs>>): Prisma__imagesClient<$Result.GetResult<Prisma.$imagesPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Images that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {imagesFindUniqueOrThrowArgs} args - Arguments to find a Images
     * @example
     * // Get one Images
     * const images = await prisma.images.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends imagesFindUniqueOrThrowArgs>(args: SelectSubset<T, imagesFindUniqueOrThrowArgs<ExtArgs>>): Prisma__imagesClient<$Result.GetResult<Prisma.$imagesPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Images that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {imagesFindFirstArgs} args - Arguments to find a Images
     * @example
     * // Get one Images
     * const images = await prisma.images.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends imagesFindFirstArgs>(args?: SelectSubset<T, imagesFindFirstArgs<ExtArgs>>): Prisma__imagesClient<$Result.GetResult<Prisma.$imagesPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Images that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {imagesFindFirstOrThrowArgs} args - Arguments to find a Images
     * @example
     * // Get one Images
     * const images = await prisma.images.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends imagesFindFirstOrThrowArgs>(args?: SelectSubset<T, imagesFindFirstOrThrowArgs<ExtArgs>>): Prisma__imagesClient<$Result.GetResult<Prisma.$imagesPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Images that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {imagesFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Images
     * const images = await prisma.images.findMany()
     * 
     * // Get first 10 Images
     * const images = await prisma.images.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const imagesWithIdOnly = await prisma.images.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends imagesFindManyArgs>(args?: SelectSubset<T, imagesFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$imagesPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Images.
     * @param {imagesCreateArgs} args - Arguments to create a Images.
     * @example
     * // Create one Images
     * const Images = await prisma.images.create({
     *   data: {
     *     // ... data to create a Images
     *   }
     * })
     * 
     */
    create<T extends imagesCreateArgs>(args: SelectSubset<T, imagesCreateArgs<ExtArgs>>): Prisma__imagesClient<$Result.GetResult<Prisma.$imagesPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Images.
     * @param {imagesCreateManyArgs} args - Arguments to create many Images.
     * @example
     * // Create many Images
     * const images = await prisma.images.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends imagesCreateManyArgs>(args?: SelectSubset<T, imagesCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Images.
     * @param {imagesDeleteArgs} args - Arguments to delete one Images.
     * @example
     * // Delete one Images
     * const Images = await prisma.images.delete({
     *   where: {
     *     // ... filter to delete one Images
     *   }
     * })
     * 
     */
    delete<T extends imagesDeleteArgs>(args: SelectSubset<T, imagesDeleteArgs<ExtArgs>>): Prisma__imagesClient<$Result.GetResult<Prisma.$imagesPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Images.
     * @param {imagesUpdateArgs} args - Arguments to update one Images.
     * @example
     * // Update one Images
     * const images = await prisma.images.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends imagesUpdateArgs>(args: SelectSubset<T, imagesUpdateArgs<ExtArgs>>): Prisma__imagesClient<$Result.GetResult<Prisma.$imagesPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Images.
     * @param {imagesDeleteManyArgs} args - Arguments to filter Images to delete.
     * @example
     * // Delete a few Images
     * const { count } = await prisma.images.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends imagesDeleteManyArgs>(args?: SelectSubset<T, imagesDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Images.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {imagesUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Images
     * const images = await prisma.images.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends imagesUpdateManyArgs>(args: SelectSubset<T, imagesUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Images.
     * @param {imagesUpsertArgs} args - Arguments to update or create a Images.
     * @example
     * // Update or create a Images
     * const images = await prisma.images.upsert({
     *   create: {
     *     // ... data to create a Images
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Images we want to update
     *   }
     * })
     */
    upsert<T extends imagesUpsertArgs>(args: SelectSubset<T, imagesUpsertArgs<ExtArgs>>): Prisma__imagesClient<$Result.GetResult<Prisma.$imagesPayload<ExtArgs>, T, "upsert">, never, ExtArgs>

    /**
     * Find zero or more Images that matches the filter.
     * @param {imagesFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const images = await prisma.images.findRaw({
     *   filter: { age: { $gt: 25 } } 
     * })
     */
    findRaw(args?: imagesFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a Images.
     * @param {imagesAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const images = await prisma.images.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: imagesAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of Images.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {imagesCountArgs} args - Arguments to filter Images to count.
     * @example
     * // Count the number of Images
     * const count = await prisma.images.count({
     *   where: {
     *     // ... the filter for the Images we want to count
     *   }
     * })
    **/
    count<T extends imagesCountArgs>(
      args?: Subset<T, imagesCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ImagesCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Images.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ImagesAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ImagesAggregateArgs>(args: Subset<T, ImagesAggregateArgs>): Prisma.PrismaPromise<GetImagesAggregateType<T>>

    /**
     * Group by Images.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {imagesGroupByArgs} args - Group by arguments.
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
      T extends imagesGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: imagesGroupByArgs['orderBy'] }
        : { orderBy?: imagesGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, imagesGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetImagesGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the images model
   */
  readonly fields: imagesFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for images.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__imagesClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    product<T extends images$productArgs<ExtArgs> = {}>(args?: Subset<T, images$productArgs<ExtArgs>>): Prisma__productsClient<$Result.GetResult<Prisma.$productsPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    users<T extends images$usersArgs<ExtArgs> = {}>(args?: Subset<T, images$usersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "findMany"> | Null>
    stores<T extends images$storesArgs<ExtArgs> = {}>(args?: Subset<T, images$storesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$storesPayload<ExtArgs>, T, "findMany"> | Null>
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
   * Fields of the images model
   */ 
  interface imagesFieldRefs {
    readonly id: FieldRef<"images", 'String'>
    readonly file_id: FieldRef<"images", 'String'>
    readonly url: FieldRef<"images", 'String'>
    readonly type: FieldRef<"images", 'ImageType'>
    readonly productId: FieldRef<"images", 'String'>
    readonly createdAt: FieldRef<"images", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * images findUnique
   */
  export type imagesFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the images
     */
    select?: imagesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: imagesInclude<ExtArgs> | null
    /**
     * Filter, which images to fetch.
     */
    where: imagesWhereUniqueInput
  }

  /**
   * images findUniqueOrThrow
   */
  export type imagesFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the images
     */
    select?: imagesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: imagesInclude<ExtArgs> | null
    /**
     * Filter, which images to fetch.
     */
    where: imagesWhereUniqueInput
  }

  /**
   * images findFirst
   */
  export type imagesFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the images
     */
    select?: imagesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: imagesInclude<ExtArgs> | null
    /**
     * Filter, which images to fetch.
     */
    where?: imagesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of images to fetch.
     */
    orderBy?: imagesOrderByWithRelationInput | imagesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for images.
     */
    cursor?: imagesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` images from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` images.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of images.
     */
    distinct?: ImagesScalarFieldEnum | ImagesScalarFieldEnum[]
  }

  /**
   * images findFirstOrThrow
   */
  export type imagesFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the images
     */
    select?: imagesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: imagesInclude<ExtArgs> | null
    /**
     * Filter, which images to fetch.
     */
    where?: imagesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of images to fetch.
     */
    orderBy?: imagesOrderByWithRelationInput | imagesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for images.
     */
    cursor?: imagesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` images from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` images.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of images.
     */
    distinct?: ImagesScalarFieldEnum | ImagesScalarFieldEnum[]
  }

  /**
   * images findMany
   */
  export type imagesFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the images
     */
    select?: imagesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: imagesInclude<ExtArgs> | null
    /**
     * Filter, which images to fetch.
     */
    where?: imagesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of images to fetch.
     */
    orderBy?: imagesOrderByWithRelationInput | imagesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing images.
     */
    cursor?: imagesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` images from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` images.
     */
    skip?: number
    distinct?: ImagesScalarFieldEnum | ImagesScalarFieldEnum[]
  }

  /**
   * images create
   */
  export type imagesCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the images
     */
    select?: imagesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: imagesInclude<ExtArgs> | null
    /**
     * The data needed to create a images.
     */
    data: XOR<imagesCreateInput, imagesUncheckedCreateInput>
  }

  /**
   * images createMany
   */
  export type imagesCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many images.
     */
    data: imagesCreateManyInput | imagesCreateManyInput[]
  }

  /**
   * images update
   */
  export type imagesUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the images
     */
    select?: imagesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: imagesInclude<ExtArgs> | null
    /**
     * The data needed to update a images.
     */
    data: XOR<imagesUpdateInput, imagesUncheckedUpdateInput>
    /**
     * Choose, which images to update.
     */
    where: imagesWhereUniqueInput
  }

  /**
   * images updateMany
   */
  export type imagesUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update images.
     */
    data: XOR<imagesUpdateManyMutationInput, imagesUncheckedUpdateManyInput>
    /**
     * Filter which images to update
     */
    where?: imagesWhereInput
  }

  /**
   * images upsert
   */
  export type imagesUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the images
     */
    select?: imagesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: imagesInclude<ExtArgs> | null
    /**
     * The filter to search for the images to update in case it exists.
     */
    where: imagesWhereUniqueInput
    /**
     * In case the images found by the `where` argument doesn't exist, create a new images with this data.
     */
    create: XOR<imagesCreateInput, imagesUncheckedCreateInput>
    /**
     * In case the images was found with the provided `where` argument, update it with this data.
     */
    update: XOR<imagesUpdateInput, imagesUncheckedUpdateInput>
  }

  /**
   * images delete
   */
  export type imagesDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the images
     */
    select?: imagesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: imagesInclude<ExtArgs> | null
    /**
     * Filter which images to delete.
     */
    where: imagesWhereUniqueInput
  }

  /**
   * images deleteMany
   */
  export type imagesDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which images to delete
     */
    where?: imagesWhereInput
  }

  /**
   * images findRaw
   */
  export type imagesFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
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
   * images aggregateRaw
   */
  export type imagesAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
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
   * images.product
   */
  export type images$productArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the products
     */
    select?: productsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: productsInclude<ExtArgs> | null
    where?: productsWhereInput
  }

  /**
   * images.users
   */
  export type images$usersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: usersInclude<ExtArgs> | null
    where?: usersWhereInput
    orderBy?: usersOrderByWithRelationInput | usersOrderByWithRelationInput[]
    cursor?: usersWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UsersScalarFieldEnum | UsersScalarFieldEnum[]
  }

  /**
   * images.stores
   */
  export type images$storesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the stores
     */
    select?: storesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: storesInclude<ExtArgs> | null
    where?: storesWhereInput
    orderBy?: storesOrderByWithRelationInput | storesOrderByWithRelationInput[]
    cursor?: storesWhereUniqueInput
    take?: number
    skip?: number
    distinct?: StoresScalarFieldEnum | StoresScalarFieldEnum[]
  }

  /**
   * images without action
   */
  export type imagesDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the images
     */
    select?: imagesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: imagesInclude<ExtArgs> | null
  }


  /**
   * Model users
   */

  export type AggregateUsers = {
    _count: UsersCountAggregateOutputType | null
    _min: UsersMinAggregateOutputType | null
    _max: UsersMaxAggregateOutputType | null
  }

  export type UsersMinAggregateOutputType = {
    id: string | null
    phone_number: string | null
    email: string | null
    name: string | null
    avatarId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UsersMaxAggregateOutputType = {
    id: string | null
    phone_number: string | null
    email: string | null
    name: string | null
    avatarId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UsersCountAggregateOutputType = {
    id: number
    phone_number: number
    email: number
    name: number
    following: number
    addresses: number
    avatarId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UsersMinAggregateInputType = {
    id?: true
    phone_number?: true
    email?: true
    name?: true
    avatarId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UsersMaxAggregateInputType = {
    id?: true
    phone_number?: true
    email?: true
    name?: true
    avatarId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UsersCountAggregateInputType = {
    id?: true
    phone_number?: true
    email?: true
    name?: true
    following?: true
    addresses?: true
    avatarId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UsersAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which users to aggregate.
     */
    where?: usersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of users to fetch.
     */
    orderBy?: usersOrderByWithRelationInput | usersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: usersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned users
    **/
    _count?: true | UsersCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UsersMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UsersMaxAggregateInputType
  }

  export type GetUsersAggregateType<T extends UsersAggregateArgs> = {
        [P in keyof T & keyof AggregateUsers]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUsers[P]>
      : GetScalarType<T[P], AggregateUsers[P]>
  }




  export type usersGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: usersWhereInput
    orderBy?: usersOrderByWithAggregationInput | usersOrderByWithAggregationInput[]
    by: UsersScalarFieldEnum[] | UsersScalarFieldEnum
    having?: usersScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UsersCountAggregateInputType | true
    _min?: UsersMinAggregateInputType
    _max?: UsersMaxAggregateInputType
  }

  export type UsersGroupByOutputType = {
    id: string
    phone_number: string | null
    email: string | null
    name: string
    following: string[]
    addresses: JsonValue[]
    avatarId: string | null
    createdAt: Date
    updatedAt: Date
    _count: UsersCountAggregateOutputType | null
    _min: UsersMinAggregateOutputType | null
    _max: UsersMaxAggregateOutputType | null
  }

  type GetUsersGroupByPayload<T extends usersGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UsersGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UsersGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UsersGroupByOutputType[P]>
            : GetScalarType<T[P], UsersGroupByOutputType[P]>
        }
      >
    >


  export type usersSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    phone_number?: boolean
    email?: boolean
    name?: boolean
    following?: boolean
    addresses?: boolean
    avatarId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    avatar?: boolean | users$avatarArgs<ExtArgs>
    favorites?: boolean | users$favoritesArgs<ExtArgs>
    _count?: boolean | UsersCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["users"]>


  export type usersSelectScalar = {
    id?: boolean
    phone_number?: boolean
    email?: boolean
    name?: boolean
    following?: boolean
    addresses?: boolean
    avatarId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type usersInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    avatar?: boolean | users$avatarArgs<ExtArgs>
    favorites?: boolean | users$favoritesArgs<ExtArgs>
    _count?: boolean | UsersCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $usersPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "users"
    objects: {
      avatar: Prisma.$imagesPayload<ExtArgs> | null
      favorites: Prisma.$favoritesPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      phone_number: string | null
      email: string | null
      name: string
      following: string[]
      addresses: Prisma.JsonValue[]
      avatarId: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["users"]>
    composites: {}
  }

  type usersGetPayload<S extends boolean | null | undefined | usersDefaultArgs> = $Result.GetResult<Prisma.$usersPayload, S>

  type usersCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<usersFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: UsersCountAggregateInputType | true
    }

  export interface usersDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['users'], meta: { name: 'users' } }
    /**
     * Find zero or one Users that matches the filter.
     * @param {usersFindUniqueArgs} args - Arguments to find a Users
     * @example
     * // Get one Users
     * const users = await prisma.users.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends usersFindUniqueArgs>(args: SelectSubset<T, usersFindUniqueArgs<ExtArgs>>): Prisma__usersClient<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Users that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {usersFindUniqueOrThrowArgs} args - Arguments to find a Users
     * @example
     * // Get one Users
     * const users = await prisma.users.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends usersFindUniqueOrThrowArgs>(args: SelectSubset<T, usersFindUniqueOrThrowArgs<ExtArgs>>): Prisma__usersClient<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {usersFindFirstArgs} args - Arguments to find a Users
     * @example
     * // Get one Users
     * const users = await prisma.users.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends usersFindFirstArgs>(args?: SelectSubset<T, usersFindFirstArgs<ExtArgs>>): Prisma__usersClient<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Users that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {usersFindFirstOrThrowArgs} args - Arguments to find a Users
     * @example
     * // Get one Users
     * const users = await prisma.users.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends usersFindFirstOrThrowArgs>(args?: SelectSubset<T, usersFindFirstOrThrowArgs<ExtArgs>>): Prisma__usersClient<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {usersFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.users.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.users.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const usersWithIdOnly = await prisma.users.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends usersFindManyArgs>(args?: SelectSubset<T, usersFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Users.
     * @param {usersCreateArgs} args - Arguments to create a Users.
     * @example
     * // Create one Users
     * const Users = await prisma.users.create({
     *   data: {
     *     // ... data to create a Users
     *   }
     * })
     * 
     */
    create<T extends usersCreateArgs>(args: SelectSubset<T, usersCreateArgs<ExtArgs>>): Prisma__usersClient<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Users.
     * @param {usersCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const users = await prisma.users.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends usersCreateManyArgs>(args?: SelectSubset<T, usersCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Users.
     * @param {usersDeleteArgs} args - Arguments to delete one Users.
     * @example
     * // Delete one Users
     * const Users = await prisma.users.delete({
     *   where: {
     *     // ... filter to delete one Users
     *   }
     * })
     * 
     */
    delete<T extends usersDeleteArgs>(args: SelectSubset<T, usersDeleteArgs<ExtArgs>>): Prisma__usersClient<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Users.
     * @param {usersUpdateArgs} args - Arguments to update one Users.
     * @example
     * // Update one Users
     * const users = await prisma.users.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends usersUpdateArgs>(args: SelectSubset<T, usersUpdateArgs<ExtArgs>>): Prisma__usersClient<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Users.
     * @param {usersDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.users.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends usersDeleteManyArgs>(args?: SelectSubset<T, usersDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {usersUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const users = await prisma.users.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends usersUpdateManyArgs>(args: SelectSubset<T, usersUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Users.
     * @param {usersUpsertArgs} args - Arguments to update or create a Users.
     * @example
     * // Update or create a Users
     * const users = await prisma.users.upsert({
     *   create: {
     *     // ... data to create a Users
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Users we want to update
     *   }
     * })
     */
    upsert<T extends usersUpsertArgs>(args: SelectSubset<T, usersUpsertArgs<ExtArgs>>): Prisma__usersClient<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "upsert">, never, ExtArgs>

    /**
     * Find zero or more Users that matches the filter.
     * @param {usersFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const users = await prisma.users.findRaw({
     *   filter: { age: { $gt: 25 } } 
     * })
     */
    findRaw(args?: usersFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a Users.
     * @param {usersAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const users = await prisma.users.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: usersAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {usersCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.users.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends usersCountArgs>(
      args?: Subset<T, usersCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UsersCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsersAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends UsersAggregateArgs>(args: Subset<T, UsersAggregateArgs>): Prisma.PrismaPromise<GetUsersAggregateType<T>>

    /**
     * Group by Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {usersGroupByArgs} args - Group by arguments.
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
      T extends usersGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: usersGroupByArgs['orderBy'] }
        : { orderBy?: usersGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, usersGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUsersGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the users model
   */
  readonly fields: usersFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for users.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__usersClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    avatar<T extends users$avatarArgs<ExtArgs> = {}>(args?: Subset<T, users$avatarArgs<ExtArgs>>): Prisma__imagesClient<$Result.GetResult<Prisma.$imagesPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    favorites<T extends users$favoritesArgs<ExtArgs> = {}>(args?: Subset<T, users$favoritesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$favoritesPayload<ExtArgs>, T, "findMany"> | Null>
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
   * Fields of the users model
   */ 
  interface usersFieldRefs {
    readonly id: FieldRef<"users", 'String'>
    readonly phone_number: FieldRef<"users", 'String'>
    readonly email: FieldRef<"users", 'String'>
    readonly name: FieldRef<"users", 'String'>
    readonly following: FieldRef<"users", 'String[]'>
    readonly addresses: FieldRef<"users", 'Json[]'>
    readonly avatarId: FieldRef<"users", 'String'>
    readonly createdAt: FieldRef<"users", 'DateTime'>
    readonly updatedAt: FieldRef<"users", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * users findUnique
   */
  export type usersFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: usersInclude<ExtArgs> | null
    /**
     * Filter, which users to fetch.
     */
    where: usersWhereUniqueInput
  }

  /**
   * users findUniqueOrThrow
   */
  export type usersFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: usersInclude<ExtArgs> | null
    /**
     * Filter, which users to fetch.
     */
    where: usersWhereUniqueInput
  }

  /**
   * users findFirst
   */
  export type usersFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: usersInclude<ExtArgs> | null
    /**
     * Filter, which users to fetch.
     */
    where?: usersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of users to fetch.
     */
    orderBy?: usersOrderByWithRelationInput | usersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for users.
     */
    cursor?: usersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of users.
     */
    distinct?: UsersScalarFieldEnum | UsersScalarFieldEnum[]
  }

  /**
   * users findFirstOrThrow
   */
  export type usersFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: usersInclude<ExtArgs> | null
    /**
     * Filter, which users to fetch.
     */
    where?: usersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of users to fetch.
     */
    orderBy?: usersOrderByWithRelationInput | usersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for users.
     */
    cursor?: usersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of users.
     */
    distinct?: UsersScalarFieldEnum | UsersScalarFieldEnum[]
  }

  /**
   * users findMany
   */
  export type usersFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: usersInclude<ExtArgs> | null
    /**
     * Filter, which users to fetch.
     */
    where?: usersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of users to fetch.
     */
    orderBy?: usersOrderByWithRelationInput | usersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing users.
     */
    cursor?: usersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` users.
     */
    skip?: number
    distinct?: UsersScalarFieldEnum | UsersScalarFieldEnum[]
  }

  /**
   * users create
   */
  export type usersCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: usersInclude<ExtArgs> | null
    /**
     * The data needed to create a users.
     */
    data: XOR<usersCreateInput, usersUncheckedCreateInput>
  }

  /**
   * users createMany
   */
  export type usersCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many users.
     */
    data: usersCreateManyInput | usersCreateManyInput[]
  }

  /**
   * users update
   */
  export type usersUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: usersInclude<ExtArgs> | null
    /**
     * The data needed to update a users.
     */
    data: XOR<usersUpdateInput, usersUncheckedUpdateInput>
    /**
     * Choose, which users to update.
     */
    where: usersWhereUniqueInput
  }

  /**
   * users updateMany
   */
  export type usersUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update users.
     */
    data: XOR<usersUpdateManyMutationInput, usersUncheckedUpdateManyInput>
    /**
     * Filter which users to update
     */
    where?: usersWhereInput
  }

  /**
   * users upsert
   */
  export type usersUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: usersInclude<ExtArgs> | null
    /**
     * The filter to search for the users to update in case it exists.
     */
    where: usersWhereUniqueInput
    /**
     * In case the users found by the `where` argument doesn't exist, create a new users with this data.
     */
    create: XOR<usersCreateInput, usersUncheckedCreateInput>
    /**
     * In case the users was found with the provided `where` argument, update it with this data.
     */
    update: XOR<usersUpdateInput, usersUncheckedUpdateInput>
  }

  /**
   * users delete
   */
  export type usersDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: usersInclude<ExtArgs> | null
    /**
     * Filter which users to delete.
     */
    where: usersWhereUniqueInput
  }

  /**
   * users deleteMany
   */
  export type usersDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which users to delete
     */
    where?: usersWhereInput
  }

  /**
   * users findRaw
   */
  export type usersFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
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
   * users aggregateRaw
   */
  export type usersAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
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
   * users.avatar
   */
  export type users$avatarArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the images
     */
    select?: imagesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: imagesInclude<ExtArgs> | null
    where?: imagesWhereInput
  }

  /**
   * users.favorites
   */
  export type users$favoritesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the favorites
     */
    select?: favoritesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: favoritesInclude<ExtArgs> | null
    where?: favoritesWhereInput
    orderBy?: favoritesOrderByWithRelationInput | favoritesOrderByWithRelationInput[]
    cursor?: favoritesWhereUniqueInput
    take?: number
    skip?: number
    distinct?: FavoritesScalarFieldEnum | FavoritesScalarFieldEnum[]
  }

  /**
   * users without action
   */
  export type usersDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: usersInclude<ExtArgs> | null
  }


  /**
   * Model discount_codes
   */

  export type AggregateDiscount_codes = {
    _count: Discount_codesCountAggregateOutputType | null
    _avg: Discount_codesAvgAggregateOutputType | null
    _sum: Discount_codesSumAggregateOutputType | null
    _min: Discount_codesMinAggregateOutputType | null
    _max: Discount_codesMaxAggregateOutputType | null
  }

  export type Discount_codesAvgAggregateOutputType = {
    discountValue: number | null
    minOrderValue: number | null
    maxUses: number | null
    maxUsesPerUser: number | null
    usedCount: number | null
  }

  export type Discount_codesSumAggregateOutputType = {
    discountValue: number | null
    minOrderValue: number | null
    maxUses: number | null
    maxUsesPerUser: number | null
    usedCount: number | null
  }

  export type Discount_codesMinAggregateOutputType = {
    id: string | null
    public_name: string | null
    discountType: string | null
    discountValue: number | null
    minOrderValue: number | null
    discountCode: string | null
    expiresAt: Date | null
    maxUses: number | null
    maxUsesPerUser: number | null
    usedCount: number | null
    isActive: boolean | null
    isFirstOrder: boolean | null
    sellerId: string | null
    adminId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type Discount_codesMaxAggregateOutputType = {
    id: string | null
    public_name: string | null
    discountType: string | null
    discountValue: number | null
    minOrderValue: number | null
    discountCode: string | null
    expiresAt: Date | null
    maxUses: number | null
    maxUsesPerUser: number | null
    usedCount: number | null
    isActive: boolean | null
    isFirstOrder: boolean | null
    sellerId: string | null
    adminId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type Discount_codesCountAggregateOutputType = {
    id: number
    public_name: number
    discountType: number
    discountValue: number
    minOrderValue: number
    discountCode: number
    expiresAt: number
    maxUses: number
    maxUsesPerUser: number
    usedCount: number
    isActive: number
    isFirstOrder: number
    sellerId: number
    adminId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type Discount_codesAvgAggregateInputType = {
    discountValue?: true
    minOrderValue?: true
    maxUses?: true
    maxUsesPerUser?: true
    usedCount?: true
  }

  export type Discount_codesSumAggregateInputType = {
    discountValue?: true
    minOrderValue?: true
    maxUses?: true
    maxUsesPerUser?: true
    usedCount?: true
  }

  export type Discount_codesMinAggregateInputType = {
    id?: true
    public_name?: true
    discountType?: true
    discountValue?: true
    minOrderValue?: true
    discountCode?: true
    expiresAt?: true
    maxUses?: true
    maxUsesPerUser?: true
    usedCount?: true
    isActive?: true
    isFirstOrder?: true
    sellerId?: true
    adminId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type Discount_codesMaxAggregateInputType = {
    id?: true
    public_name?: true
    discountType?: true
    discountValue?: true
    minOrderValue?: true
    discountCode?: true
    expiresAt?: true
    maxUses?: true
    maxUsesPerUser?: true
    usedCount?: true
    isActive?: true
    isFirstOrder?: true
    sellerId?: true
    adminId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type Discount_codesCountAggregateInputType = {
    id?: true
    public_name?: true
    discountType?: true
    discountValue?: true
    minOrderValue?: true
    discountCode?: true
    expiresAt?: true
    maxUses?: true
    maxUsesPerUser?: true
    usedCount?: true
    isActive?: true
    isFirstOrder?: true
    sellerId?: true
    adminId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type Discount_codesAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which discount_codes to aggregate.
     */
    where?: discount_codesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of discount_codes to fetch.
     */
    orderBy?: discount_codesOrderByWithRelationInput | discount_codesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: discount_codesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` discount_codes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` discount_codes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned discount_codes
    **/
    _count?: true | Discount_codesCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Discount_codesAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Discount_codesSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Discount_codesMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Discount_codesMaxAggregateInputType
  }

  export type GetDiscount_codesAggregateType<T extends Discount_codesAggregateArgs> = {
        [P in keyof T & keyof AggregateDiscount_codes]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDiscount_codes[P]>
      : GetScalarType<T[P], AggregateDiscount_codes[P]>
  }




  export type discount_codesGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: discount_codesWhereInput
    orderBy?: discount_codesOrderByWithAggregationInput | discount_codesOrderByWithAggregationInput[]
    by: Discount_codesScalarFieldEnum[] | Discount_codesScalarFieldEnum
    having?: discount_codesScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Discount_codesCountAggregateInputType | true
    _avg?: Discount_codesAvgAggregateInputType
    _sum?: Discount_codesSumAggregateInputType
    _min?: Discount_codesMinAggregateInputType
    _max?: Discount_codesMaxAggregateInputType
  }

  export type Discount_codesGroupByOutputType = {
    id: string
    public_name: string
    discountType: string
    discountValue: number
    minOrderValue: number
    discountCode: string
    expiresAt: Date | null
    maxUses: number | null
    maxUsesPerUser: number
    usedCount: number
    isActive: boolean
    isFirstOrder: boolean
    sellerId: string | null
    adminId: string | null
    createdAt: Date
    updatedAt: Date
    _count: Discount_codesCountAggregateOutputType | null
    _avg: Discount_codesAvgAggregateOutputType | null
    _sum: Discount_codesSumAggregateOutputType | null
    _min: Discount_codesMinAggregateOutputType | null
    _max: Discount_codesMaxAggregateOutputType | null
  }

  type GetDiscount_codesGroupByPayload<T extends discount_codesGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Discount_codesGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Discount_codesGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Discount_codesGroupByOutputType[P]>
            : GetScalarType<T[P], Discount_codesGroupByOutputType[P]>
        }
      >
    >


  export type discount_codesSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    public_name?: boolean
    discountType?: boolean
    discountValue?: boolean
    minOrderValue?: boolean
    discountCode?: boolean
    expiresAt?: boolean
    maxUses?: boolean
    maxUsesPerUser?: boolean
    usedCount?: boolean
    isActive?: boolean
    isFirstOrder?: boolean
    sellerId?: boolean
    adminId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    seller?: boolean | discount_codes$sellerArgs<ExtArgs>
    admin?: boolean | discount_codes$adminArgs<ExtArgs>
    usages?: boolean | discount_codes$usagesArgs<ExtArgs>
    _count?: boolean | Discount_codesCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["discount_codes"]>


  export type discount_codesSelectScalar = {
    id?: boolean
    public_name?: boolean
    discountType?: boolean
    discountValue?: boolean
    minOrderValue?: boolean
    discountCode?: boolean
    expiresAt?: boolean
    maxUses?: boolean
    maxUsesPerUser?: boolean
    usedCount?: boolean
    isActive?: boolean
    isFirstOrder?: boolean
    sellerId?: boolean
    adminId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type discount_codesInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    seller?: boolean | discount_codes$sellerArgs<ExtArgs>
    admin?: boolean | discount_codes$adminArgs<ExtArgs>
    usages?: boolean | discount_codes$usagesArgs<ExtArgs>
    _count?: boolean | Discount_codesCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $discount_codesPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "discount_codes"
    objects: {
      seller: Prisma.$sellersPayload<ExtArgs> | null
      admin: Prisma.$adminsPayload<ExtArgs> | null
      usages: Prisma.$coupon_usagesPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      public_name: string
      discountType: string
      discountValue: number
      minOrderValue: number
      discountCode: string
      expiresAt: Date | null
      maxUses: number | null
      maxUsesPerUser: number
      usedCount: number
      isActive: boolean
      isFirstOrder: boolean
      sellerId: string | null
      adminId: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["discount_codes"]>
    composites: {}
  }

  type discount_codesGetPayload<S extends boolean | null | undefined | discount_codesDefaultArgs> = $Result.GetResult<Prisma.$discount_codesPayload, S>

  type discount_codesCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<discount_codesFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: Discount_codesCountAggregateInputType | true
    }

  export interface discount_codesDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['discount_codes'], meta: { name: 'discount_codes' } }
    /**
     * Find zero or one Discount_codes that matches the filter.
     * @param {discount_codesFindUniqueArgs} args - Arguments to find a Discount_codes
     * @example
     * // Get one Discount_codes
     * const discount_codes = await prisma.discount_codes.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends discount_codesFindUniqueArgs>(args: SelectSubset<T, discount_codesFindUniqueArgs<ExtArgs>>): Prisma__discount_codesClient<$Result.GetResult<Prisma.$discount_codesPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Discount_codes that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {discount_codesFindUniqueOrThrowArgs} args - Arguments to find a Discount_codes
     * @example
     * // Get one Discount_codes
     * const discount_codes = await prisma.discount_codes.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends discount_codesFindUniqueOrThrowArgs>(args: SelectSubset<T, discount_codesFindUniqueOrThrowArgs<ExtArgs>>): Prisma__discount_codesClient<$Result.GetResult<Prisma.$discount_codesPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Discount_codes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {discount_codesFindFirstArgs} args - Arguments to find a Discount_codes
     * @example
     * // Get one Discount_codes
     * const discount_codes = await prisma.discount_codes.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends discount_codesFindFirstArgs>(args?: SelectSubset<T, discount_codesFindFirstArgs<ExtArgs>>): Prisma__discount_codesClient<$Result.GetResult<Prisma.$discount_codesPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Discount_codes that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {discount_codesFindFirstOrThrowArgs} args - Arguments to find a Discount_codes
     * @example
     * // Get one Discount_codes
     * const discount_codes = await prisma.discount_codes.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends discount_codesFindFirstOrThrowArgs>(args?: SelectSubset<T, discount_codesFindFirstOrThrowArgs<ExtArgs>>): Prisma__discount_codesClient<$Result.GetResult<Prisma.$discount_codesPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Discount_codes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {discount_codesFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Discount_codes
     * const discount_codes = await prisma.discount_codes.findMany()
     * 
     * // Get first 10 Discount_codes
     * const discount_codes = await prisma.discount_codes.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const discount_codesWithIdOnly = await prisma.discount_codes.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends discount_codesFindManyArgs>(args?: SelectSubset<T, discount_codesFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$discount_codesPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Discount_codes.
     * @param {discount_codesCreateArgs} args - Arguments to create a Discount_codes.
     * @example
     * // Create one Discount_codes
     * const Discount_codes = await prisma.discount_codes.create({
     *   data: {
     *     // ... data to create a Discount_codes
     *   }
     * })
     * 
     */
    create<T extends discount_codesCreateArgs>(args: SelectSubset<T, discount_codesCreateArgs<ExtArgs>>): Prisma__discount_codesClient<$Result.GetResult<Prisma.$discount_codesPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Discount_codes.
     * @param {discount_codesCreateManyArgs} args - Arguments to create many Discount_codes.
     * @example
     * // Create many Discount_codes
     * const discount_codes = await prisma.discount_codes.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends discount_codesCreateManyArgs>(args?: SelectSubset<T, discount_codesCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Discount_codes.
     * @param {discount_codesDeleteArgs} args - Arguments to delete one Discount_codes.
     * @example
     * // Delete one Discount_codes
     * const Discount_codes = await prisma.discount_codes.delete({
     *   where: {
     *     // ... filter to delete one Discount_codes
     *   }
     * })
     * 
     */
    delete<T extends discount_codesDeleteArgs>(args: SelectSubset<T, discount_codesDeleteArgs<ExtArgs>>): Prisma__discount_codesClient<$Result.GetResult<Prisma.$discount_codesPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Discount_codes.
     * @param {discount_codesUpdateArgs} args - Arguments to update one Discount_codes.
     * @example
     * // Update one Discount_codes
     * const discount_codes = await prisma.discount_codes.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends discount_codesUpdateArgs>(args: SelectSubset<T, discount_codesUpdateArgs<ExtArgs>>): Prisma__discount_codesClient<$Result.GetResult<Prisma.$discount_codesPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Discount_codes.
     * @param {discount_codesDeleteManyArgs} args - Arguments to filter Discount_codes to delete.
     * @example
     * // Delete a few Discount_codes
     * const { count } = await prisma.discount_codes.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends discount_codesDeleteManyArgs>(args?: SelectSubset<T, discount_codesDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Discount_codes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {discount_codesUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Discount_codes
     * const discount_codes = await prisma.discount_codes.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends discount_codesUpdateManyArgs>(args: SelectSubset<T, discount_codesUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Discount_codes.
     * @param {discount_codesUpsertArgs} args - Arguments to update or create a Discount_codes.
     * @example
     * // Update or create a Discount_codes
     * const discount_codes = await prisma.discount_codes.upsert({
     *   create: {
     *     // ... data to create a Discount_codes
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Discount_codes we want to update
     *   }
     * })
     */
    upsert<T extends discount_codesUpsertArgs>(args: SelectSubset<T, discount_codesUpsertArgs<ExtArgs>>): Prisma__discount_codesClient<$Result.GetResult<Prisma.$discount_codesPayload<ExtArgs>, T, "upsert">, never, ExtArgs>

    /**
     * Find zero or more Discount_codes that matches the filter.
     * @param {discount_codesFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const discount_codes = await prisma.discount_codes.findRaw({
     *   filter: { age: { $gt: 25 } } 
     * })
     */
    findRaw(args?: discount_codesFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a Discount_codes.
     * @param {discount_codesAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const discount_codes = await prisma.discount_codes.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: discount_codesAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of Discount_codes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {discount_codesCountArgs} args - Arguments to filter Discount_codes to count.
     * @example
     * // Count the number of Discount_codes
     * const count = await prisma.discount_codes.count({
     *   where: {
     *     // ... the filter for the Discount_codes we want to count
     *   }
     * })
    **/
    count<T extends discount_codesCountArgs>(
      args?: Subset<T, discount_codesCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Discount_codesCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Discount_codes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Discount_codesAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Discount_codesAggregateArgs>(args: Subset<T, Discount_codesAggregateArgs>): Prisma.PrismaPromise<GetDiscount_codesAggregateType<T>>

    /**
     * Group by Discount_codes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {discount_codesGroupByArgs} args - Group by arguments.
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
      T extends discount_codesGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: discount_codesGroupByArgs['orderBy'] }
        : { orderBy?: discount_codesGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, discount_codesGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDiscount_codesGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the discount_codes model
   */
  readonly fields: discount_codesFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for discount_codes.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__discount_codesClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    seller<T extends discount_codes$sellerArgs<ExtArgs> = {}>(args?: Subset<T, discount_codes$sellerArgs<ExtArgs>>): Prisma__sellersClient<$Result.GetResult<Prisma.$sellersPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    admin<T extends discount_codes$adminArgs<ExtArgs> = {}>(args?: Subset<T, discount_codes$adminArgs<ExtArgs>>): Prisma__adminsClient<$Result.GetResult<Prisma.$adminsPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    usages<T extends discount_codes$usagesArgs<ExtArgs> = {}>(args?: Subset<T, discount_codes$usagesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$coupon_usagesPayload<ExtArgs>, T, "findMany"> | Null>
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
   * Fields of the discount_codes model
   */ 
  interface discount_codesFieldRefs {
    readonly id: FieldRef<"discount_codes", 'String'>
    readonly public_name: FieldRef<"discount_codes", 'String'>
    readonly discountType: FieldRef<"discount_codes", 'String'>
    readonly discountValue: FieldRef<"discount_codes", 'Float'>
    readonly minOrderValue: FieldRef<"discount_codes", 'Float'>
    readonly discountCode: FieldRef<"discount_codes", 'String'>
    readonly expiresAt: FieldRef<"discount_codes", 'DateTime'>
    readonly maxUses: FieldRef<"discount_codes", 'Int'>
    readonly maxUsesPerUser: FieldRef<"discount_codes", 'Int'>
    readonly usedCount: FieldRef<"discount_codes", 'Int'>
    readonly isActive: FieldRef<"discount_codes", 'Boolean'>
    readonly isFirstOrder: FieldRef<"discount_codes", 'Boolean'>
    readonly sellerId: FieldRef<"discount_codes", 'String'>
    readonly adminId: FieldRef<"discount_codes", 'String'>
    readonly createdAt: FieldRef<"discount_codes", 'DateTime'>
    readonly updatedAt: FieldRef<"discount_codes", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * discount_codes findUnique
   */
  export type discount_codesFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the discount_codes
     */
    select?: discount_codesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: discount_codesInclude<ExtArgs> | null
    /**
     * Filter, which discount_codes to fetch.
     */
    where: discount_codesWhereUniqueInput
  }

  /**
   * discount_codes findUniqueOrThrow
   */
  export type discount_codesFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the discount_codes
     */
    select?: discount_codesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: discount_codesInclude<ExtArgs> | null
    /**
     * Filter, which discount_codes to fetch.
     */
    where: discount_codesWhereUniqueInput
  }

  /**
   * discount_codes findFirst
   */
  export type discount_codesFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the discount_codes
     */
    select?: discount_codesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: discount_codesInclude<ExtArgs> | null
    /**
     * Filter, which discount_codes to fetch.
     */
    where?: discount_codesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of discount_codes to fetch.
     */
    orderBy?: discount_codesOrderByWithRelationInput | discount_codesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for discount_codes.
     */
    cursor?: discount_codesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` discount_codes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` discount_codes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of discount_codes.
     */
    distinct?: Discount_codesScalarFieldEnum | Discount_codesScalarFieldEnum[]
  }

  /**
   * discount_codes findFirstOrThrow
   */
  export type discount_codesFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the discount_codes
     */
    select?: discount_codesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: discount_codesInclude<ExtArgs> | null
    /**
     * Filter, which discount_codes to fetch.
     */
    where?: discount_codesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of discount_codes to fetch.
     */
    orderBy?: discount_codesOrderByWithRelationInput | discount_codesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for discount_codes.
     */
    cursor?: discount_codesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` discount_codes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` discount_codes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of discount_codes.
     */
    distinct?: Discount_codesScalarFieldEnum | Discount_codesScalarFieldEnum[]
  }

  /**
   * discount_codes findMany
   */
  export type discount_codesFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the discount_codes
     */
    select?: discount_codesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: discount_codesInclude<ExtArgs> | null
    /**
     * Filter, which discount_codes to fetch.
     */
    where?: discount_codesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of discount_codes to fetch.
     */
    orderBy?: discount_codesOrderByWithRelationInput | discount_codesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing discount_codes.
     */
    cursor?: discount_codesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` discount_codes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` discount_codes.
     */
    skip?: number
    distinct?: Discount_codesScalarFieldEnum | Discount_codesScalarFieldEnum[]
  }

  /**
   * discount_codes create
   */
  export type discount_codesCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the discount_codes
     */
    select?: discount_codesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: discount_codesInclude<ExtArgs> | null
    /**
     * The data needed to create a discount_codes.
     */
    data: XOR<discount_codesCreateInput, discount_codesUncheckedCreateInput>
  }

  /**
   * discount_codes createMany
   */
  export type discount_codesCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many discount_codes.
     */
    data: discount_codesCreateManyInput | discount_codesCreateManyInput[]
  }

  /**
   * discount_codes update
   */
  export type discount_codesUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the discount_codes
     */
    select?: discount_codesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: discount_codesInclude<ExtArgs> | null
    /**
     * The data needed to update a discount_codes.
     */
    data: XOR<discount_codesUpdateInput, discount_codesUncheckedUpdateInput>
    /**
     * Choose, which discount_codes to update.
     */
    where: discount_codesWhereUniqueInput
  }

  /**
   * discount_codes updateMany
   */
  export type discount_codesUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update discount_codes.
     */
    data: XOR<discount_codesUpdateManyMutationInput, discount_codesUncheckedUpdateManyInput>
    /**
     * Filter which discount_codes to update
     */
    where?: discount_codesWhereInput
  }

  /**
   * discount_codes upsert
   */
  export type discount_codesUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the discount_codes
     */
    select?: discount_codesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: discount_codesInclude<ExtArgs> | null
    /**
     * The filter to search for the discount_codes to update in case it exists.
     */
    where: discount_codesWhereUniqueInput
    /**
     * In case the discount_codes found by the `where` argument doesn't exist, create a new discount_codes with this data.
     */
    create: XOR<discount_codesCreateInput, discount_codesUncheckedCreateInput>
    /**
     * In case the discount_codes was found with the provided `where` argument, update it with this data.
     */
    update: XOR<discount_codesUpdateInput, discount_codesUncheckedUpdateInput>
  }

  /**
   * discount_codes delete
   */
  export type discount_codesDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the discount_codes
     */
    select?: discount_codesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: discount_codesInclude<ExtArgs> | null
    /**
     * Filter which discount_codes to delete.
     */
    where: discount_codesWhereUniqueInput
  }

  /**
   * discount_codes deleteMany
   */
  export type discount_codesDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which discount_codes to delete
     */
    where?: discount_codesWhereInput
  }

  /**
   * discount_codes findRaw
   */
  export type discount_codesFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
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
   * discount_codes aggregateRaw
   */
  export type discount_codesAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
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
   * discount_codes.seller
   */
  export type discount_codes$sellerArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the sellers
     */
    select?: sellersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: sellersInclude<ExtArgs> | null
    where?: sellersWhereInput
  }

  /**
   * discount_codes.admin
   */
  export type discount_codes$adminArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the admins
     */
    select?: adminsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: adminsInclude<ExtArgs> | null
    where?: adminsWhereInput
  }

  /**
   * discount_codes.usages
   */
  export type discount_codes$usagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the coupon_usages
     */
    select?: coupon_usagesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: coupon_usagesInclude<ExtArgs> | null
    where?: coupon_usagesWhereInput
    orderBy?: coupon_usagesOrderByWithRelationInput | coupon_usagesOrderByWithRelationInput[]
    cursor?: coupon_usagesWhereUniqueInput
    take?: number
    skip?: number
    distinct?: Coupon_usagesScalarFieldEnum | Coupon_usagesScalarFieldEnum[]
  }

  /**
   * discount_codes without action
   */
  export type discount_codesDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the discount_codes
     */
    select?: discount_codesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: discount_codesInclude<ExtArgs> | null
  }


  /**
   * Model coupon_usages
   */

  export type AggregateCoupon_usages = {
    _count: Coupon_usagesCountAggregateOutputType | null
    _min: Coupon_usagesMinAggregateOutputType | null
    _max: Coupon_usagesMaxAggregateOutputType | null
  }

  export type Coupon_usagesMinAggregateOutputType = {
    id: string | null
    couponId: string | null
    userId: string | null
    orderId: string | null
    usedAt: Date | null
  }

  export type Coupon_usagesMaxAggregateOutputType = {
    id: string | null
    couponId: string | null
    userId: string | null
    orderId: string | null
    usedAt: Date | null
  }

  export type Coupon_usagesCountAggregateOutputType = {
    id: number
    couponId: number
    userId: number
    orderId: number
    usedAt: number
    _all: number
  }


  export type Coupon_usagesMinAggregateInputType = {
    id?: true
    couponId?: true
    userId?: true
    orderId?: true
    usedAt?: true
  }

  export type Coupon_usagesMaxAggregateInputType = {
    id?: true
    couponId?: true
    userId?: true
    orderId?: true
    usedAt?: true
  }

  export type Coupon_usagesCountAggregateInputType = {
    id?: true
    couponId?: true
    userId?: true
    orderId?: true
    usedAt?: true
    _all?: true
  }

  export type Coupon_usagesAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which coupon_usages to aggregate.
     */
    where?: coupon_usagesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of coupon_usages to fetch.
     */
    orderBy?: coupon_usagesOrderByWithRelationInput | coupon_usagesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: coupon_usagesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` coupon_usages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` coupon_usages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned coupon_usages
    **/
    _count?: true | Coupon_usagesCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Coupon_usagesMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Coupon_usagesMaxAggregateInputType
  }

  export type GetCoupon_usagesAggregateType<T extends Coupon_usagesAggregateArgs> = {
        [P in keyof T & keyof AggregateCoupon_usages]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCoupon_usages[P]>
      : GetScalarType<T[P], AggregateCoupon_usages[P]>
  }




  export type coupon_usagesGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: coupon_usagesWhereInput
    orderBy?: coupon_usagesOrderByWithAggregationInput | coupon_usagesOrderByWithAggregationInput[]
    by: Coupon_usagesScalarFieldEnum[] | Coupon_usagesScalarFieldEnum
    having?: coupon_usagesScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Coupon_usagesCountAggregateInputType | true
    _min?: Coupon_usagesMinAggregateInputType
    _max?: Coupon_usagesMaxAggregateInputType
  }

  export type Coupon_usagesGroupByOutputType = {
    id: string
    couponId: string
    userId: string
    orderId: string
    usedAt: Date
    _count: Coupon_usagesCountAggregateOutputType | null
    _min: Coupon_usagesMinAggregateOutputType | null
    _max: Coupon_usagesMaxAggregateOutputType | null
  }

  type GetCoupon_usagesGroupByPayload<T extends coupon_usagesGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Coupon_usagesGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Coupon_usagesGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Coupon_usagesGroupByOutputType[P]>
            : GetScalarType<T[P], Coupon_usagesGroupByOutputType[P]>
        }
      >
    >


  export type coupon_usagesSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    couponId?: boolean
    userId?: boolean
    orderId?: boolean
    usedAt?: boolean
    coupon?: boolean | discount_codesDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["coupon_usages"]>


  export type coupon_usagesSelectScalar = {
    id?: boolean
    couponId?: boolean
    userId?: boolean
    orderId?: boolean
    usedAt?: boolean
  }

  export type coupon_usagesInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    coupon?: boolean | discount_codesDefaultArgs<ExtArgs>
  }

  export type $coupon_usagesPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "coupon_usages"
    objects: {
      coupon: Prisma.$discount_codesPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      couponId: string
      userId: string
      orderId: string
      usedAt: Date
    }, ExtArgs["result"]["coupon_usages"]>
    composites: {}
  }

  type coupon_usagesGetPayload<S extends boolean | null | undefined | coupon_usagesDefaultArgs> = $Result.GetResult<Prisma.$coupon_usagesPayload, S>

  type coupon_usagesCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<coupon_usagesFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: Coupon_usagesCountAggregateInputType | true
    }

  export interface coupon_usagesDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['coupon_usages'], meta: { name: 'coupon_usages' } }
    /**
     * Find zero or one Coupon_usages that matches the filter.
     * @param {coupon_usagesFindUniqueArgs} args - Arguments to find a Coupon_usages
     * @example
     * // Get one Coupon_usages
     * const coupon_usages = await prisma.coupon_usages.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends coupon_usagesFindUniqueArgs>(args: SelectSubset<T, coupon_usagesFindUniqueArgs<ExtArgs>>): Prisma__coupon_usagesClient<$Result.GetResult<Prisma.$coupon_usagesPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Coupon_usages that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {coupon_usagesFindUniqueOrThrowArgs} args - Arguments to find a Coupon_usages
     * @example
     * // Get one Coupon_usages
     * const coupon_usages = await prisma.coupon_usages.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends coupon_usagesFindUniqueOrThrowArgs>(args: SelectSubset<T, coupon_usagesFindUniqueOrThrowArgs<ExtArgs>>): Prisma__coupon_usagesClient<$Result.GetResult<Prisma.$coupon_usagesPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Coupon_usages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {coupon_usagesFindFirstArgs} args - Arguments to find a Coupon_usages
     * @example
     * // Get one Coupon_usages
     * const coupon_usages = await prisma.coupon_usages.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends coupon_usagesFindFirstArgs>(args?: SelectSubset<T, coupon_usagesFindFirstArgs<ExtArgs>>): Prisma__coupon_usagesClient<$Result.GetResult<Prisma.$coupon_usagesPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Coupon_usages that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {coupon_usagesFindFirstOrThrowArgs} args - Arguments to find a Coupon_usages
     * @example
     * // Get one Coupon_usages
     * const coupon_usages = await prisma.coupon_usages.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends coupon_usagesFindFirstOrThrowArgs>(args?: SelectSubset<T, coupon_usagesFindFirstOrThrowArgs<ExtArgs>>): Prisma__coupon_usagesClient<$Result.GetResult<Prisma.$coupon_usagesPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Coupon_usages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {coupon_usagesFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Coupon_usages
     * const coupon_usages = await prisma.coupon_usages.findMany()
     * 
     * // Get first 10 Coupon_usages
     * const coupon_usages = await prisma.coupon_usages.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const coupon_usagesWithIdOnly = await prisma.coupon_usages.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends coupon_usagesFindManyArgs>(args?: SelectSubset<T, coupon_usagesFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$coupon_usagesPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Coupon_usages.
     * @param {coupon_usagesCreateArgs} args - Arguments to create a Coupon_usages.
     * @example
     * // Create one Coupon_usages
     * const Coupon_usages = await prisma.coupon_usages.create({
     *   data: {
     *     // ... data to create a Coupon_usages
     *   }
     * })
     * 
     */
    create<T extends coupon_usagesCreateArgs>(args: SelectSubset<T, coupon_usagesCreateArgs<ExtArgs>>): Prisma__coupon_usagesClient<$Result.GetResult<Prisma.$coupon_usagesPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Coupon_usages.
     * @param {coupon_usagesCreateManyArgs} args - Arguments to create many Coupon_usages.
     * @example
     * // Create many Coupon_usages
     * const coupon_usages = await prisma.coupon_usages.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends coupon_usagesCreateManyArgs>(args?: SelectSubset<T, coupon_usagesCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Coupon_usages.
     * @param {coupon_usagesDeleteArgs} args - Arguments to delete one Coupon_usages.
     * @example
     * // Delete one Coupon_usages
     * const Coupon_usages = await prisma.coupon_usages.delete({
     *   where: {
     *     // ... filter to delete one Coupon_usages
     *   }
     * })
     * 
     */
    delete<T extends coupon_usagesDeleteArgs>(args: SelectSubset<T, coupon_usagesDeleteArgs<ExtArgs>>): Prisma__coupon_usagesClient<$Result.GetResult<Prisma.$coupon_usagesPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Coupon_usages.
     * @param {coupon_usagesUpdateArgs} args - Arguments to update one Coupon_usages.
     * @example
     * // Update one Coupon_usages
     * const coupon_usages = await prisma.coupon_usages.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends coupon_usagesUpdateArgs>(args: SelectSubset<T, coupon_usagesUpdateArgs<ExtArgs>>): Prisma__coupon_usagesClient<$Result.GetResult<Prisma.$coupon_usagesPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Coupon_usages.
     * @param {coupon_usagesDeleteManyArgs} args - Arguments to filter Coupon_usages to delete.
     * @example
     * // Delete a few Coupon_usages
     * const { count } = await prisma.coupon_usages.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends coupon_usagesDeleteManyArgs>(args?: SelectSubset<T, coupon_usagesDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Coupon_usages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {coupon_usagesUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Coupon_usages
     * const coupon_usages = await prisma.coupon_usages.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends coupon_usagesUpdateManyArgs>(args: SelectSubset<T, coupon_usagesUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Coupon_usages.
     * @param {coupon_usagesUpsertArgs} args - Arguments to update or create a Coupon_usages.
     * @example
     * // Update or create a Coupon_usages
     * const coupon_usages = await prisma.coupon_usages.upsert({
     *   create: {
     *     // ... data to create a Coupon_usages
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Coupon_usages we want to update
     *   }
     * })
     */
    upsert<T extends coupon_usagesUpsertArgs>(args: SelectSubset<T, coupon_usagesUpsertArgs<ExtArgs>>): Prisma__coupon_usagesClient<$Result.GetResult<Prisma.$coupon_usagesPayload<ExtArgs>, T, "upsert">, never, ExtArgs>

    /**
     * Find zero or more Coupon_usages that matches the filter.
     * @param {coupon_usagesFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const coupon_usages = await prisma.coupon_usages.findRaw({
     *   filter: { age: { $gt: 25 } } 
     * })
     */
    findRaw(args?: coupon_usagesFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a Coupon_usages.
     * @param {coupon_usagesAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const coupon_usages = await prisma.coupon_usages.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: coupon_usagesAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of Coupon_usages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {coupon_usagesCountArgs} args - Arguments to filter Coupon_usages to count.
     * @example
     * // Count the number of Coupon_usages
     * const count = await prisma.coupon_usages.count({
     *   where: {
     *     // ... the filter for the Coupon_usages we want to count
     *   }
     * })
    **/
    count<T extends coupon_usagesCountArgs>(
      args?: Subset<T, coupon_usagesCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Coupon_usagesCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Coupon_usages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Coupon_usagesAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Coupon_usagesAggregateArgs>(args: Subset<T, Coupon_usagesAggregateArgs>): Prisma.PrismaPromise<GetCoupon_usagesAggregateType<T>>

    /**
     * Group by Coupon_usages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {coupon_usagesGroupByArgs} args - Group by arguments.
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
      T extends coupon_usagesGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: coupon_usagesGroupByArgs['orderBy'] }
        : { orderBy?: coupon_usagesGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, coupon_usagesGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCoupon_usagesGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the coupon_usages model
   */
  readonly fields: coupon_usagesFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for coupon_usages.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__coupon_usagesClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    coupon<T extends discount_codesDefaultArgs<ExtArgs> = {}>(args?: Subset<T, discount_codesDefaultArgs<ExtArgs>>): Prisma__discount_codesClient<$Result.GetResult<Prisma.$discount_codesPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
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
   * Fields of the coupon_usages model
   */ 
  interface coupon_usagesFieldRefs {
    readonly id: FieldRef<"coupon_usages", 'String'>
    readonly couponId: FieldRef<"coupon_usages", 'String'>
    readonly userId: FieldRef<"coupon_usages", 'String'>
    readonly orderId: FieldRef<"coupon_usages", 'String'>
    readonly usedAt: FieldRef<"coupon_usages", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * coupon_usages findUnique
   */
  export type coupon_usagesFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the coupon_usages
     */
    select?: coupon_usagesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: coupon_usagesInclude<ExtArgs> | null
    /**
     * Filter, which coupon_usages to fetch.
     */
    where: coupon_usagesWhereUniqueInput
  }

  /**
   * coupon_usages findUniqueOrThrow
   */
  export type coupon_usagesFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the coupon_usages
     */
    select?: coupon_usagesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: coupon_usagesInclude<ExtArgs> | null
    /**
     * Filter, which coupon_usages to fetch.
     */
    where: coupon_usagesWhereUniqueInput
  }

  /**
   * coupon_usages findFirst
   */
  export type coupon_usagesFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the coupon_usages
     */
    select?: coupon_usagesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: coupon_usagesInclude<ExtArgs> | null
    /**
     * Filter, which coupon_usages to fetch.
     */
    where?: coupon_usagesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of coupon_usages to fetch.
     */
    orderBy?: coupon_usagesOrderByWithRelationInput | coupon_usagesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for coupon_usages.
     */
    cursor?: coupon_usagesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` coupon_usages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` coupon_usages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of coupon_usages.
     */
    distinct?: Coupon_usagesScalarFieldEnum | Coupon_usagesScalarFieldEnum[]
  }

  /**
   * coupon_usages findFirstOrThrow
   */
  export type coupon_usagesFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the coupon_usages
     */
    select?: coupon_usagesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: coupon_usagesInclude<ExtArgs> | null
    /**
     * Filter, which coupon_usages to fetch.
     */
    where?: coupon_usagesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of coupon_usages to fetch.
     */
    orderBy?: coupon_usagesOrderByWithRelationInput | coupon_usagesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for coupon_usages.
     */
    cursor?: coupon_usagesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` coupon_usages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` coupon_usages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of coupon_usages.
     */
    distinct?: Coupon_usagesScalarFieldEnum | Coupon_usagesScalarFieldEnum[]
  }

  /**
   * coupon_usages findMany
   */
  export type coupon_usagesFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the coupon_usages
     */
    select?: coupon_usagesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: coupon_usagesInclude<ExtArgs> | null
    /**
     * Filter, which coupon_usages to fetch.
     */
    where?: coupon_usagesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of coupon_usages to fetch.
     */
    orderBy?: coupon_usagesOrderByWithRelationInput | coupon_usagesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing coupon_usages.
     */
    cursor?: coupon_usagesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` coupon_usages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` coupon_usages.
     */
    skip?: number
    distinct?: Coupon_usagesScalarFieldEnum | Coupon_usagesScalarFieldEnum[]
  }

  /**
   * coupon_usages create
   */
  export type coupon_usagesCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the coupon_usages
     */
    select?: coupon_usagesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: coupon_usagesInclude<ExtArgs> | null
    /**
     * The data needed to create a coupon_usages.
     */
    data: XOR<coupon_usagesCreateInput, coupon_usagesUncheckedCreateInput>
  }

  /**
   * coupon_usages createMany
   */
  export type coupon_usagesCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many coupon_usages.
     */
    data: coupon_usagesCreateManyInput | coupon_usagesCreateManyInput[]
  }

  /**
   * coupon_usages update
   */
  export type coupon_usagesUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the coupon_usages
     */
    select?: coupon_usagesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: coupon_usagesInclude<ExtArgs> | null
    /**
     * The data needed to update a coupon_usages.
     */
    data: XOR<coupon_usagesUpdateInput, coupon_usagesUncheckedUpdateInput>
    /**
     * Choose, which coupon_usages to update.
     */
    where: coupon_usagesWhereUniqueInput
  }

  /**
   * coupon_usages updateMany
   */
  export type coupon_usagesUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update coupon_usages.
     */
    data: XOR<coupon_usagesUpdateManyMutationInput, coupon_usagesUncheckedUpdateManyInput>
    /**
     * Filter which coupon_usages to update
     */
    where?: coupon_usagesWhereInput
  }

  /**
   * coupon_usages upsert
   */
  export type coupon_usagesUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the coupon_usages
     */
    select?: coupon_usagesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: coupon_usagesInclude<ExtArgs> | null
    /**
     * The filter to search for the coupon_usages to update in case it exists.
     */
    where: coupon_usagesWhereUniqueInput
    /**
     * In case the coupon_usages found by the `where` argument doesn't exist, create a new coupon_usages with this data.
     */
    create: XOR<coupon_usagesCreateInput, coupon_usagesUncheckedCreateInput>
    /**
     * In case the coupon_usages was found with the provided `where` argument, update it with this data.
     */
    update: XOR<coupon_usagesUpdateInput, coupon_usagesUncheckedUpdateInput>
  }

  /**
   * coupon_usages delete
   */
  export type coupon_usagesDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the coupon_usages
     */
    select?: coupon_usagesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: coupon_usagesInclude<ExtArgs> | null
    /**
     * Filter which coupon_usages to delete.
     */
    where: coupon_usagesWhereUniqueInput
  }

  /**
   * coupon_usages deleteMany
   */
  export type coupon_usagesDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which coupon_usages to delete
     */
    where?: coupon_usagesWhereInput
  }

  /**
   * coupon_usages findRaw
   */
  export type coupon_usagesFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
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
   * coupon_usages aggregateRaw
   */
  export type coupon_usagesAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
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
   * coupon_usages without action
   */
  export type coupon_usagesDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the coupon_usages
     */
    select?: coupon_usagesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: coupon_usagesInclude<ExtArgs> | null
  }


  /**
   * Model sellers
   */

  export type AggregateSellers = {
    _count: SellersCountAggregateOutputType | null
    _min: SellersMinAggregateOutputType | null
    _max: SellersMaxAggregateOutputType | null
  }

  export type SellersMinAggregateOutputType = {
    id: string | null
    name: string | null
    email: string | null
    phone_number: string | null
    password: string | null
    isApprovedByAdmin: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SellersMaxAggregateOutputType = {
    id: string | null
    name: string | null
    email: string | null
    phone_number: string | null
    password: string | null
    isApprovedByAdmin: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SellersCountAggregateOutputType = {
    id: number
    name: number
    email: number
    phone_number: number
    password: number
    following: number
    isApprovedByAdmin: number
    permissions: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type SellersMinAggregateInputType = {
    id?: true
    name?: true
    email?: true
    phone_number?: true
    password?: true
    isApprovedByAdmin?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SellersMaxAggregateInputType = {
    id?: true
    name?: true
    email?: true
    phone_number?: true
    password?: true
    isApprovedByAdmin?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SellersCountAggregateInputType = {
    id?: true
    name?: true
    email?: true
    phone_number?: true
    password?: true
    following?: true
    isApprovedByAdmin?: true
    permissions?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type SellersAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which sellers to aggregate.
     */
    where?: sellersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of sellers to fetch.
     */
    orderBy?: sellersOrderByWithRelationInput | sellersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: sellersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` sellers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` sellers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned sellers
    **/
    _count?: true | SellersCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SellersMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SellersMaxAggregateInputType
  }

  export type GetSellersAggregateType<T extends SellersAggregateArgs> = {
        [P in keyof T & keyof AggregateSellers]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSellers[P]>
      : GetScalarType<T[P], AggregateSellers[P]>
  }




  export type sellersGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: sellersWhereInput
    orderBy?: sellersOrderByWithAggregationInput | sellersOrderByWithAggregationInput[]
    by: SellersScalarFieldEnum[] | SellersScalarFieldEnum
    having?: sellersScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SellersCountAggregateInputType | true
    _min?: SellersMinAggregateInputType
    _max?: SellersMaxAggregateInputType
  }

  export type SellersGroupByOutputType = {
    id: string
    name: string
    email: string
    phone_number: string
    password: string
    following: string[]
    isApprovedByAdmin: boolean
    permissions: JsonValue | null
    createdAt: Date
    updatedAt: Date
    _count: SellersCountAggregateOutputType | null
    _min: SellersMinAggregateOutputType | null
    _max: SellersMaxAggregateOutputType | null
  }

  type GetSellersGroupByPayload<T extends sellersGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SellersGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SellersGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SellersGroupByOutputType[P]>
            : GetScalarType<T[P], SellersGroupByOutputType[P]>
        }
      >
    >


  export type sellersSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    phone_number?: boolean
    password?: boolean
    following?: boolean
    isApprovedByAdmin?: boolean
    permissions?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    banners?: boolean | sellers$bannersArgs<ExtArgs>
    events?: boolean | sellers$eventsArgs<ExtArgs>
    store?: boolean | sellers$storeArgs<ExtArgs>
    coupons?: boolean | sellers$couponsArgs<ExtArgs>
    staffs?: boolean | sellers$staffsArgs<ExtArgs>
    _count?: boolean | SellersCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["sellers"]>


  export type sellersSelectScalar = {
    id?: boolean
    name?: boolean
    email?: boolean
    phone_number?: boolean
    password?: boolean
    following?: boolean
    isApprovedByAdmin?: boolean
    permissions?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type sellersInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    banners?: boolean | sellers$bannersArgs<ExtArgs>
    events?: boolean | sellers$eventsArgs<ExtArgs>
    store?: boolean | sellers$storeArgs<ExtArgs>
    coupons?: boolean | sellers$couponsArgs<ExtArgs>
    staffs?: boolean | sellers$staffsArgs<ExtArgs>
    _count?: boolean | SellersCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $sellersPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "sellers"
    objects: {
      banners: Prisma.$bannersPayload<ExtArgs>[]
      events: Prisma.$seller_eventsPayload<ExtArgs>[]
      store: Prisma.$storesPayload<ExtArgs> | null
      coupons: Prisma.$discount_codesPayload<ExtArgs>[]
      staffs: Prisma.$staffsPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      email: string
      phone_number: string
      password: string
      following: string[]
      isApprovedByAdmin: boolean
      permissions: Prisma.JsonValue | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["sellers"]>
    composites: {}
  }

  type sellersGetPayload<S extends boolean | null | undefined | sellersDefaultArgs> = $Result.GetResult<Prisma.$sellersPayload, S>

  type sellersCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<sellersFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: SellersCountAggregateInputType | true
    }

  export interface sellersDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['sellers'], meta: { name: 'sellers' } }
    /**
     * Find zero or one Sellers that matches the filter.
     * @param {sellersFindUniqueArgs} args - Arguments to find a Sellers
     * @example
     * // Get one Sellers
     * const sellers = await prisma.sellers.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends sellersFindUniqueArgs>(args: SelectSubset<T, sellersFindUniqueArgs<ExtArgs>>): Prisma__sellersClient<$Result.GetResult<Prisma.$sellersPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Sellers that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {sellersFindUniqueOrThrowArgs} args - Arguments to find a Sellers
     * @example
     * // Get one Sellers
     * const sellers = await prisma.sellers.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends sellersFindUniqueOrThrowArgs>(args: SelectSubset<T, sellersFindUniqueOrThrowArgs<ExtArgs>>): Prisma__sellersClient<$Result.GetResult<Prisma.$sellersPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Sellers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {sellersFindFirstArgs} args - Arguments to find a Sellers
     * @example
     * // Get one Sellers
     * const sellers = await prisma.sellers.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends sellersFindFirstArgs>(args?: SelectSubset<T, sellersFindFirstArgs<ExtArgs>>): Prisma__sellersClient<$Result.GetResult<Prisma.$sellersPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Sellers that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {sellersFindFirstOrThrowArgs} args - Arguments to find a Sellers
     * @example
     * // Get one Sellers
     * const sellers = await prisma.sellers.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends sellersFindFirstOrThrowArgs>(args?: SelectSubset<T, sellersFindFirstOrThrowArgs<ExtArgs>>): Prisma__sellersClient<$Result.GetResult<Prisma.$sellersPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Sellers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {sellersFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Sellers
     * const sellers = await prisma.sellers.findMany()
     * 
     * // Get first 10 Sellers
     * const sellers = await prisma.sellers.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const sellersWithIdOnly = await prisma.sellers.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends sellersFindManyArgs>(args?: SelectSubset<T, sellersFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$sellersPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Sellers.
     * @param {sellersCreateArgs} args - Arguments to create a Sellers.
     * @example
     * // Create one Sellers
     * const Sellers = await prisma.sellers.create({
     *   data: {
     *     // ... data to create a Sellers
     *   }
     * })
     * 
     */
    create<T extends sellersCreateArgs>(args: SelectSubset<T, sellersCreateArgs<ExtArgs>>): Prisma__sellersClient<$Result.GetResult<Prisma.$sellersPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Sellers.
     * @param {sellersCreateManyArgs} args - Arguments to create many Sellers.
     * @example
     * // Create many Sellers
     * const sellers = await prisma.sellers.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends sellersCreateManyArgs>(args?: SelectSubset<T, sellersCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Sellers.
     * @param {sellersDeleteArgs} args - Arguments to delete one Sellers.
     * @example
     * // Delete one Sellers
     * const Sellers = await prisma.sellers.delete({
     *   where: {
     *     // ... filter to delete one Sellers
     *   }
     * })
     * 
     */
    delete<T extends sellersDeleteArgs>(args: SelectSubset<T, sellersDeleteArgs<ExtArgs>>): Prisma__sellersClient<$Result.GetResult<Prisma.$sellersPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Sellers.
     * @param {sellersUpdateArgs} args - Arguments to update one Sellers.
     * @example
     * // Update one Sellers
     * const sellers = await prisma.sellers.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends sellersUpdateArgs>(args: SelectSubset<T, sellersUpdateArgs<ExtArgs>>): Prisma__sellersClient<$Result.GetResult<Prisma.$sellersPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Sellers.
     * @param {sellersDeleteManyArgs} args - Arguments to filter Sellers to delete.
     * @example
     * // Delete a few Sellers
     * const { count } = await prisma.sellers.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends sellersDeleteManyArgs>(args?: SelectSubset<T, sellersDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Sellers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {sellersUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Sellers
     * const sellers = await prisma.sellers.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends sellersUpdateManyArgs>(args: SelectSubset<T, sellersUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Sellers.
     * @param {sellersUpsertArgs} args - Arguments to update or create a Sellers.
     * @example
     * // Update or create a Sellers
     * const sellers = await prisma.sellers.upsert({
     *   create: {
     *     // ... data to create a Sellers
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Sellers we want to update
     *   }
     * })
     */
    upsert<T extends sellersUpsertArgs>(args: SelectSubset<T, sellersUpsertArgs<ExtArgs>>): Prisma__sellersClient<$Result.GetResult<Prisma.$sellersPayload<ExtArgs>, T, "upsert">, never, ExtArgs>

    /**
     * Find zero or more Sellers that matches the filter.
     * @param {sellersFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const sellers = await prisma.sellers.findRaw({
     *   filter: { age: { $gt: 25 } } 
     * })
     */
    findRaw(args?: sellersFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a Sellers.
     * @param {sellersAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const sellers = await prisma.sellers.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: sellersAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of Sellers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {sellersCountArgs} args - Arguments to filter Sellers to count.
     * @example
     * // Count the number of Sellers
     * const count = await prisma.sellers.count({
     *   where: {
     *     // ... the filter for the Sellers we want to count
     *   }
     * })
    **/
    count<T extends sellersCountArgs>(
      args?: Subset<T, sellersCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SellersCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Sellers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SellersAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends SellersAggregateArgs>(args: Subset<T, SellersAggregateArgs>): Prisma.PrismaPromise<GetSellersAggregateType<T>>

    /**
     * Group by Sellers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {sellersGroupByArgs} args - Group by arguments.
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
      T extends sellersGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: sellersGroupByArgs['orderBy'] }
        : { orderBy?: sellersGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, sellersGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSellersGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the sellers model
   */
  readonly fields: sellersFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for sellers.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__sellersClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    banners<T extends sellers$bannersArgs<ExtArgs> = {}>(args?: Subset<T, sellers$bannersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$bannersPayload<ExtArgs>, T, "findMany"> | Null>
    events<T extends sellers$eventsArgs<ExtArgs> = {}>(args?: Subset<T, sellers$eventsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$seller_eventsPayload<ExtArgs>, T, "findMany"> | Null>
    store<T extends sellers$storeArgs<ExtArgs> = {}>(args?: Subset<T, sellers$storeArgs<ExtArgs>>): Prisma__storesClient<$Result.GetResult<Prisma.$storesPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    coupons<T extends sellers$couponsArgs<ExtArgs> = {}>(args?: Subset<T, sellers$couponsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$discount_codesPayload<ExtArgs>, T, "findMany"> | Null>
    staffs<T extends sellers$staffsArgs<ExtArgs> = {}>(args?: Subset<T, sellers$staffsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$staffsPayload<ExtArgs>, T, "findMany"> | Null>
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
   * Fields of the sellers model
   */ 
  interface sellersFieldRefs {
    readonly id: FieldRef<"sellers", 'String'>
    readonly name: FieldRef<"sellers", 'String'>
    readonly email: FieldRef<"sellers", 'String'>
    readonly phone_number: FieldRef<"sellers", 'String'>
    readonly password: FieldRef<"sellers", 'String'>
    readonly following: FieldRef<"sellers", 'String[]'>
    readonly isApprovedByAdmin: FieldRef<"sellers", 'Boolean'>
    readonly permissions: FieldRef<"sellers", 'Json'>
    readonly createdAt: FieldRef<"sellers", 'DateTime'>
    readonly updatedAt: FieldRef<"sellers", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * sellers findUnique
   */
  export type sellersFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the sellers
     */
    select?: sellersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: sellersInclude<ExtArgs> | null
    /**
     * Filter, which sellers to fetch.
     */
    where: sellersWhereUniqueInput
  }

  /**
   * sellers findUniqueOrThrow
   */
  export type sellersFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the sellers
     */
    select?: sellersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: sellersInclude<ExtArgs> | null
    /**
     * Filter, which sellers to fetch.
     */
    where: sellersWhereUniqueInput
  }

  /**
   * sellers findFirst
   */
  export type sellersFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the sellers
     */
    select?: sellersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: sellersInclude<ExtArgs> | null
    /**
     * Filter, which sellers to fetch.
     */
    where?: sellersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of sellers to fetch.
     */
    orderBy?: sellersOrderByWithRelationInput | sellersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for sellers.
     */
    cursor?: sellersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` sellers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` sellers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of sellers.
     */
    distinct?: SellersScalarFieldEnum | SellersScalarFieldEnum[]
  }

  /**
   * sellers findFirstOrThrow
   */
  export type sellersFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the sellers
     */
    select?: sellersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: sellersInclude<ExtArgs> | null
    /**
     * Filter, which sellers to fetch.
     */
    where?: sellersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of sellers to fetch.
     */
    orderBy?: sellersOrderByWithRelationInput | sellersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for sellers.
     */
    cursor?: sellersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` sellers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` sellers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of sellers.
     */
    distinct?: SellersScalarFieldEnum | SellersScalarFieldEnum[]
  }

  /**
   * sellers findMany
   */
  export type sellersFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the sellers
     */
    select?: sellersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: sellersInclude<ExtArgs> | null
    /**
     * Filter, which sellers to fetch.
     */
    where?: sellersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of sellers to fetch.
     */
    orderBy?: sellersOrderByWithRelationInput | sellersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing sellers.
     */
    cursor?: sellersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` sellers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` sellers.
     */
    skip?: number
    distinct?: SellersScalarFieldEnum | SellersScalarFieldEnum[]
  }

  /**
   * sellers create
   */
  export type sellersCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the sellers
     */
    select?: sellersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: sellersInclude<ExtArgs> | null
    /**
     * The data needed to create a sellers.
     */
    data: XOR<sellersCreateInput, sellersUncheckedCreateInput>
  }

  /**
   * sellers createMany
   */
  export type sellersCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many sellers.
     */
    data: sellersCreateManyInput | sellersCreateManyInput[]
  }

  /**
   * sellers update
   */
  export type sellersUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the sellers
     */
    select?: sellersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: sellersInclude<ExtArgs> | null
    /**
     * The data needed to update a sellers.
     */
    data: XOR<sellersUpdateInput, sellersUncheckedUpdateInput>
    /**
     * Choose, which sellers to update.
     */
    where: sellersWhereUniqueInput
  }

  /**
   * sellers updateMany
   */
  export type sellersUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update sellers.
     */
    data: XOR<sellersUpdateManyMutationInput, sellersUncheckedUpdateManyInput>
    /**
     * Filter which sellers to update
     */
    where?: sellersWhereInput
  }

  /**
   * sellers upsert
   */
  export type sellersUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the sellers
     */
    select?: sellersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: sellersInclude<ExtArgs> | null
    /**
     * The filter to search for the sellers to update in case it exists.
     */
    where: sellersWhereUniqueInput
    /**
     * In case the sellers found by the `where` argument doesn't exist, create a new sellers with this data.
     */
    create: XOR<sellersCreateInput, sellersUncheckedCreateInput>
    /**
     * In case the sellers was found with the provided `where` argument, update it with this data.
     */
    update: XOR<sellersUpdateInput, sellersUncheckedUpdateInput>
  }

  /**
   * sellers delete
   */
  export type sellersDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the sellers
     */
    select?: sellersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: sellersInclude<ExtArgs> | null
    /**
     * Filter which sellers to delete.
     */
    where: sellersWhereUniqueInput
  }

  /**
   * sellers deleteMany
   */
  export type sellersDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which sellers to delete
     */
    where?: sellersWhereInput
  }

  /**
   * sellers findRaw
   */
  export type sellersFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
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
   * sellers aggregateRaw
   */
  export type sellersAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
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
   * sellers.banners
   */
  export type sellers$bannersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the banners
     */
    select?: bannersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: bannersInclude<ExtArgs> | null
    where?: bannersWhereInput
    orderBy?: bannersOrderByWithRelationInput | bannersOrderByWithRelationInput[]
    cursor?: bannersWhereUniqueInput
    take?: number
    skip?: number
    distinct?: BannersScalarFieldEnum | BannersScalarFieldEnum[]
  }

  /**
   * sellers.events
   */
  export type sellers$eventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the seller_events
     */
    select?: seller_eventsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: seller_eventsInclude<ExtArgs> | null
    where?: seller_eventsWhereInput
    orderBy?: seller_eventsOrderByWithRelationInput | seller_eventsOrderByWithRelationInput[]
    cursor?: seller_eventsWhereUniqueInput
    take?: number
    skip?: number
    distinct?: Seller_eventsScalarFieldEnum | Seller_eventsScalarFieldEnum[]
  }

  /**
   * sellers.store
   */
  export type sellers$storeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the stores
     */
    select?: storesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: storesInclude<ExtArgs> | null
    where?: storesWhereInput
  }

  /**
   * sellers.coupons
   */
  export type sellers$couponsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the discount_codes
     */
    select?: discount_codesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: discount_codesInclude<ExtArgs> | null
    where?: discount_codesWhereInput
    orderBy?: discount_codesOrderByWithRelationInput | discount_codesOrderByWithRelationInput[]
    cursor?: discount_codesWhereUniqueInput
    take?: number
    skip?: number
    distinct?: Discount_codesScalarFieldEnum | Discount_codesScalarFieldEnum[]
  }

  /**
   * sellers.staffs
   */
  export type sellers$staffsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the staffs
     */
    select?: staffsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: staffsInclude<ExtArgs> | null
    where?: staffsWhereInput
    orderBy?: staffsOrderByWithRelationInput | staffsOrderByWithRelationInput[]
    cursor?: staffsWhereUniqueInput
    take?: number
    skip?: number
    distinct?: StaffsScalarFieldEnum | StaffsScalarFieldEnum[]
  }

  /**
   * sellers without action
   */
  export type sellersDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the sellers
     */
    select?: sellersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: sellersInclude<ExtArgs> | null
  }


  /**
   * Model staffs
   */

  export type AggregateStaffs = {
    _count: StaffsCountAggregateOutputType | null
    _min: StaffsMinAggregateOutputType | null
    _max: StaffsMaxAggregateOutputType | null
  }

  export type StaffsMinAggregateOutputType = {
    id: string | null
    name: string | null
    email: string | null
    password: string | null
    isActive: boolean | null
    sellerId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type StaffsMaxAggregateOutputType = {
    id: string | null
    name: string | null
    email: string | null
    password: string | null
    isActive: boolean | null
    sellerId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type StaffsCountAggregateOutputType = {
    id: number
    name: number
    email: number
    password: number
    isActive: number
    sellerId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type StaffsMinAggregateInputType = {
    id?: true
    name?: true
    email?: true
    password?: true
    isActive?: true
    sellerId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type StaffsMaxAggregateInputType = {
    id?: true
    name?: true
    email?: true
    password?: true
    isActive?: true
    sellerId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type StaffsCountAggregateInputType = {
    id?: true
    name?: true
    email?: true
    password?: true
    isActive?: true
    sellerId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type StaffsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which staffs to aggregate.
     */
    where?: staffsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of staffs to fetch.
     */
    orderBy?: staffsOrderByWithRelationInput | staffsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: staffsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` staffs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` staffs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned staffs
    **/
    _count?: true | StaffsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: StaffsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: StaffsMaxAggregateInputType
  }

  export type GetStaffsAggregateType<T extends StaffsAggregateArgs> = {
        [P in keyof T & keyof AggregateStaffs]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateStaffs[P]>
      : GetScalarType<T[P], AggregateStaffs[P]>
  }




  export type staffsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: staffsWhereInput
    orderBy?: staffsOrderByWithAggregationInput | staffsOrderByWithAggregationInput[]
    by: StaffsScalarFieldEnum[] | StaffsScalarFieldEnum
    having?: staffsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: StaffsCountAggregateInputType | true
    _min?: StaffsMinAggregateInputType
    _max?: StaffsMaxAggregateInputType
  }

  export type StaffsGroupByOutputType = {
    id: string
    name: string
    email: string
    password: string
    isActive: boolean
    sellerId: string | null
    createdAt: Date
    updatedAt: Date
    _count: StaffsCountAggregateOutputType | null
    _min: StaffsMinAggregateOutputType | null
    _max: StaffsMaxAggregateOutputType | null
  }

  type GetStaffsGroupByPayload<T extends staffsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<StaffsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof StaffsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], StaffsGroupByOutputType[P]>
            : GetScalarType<T[P], StaffsGroupByOutputType[P]>
        }
      >
    >


  export type staffsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    password?: boolean
    isActive?: boolean
    sellerId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    seller?: boolean | staffs$sellerArgs<ExtArgs>
  }, ExtArgs["result"]["staffs"]>


  export type staffsSelectScalar = {
    id?: boolean
    name?: boolean
    email?: boolean
    password?: boolean
    isActive?: boolean
    sellerId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type staffsInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    seller?: boolean | staffs$sellerArgs<ExtArgs>
  }

  export type $staffsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "staffs"
    objects: {
      seller: Prisma.$sellersPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      email: string
      password: string
      isActive: boolean
      sellerId: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["staffs"]>
    composites: {}
  }

  type staffsGetPayload<S extends boolean | null | undefined | staffsDefaultArgs> = $Result.GetResult<Prisma.$staffsPayload, S>

  type staffsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<staffsFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: StaffsCountAggregateInputType | true
    }

  export interface staffsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['staffs'], meta: { name: 'staffs' } }
    /**
     * Find zero or one Staffs that matches the filter.
     * @param {staffsFindUniqueArgs} args - Arguments to find a Staffs
     * @example
     * // Get one Staffs
     * const staffs = await prisma.staffs.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends staffsFindUniqueArgs>(args: SelectSubset<T, staffsFindUniqueArgs<ExtArgs>>): Prisma__staffsClient<$Result.GetResult<Prisma.$staffsPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Staffs that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {staffsFindUniqueOrThrowArgs} args - Arguments to find a Staffs
     * @example
     * // Get one Staffs
     * const staffs = await prisma.staffs.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends staffsFindUniqueOrThrowArgs>(args: SelectSubset<T, staffsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__staffsClient<$Result.GetResult<Prisma.$staffsPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Staffs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {staffsFindFirstArgs} args - Arguments to find a Staffs
     * @example
     * // Get one Staffs
     * const staffs = await prisma.staffs.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends staffsFindFirstArgs>(args?: SelectSubset<T, staffsFindFirstArgs<ExtArgs>>): Prisma__staffsClient<$Result.GetResult<Prisma.$staffsPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Staffs that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {staffsFindFirstOrThrowArgs} args - Arguments to find a Staffs
     * @example
     * // Get one Staffs
     * const staffs = await prisma.staffs.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends staffsFindFirstOrThrowArgs>(args?: SelectSubset<T, staffsFindFirstOrThrowArgs<ExtArgs>>): Prisma__staffsClient<$Result.GetResult<Prisma.$staffsPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Staffs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {staffsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Staffs
     * const staffs = await prisma.staffs.findMany()
     * 
     * // Get first 10 Staffs
     * const staffs = await prisma.staffs.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const staffsWithIdOnly = await prisma.staffs.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends staffsFindManyArgs>(args?: SelectSubset<T, staffsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$staffsPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Staffs.
     * @param {staffsCreateArgs} args - Arguments to create a Staffs.
     * @example
     * // Create one Staffs
     * const Staffs = await prisma.staffs.create({
     *   data: {
     *     // ... data to create a Staffs
     *   }
     * })
     * 
     */
    create<T extends staffsCreateArgs>(args: SelectSubset<T, staffsCreateArgs<ExtArgs>>): Prisma__staffsClient<$Result.GetResult<Prisma.$staffsPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Staffs.
     * @param {staffsCreateManyArgs} args - Arguments to create many Staffs.
     * @example
     * // Create many Staffs
     * const staffs = await prisma.staffs.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends staffsCreateManyArgs>(args?: SelectSubset<T, staffsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Staffs.
     * @param {staffsDeleteArgs} args - Arguments to delete one Staffs.
     * @example
     * // Delete one Staffs
     * const Staffs = await prisma.staffs.delete({
     *   where: {
     *     // ... filter to delete one Staffs
     *   }
     * })
     * 
     */
    delete<T extends staffsDeleteArgs>(args: SelectSubset<T, staffsDeleteArgs<ExtArgs>>): Prisma__staffsClient<$Result.GetResult<Prisma.$staffsPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Staffs.
     * @param {staffsUpdateArgs} args - Arguments to update one Staffs.
     * @example
     * // Update one Staffs
     * const staffs = await prisma.staffs.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends staffsUpdateArgs>(args: SelectSubset<T, staffsUpdateArgs<ExtArgs>>): Prisma__staffsClient<$Result.GetResult<Prisma.$staffsPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Staffs.
     * @param {staffsDeleteManyArgs} args - Arguments to filter Staffs to delete.
     * @example
     * // Delete a few Staffs
     * const { count } = await prisma.staffs.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends staffsDeleteManyArgs>(args?: SelectSubset<T, staffsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Staffs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {staffsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Staffs
     * const staffs = await prisma.staffs.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends staffsUpdateManyArgs>(args: SelectSubset<T, staffsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Staffs.
     * @param {staffsUpsertArgs} args - Arguments to update or create a Staffs.
     * @example
     * // Update or create a Staffs
     * const staffs = await prisma.staffs.upsert({
     *   create: {
     *     // ... data to create a Staffs
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Staffs we want to update
     *   }
     * })
     */
    upsert<T extends staffsUpsertArgs>(args: SelectSubset<T, staffsUpsertArgs<ExtArgs>>): Prisma__staffsClient<$Result.GetResult<Prisma.$staffsPayload<ExtArgs>, T, "upsert">, never, ExtArgs>

    /**
     * Find zero or more Staffs that matches the filter.
     * @param {staffsFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const staffs = await prisma.staffs.findRaw({
     *   filter: { age: { $gt: 25 } } 
     * })
     */
    findRaw(args?: staffsFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a Staffs.
     * @param {staffsAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const staffs = await prisma.staffs.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: staffsAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of Staffs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {staffsCountArgs} args - Arguments to filter Staffs to count.
     * @example
     * // Count the number of Staffs
     * const count = await prisma.staffs.count({
     *   where: {
     *     // ... the filter for the Staffs we want to count
     *   }
     * })
    **/
    count<T extends staffsCountArgs>(
      args?: Subset<T, staffsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], StaffsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Staffs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StaffsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends StaffsAggregateArgs>(args: Subset<T, StaffsAggregateArgs>): Prisma.PrismaPromise<GetStaffsAggregateType<T>>

    /**
     * Group by Staffs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {staffsGroupByArgs} args - Group by arguments.
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
      T extends staffsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: staffsGroupByArgs['orderBy'] }
        : { orderBy?: staffsGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, staffsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetStaffsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the staffs model
   */
  readonly fields: staffsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for staffs.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__staffsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    seller<T extends staffs$sellerArgs<ExtArgs> = {}>(args?: Subset<T, staffs$sellerArgs<ExtArgs>>): Prisma__sellersClient<$Result.GetResult<Prisma.$sellersPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
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
   * Fields of the staffs model
   */ 
  interface staffsFieldRefs {
    readonly id: FieldRef<"staffs", 'String'>
    readonly name: FieldRef<"staffs", 'String'>
    readonly email: FieldRef<"staffs", 'String'>
    readonly password: FieldRef<"staffs", 'String'>
    readonly isActive: FieldRef<"staffs", 'Boolean'>
    readonly sellerId: FieldRef<"staffs", 'String'>
    readonly createdAt: FieldRef<"staffs", 'DateTime'>
    readonly updatedAt: FieldRef<"staffs", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * staffs findUnique
   */
  export type staffsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the staffs
     */
    select?: staffsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: staffsInclude<ExtArgs> | null
    /**
     * Filter, which staffs to fetch.
     */
    where: staffsWhereUniqueInput
  }

  /**
   * staffs findUniqueOrThrow
   */
  export type staffsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the staffs
     */
    select?: staffsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: staffsInclude<ExtArgs> | null
    /**
     * Filter, which staffs to fetch.
     */
    where: staffsWhereUniqueInput
  }

  /**
   * staffs findFirst
   */
  export type staffsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the staffs
     */
    select?: staffsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: staffsInclude<ExtArgs> | null
    /**
     * Filter, which staffs to fetch.
     */
    where?: staffsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of staffs to fetch.
     */
    orderBy?: staffsOrderByWithRelationInput | staffsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for staffs.
     */
    cursor?: staffsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` staffs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` staffs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of staffs.
     */
    distinct?: StaffsScalarFieldEnum | StaffsScalarFieldEnum[]
  }

  /**
   * staffs findFirstOrThrow
   */
  export type staffsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the staffs
     */
    select?: staffsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: staffsInclude<ExtArgs> | null
    /**
     * Filter, which staffs to fetch.
     */
    where?: staffsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of staffs to fetch.
     */
    orderBy?: staffsOrderByWithRelationInput | staffsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for staffs.
     */
    cursor?: staffsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` staffs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` staffs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of staffs.
     */
    distinct?: StaffsScalarFieldEnum | StaffsScalarFieldEnum[]
  }

  /**
   * staffs findMany
   */
  export type staffsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the staffs
     */
    select?: staffsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: staffsInclude<ExtArgs> | null
    /**
     * Filter, which staffs to fetch.
     */
    where?: staffsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of staffs to fetch.
     */
    orderBy?: staffsOrderByWithRelationInput | staffsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing staffs.
     */
    cursor?: staffsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` staffs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` staffs.
     */
    skip?: number
    distinct?: StaffsScalarFieldEnum | StaffsScalarFieldEnum[]
  }

  /**
   * staffs create
   */
  export type staffsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the staffs
     */
    select?: staffsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: staffsInclude<ExtArgs> | null
    /**
     * The data needed to create a staffs.
     */
    data: XOR<staffsCreateInput, staffsUncheckedCreateInput>
  }

  /**
   * staffs createMany
   */
  export type staffsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many staffs.
     */
    data: staffsCreateManyInput | staffsCreateManyInput[]
  }

  /**
   * staffs update
   */
  export type staffsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the staffs
     */
    select?: staffsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: staffsInclude<ExtArgs> | null
    /**
     * The data needed to update a staffs.
     */
    data: XOR<staffsUpdateInput, staffsUncheckedUpdateInput>
    /**
     * Choose, which staffs to update.
     */
    where: staffsWhereUniqueInput
  }

  /**
   * staffs updateMany
   */
  export type staffsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update staffs.
     */
    data: XOR<staffsUpdateManyMutationInput, staffsUncheckedUpdateManyInput>
    /**
     * Filter which staffs to update
     */
    where?: staffsWhereInput
  }

  /**
   * staffs upsert
   */
  export type staffsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the staffs
     */
    select?: staffsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: staffsInclude<ExtArgs> | null
    /**
     * The filter to search for the staffs to update in case it exists.
     */
    where: staffsWhereUniqueInput
    /**
     * In case the staffs found by the `where` argument doesn't exist, create a new staffs with this data.
     */
    create: XOR<staffsCreateInput, staffsUncheckedCreateInput>
    /**
     * In case the staffs was found with the provided `where` argument, update it with this data.
     */
    update: XOR<staffsUpdateInput, staffsUncheckedUpdateInput>
  }

  /**
   * staffs delete
   */
  export type staffsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the staffs
     */
    select?: staffsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: staffsInclude<ExtArgs> | null
    /**
     * Filter which staffs to delete.
     */
    where: staffsWhereUniqueInput
  }

  /**
   * staffs deleteMany
   */
  export type staffsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which staffs to delete
     */
    where?: staffsWhereInput
  }

  /**
   * staffs findRaw
   */
  export type staffsFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
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
   * staffs aggregateRaw
   */
  export type staffsAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
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
   * staffs.seller
   */
  export type staffs$sellerArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the sellers
     */
    select?: sellersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: sellersInclude<ExtArgs> | null
    where?: sellersWhereInput
  }

  /**
   * staffs without action
   */
  export type staffsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the staffs
     */
    select?: staffsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: staffsInclude<ExtArgs> | null
  }


  /**
   * Model stores
   */

  export type AggregateStores = {
    _count: StoresCountAggregateOutputType | null
    _avg: StoresAvgAggregateOutputType | null
    _sum: StoresSumAggregateOutputType | null
    _min: StoresMinAggregateOutputType | null
    _max: StoresMaxAggregateOutputType | null
  }

  export type StoresAvgAggregateOutputType = {
    instant_delivery_fee: number | null
  }

  export type StoresSumAggregateOutputType = {
    instant_delivery_fee: number | null
  }

  export type StoresMinAggregateOutputType = {
    id: string | null
    name: string | null
    bio: string | null
    avatarId: string | null
    address: string | null
    city: string | null
    pincode: string | null
    opening_hours: string | null
    closing_hours: string | null
    is_instant_delivery_enabled: boolean | null
    instant_delivery_fee: number | null
    instant_delivery_window_start: string | null
    instant_delivery_window_end: string | null
    state: string | null
    sellerId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type StoresMaxAggregateOutputType = {
    id: string | null
    name: string | null
    bio: string | null
    avatarId: string | null
    address: string | null
    city: string | null
    pincode: string | null
    opening_hours: string | null
    closing_hours: string | null
    is_instant_delivery_enabled: boolean | null
    instant_delivery_fee: number | null
    instant_delivery_window_start: string | null
    instant_delivery_window_end: string | null
    state: string | null
    sellerId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type StoresCountAggregateOutputType = {
    id: number
    name: number
    bio: number
    avatarId: number
    address: number
    city: number
    pincode: number
    opening_hours: number
    closing_hours: number
    is_instant_delivery_enabled: number
    instant_delivery_fee: number
    instant_delivery_window_start: number
    instant_delivery_window_end: number
    availableCities: number
    cityDeliveryTimes: number
    state: number
    sellerId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type StoresAvgAggregateInputType = {
    instant_delivery_fee?: true
  }

  export type StoresSumAggregateInputType = {
    instant_delivery_fee?: true
  }

  export type StoresMinAggregateInputType = {
    id?: true
    name?: true
    bio?: true
    avatarId?: true
    address?: true
    city?: true
    pincode?: true
    opening_hours?: true
    closing_hours?: true
    is_instant_delivery_enabled?: true
    instant_delivery_fee?: true
    instant_delivery_window_start?: true
    instant_delivery_window_end?: true
    state?: true
    sellerId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type StoresMaxAggregateInputType = {
    id?: true
    name?: true
    bio?: true
    avatarId?: true
    address?: true
    city?: true
    pincode?: true
    opening_hours?: true
    closing_hours?: true
    is_instant_delivery_enabled?: true
    instant_delivery_fee?: true
    instant_delivery_window_start?: true
    instant_delivery_window_end?: true
    state?: true
    sellerId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type StoresCountAggregateInputType = {
    id?: true
    name?: true
    bio?: true
    avatarId?: true
    address?: true
    city?: true
    pincode?: true
    opening_hours?: true
    closing_hours?: true
    is_instant_delivery_enabled?: true
    instant_delivery_fee?: true
    instant_delivery_window_start?: true
    instant_delivery_window_end?: true
    availableCities?: true
    cityDeliveryTimes?: true
    state?: true
    sellerId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type StoresAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which stores to aggregate.
     */
    where?: storesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of stores to fetch.
     */
    orderBy?: storesOrderByWithRelationInput | storesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: storesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` stores from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` stores.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned stores
    **/
    _count?: true | StoresCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: StoresAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: StoresSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: StoresMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: StoresMaxAggregateInputType
  }

  export type GetStoresAggregateType<T extends StoresAggregateArgs> = {
        [P in keyof T & keyof AggregateStores]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateStores[P]>
      : GetScalarType<T[P], AggregateStores[P]>
  }




  export type storesGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: storesWhereInput
    orderBy?: storesOrderByWithAggregationInput | storesOrderByWithAggregationInput[]
    by: StoresScalarFieldEnum[] | StoresScalarFieldEnum
    having?: storesScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: StoresCountAggregateInputType | true
    _avg?: StoresAvgAggregateInputType
    _sum?: StoresSumAggregateInputType
    _min?: StoresMinAggregateInputType
    _max?: StoresMaxAggregateInputType
  }

  export type StoresGroupByOutputType = {
    id: string
    name: string
    bio: string
    avatarId: string | null
    address: string
    city: string
    pincode: string
    opening_hours: string
    closing_hours: string
    is_instant_delivery_enabled: boolean
    instant_delivery_fee: number
    instant_delivery_window_start: string
    instant_delivery_window_end: string
    availableCities: string[]
    cityDeliveryTimes: JsonValue | null
    state: string | null
    sellerId: string
    createdAt: Date
    updatedAt: Date
    _count: StoresCountAggregateOutputType | null
    _avg: StoresAvgAggregateOutputType | null
    _sum: StoresSumAggregateOutputType | null
    _min: StoresMinAggregateOutputType | null
    _max: StoresMaxAggregateOutputType | null
  }

  type GetStoresGroupByPayload<T extends storesGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<StoresGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof StoresGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], StoresGroupByOutputType[P]>
            : GetScalarType<T[P], StoresGroupByOutputType[P]>
        }
      >
    >


  export type storesSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    bio?: boolean
    avatarId?: boolean
    address?: boolean
    city?: boolean
    pincode?: boolean
    opening_hours?: boolean
    closing_hours?: boolean
    is_instant_delivery_enabled?: boolean
    instant_delivery_fee?: boolean
    instant_delivery_window_start?: boolean
    instant_delivery_window_end?: boolean
    availableCities?: boolean
    cityDeliveryTimes?: boolean
    state?: boolean
    sellerId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    avatar?: boolean | stores$avatarArgs<ExtArgs>
    seller?: boolean | sellersDefaultArgs<ExtArgs>
    products?: boolean | stores$productsArgs<ExtArgs>
    _count?: boolean | StoresCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["stores"]>


  export type storesSelectScalar = {
    id?: boolean
    name?: boolean
    bio?: boolean
    avatarId?: boolean
    address?: boolean
    city?: boolean
    pincode?: boolean
    opening_hours?: boolean
    closing_hours?: boolean
    is_instant_delivery_enabled?: boolean
    instant_delivery_fee?: boolean
    instant_delivery_window_start?: boolean
    instant_delivery_window_end?: boolean
    availableCities?: boolean
    cityDeliveryTimes?: boolean
    state?: boolean
    sellerId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type storesInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    avatar?: boolean | stores$avatarArgs<ExtArgs>
    seller?: boolean | sellersDefaultArgs<ExtArgs>
    products?: boolean | stores$productsArgs<ExtArgs>
    _count?: boolean | StoresCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $storesPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "stores"
    objects: {
      avatar: Prisma.$imagesPayload<ExtArgs> | null
      seller: Prisma.$sellersPayload<ExtArgs>
      products: Prisma.$productsPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      bio: string
      avatarId: string | null
      address: string
      city: string
      pincode: string
      opening_hours: string
      closing_hours: string
      is_instant_delivery_enabled: boolean
      instant_delivery_fee: number
      instant_delivery_window_start: string
      instant_delivery_window_end: string
      availableCities: string[]
      cityDeliveryTimes: Prisma.JsonValue | null
      state: string | null
      sellerId: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["stores"]>
    composites: {}
  }

  type storesGetPayload<S extends boolean | null | undefined | storesDefaultArgs> = $Result.GetResult<Prisma.$storesPayload, S>

  type storesCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<storesFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: StoresCountAggregateInputType | true
    }

  export interface storesDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['stores'], meta: { name: 'stores' } }
    /**
     * Find zero or one Stores that matches the filter.
     * @param {storesFindUniqueArgs} args - Arguments to find a Stores
     * @example
     * // Get one Stores
     * const stores = await prisma.stores.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends storesFindUniqueArgs>(args: SelectSubset<T, storesFindUniqueArgs<ExtArgs>>): Prisma__storesClient<$Result.GetResult<Prisma.$storesPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Stores that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {storesFindUniqueOrThrowArgs} args - Arguments to find a Stores
     * @example
     * // Get one Stores
     * const stores = await prisma.stores.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends storesFindUniqueOrThrowArgs>(args: SelectSubset<T, storesFindUniqueOrThrowArgs<ExtArgs>>): Prisma__storesClient<$Result.GetResult<Prisma.$storesPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Stores that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {storesFindFirstArgs} args - Arguments to find a Stores
     * @example
     * // Get one Stores
     * const stores = await prisma.stores.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends storesFindFirstArgs>(args?: SelectSubset<T, storesFindFirstArgs<ExtArgs>>): Prisma__storesClient<$Result.GetResult<Prisma.$storesPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Stores that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {storesFindFirstOrThrowArgs} args - Arguments to find a Stores
     * @example
     * // Get one Stores
     * const stores = await prisma.stores.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends storesFindFirstOrThrowArgs>(args?: SelectSubset<T, storesFindFirstOrThrowArgs<ExtArgs>>): Prisma__storesClient<$Result.GetResult<Prisma.$storesPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Stores that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {storesFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Stores
     * const stores = await prisma.stores.findMany()
     * 
     * // Get first 10 Stores
     * const stores = await prisma.stores.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const storesWithIdOnly = await prisma.stores.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends storesFindManyArgs>(args?: SelectSubset<T, storesFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$storesPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Stores.
     * @param {storesCreateArgs} args - Arguments to create a Stores.
     * @example
     * // Create one Stores
     * const Stores = await prisma.stores.create({
     *   data: {
     *     // ... data to create a Stores
     *   }
     * })
     * 
     */
    create<T extends storesCreateArgs>(args: SelectSubset<T, storesCreateArgs<ExtArgs>>): Prisma__storesClient<$Result.GetResult<Prisma.$storesPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Stores.
     * @param {storesCreateManyArgs} args - Arguments to create many Stores.
     * @example
     * // Create many Stores
     * const stores = await prisma.stores.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends storesCreateManyArgs>(args?: SelectSubset<T, storesCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Stores.
     * @param {storesDeleteArgs} args - Arguments to delete one Stores.
     * @example
     * // Delete one Stores
     * const Stores = await prisma.stores.delete({
     *   where: {
     *     // ... filter to delete one Stores
     *   }
     * })
     * 
     */
    delete<T extends storesDeleteArgs>(args: SelectSubset<T, storesDeleteArgs<ExtArgs>>): Prisma__storesClient<$Result.GetResult<Prisma.$storesPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Stores.
     * @param {storesUpdateArgs} args - Arguments to update one Stores.
     * @example
     * // Update one Stores
     * const stores = await prisma.stores.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends storesUpdateArgs>(args: SelectSubset<T, storesUpdateArgs<ExtArgs>>): Prisma__storesClient<$Result.GetResult<Prisma.$storesPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Stores.
     * @param {storesDeleteManyArgs} args - Arguments to filter Stores to delete.
     * @example
     * // Delete a few Stores
     * const { count } = await prisma.stores.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends storesDeleteManyArgs>(args?: SelectSubset<T, storesDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Stores.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {storesUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Stores
     * const stores = await prisma.stores.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends storesUpdateManyArgs>(args: SelectSubset<T, storesUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Stores.
     * @param {storesUpsertArgs} args - Arguments to update or create a Stores.
     * @example
     * // Update or create a Stores
     * const stores = await prisma.stores.upsert({
     *   create: {
     *     // ... data to create a Stores
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Stores we want to update
     *   }
     * })
     */
    upsert<T extends storesUpsertArgs>(args: SelectSubset<T, storesUpsertArgs<ExtArgs>>): Prisma__storesClient<$Result.GetResult<Prisma.$storesPayload<ExtArgs>, T, "upsert">, never, ExtArgs>

    /**
     * Find zero or more Stores that matches the filter.
     * @param {storesFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const stores = await prisma.stores.findRaw({
     *   filter: { age: { $gt: 25 } } 
     * })
     */
    findRaw(args?: storesFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a Stores.
     * @param {storesAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const stores = await prisma.stores.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: storesAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of Stores.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {storesCountArgs} args - Arguments to filter Stores to count.
     * @example
     * // Count the number of Stores
     * const count = await prisma.stores.count({
     *   where: {
     *     // ... the filter for the Stores we want to count
     *   }
     * })
    **/
    count<T extends storesCountArgs>(
      args?: Subset<T, storesCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], StoresCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Stores.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StoresAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends StoresAggregateArgs>(args: Subset<T, StoresAggregateArgs>): Prisma.PrismaPromise<GetStoresAggregateType<T>>

    /**
     * Group by Stores.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {storesGroupByArgs} args - Group by arguments.
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
      T extends storesGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: storesGroupByArgs['orderBy'] }
        : { orderBy?: storesGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, storesGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetStoresGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the stores model
   */
  readonly fields: storesFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for stores.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__storesClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    avatar<T extends stores$avatarArgs<ExtArgs> = {}>(args?: Subset<T, stores$avatarArgs<ExtArgs>>): Prisma__imagesClient<$Result.GetResult<Prisma.$imagesPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    seller<T extends sellersDefaultArgs<ExtArgs> = {}>(args?: Subset<T, sellersDefaultArgs<ExtArgs>>): Prisma__sellersClient<$Result.GetResult<Prisma.$sellersPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    products<T extends stores$productsArgs<ExtArgs> = {}>(args?: Subset<T, stores$productsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$productsPayload<ExtArgs>, T, "findMany"> | Null>
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
   * Fields of the stores model
   */ 
  interface storesFieldRefs {
    readonly id: FieldRef<"stores", 'String'>
    readonly name: FieldRef<"stores", 'String'>
    readonly bio: FieldRef<"stores", 'String'>
    readonly avatarId: FieldRef<"stores", 'String'>
    readonly address: FieldRef<"stores", 'String'>
    readonly city: FieldRef<"stores", 'String'>
    readonly pincode: FieldRef<"stores", 'String'>
    readonly opening_hours: FieldRef<"stores", 'String'>
    readonly closing_hours: FieldRef<"stores", 'String'>
    readonly is_instant_delivery_enabled: FieldRef<"stores", 'Boolean'>
    readonly instant_delivery_fee: FieldRef<"stores", 'Float'>
    readonly instant_delivery_window_start: FieldRef<"stores", 'String'>
    readonly instant_delivery_window_end: FieldRef<"stores", 'String'>
    readonly availableCities: FieldRef<"stores", 'String[]'>
    readonly cityDeliveryTimes: FieldRef<"stores", 'Json'>
    readonly state: FieldRef<"stores", 'String'>
    readonly sellerId: FieldRef<"stores", 'String'>
    readonly createdAt: FieldRef<"stores", 'DateTime'>
    readonly updatedAt: FieldRef<"stores", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * stores findUnique
   */
  export type storesFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the stores
     */
    select?: storesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: storesInclude<ExtArgs> | null
    /**
     * Filter, which stores to fetch.
     */
    where: storesWhereUniqueInput
  }

  /**
   * stores findUniqueOrThrow
   */
  export type storesFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the stores
     */
    select?: storesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: storesInclude<ExtArgs> | null
    /**
     * Filter, which stores to fetch.
     */
    where: storesWhereUniqueInput
  }

  /**
   * stores findFirst
   */
  export type storesFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the stores
     */
    select?: storesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: storesInclude<ExtArgs> | null
    /**
     * Filter, which stores to fetch.
     */
    where?: storesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of stores to fetch.
     */
    orderBy?: storesOrderByWithRelationInput | storesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for stores.
     */
    cursor?: storesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` stores from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` stores.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of stores.
     */
    distinct?: StoresScalarFieldEnum | StoresScalarFieldEnum[]
  }

  /**
   * stores findFirstOrThrow
   */
  export type storesFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the stores
     */
    select?: storesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: storesInclude<ExtArgs> | null
    /**
     * Filter, which stores to fetch.
     */
    where?: storesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of stores to fetch.
     */
    orderBy?: storesOrderByWithRelationInput | storesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for stores.
     */
    cursor?: storesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` stores from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` stores.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of stores.
     */
    distinct?: StoresScalarFieldEnum | StoresScalarFieldEnum[]
  }

  /**
   * stores findMany
   */
  export type storesFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the stores
     */
    select?: storesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: storesInclude<ExtArgs> | null
    /**
     * Filter, which stores to fetch.
     */
    where?: storesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of stores to fetch.
     */
    orderBy?: storesOrderByWithRelationInput | storesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing stores.
     */
    cursor?: storesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` stores from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` stores.
     */
    skip?: number
    distinct?: StoresScalarFieldEnum | StoresScalarFieldEnum[]
  }

  /**
   * stores create
   */
  export type storesCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the stores
     */
    select?: storesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: storesInclude<ExtArgs> | null
    /**
     * The data needed to create a stores.
     */
    data: XOR<storesCreateInput, storesUncheckedCreateInput>
  }

  /**
   * stores createMany
   */
  export type storesCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many stores.
     */
    data: storesCreateManyInput | storesCreateManyInput[]
  }

  /**
   * stores update
   */
  export type storesUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the stores
     */
    select?: storesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: storesInclude<ExtArgs> | null
    /**
     * The data needed to update a stores.
     */
    data: XOR<storesUpdateInput, storesUncheckedUpdateInput>
    /**
     * Choose, which stores to update.
     */
    where: storesWhereUniqueInput
  }

  /**
   * stores updateMany
   */
  export type storesUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update stores.
     */
    data: XOR<storesUpdateManyMutationInput, storesUncheckedUpdateManyInput>
    /**
     * Filter which stores to update
     */
    where?: storesWhereInput
  }

  /**
   * stores upsert
   */
  export type storesUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the stores
     */
    select?: storesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: storesInclude<ExtArgs> | null
    /**
     * The filter to search for the stores to update in case it exists.
     */
    where: storesWhereUniqueInput
    /**
     * In case the stores found by the `where` argument doesn't exist, create a new stores with this data.
     */
    create: XOR<storesCreateInput, storesUncheckedCreateInput>
    /**
     * In case the stores was found with the provided `where` argument, update it with this data.
     */
    update: XOR<storesUpdateInput, storesUncheckedUpdateInput>
  }

  /**
   * stores delete
   */
  export type storesDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the stores
     */
    select?: storesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: storesInclude<ExtArgs> | null
    /**
     * Filter which stores to delete.
     */
    where: storesWhereUniqueInput
  }

  /**
   * stores deleteMany
   */
  export type storesDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which stores to delete
     */
    where?: storesWhereInput
  }

  /**
   * stores findRaw
   */
  export type storesFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
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
   * stores aggregateRaw
   */
  export type storesAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
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
   * stores.avatar
   */
  export type stores$avatarArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the images
     */
    select?: imagesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: imagesInclude<ExtArgs> | null
    where?: imagesWhereInput
  }

  /**
   * stores.products
   */
  export type stores$productsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the products
     */
    select?: productsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: productsInclude<ExtArgs> | null
    where?: productsWhereInput
    orderBy?: productsOrderByWithRelationInput | productsOrderByWithRelationInput[]
    cursor?: productsWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ProductsScalarFieldEnum | ProductsScalarFieldEnum[]
  }

  /**
   * stores without action
   */
  export type storesDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the stores
     */
    select?: storesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: storesInclude<ExtArgs> | null
  }


  /**
   * Model favorites
   */

  export type AggregateFavorites = {
    _count: FavoritesCountAggregateOutputType | null
    _min: FavoritesMinAggregateOutputType | null
    _max: FavoritesMaxAggregateOutputType | null
  }

  export type FavoritesMinAggregateOutputType = {
    id: string | null
    userId: string | null
    productId: string | null
    createdAt: Date | null
  }

  export type FavoritesMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    productId: string | null
    createdAt: Date | null
  }

  export type FavoritesCountAggregateOutputType = {
    id: number
    userId: number
    productId: number
    createdAt: number
    _all: number
  }


  export type FavoritesMinAggregateInputType = {
    id?: true
    userId?: true
    productId?: true
    createdAt?: true
  }

  export type FavoritesMaxAggregateInputType = {
    id?: true
    userId?: true
    productId?: true
    createdAt?: true
  }

  export type FavoritesCountAggregateInputType = {
    id?: true
    userId?: true
    productId?: true
    createdAt?: true
    _all?: true
  }

  export type FavoritesAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which favorites to aggregate.
     */
    where?: favoritesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of favorites to fetch.
     */
    orderBy?: favoritesOrderByWithRelationInput | favoritesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: favoritesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` favorites from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` favorites.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned favorites
    **/
    _count?: true | FavoritesCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: FavoritesMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: FavoritesMaxAggregateInputType
  }

  export type GetFavoritesAggregateType<T extends FavoritesAggregateArgs> = {
        [P in keyof T & keyof AggregateFavorites]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateFavorites[P]>
      : GetScalarType<T[P], AggregateFavorites[P]>
  }




  export type favoritesGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: favoritesWhereInput
    orderBy?: favoritesOrderByWithAggregationInput | favoritesOrderByWithAggregationInput[]
    by: FavoritesScalarFieldEnum[] | FavoritesScalarFieldEnum
    having?: favoritesScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: FavoritesCountAggregateInputType | true
    _min?: FavoritesMinAggregateInputType
    _max?: FavoritesMaxAggregateInputType
  }

  export type FavoritesGroupByOutputType = {
    id: string
    userId: string
    productId: string
    createdAt: Date
    _count: FavoritesCountAggregateOutputType | null
    _min: FavoritesMinAggregateOutputType | null
    _max: FavoritesMaxAggregateOutputType | null
  }

  type GetFavoritesGroupByPayload<T extends favoritesGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<FavoritesGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof FavoritesGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], FavoritesGroupByOutputType[P]>
            : GetScalarType<T[P], FavoritesGroupByOutputType[P]>
        }
      >
    >


  export type favoritesSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    productId?: boolean
    createdAt?: boolean
    user?: boolean | usersDefaultArgs<ExtArgs>
    product?: boolean | productsDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["favorites"]>


  export type favoritesSelectScalar = {
    id?: boolean
    userId?: boolean
    productId?: boolean
    createdAt?: boolean
  }

  export type favoritesInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | usersDefaultArgs<ExtArgs>
    product?: boolean | productsDefaultArgs<ExtArgs>
  }

  export type $favoritesPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "favorites"
    objects: {
      user: Prisma.$usersPayload<ExtArgs>
      product: Prisma.$productsPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      productId: string
      createdAt: Date
    }, ExtArgs["result"]["favorites"]>
    composites: {}
  }

  type favoritesGetPayload<S extends boolean | null | undefined | favoritesDefaultArgs> = $Result.GetResult<Prisma.$favoritesPayload, S>

  type favoritesCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<favoritesFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: FavoritesCountAggregateInputType | true
    }

  export interface favoritesDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['favorites'], meta: { name: 'favorites' } }
    /**
     * Find zero or one Favorites that matches the filter.
     * @param {favoritesFindUniqueArgs} args - Arguments to find a Favorites
     * @example
     * // Get one Favorites
     * const favorites = await prisma.favorites.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends favoritesFindUniqueArgs>(args: SelectSubset<T, favoritesFindUniqueArgs<ExtArgs>>): Prisma__favoritesClient<$Result.GetResult<Prisma.$favoritesPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Favorites that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {favoritesFindUniqueOrThrowArgs} args - Arguments to find a Favorites
     * @example
     * // Get one Favorites
     * const favorites = await prisma.favorites.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends favoritesFindUniqueOrThrowArgs>(args: SelectSubset<T, favoritesFindUniqueOrThrowArgs<ExtArgs>>): Prisma__favoritesClient<$Result.GetResult<Prisma.$favoritesPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Favorites that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {favoritesFindFirstArgs} args - Arguments to find a Favorites
     * @example
     * // Get one Favorites
     * const favorites = await prisma.favorites.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends favoritesFindFirstArgs>(args?: SelectSubset<T, favoritesFindFirstArgs<ExtArgs>>): Prisma__favoritesClient<$Result.GetResult<Prisma.$favoritesPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Favorites that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {favoritesFindFirstOrThrowArgs} args - Arguments to find a Favorites
     * @example
     * // Get one Favorites
     * const favorites = await prisma.favorites.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends favoritesFindFirstOrThrowArgs>(args?: SelectSubset<T, favoritesFindFirstOrThrowArgs<ExtArgs>>): Prisma__favoritesClient<$Result.GetResult<Prisma.$favoritesPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Favorites that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {favoritesFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Favorites
     * const favorites = await prisma.favorites.findMany()
     * 
     * // Get first 10 Favorites
     * const favorites = await prisma.favorites.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const favoritesWithIdOnly = await prisma.favorites.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends favoritesFindManyArgs>(args?: SelectSubset<T, favoritesFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$favoritesPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Favorites.
     * @param {favoritesCreateArgs} args - Arguments to create a Favorites.
     * @example
     * // Create one Favorites
     * const Favorites = await prisma.favorites.create({
     *   data: {
     *     // ... data to create a Favorites
     *   }
     * })
     * 
     */
    create<T extends favoritesCreateArgs>(args: SelectSubset<T, favoritesCreateArgs<ExtArgs>>): Prisma__favoritesClient<$Result.GetResult<Prisma.$favoritesPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Favorites.
     * @param {favoritesCreateManyArgs} args - Arguments to create many Favorites.
     * @example
     * // Create many Favorites
     * const favorites = await prisma.favorites.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends favoritesCreateManyArgs>(args?: SelectSubset<T, favoritesCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Favorites.
     * @param {favoritesDeleteArgs} args - Arguments to delete one Favorites.
     * @example
     * // Delete one Favorites
     * const Favorites = await prisma.favorites.delete({
     *   where: {
     *     // ... filter to delete one Favorites
     *   }
     * })
     * 
     */
    delete<T extends favoritesDeleteArgs>(args: SelectSubset<T, favoritesDeleteArgs<ExtArgs>>): Prisma__favoritesClient<$Result.GetResult<Prisma.$favoritesPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Favorites.
     * @param {favoritesUpdateArgs} args - Arguments to update one Favorites.
     * @example
     * // Update one Favorites
     * const favorites = await prisma.favorites.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends favoritesUpdateArgs>(args: SelectSubset<T, favoritesUpdateArgs<ExtArgs>>): Prisma__favoritesClient<$Result.GetResult<Prisma.$favoritesPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Favorites.
     * @param {favoritesDeleteManyArgs} args - Arguments to filter Favorites to delete.
     * @example
     * // Delete a few Favorites
     * const { count } = await prisma.favorites.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends favoritesDeleteManyArgs>(args?: SelectSubset<T, favoritesDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Favorites.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {favoritesUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Favorites
     * const favorites = await prisma.favorites.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends favoritesUpdateManyArgs>(args: SelectSubset<T, favoritesUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Favorites.
     * @param {favoritesUpsertArgs} args - Arguments to update or create a Favorites.
     * @example
     * // Update or create a Favorites
     * const favorites = await prisma.favorites.upsert({
     *   create: {
     *     // ... data to create a Favorites
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Favorites we want to update
     *   }
     * })
     */
    upsert<T extends favoritesUpsertArgs>(args: SelectSubset<T, favoritesUpsertArgs<ExtArgs>>): Prisma__favoritesClient<$Result.GetResult<Prisma.$favoritesPayload<ExtArgs>, T, "upsert">, never, ExtArgs>

    /**
     * Find zero or more Favorites that matches the filter.
     * @param {favoritesFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const favorites = await prisma.favorites.findRaw({
     *   filter: { age: { $gt: 25 } } 
     * })
     */
    findRaw(args?: favoritesFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a Favorites.
     * @param {favoritesAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const favorites = await prisma.favorites.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: favoritesAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of Favorites.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {favoritesCountArgs} args - Arguments to filter Favorites to count.
     * @example
     * // Count the number of Favorites
     * const count = await prisma.favorites.count({
     *   where: {
     *     // ... the filter for the Favorites we want to count
     *   }
     * })
    **/
    count<T extends favoritesCountArgs>(
      args?: Subset<T, favoritesCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], FavoritesCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Favorites.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FavoritesAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends FavoritesAggregateArgs>(args: Subset<T, FavoritesAggregateArgs>): Prisma.PrismaPromise<GetFavoritesAggregateType<T>>

    /**
     * Group by Favorites.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {favoritesGroupByArgs} args - Group by arguments.
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
      T extends favoritesGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: favoritesGroupByArgs['orderBy'] }
        : { orderBy?: favoritesGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, favoritesGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFavoritesGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the favorites model
   */
  readonly fields: favoritesFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for favorites.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__favoritesClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends usersDefaultArgs<ExtArgs> = {}>(args?: Subset<T, usersDefaultArgs<ExtArgs>>): Prisma__usersClient<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    product<T extends productsDefaultArgs<ExtArgs> = {}>(args?: Subset<T, productsDefaultArgs<ExtArgs>>): Prisma__productsClient<$Result.GetResult<Prisma.$productsPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
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
   * Fields of the favorites model
   */ 
  interface favoritesFieldRefs {
    readonly id: FieldRef<"favorites", 'String'>
    readonly userId: FieldRef<"favorites", 'String'>
    readonly productId: FieldRef<"favorites", 'String'>
    readonly createdAt: FieldRef<"favorites", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * favorites findUnique
   */
  export type favoritesFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the favorites
     */
    select?: favoritesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: favoritesInclude<ExtArgs> | null
    /**
     * Filter, which favorites to fetch.
     */
    where: favoritesWhereUniqueInput
  }

  /**
   * favorites findUniqueOrThrow
   */
  export type favoritesFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the favorites
     */
    select?: favoritesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: favoritesInclude<ExtArgs> | null
    /**
     * Filter, which favorites to fetch.
     */
    where: favoritesWhereUniqueInput
  }

  /**
   * favorites findFirst
   */
  export type favoritesFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the favorites
     */
    select?: favoritesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: favoritesInclude<ExtArgs> | null
    /**
     * Filter, which favorites to fetch.
     */
    where?: favoritesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of favorites to fetch.
     */
    orderBy?: favoritesOrderByWithRelationInput | favoritesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for favorites.
     */
    cursor?: favoritesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` favorites from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` favorites.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of favorites.
     */
    distinct?: FavoritesScalarFieldEnum | FavoritesScalarFieldEnum[]
  }

  /**
   * favorites findFirstOrThrow
   */
  export type favoritesFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the favorites
     */
    select?: favoritesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: favoritesInclude<ExtArgs> | null
    /**
     * Filter, which favorites to fetch.
     */
    where?: favoritesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of favorites to fetch.
     */
    orderBy?: favoritesOrderByWithRelationInput | favoritesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for favorites.
     */
    cursor?: favoritesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` favorites from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` favorites.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of favorites.
     */
    distinct?: FavoritesScalarFieldEnum | FavoritesScalarFieldEnum[]
  }

  /**
   * favorites findMany
   */
  export type favoritesFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the favorites
     */
    select?: favoritesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: favoritesInclude<ExtArgs> | null
    /**
     * Filter, which favorites to fetch.
     */
    where?: favoritesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of favorites to fetch.
     */
    orderBy?: favoritesOrderByWithRelationInput | favoritesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing favorites.
     */
    cursor?: favoritesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` favorites from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` favorites.
     */
    skip?: number
    distinct?: FavoritesScalarFieldEnum | FavoritesScalarFieldEnum[]
  }

  /**
   * favorites create
   */
  export type favoritesCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the favorites
     */
    select?: favoritesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: favoritesInclude<ExtArgs> | null
    /**
     * The data needed to create a favorites.
     */
    data: XOR<favoritesCreateInput, favoritesUncheckedCreateInput>
  }

  /**
   * favorites createMany
   */
  export type favoritesCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many favorites.
     */
    data: favoritesCreateManyInput | favoritesCreateManyInput[]
  }

  /**
   * favorites update
   */
  export type favoritesUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the favorites
     */
    select?: favoritesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: favoritesInclude<ExtArgs> | null
    /**
     * The data needed to update a favorites.
     */
    data: XOR<favoritesUpdateInput, favoritesUncheckedUpdateInput>
    /**
     * Choose, which favorites to update.
     */
    where: favoritesWhereUniqueInput
  }

  /**
   * favorites updateMany
   */
  export type favoritesUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update favorites.
     */
    data: XOR<favoritesUpdateManyMutationInput, favoritesUncheckedUpdateManyInput>
    /**
     * Filter which favorites to update
     */
    where?: favoritesWhereInput
  }

  /**
   * favorites upsert
   */
  export type favoritesUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the favorites
     */
    select?: favoritesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: favoritesInclude<ExtArgs> | null
    /**
     * The filter to search for the favorites to update in case it exists.
     */
    where: favoritesWhereUniqueInput
    /**
     * In case the favorites found by the `where` argument doesn't exist, create a new favorites with this data.
     */
    create: XOR<favoritesCreateInput, favoritesUncheckedCreateInput>
    /**
     * In case the favorites was found with the provided `where` argument, update it with this data.
     */
    update: XOR<favoritesUpdateInput, favoritesUncheckedUpdateInput>
  }

  /**
   * favorites delete
   */
  export type favoritesDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the favorites
     */
    select?: favoritesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: favoritesInclude<ExtArgs> | null
    /**
     * Filter which favorites to delete.
     */
    where: favoritesWhereUniqueInput
  }

  /**
   * favorites deleteMany
   */
  export type favoritesDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which favorites to delete
     */
    where?: favoritesWhereInput
  }

  /**
   * favorites findRaw
   */
  export type favoritesFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
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
   * favorites aggregateRaw
   */
  export type favoritesAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
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
   * favorites without action
   */
  export type favoritesDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the favorites
     */
    select?: favoritesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: favoritesInclude<ExtArgs> | null
  }


  /**
   * Model site_config
   */

  export type AggregateSite_config = {
    _count: Site_configCountAggregateOutputType | null
    _min: Site_configMinAggregateOutputType | null
    _max: Site_configMaxAggregateOutputType | null
  }

  export type Site_configMinAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type Site_configMaxAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type Site_configCountAggregateOutputType = {
    id: number
    categories: number
    subCategories: number
    categoryImages: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type Site_configMinAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
  }

  export type Site_configMaxAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
  }

  export type Site_configCountAggregateInputType = {
    id?: true
    categories?: true
    subCategories?: true
    categoryImages?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type Site_configAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which site_config to aggregate.
     */
    where?: site_configWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of site_configs to fetch.
     */
    orderBy?: site_configOrderByWithRelationInput | site_configOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: site_configWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` site_configs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` site_configs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned site_configs
    **/
    _count?: true | Site_configCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Site_configMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Site_configMaxAggregateInputType
  }

  export type GetSite_configAggregateType<T extends Site_configAggregateArgs> = {
        [P in keyof T & keyof AggregateSite_config]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSite_config[P]>
      : GetScalarType<T[P], AggregateSite_config[P]>
  }




  export type site_configGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: site_configWhereInput
    orderBy?: site_configOrderByWithAggregationInput | site_configOrderByWithAggregationInput[]
    by: Site_configScalarFieldEnum[] | Site_configScalarFieldEnum
    having?: site_configScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Site_configCountAggregateInputType | true
    _min?: Site_configMinAggregateInputType
    _max?: Site_configMaxAggregateInputType
  }

  export type Site_configGroupByOutputType = {
    id: string
    categories: string[]
    subCategories: JsonValue
    categoryImages: JsonValue
    createdAt: Date
    updatedAt: Date
    _count: Site_configCountAggregateOutputType | null
    _min: Site_configMinAggregateOutputType | null
    _max: Site_configMaxAggregateOutputType | null
  }

  type GetSite_configGroupByPayload<T extends site_configGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Site_configGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Site_configGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Site_configGroupByOutputType[P]>
            : GetScalarType<T[P], Site_configGroupByOutputType[P]>
        }
      >
    >


  export type site_configSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    categories?: boolean
    subCategories?: boolean
    categoryImages?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["site_config"]>


  export type site_configSelectScalar = {
    id?: boolean
    categories?: boolean
    subCategories?: boolean
    categoryImages?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }


  export type $site_configPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "site_config"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      categories: string[]
      subCategories: Prisma.JsonValue
      categoryImages: Prisma.JsonValue
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["site_config"]>
    composites: {}
  }

  type site_configGetPayload<S extends boolean | null | undefined | site_configDefaultArgs> = $Result.GetResult<Prisma.$site_configPayload, S>

  type site_configCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<site_configFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: Site_configCountAggregateInputType | true
    }

  export interface site_configDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['site_config'], meta: { name: 'site_config' } }
    /**
     * Find zero or one Site_config that matches the filter.
     * @param {site_configFindUniqueArgs} args - Arguments to find a Site_config
     * @example
     * // Get one Site_config
     * const site_config = await prisma.site_config.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends site_configFindUniqueArgs>(args: SelectSubset<T, site_configFindUniqueArgs<ExtArgs>>): Prisma__site_configClient<$Result.GetResult<Prisma.$site_configPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Site_config that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {site_configFindUniqueOrThrowArgs} args - Arguments to find a Site_config
     * @example
     * // Get one Site_config
     * const site_config = await prisma.site_config.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends site_configFindUniqueOrThrowArgs>(args: SelectSubset<T, site_configFindUniqueOrThrowArgs<ExtArgs>>): Prisma__site_configClient<$Result.GetResult<Prisma.$site_configPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Site_config that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {site_configFindFirstArgs} args - Arguments to find a Site_config
     * @example
     * // Get one Site_config
     * const site_config = await prisma.site_config.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends site_configFindFirstArgs>(args?: SelectSubset<T, site_configFindFirstArgs<ExtArgs>>): Prisma__site_configClient<$Result.GetResult<Prisma.$site_configPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Site_config that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {site_configFindFirstOrThrowArgs} args - Arguments to find a Site_config
     * @example
     * // Get one Site_config
     * const site_config = await prisma.site_config.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends site_configFindFirstOrThrowArgs>(args?: SelectSubset<T, site_configFindFirstOrThrowArgs<ExtArgs>>): Prisma__site_configClient<$Result.GetResult<Prisma.$site_configPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Site_configs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {site_configFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Site_configs
     * const site_configs = await prisma.site_config.findMany()
     * 
     * // Get first 10 Site_configs
     * const site_configs = await prisma.site_config.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const site_configWithIdOnly = await prisma.site_config.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends site_configFindManyArgs>(args?: SelectSubset<T, site_configFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$site_configPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Site_config.
     * @param {site_configCreateArgs} args - Arguments to create a Site_config.
     * @example
     * // Create one Site_config
     * const Site_config = await prisma.site_config.create({
     *   data: {
     *     // ... data to create a Site_config
     *   }
     * })
     * 
     */
    create<T extends site_configCreateArgs>(args: SelectSubset<T, site_configCreateArgs<ExtArgs>>): Prisma__site_configClient<$Result.GetResult<Prisma.$site_configPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Site_configs.
     * @param {site_configCreateManyArgs} args - Arguments to create many Site_configs.
     * @example
     * // Create many Site_configs
     * const site_config = await prisma.site_config.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends site_configCreateManyArgs>(args?: SelectSubset<T, site_configCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Site_config.
     * @param {site_configDeleteArgs} args - Arguments to delete one Site_config.
     * @example
     * // Delete one Site_config
     * const Site_config = await prisma.site_config.delete({
     *   where: {
     *     // ... filter to delete one Site_config
     *   }
     * })
     * 
     */
    delete<T extends site_configDeleteArgs>(args: SelectSubset<T, site_configDeleteArgs<ExtArgs>>): Prisma__site_configClient<$Result.GetResult<Prisma.$site_configPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Site_config.
     * @param {site_configUpdateArgs} args - Arguments to update one Site_config.
     * @example
     * // Update one Site_config
     * const site_config = await prisma.site_config.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends site_configUpdateArgs>(args: SelectSubset<T, site_configUpdateArgs<ExtArgs>>): Prisma__site_configClient<$Result.GetResult<Prisma.$site_configPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Site_configs.
     * @param {site_configDeleteManyArgs} args - Arguments to filter Site_configs to delete.
     * @example
     * // Delete a few Site_configs
     * const { count } = await prisma.site_config.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends site_configDeleteManyArgs>(args?: SelectSubset<T, site_configDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Site_configs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {site_configUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Site_configs
     * const site_config = await prisma.site_config.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends site_configUpdateManyArgs>(args: SelectSubset<T, site_configUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Site_config.
     * @param {site_configUpsertArgs} args - Arguments to update or create a Site_config.
     * @example
     * // Update or create a Site_config
     * const site_config = await prisma.site_config.upsert({
     *   create: {
     *     // ... data to create a Site_config
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Site_config we want to update
     *   }
     * })
     */
    upsert<T extends site_configUpsertArgs>(args: SelectSubset<T, site_configUpsertArgs<ExtArgs>>): Prisma__site_configClient<$Result.GetResult<Prisma.$site_configPayload<ExtArgs>, T, "upsert">, never, ExtArgs>

    /**
     * Find zero or more Site_configs that matches the filter.
     * @param {site_configFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const site_config = await prisma.site_config.findRaw({
     *   filter: { age: { $gt: 25 } } 
     * })
     */
    findRaw(args?: site_configFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a Site_config.
     * @param {site_configAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const site_config = await prisma.site_config.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: site_configAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of Site_configs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {site_configCountArgs} args - Arguments to filter Site_configs to count.
     * @example
     * // Count the number of Site_configs
     * const count = await prisma.site_config.count({
     *   where: {
     *     // ... the filter for the Site_configs we want to count
     *   }
     * })
    **/
    count<T extends site_configCountArgs>(
      args?: Subset<T, site_configCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Site_configCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Site_config.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Site_configAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Site_configAggregateArgs>(args: Subset<T, Site_configAggregateArgs>): Prisma.PrismaPromise<GetSite_configAggregateType<T>>

    /**
     * Group by Site_config.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {site_configGroupByArgs} args - Group by arguments.
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
      T extends site_configGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: site_configGroupByArgs['orderBy'] }
        : { orderBy?: site_configGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, site_configGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSite_configGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the site_config model
   */
  readonly fields: site_configFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for site_config.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__site_configClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the site_config model
   */ 
  interface site_configFieldRefs {
    readonly id: FieldRef<"site_config", 'String'>
    readonly categories: FieldRef<"site_config", 'String[]'>
    readonly subCategories: FieldRef<"site_config", 'Json'>
    readonly categoryImages: FieldRef<"site_config", 'Json'>
    readonly createdAt: FieldRef<"site_config", 'DateTime'>
    readonly updatedAt: FieldRef<"site_config", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * site_config findUnique
   */
  export type site_configFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the site_config
     */
    select?: site_configSelect<ExtArgs> | null
    /**
     * Filter, which site_config to fetch.
     */
    where: site_configWhereUniqueInput
  }

  /**
   * site_config findUniqueOrThrow
   */
  export type site_configFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the site_config
     */
    select?: site_configSelect<ExtArgs> | null
    /**
     * Filter, which site_config to fetch.
     */
    where: site_configWhereUniqueInput
  }

  /**
   * site_config findFirst
   */
  export type site_configFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the site_config
     */
    select?: site_configSelect<ExtArgs> | null
    /**
     * Filter, which site_config to fetch.
     */
    where?: site_configWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of site_configs to fetch.
     */
    orderBy?: site_configOrderByWithRelationInput | site_configOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for site_configs.
     */
    cursor?: site_configWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` site_configs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` site_configs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of site_configs.
     */
    distinct?: Site_configScalarFieldEnum | Site_configScalarFieldEnum[]
  }

  /**
   * site_config findFirstOrThrow
   */
  export type site_configFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the site_config
     */
    select?: site_configSelect<ExtArgs> | null
    /**
     * Filter, which site_config to fetch.
     */
    where?: site_configWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of site_configs to fetch.
     */
    orderBy?: site_configOrderByWithRelationInput | site_configOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for site_configs.
     */
    cursor?: site_configWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` site_configs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` site_configs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of site_configs.
     */
    distinct?: Site_configScalarFieldEnum | Site_configScalarFieldEnum[]
  }

  /**
   * site_config findMany
   */
  export type site_configFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the site_config
     */
    select?: site_configSelect<ExtArgs> | null
    /**
     * Filter, which site_configs to fetch.
     */
    where?: site_configWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of site_configs to fetch.
     */
    orderBy?: site_configOrderByWithRelationInput | site_configOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing site_configs.
     */
    cursor?: site_configWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` site_configs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` site_configs.
     */
    skip?: number
    distinct?: Site_configScalarFieldEnum | Site_configScalarFieldEnum[]
  }

  /**
   * site_config create
   */
  export type site_configCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the site_config
     */
    select?: site_configSelect<ExtArgs> | null
    /**
     * The data needed to create a site_config.
     */
    data: XOR<site_configCreateInput, site_configUncheckedCreateInput>
  }

  /**
   * site_config createMany
   */
  export type site_configCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many site_configs.
     */
    data: site_configCreateManyInput | site_configCreateManyInput[]
  }

  /**
   * site_config update
   */
  export type site_configUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the site_config
     */
    select?: site_configSelect<ExtArgs> | null
    /**
     * The data needed to update a site_config.
     */
    data: XOR<site_configUpdateInput, site_configUncheckedUpdateInput>
    /**
     * Choose, which site_config to update.
     */
    where: site_configWhereUniqueInput
  }

  /**
   * site_config updateMany
   */
  export type site_configUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update site_configs.
     */
    data: XOR<site_configUpdateManyMutationInput, site_configUncheckedUpdateManyInput>
    /**
     * Filter which site_configs to update
     */
    where?: site_configWhereInput
  }

  /**
   * site_config upsert
   */
  export type site_configUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the site_config
     */
    select?: site_configSelect<ExtArgs> | null
    /**
     * The filter to search for the site_config to update in case it exists.
     */
    where: site_configWhereUniqueInput
    /**
     * In case the site_config found by the `where` argument doesn't exist, create a new site_config with this data.
     */
    create: XOR<site_configCreateInput, site_configUncheckedCreateInput>
    /**
     * In case the site_config was found with the provided `where` argument, update it with this data.
     */
    update: XOR<site_configUpdateInput, site_configUncheckedUpdateInput>
  }

  /**
   * site_config delete
   */
  export type site_configDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the site_config
     */
    select?: site_configSelect<ExtArgs> | null
    /**
     * Filter which site_config to delete.
     */
    where: site_configWhereUniqueInput
  }

  /**
   * site_config deleteMany
   */
  export type site_configDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which site_configs to delete
     */
    where?: site_configWhereInput
  }

  /**
   * site_config findRaw
   */
  export type site_configFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
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
   * site_config aggregateRaw
   */
  export type site_configAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
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
   * site_config without action
   */
  export type site_configDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the site_config
     */
    select?: site_configSelect<ExtArgs> | null
  }


  /**
   * Model products
   */

  export type AggregateProducts = {
    _count: ProductsCountAggregateOutputType | null
    _avg: ProductsAvgAggregateOutputType | null
    _sum: ProductsSumAggregateOutputType | null
    _min: ProductsMinAggregateOutputType | null
    _max: ProductsMaxAggregateOutputType | null
  }

  export type ProductsAvgAggregateOutputType = {
    stock: number | null
    sale_price: number | null
    regular_price: number | null
    totalSold: number | null
    ratings: number | null
  }

  export type ProductsSumAggregateOutputType = {
    stock: number | null
    sale_price: number | null
    regular_price: number | null
    totalSold: number | null
    ratings: number | null
  }

  export type ProductsMinAggregateOutputType = {
    id: string | null
    title: string | null
    slug: string | null
    isCatalog: boolean | null
    category: string | null
    subCategory: string | null
    short_description: string | null
    processingWeightLoss: string | null
    stock: number | null
    sale_price: number | null
    regular_price: number | null
    totalSold: number | null
    ratings: number | null
    cashOnDelivery: string | null
    status: $Enums.productStatus | null
    isDeleted: boolean | null
    deletedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
    storeId: string | null
    adminId: string | null
    catalogProductId: string | null
  }

  export type ProductsMaxAggregateOutputType = {
    id: string | null
    title: string | null
    slug: string | null
    isCatalog: boolean | null
    category: string | null
    subCategory: string | null
    short_description: string | null
    processingWeightLoss: string | null
    stock: number | null
    sale_price: number | null
    regular_price: number | null
    totalSold: number | null
    ratings: number | null
    cashOnDelivery: string | null
    status: $Enums.productStatus | null
    isDeleted: boolean | null
    deletedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
    storeId: string | null
    adminId: string | null
    catalogProductId: string | null
  }

  export type ProductsCountAggregateOutputType = {
    id: number
    title: number
    slug: number
    isCatalog: number
    category: number
    subCategory: number
    short_description: number
    tags: number
    sizes: number
    sizePricing: number
    cuttingTypePricing: number
    pieceSizePricing: number
    cuttingTypes: number
    pieceSizes: number
    processingWeightLoss: number
    stock: number
    sale_price: number
    regular_price: number
    totalSold: number
    ratings: number
    cashOnDelivery: number
    discount_codes: number
    status: number
    isDeleted: number
    deletedAt: number
    createdAt: number
    updatedAt: number
    storeId: number
    adminId: number
    catalogProductId: number
    _all: number
  }


  export type ProductsAvgAggregateInputType = {
    stock?: true
    sale_price?: true
    regular_price?: true
    totalSold?: true
    ratings?: true
  }

  export type ProductsSumAggregateInputType = {
    stock?: true
    sale_price?: true
    regular_price?: true
    totalSold?: true
    ratings?: true
  }

  export type ProductsMinAggregateInputType = {
    id?: true
    title?: true
    slug?: true
    isCatalog?: true
    category?: true
    subCategory?: true
    short_description?: true
    processingWeightLoss?: true
    stock?: true
    sale_price?: true
    regular_price?: true
    totalSold?: true
    ratings?: true
    cashOnDelivery?: true
    status?: true
    isDeleted?: true
    deletedAt?: true
    createdAt?: true
    updatedAt?: true
    storeId?: true
    adminId?: true
    catalogProductId?: true
  }

  export type ProductsMaxAggregateInputType = {
    id?: true
    title?: true
    slug?: true
    isCatalog?: true
    category?: true
    subCategory?: true
    short_description?: true
    processingWeightLoss?: true
    stock?: true
    sale_price?: true
    regular_price?: true
    totalSold?: true
    ratings?: true
    cashOnDelivery?: true
    status?: true
    isDeleted?: true
    deletedAt?: true
    createdAt?: true
    updatedAt?: true
    storeId?: true
    adminId?: true
    catalogProductId?: true
  }

  export type ProductsCountAggregateInputType = {
    id?: true
    title?: true
    slug?: true
    isCatalog?: true
    category?: true
    subCategory?: true
    short_description?: true
    tags?: true
    sizes?: true
    sizePricing?: true
    cuttingTypePricing?: true
    pieceSizePricing?: true
    cuttingTypes?: true
    pieceSizes?: true
    processingWeightLoss?: true
    stock?: true
    sale_price?: true
    regular_price?: true
    totalSold?: true
    ratings?: true
    cashOnDelivery?: true
    discount_codes?: true
    status?: true
    isDeleted?: true
    deletedAt?: true
    createdAt?: true
    updatedAt?: true
    storeId?: true
    adminId?: true
    catalogProductId?: true
    _all?: true
  }

  export type ProductsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which products to aggregate.
     */
    where?: productsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of products to fetch.
     */
    orderBy?: productsOrderByWithRelationInput | productsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: productsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` products.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned products
    **/
    _count?: true | ProductsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ProductsAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ProductsSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProductsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProductsMaxAggregateInputType
  }

  export type GetProductsAggregateType<T extends ProductsAggregateArgs> = {
        [P in keyof T & keyof AggregateProducts]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProducts[P]>
      : GetScalarType<T[P], AggregateProducts[P]>
  }




  export type productsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: productsWhereInput
    orderBy?: productsOrderByWithAggregationInput | productsOrderByWithAggregationInput[]
    by: ProductsScalarFieldEnum[] | ProductsScalarFieldEnum
    having?: productsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProductsCountAggregateInputType | true
    _avg?: ProductsAvgAggregateInputType
    _sum?: ProductsSumAggregateInputType
    _min?: ProductsMinAggregateInputType
    _max?: ProductsMaxAggregateInputType
  }

  export type ProductsGroupByOutputType = {
    id: string
    title: string
    slug: string | null
    isCatalog: boolean
    category: string
    subCategory: string
    short_description: string
    tags: string[]
    sizes: string[]
    sizePricing: JsonValue | null
    cuttingTypePricing: JsonValue | null
    pieceSizePricing: JsonValue | null
    cuttingTypes: string[]
    pieceSizes: string[]
    processingWeightLoss: string | null
    stock: number
    sale_price: number
    regular_price: number
    totalSold: number
    ratings: number
    cashOnDelivery: string | null
    discount_codes: string[]
    status: $Enums.productStatus
    isDeleted: boolean | null
    deletedAt: Date | null
    createdAt: Date
    updatedAt: Date
    storeId: string | null
    adminId: string | null
    catalogProductId: string | null
    _count: ProductsCountAggregateOutputType | null
    _avg: ProductsAvgAggregateOutputType | null
    _sum: ProductsSumAggregateOutputType | null
    _min: ProductsMinAggregateOutputType | null
    _max: ProductsMaxAggregateOutputType | null
  }

  type GetProductsGroupByPayload<T extends productsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProductsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProductsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProductsGroupByOutputType[P]>
            : GetScalarType<T[P], ProductsGroupByOutputType[P]>
        }
      >
    >


  export type productsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    slug?: boolean
    isCatalog?: boolean
    category?: boolean
    subCategory?: boolean
    short_description?: boolean
    tags?: boolean
    sizes?: boolean
    sizePricing?: boolean
    cuttingTypePricing?: boolean
    pieceSizePricing?: boolean
    cuttingTypes?: boolean
    pieceSizes?: boolean
    processingWeightLoss?: boolean
    stock?: boolean
    sale_price?: boolean
    regular_price?: boolean
    totalSold?: boolean
    ratings?: boolean
    cashOnDelivery?: boolean
    discount_codes?: boolean
    status?: boolean
    isDeleted?: boolean
    deletedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    storeId?: boolean
    adminId?: boolean
    catalogProductId?: boolean
    images?: boolean | products$imagesArgs<ExtArgs>
    favorites?: boolean | products$favoritesArgs<ExtArgs>
    store?: boolean | products$storeArgs<ExtArgs>
    admin?: boolean | products$adminArgs<ExtArgs>
    catalogProduct?: boolean | products$catalogProductArgs<ExtArgs>
    storeVariants?: boolean | products$storeVariantsArgs<ExtArgs>
    _count?: boolean | ProductsCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["products"]>


  export type productsSelectScalar = {
    id?: boolean
    title?: boolean
    slug?: boolean
    isCatalog?: boolean
    category?: boolean
    subCategory?: boolean
    short_description?: boolean
    tags?: boolean
    sizes?: boolean
    sizePricing?: boolean
    cuttingTypePricing?: boolean
    pieceSizePricing?: boolean
    cuttingTypes?: boolean
    pieceSizes?: boolean
    processingWeightLoss?: boolean
    stock?: boolean
    sale_price?: boolean
    regular_price?: boolean
    totalSold?: boolean
    ratings?: boolean
    cashOnDelivery?: boolean
    discount_codes?: boolean
    status?: boolean
    isDeleted?: boolean
    deletedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    storeId?: boolean
    adminId?: boolean
    catalogProductId?: boolean
  }

  export type productsInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    images?: boolean | products$imagesArgs<ExtArgs>
    favorites?: boolean | products$favoritesArgs<ExtArgs>
    store?: boolean | products$storeArgs<ExtArgs>
    admin?: boolean | products$adminArgs<ExtArgs>
    catalogProduct?: boolean | products$catalogProductArgs<ExtArgs>
    storeVariants?: boolean | products$storeVariantsArgs<ExtArgs>
    _count?: boolean | ProductsCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $productsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "products"
    objects: {
      images: Prisma.$imagesPayload<ExtArgs>[]
      favorites: Prisma.$favoritesPayload<ExtArgs>[]
      store: Prisma.$storesPayload<ExtArgs> | null
      admin: Prisma.$adminsPayload<ExtArgs> | null
      catalogProduct: Prisma.$productsPayload<ExtArgs> | null
      storeVariants: Prisma.$productsPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      title: string
      slug: string | null
      isCatalog: boolean
      category: string
      subCategory: string
      short_description: string
      tags: string[]
      sizes: string[]
      sizePricing: Prisma.JsonValue | null
      cuttingTypePricing: Prisma.JsonValue | null
      pieceSizePricing: Prisma.JsonValue | null
      cuttingTypes: string[]
      pieceSizes: string[]
      processingWeightLoss: string | null
      stock: number
      sale_price: number
      regular_price: number
      totalSold: number
      ratings: number
      cashOnDelivery: string | null
      discount_codes: string[]
      status: $Enums.productStatus
      isDeleted: boolean | null
      deletedAt: Date | null
      createdAt: Date
      updatedAt: Date
      storeId: string | null
      adminId: string | null
      catalogProductId: string | null
    }, ExtArgs["result"]["products"]>
    composites: {}
  }

  type productsGetPayload<S extends boolean | null | undefined | productsDefaultArgs> = $Result.GetResult<Prisma.$productsPayload, S>

  type productsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<productsFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ProductsCountAggregateInputType | true
    }

  export interface productsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['products'], meta: { name: 'products' } }
    /**
     * Find zero or one Products that matches the filter.
     * @param {productsFindUniqueArgs} args - Arguments to find a Products
     * @example
     * // Get one Products
     * const products = await prisma.products.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends productsFindUniqueArgs>(args: SelectSubset<T, productsFindUniqueArgs<ExtArgs>>): Prisma__productsClient<$Result.GetResult<Prisma.$productsPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Products that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {productsFindUniqueOrThrowArgs} args - Arguments to find a Products
     * @example
     * // Get one Products
     * const products = await prisma.products.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends productsFindUniqueOrThrowArgs>(args: SelectSubset<T, productsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__productsClient<$Result.GetResult<Prisma.$productsPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Products that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {productsFindFirstArgs} args - Arguments to find a Products
     * @example
     * // Get one Products
     * const products = await prisma.products.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends productsFindFirstArgs>(args?: SelectSubset<T, productsFindFirstArgs<ExtArgs>>): Prisma__productsClient<$Result.GetResult<Prisma.$productsPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Products that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {productsFindFirstOrThrowArgs} args - Arguments to find a Products
     * @example
     * // Get one Products
     * const products = await prisma.products.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends productsFindFirstOrThrowArgs>(args?: SelectSubset<T, productsFindFirstOrThrowArgs<ExtArgs>>): Prisma__productsClient<$Result.GetResult<Prisma.$productsPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Products that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {productsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Products
     * const products = await prisma.products.findMany()
     * 
     * // Get first 10 Products
     * const products = await prisma.products.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const productsWithIdOnly = await prisma.products.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends productsFindManyArgs>(args?: SelectSubset<T, productsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$productsPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Products.
     * @param {productsCreateArgs} args - Arguments to create a Products.
     * @example
     * // Create one Products
     * const Products = await prisma.products.create({
     *   data: {
     *     // ... data to create a Products
     *   }
     * })
     * 
     */
    create<T extends productsCreateArgs>(args: SelectSubset<T, productsCreateArgs<ExtArgs>>): Prisma__productsClient<$Result.GetResult<Prisma.$productsPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Products.
     * @param {productsCreateManyArgs} args - Arguments to create many Products.
     * @example
     * // Create many Products
     * const products = await prisma.products.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends productsCreateManyArgs>(args?: SelectSubset<T, productsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Products.
     * @param {productsDeleteArgs} args - Arguments to delete one Products.
     * @example
     * // Delete one Products
     * const Products = await prisma.products.delete({
     *   where: {
     *     // ... filter to delete one Products
     *   }
     * })
     * 
     */
    delete<T extends productsDeleteArgs>(args: SelectSubset<T, productsDeleteArgs<ExtArgs>>): Prisma__productsClient<$Result.GetResult<Prisma.$productsPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Products.
     * @param {productsUpdateArgs} args - Arguments to update one Products.
     * @example
     * // Update one Products
     * const products = await prisma.products.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends productsUpdateArgs>(args: SelectSubset<T, productsUpdateArgs<ExtArgs>>): Prisma__productsClient<$Result.GetResult<Prisma.$productsPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Products.
     * @param {productsDeleteManyArgs} args - Arguments to filter Products to delete.
     * @example
     * // Delete a few Products
     * const { count } = await prisma.products.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends productsDeleteManyArgs>(args?: SelectSubset<T, productsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Products.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {productsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Products
     * const products = await prisma.products.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends productsUpdateManyArgs>(args: SelectSubset<T, productsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Products.
     * @param {productsUpsertArgs} args - Arguments to update or create a Products.
     * @example
     * // Update or create a Products
     * const products = await prisma.products.upsert({
     *   create: {
     *     // ... data to create a Products
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Products we want to update
     *   }
     * })
     */
    upsert<T extends productsUpsertArgs>(args: SelectSubset<T, productsUpsertArgs<ExtArgs>>): Prisma__productsClient<$Result.GetResult<Prisma.$productsPayload<ExtArgs>, T, "upsert">, never, ExtArgs>

    /**
     * Find zero or more Products that matches the filter.
     * @param {productsFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const products = await prisma.products.findRaw({
     *   filter: { age: { $gt: 25 } } 
     * })
     */
    findRaw(args?: productsFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a Products.
     * @param {productsAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const products = await prisma.products.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: productsAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of Products.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {productsCountArgs} args - Arguments to filter Products to count.
     * @example
     * // Count the number of Products
     * const count = await prisma.products.count({
     *   where: {
     *     // ... the filter for the Products we want to count
     *   }
     * })
    **/
    count<T extends productsCountArgs>(
      args?: Subset<T, productsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProductsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Products.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ProductsAggregateArgs>(args: Subset<T, ProductsAggregateArgs>): Prisma.PrismaPromise<GetProductsAggregateType<T>>

    /**
     * Group by Products.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {productsGroupByArgs} args - Group by arguments.
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
      T extends productsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: productsGroupByArgs['orderBy'] }
        : { orderBy?: productsGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, productsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProductsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the products model
   */
  readonly fields: productsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for products.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__productsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    images<T extends products$imagesArgs<ExtArgs> = {}>(args?: Subset<T, products$imagesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$imagesPayload<ExtArgs>, T, "findMany"> | Null>
    favorites<T extends products$favoritesArgs<ExtArgs> = {}>(args?: Subset<T, products$favoritesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$favoritesPayload<ExtArgs>, T, "findMany"> | Null>
    store<T extends products$storeArgs<ExtArgs> = {}>(args?: Subset<T, products$storeArgs<ExtArgs>>): Prisma__storesClient<$Result.GetResult<Prisma.$storesPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    admin<T extends products$adminArgs<ExtArgs> = {}>(args?: Subset<T, products$adminArgs<ExtArgs>>): Prisma__adminsClient<$Result.GetResult<Prisma.$adminsPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    catalogProduct<T extends products$catalogProductArgs<ExtArgs> = {}>(args?: Subset<T, products$catalogProductArgs<ExtArgs>>): Prisma__productsClient<$Result.GetResult<Prisma.$productsPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    storeVariants<T extends products$storeVariantsArgs<ExtArgs> = {}>(args?: Subset<T, products$storeVariantsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$productsPayload<ExtArgs>, T, "findMany"> | Null>
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
   * Fields of the products model
   */ 
  interface productsFieldRefs {
    readonly id: FieldRef<"products", 'String'>
    readonly title: FieldRef<"products", 'String'>
    readonly slug: FieldRef<"products", 'String'>
    readonly isCatalog: FieldRef<"products", 'Boolean'>
    readonly category: FieldRef<"products", 'String'>
    readonly subCategory: FieldRef<"products", 'String'>
    readonly short_description: FieldRef<"products", 'String'>
    readonly tags: FieldRef<"products", 'String[]'>
    readonly sizes: FieldRef<"products", 'String[]'>
    readonly sizePricing: FieldRef<"products", 'Json'>
    readonly cuttingTypePricing: FieldRef<"products", 'Json'>
    readonly pieceSizePricing: FieldRef<"products", 'Json'>
    readonly cuttingTypes: FieldRef<"products", 'String[]'>
    readonly pieceSizes: FieldRef<"products", 'String[]'>
    readonly processingWeightLoss: FieldRef<"products", 'String'>
    readonly stock: FieldRef<"products", 'Int'>
    readonly sale_price: FieldRef<"products", 'Float'>
    readonly regular_price: FieldRef<"products", 'Float'>
    readonly totalSold: FieldRef<"products", 'Int'>
    readonly ratings: FieldRef<"products", 'Float'>
    readonly cashOnDelivery: FieldRef<"products", 'String'>
    readonly discount_codes: FieldRef<"products", 'String[]'>
    readonly status: FieldRef<"products", 'productStatus'>
    readonly isDeleted: FieldRef<"products", 'Boolean'>
    readonly deletedAt: FieldRef<"products", 'DateTime'>
    readonly createdAt: FieldRef<"products", 'DateTime'>
    readonly updatedAt: FieldRef<"products", 'DateTime'>
    readonly storeId: FieldRef<"products", 'String'>
    readonly adminId: FieldRef<"products", 'String'>
    readonly catalogProductId: FieldRef<"products", 'String'>
  }
    

  // Custom InputTypes
  /**
   * products findUnique
   */
  export type productsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the products
     */
    select?: productsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: productsInclude<ExtArgs> | null
    /**
     * Filter, which products to fetch.
     */
    where: productsWhereUniqueInput
  }

  /**
   * products findUniqueOrThrow
   */
  export type productsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the products
     */
    select?: productsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: productsInclude<ExtArgs> | null
    /**
     * Filter, which products to fetch.
     */
    where: productsWhereUniqueInput
  }

  /**
   * products findFirst
   */
  export type productsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the products
     */
    select?: productsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: productsInclude<ExtArgs> | null
    /**
     * Filter, which products to fetch.
     */
    where?: productsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of products to fetch.
     */
    orderBy?: productsOrderByWithRelationInput | productsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for products.
     */
    cursor?: productsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` products.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of products.
     */
    distinct?: ProductsScalarFieldEnum | ProductsScalarFieldEnum[]
  }

  /**
   * products findFirstOrThrow
   */
  export type productsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the products
     */
    select?: productsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: productsInclude<ExtArgs> | null
    /**
     * Filter, which products to fetch.
     */
    where?: productsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of products to fetch.
     */
    orderBy?: productsOrderByWithRelationInput | productsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for products.
     */
    cursor?: productsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` products.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of products.
     */
    distinct?: ProductsScalarFieldEnum | ProductsScalarFieldEnum[]
  }

  /**
   * products findMany
   */
  export type productsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the products
     */
    select?: productsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: productsInclude<ExtArgs> | null
    /**
     * Filter, which products to fetch.
     */
    where?: productsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of products to fetch.
     */
    orderBy?: productsOrderByWithRelationInput | productsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing products.
     */
    cursor?: productsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` products.
     */
    skip?: number
    distinct?: ProductsScalarFieldEnum | ProductsScalarFieldEnum[]
  }

  /**
   * products create
   */
  export type productsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the products
     */
    select?: productsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: productsInclude<ExtArgs> | null
    /**
     * The data needed to create a products.
     */
    data: XOR<productsCreateInput, productsUncheckedCreateInput>
  }

  /**
   * products createMany
   */
  export type productsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many products.
     */
    data: productsCreateManyInput | productsCreateManyInput[]
  }

  /**
   * products update
   */
  export type productsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the products
     */
    select?: productsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: productsInclude<ExtArgs> | null
    /**
     * The data needed to update a products.
     */
    data: XOR<productsUpdateInput, productsUncheckedUpdateInput>
    /**
     * Choose, which products to update.
     */
    where: productsWhereUniqueInput
  }

  /**
   * products updateMany
   */
  export type productsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update products.
     */
    data: XOR<productsUpdateManyMutationInput, productsUncheckedUpdateManyInput>
    /**
     * Filter which products to update
     */
    where?: productsWhereInput
  }

  /**
   * products upsert
   */
  export type productsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the products
     */
    select?: productsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: productsInclude<ExtArgs> | null
    /**
     * The filter to search for the products to update in case it exists.
     */
    where: productsWhereUniqueInput
    /**
     * In case the products found by the `where` argument doesn't exist, create a new products with this data.
     */
    create: XOR<productsCreateInput, productsUncheckedCreateInput>
    /**
     * In case the products was found with the provided `where` argument, update it with this data.
     */
    update: XOR<productsUpdateInput, productsUncheckedUpdateInput>
  }

  /**
   * products delete
   */
  export type productsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the products
     */
    select?: productsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: productsInclude<ExtArgs> | null
    /**
     * Filter which products to delete.
     */
    where: productsWhereUniqueInput
  }

  /**
   * products deleteMany
   */
  export type productsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which products to delete
     */
    where?: productsWhereInput
  }

  /**
   * products findRaw
   */
  export type productsFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
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
   * products aggregateRaw
   */
  export type productsAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
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
   * products.images
   */
  export type products$imagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the images
     */
    select?: imagesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: imagesInclude<ExtArgs> | null
    where?: imagesWhereInput
    orderBy?: imagesOrderByWithRelationInput | imagesOrderByWithRelationInput[]
    cursor?: imagesWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ImagesScalarFieldEnum | ImagesScalarFieldEnum[]
  }

  /**
   * products.favorites
   */
  export type products$favoritesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the favorites
     */
    select?: favoritesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: favoritesInclude<ExtArgs> | null
    where?: favoritesWhereInput
    orderBy?: favoritesOrderByWithRelationInput | favoritesOrderByWithRelationInput[]
    cursor?: favoritesWhereUniqueInput
    take?: number
    skip?: number
    distinct?: FavoritesScalarFieldEnum | FavoritesScalarFieldEnum[]
  }

  /**
   * products.store
   */
  export type products$storeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the stores
     */
    select?: storesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: storesInclude<ExtArgs> | null
    where?: storesWhereInput
  }

  /**
   * products.admin
   */
  export type products$adminArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the admins
     */
    select?: adminsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: adminsInclude<ExtArgs> | null
    where?: adminsWhereInput
  }

  /**
   * products.catalogProduct
   */
  export type products$catalogProductArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the products
     */
    select?: productsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: productsInclude<ExtArgs> | null
    where?: productsWhereInput
  }

  /**
   * products.storeVariants
   */
  export type products$storeVariantsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the products
     */
    select?: productsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: productsInclude<ExtArgs> | null
    where?: productsWhereInput
    orderBy?: productsOrderByWithRelationInput | productsOrderByWithRelationInput[]
    cursor?: productsWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ProductsScalarFieldEnum | ProductsScalarFieldEnum[]
  }

  /**
   * products without action
   */
  export type productsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the products
     */
    select?: productsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: productsInclude<ExtArgs> | null
  }


  /**
   * Model banners
   */

  export type AggregateBanners = {
    _count: BannersCountAggregateOutputType | null
    _min: BannersMinAggregateOutputType | null
    _max: BannersMaxAggregateOutputType | null
  }

  export type BannersMinAggregateOutputType = {
    id: string | null
    imageUrl: string | null
    fileId: string | null
    isActive: boolean | null
    category: string | null
    status: string | null
    rejectionReason: string | null
    bannerType: string | null
    title: string | null
    subtitle: string | null
    price: string | null
    sellerId: string | null
    adminId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type BannersMaxAggregateOutputType = {
    id: string | null
    imageUrl: string | null
    fileId: string | null
    isActive: boolean | null
    category: string | null
    status: string | null
    rejectionReason: string | null
    bannerType: string | null
    title: string | null
    subtitle: string | null
    price: string | null
    sellerId: string | null
    adminId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type BannersCountAggregateOutputType = {
    id: number
    imageUrl: number
    fileId: number
    isActive: number
    category: number
    status: number
    rejectionReason: number
    bannerType: number
    title: number
    subtitle: number
    price: number
    sellerId: number
    adminId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type BannersMinAggregateInputType = {
    id?: true
    imageUrl?: true
    fileId?: true
    isActive?: true
    category?: true
    status?: true
    rejectionReason?: true
    bannerType?: true
    title?: true
    subtitle?: true
    price?: true
    sellerId?: true
    adminId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type BannersMaxAggregateInputType = {
    id?: true
    imageUrl?: true
    fileId?: true
    isActive?: true
    category?: true
    status?: true
    rejectionReason?: true
    bannerType?: true
    title?: true
    subtitle?: true
    price?: true
    sellerId?: true
    adminId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type BannersCountAggregateInputType = {
    id?: true
    imageUrl?: true
    fileId?: true
    isActive?: true
    category?: true
    status?: true
    rejectionReason?: true
    bannerType?: true
    title?: true
    subtitle?: true
    price?: true
    sellerId?: true
    adminId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type BannersAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which banners to aggregate.
     */
    where?: bannersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of banners to fetch.
     */
    orderBy?: bannersOrderByWithRelationInput | bannersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: bannersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` banners from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` banners.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned banners
    **/
    _count?: true | BannersCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: BannersMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: BannersMaxAggregateInputType
  }

  export type GetBannersAggregateType<T extends BannersAggregateArgs> = {
        [P in keyof T & keyof AggregateBanners]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateBanners[P]>
      : GetScalarType<T[P], AggregateBanners[P]>
  }




  export type bannersGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: bannersWhereInput
    orderBy?: bannersOrderByWithAggregationInput | bannersOrderByWithAggregationInput[]
    by: BannersScalarFieldEnum[] | BannersScalarFieldEnum
    having?: bannersScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: BannersCountAggregateInputType | true
    _min?: BannersMinAggregateInputType
    _max?: BannersMaxAggregateInputType
  }

  export type BannersGroupByOutputType = {
    id: string
    imageUrl: string
    fileId: string
    isActive: boolean
    category: string | null
    status: string | null
    rejectionReason: string | null
    bannerType: string | null
    title: string | null
    subtitle: string | null
    price: string | null
    sellerId: string | null
    adminId: string | null
    createdAt: Date
    updatedAt: Date
    _count: BannersCountAggregateOutputType | null
    _min: BannersMinAggregateOutputType | null
    _max: BannersMaxAggregateOutputType | null
  }

  type GetBannersGroupByPayload<T extends bannersGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<BannersGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof BannersGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], BannersGroupByOutputType[P]>
            : GetScalarType<T[P], BannersGroupByOutputType[P]>
        }
      >
    >


  export type bannersSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    imageUrl?: boolean
    fileId?: boolean
    isActive?: boolean
    category?: boolean
    status?: boolean
    rejectionReason?: boolean
    bannerType?: boolean
    title?: boolean
    subtitle?: boolean
    price?: boolean
    sellerId?: boolean
    adminId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    seller?: boolean | banners$sellerArgs<ExtArgs>
    admin?: boolean | banners$adminArgs<ExtArgs>
  }, ExtArgs["result"]["banners"]>


  export type bannersSelectScalar = {
    id?: boolean
    imageUrl?: boolean
    fileId?: boolean
    isActive?: boolean
    category?: boolean
    status?: boolean
    rejectionReason?: boolean
    bannerType?: boolean
    title?: boolean
    subtitle?: boolean
    price?: boolean
    sellerId?: boolean
    adminId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type bannersInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    seller?: boolean | banners$sellerArgs<ExtArgs>
    admin?: boolean | banners$adminArgs<ExtArgs>
  }

  export type $bannersPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "banners"
    objects: {
      seller: Prisma.$sellersPayload<ExtArgs> | null
      admin: Prisma.$adminsPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      imageUrl: string
      fileId: string
      isActive: boolean
      category: string | null
      status: string | null
      rejectionReason: string | null
      bannerType: string | null
      title: string | null
      subtitle: string | null
      price: string | null
      sellerId: string | null
      adminId: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["banners"]>
    composites: {}
  }

  type bannersGetPayload<S extends boolean | null | undefined | bannersDefaultArgs> = $Result.GetResult<Prisma.$bannersPayload, S>

  type bannersCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<bannersFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: BannersCountAggregateInputType | true
    }

  export interface bannersDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['banners'], meta: { name: 'banners' } }
    /**
     * Find zero or one Banners that matches the filter.
     * @param {bannersFindUniqueArgs} args - Arguments to find a Banners
     * @example
     * // Get one Banners
     * const banners = await prisma.banners.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends bannersFindUniqueArgs>(args: SelectSubset<T, bannersFindUniqueArgs<ExtArgs>>): Prisma__bannersClient<$Result.GetResult<Prisma.$bannersPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Banners that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {bannersFindUniqueOrThrowArgs} args - Arguments to find a Banners
     * @example
     * // Get one Banners
     * const banners = await prisma.banners.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends bannersFindUniqueOrThrowArgs>(args: SelectSubset<T, bannersFindUniqueOrThrowArgs<ExtArgs>>): Prisma__bannersClient<$Result.GetResult<Prisma.$bannersPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Banners that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {bannersFindFirstArgs} args - Arguments to find a Banners
     * @example
     * // Get one Banners
     * const banners = await prisma.banners.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends bannersFindFirstArgs>(args?: SelectSubset<T, bannersFindFirstArgs<ExtArgs>>): Prisma__bannersClient<$Result.GetResult<Prisma.$bannersPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Banners that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {bannersFindFirstOrThrowArgs} args - Arguments to find a Banners
     * @example
     * // Get one Banners
     * const banners = await prisma.banners.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends bannersFindFirstOrThrowArgs>(args?: SelectSubset<T, bannersFindFirstOrThrowArgs<ExtArgs>>): Prisma__bannersClient<$Result.GetResult<Prisma.$bannersPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Banners that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {bannersFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Banners
     * const banners = await prisma.banners.findMany()
     * 
     * // Get first 10 Banners
     * const banners = await prisma.banners.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const bannersWithIdOnly = await prisma.banners.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends bannersFindManyArgs>(args?: SelectSubset<T, bannersFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$bannersPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Banners.
     * @param {bannersCreateArgs} args - Arguments to create a Banners.
     * @example
     * // Create one Banners
     * const Banners = await prisma.banners.create({
     *   data: {
     *     // ... data to create a Banners
     *   }
     * })
     * 
     */
    create<T extends bannersCreateArgs>(args: SelectSubset<T, bannersCreateArgs<ExtArgs>>): Prisma__bannersClient<$Result.GetResult<Prisma.$bannersPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Banners.
     * @param {bannersCreateManyArgs} args - Arguments to create many Banners.
     * @example
     * // Create many Banners
     * const banners = await prisma.banners.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends bannersCreateManyArgs>(args?: SelectSubset<T, bannersCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Banners.
     * @param {bannersDeleteArgs} args - Arguments to delete one Banners.
     * @example
     * // Delete one Banners
     * const Banners = await prisma.banners.delete({
     *   where: {
     *     // ... filter to delete one Banners
     *   }
     * })
     * 
     */
    delete<T extends bannersDeleteArgs>(args: SelectSubset<T, bannersDeleteArgs<ExtArgs>>): Prisma__bannersClient<$Result.GetResult<Prisma.$bannersPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Banners.
     * @param {bannersUpdateArgs} args - Arguments to update one Banners.
     * @example
     * // Update one Banners
     * const banners = await prisma.banners.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends bannersUpdateArgs>(args: SelectSubset<T, bannersUpdateArgs<ExtArgs>>): Prisma__bannersClient<$Result.GetResult<Prisma.$bannersPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Banners.
     * @param {bannersDeleteManyArgs} args - Arguments to filter Banners to delete.
     * @example
     * // Delete a few Banners
     * const { count } = await prisma.banners.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends bannersDeleteManyArgs>(args?: SelectSubset<T, bannersDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Banners.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {bannersUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Banners
     * const banners = await prisma.banners.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends bannersUpdateManyArgs>(args: SelectSubset<T, bannersUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Banners.
     * @param {bannersUpsertArgs} args - Arguments to update or create a Banners.
     * @example
     * // Update or create a Banners
     * const banners = await prisma.banners.upsert({
     *   create: {
     *     // ... data to create a Banners
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Banners we want to update
     *   }
     * })
     */
    upsert<T extends bannersUpsertArgs>(args: SelectSubset<T, bannersUpsertArgs<ExtArgs>>): Prisma__bannersClient<$Result.GetResult<Prisma.$bannersPayload<ExtArgs>, T, "upsert">, never, ExtArgs>

    /**
     * Find zero or more Banners that matches the filter.
     * @param {bannersFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const banners = await prisma.banners.findRaw({
     *   filter: { age: { $gt: 25 } } 
     * })
     */
    findRaw(args?: bannersFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a Banners.
     * @param {bannersAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const banners = await prisma.banners.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: bannersAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of Banners.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {bannersCountArgs} args - Arguments to filter Banners to count.
     * @example
     * // Count the number of Banners
     * const count = await prisma.banners.count({
     *   where: {
     *     // ... the filter for the Banners we want to count
     *   }
     * })
    **/
    count<T extends bannersCountArgs>(
      args?: Subset<T, bannersCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], BannersCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Banners.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BannersAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends BannersAggregateArgs>(args: Subset<T, BannersAggregateArgs>): Prisma.PrismaPromise<GetBannersAggregateType<T>>

    /**
     * Group by Banners.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {bannersGroupByArgs} args - Group by arguments.
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
      T extends bannersGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: bannersGroupByArgs['orderBy'] }
        : { orderBy?: bannersGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, bannersGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBannersGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the banners model
   */
  readonly fields: bannersFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for banners.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__bannersClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    seller<T extends banners$sellerArgs<ExtArgs> = {}>(args?: Subset<T, banners$sellerArgs<ExtArgs>>): Prisma__sellersClient<$Result.GetResult<Prisma.$sellersPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    admin<T extends banners$adminArgs<ExtArgs> = {}>(args?: Subset<T, banners$adminArgs<ExtArgs>>): Prisma__adminsClient<$Result.GetResult<Prisma.$adminsPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
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
   * Fields of the banners model
   */ 
  interface bannersFieldRefs {
    readonly id: FieldRef<"banners", 'String'>
    readonly imageUrl: FieldRef<"banners", 'String'>
    readonly fileId: FieldRef<"banners", 'String'>
    readonly isActive: FieldRef<"banners", 'Boolean'>
    readonly category: FieldRef<"banners", 'String'>
    readonly status: FieldRef<"banners", 'String'>
    readonly rejectionReason: FieldRef<"banners", 'String'>
    readonly bannerType: FieldRef<"banners", 'String'>
    readonly title: FieldRef<"banners", 'String'>
    readonly subtitle: FieldRef<"banners", 'String'>
    readonly price: FieldRef<"banners", 'String'>
    readonly sellerId: FieldRef<"banners", 'String'>
    readonly adminId: FieldRef<"banners", 'String'>
    readonly createdAt: FieldRef<"banners", 'DateTime'>
    readonly updatedAt: FieldRef<"banners", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * banners findUnique
   */
  export type bannersFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the banners
     */
    select?: bannersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: bannersInclude<ExtArgs> | null
    /**
     * Filter, which banners to fetch.
     */
    where: bannersWhereUniqueInput
  }

  /**
   * banners findUniqueOrThrow
   */
  export type bannersFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the banners
     */
    select?: bannersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: bannersInclude<ExtArgs> | null
    /**
     * Filter, which banners to fetch.
     */
    where: bannersWhereUniqueInput
  }

  /**
   * banners findFirst
   */
  export type bannersFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the banners
     */
    select?: bannersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: bannersInclude<ExtArgs> | null
    /**
     * Filter, which banners to fetch.
     */
    where?: bannersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of banners to fetch.
     */
    orderBy?: bannersOrderByWithRelationInput | bannersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for banners.
     */
    cursor?: bannersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` banners from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` banners.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of banners.
     */
    distinct?: BannersScalarFieldEnum | BannersScalarFieldEnum[]
  }

  /**
   * banners findFirstOrThrow
   */
  export type bannersFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the banners
     */
    select?: bannersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: bannersInclude<ExtArgs> | null
    /**
     * Filter, which banners to fetch.
     */
    where?: bannersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of banners to fetch.
     */
    orderBy?: bannersOrderByWithRelationInput | bannersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for banners.
     */
    cursor?: bannersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` banners from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` banners.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of banners.
     */
    distinct?: BannersScalarFieldEnum | BannersScalarFieldEnum[]
  }

  /**
   * banners findMany
   */
  export type bannersFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the banners
     */
    select?: bannersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: bannersInclude<ExtArgs> | null
    /**
     * Filter, which banners to fetch.
     */
    where?: bannersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of banners to fetch.
     */
    orderBy?: bannersOrderByWithRelationInput | bannersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing banners.
     */
    cursor?: bannersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` banners from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` banners.
     */
    skip?: number
    distinct?: BannersScalarFieldEnum | BannersScalarFieldEnum[]
  }

  /**
   * banners create
   */
  export type bannersCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the banners
     */
    select?: bannersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: bannersInclude<ExtArgs> | null
    /**
     * The data needed to create a banners.
     */
    data: XOR<bannersCreateInput, bannersUncheckedCreateInput>
  }

  /**
   * banners createMany
   */
  export type bannersCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many banners.
     */
    data: bannersCreateManyInput | bannersCreateManyInput[]
  }

  /**
   * banners update
   */
  export type bannersUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the banners
     */
    select?: bannersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: bannersInclude<ExtArgs> | null
    /**
     * The data needed to update a banners.
     */
    data: XOR<bannersUpdateInput, bannersUncheckedUpdateInput>
    /**
     * Choose, which banners to update.
     */
    where: bannersWhereUniqueInput
  }

  /**
   * banners updateMany
   */
  export type bannersUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update banners.
     */
    data: XOR<bannersUpdateManyMutationInput, bannersUncheckedUpdateManyInput>
    /**
     * Filter which banners to update
     */
    where?: bannersWhereInput
  }

  /**
   * banners upsert
   */
  export type bannersUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the banners
     */
    select?: bannersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: bannersInclude<ExtArgs> | null
    /**
     * The filter to search for the banners to update in case it exists.
     */
    where: bannersWhereUniqueInput
    /**
     * In case the banners found by the `where` argument doesn't exist, create a new banners with this data.
     */
    create: XOR<bannersCreateInput, bannersUncheckedCreateInput>
    /**
     * In case the banners was found with the provided `where` argument, update it with this data.
     */
    update: XOR<bannersUpdateInput, bannersUncheckedUpdateInput>
  }

  /**
   * banners delete
   */
  export type bannersDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the banners
     */
    select?: bannersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: bannersInclude<ExtArgs> | null
    /**
     * Filter which banners to delete.
     */
    where: bannersWhereUniqueInput
  }

  /**
   * banners deleteMany
   */
  export type bannersDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which banners to delete
     */
    where?: bannersWhereInput
  }

  /**
   * banners findRaw
   */
  export type bannersFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
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
   * banners aggregateRaw
   */
  export type bannersAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
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
   * banners.seller
   */
  export type banners$sellerArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the sellers
     */
    select?: sellersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: sellersInclude<ExtArgs> | null
    where?: sellersWhereInput
  }

  /**
   * banners.admin
   */
  export type banners$adminArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the admins
     */
    select?: adminsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: adminsInclude<ExtArgs> | null
    where?: adminsWhereInput
  }

  /**
   * banners without action
   */
  export type bannersDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the banners
     */
    select?: bannersSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: bannersInclude<ExtArgs> | null
  }


  /**
   * Model seller_events
   */

  export type AggregateSeller_events = {
    _count: Seller_eventsCountAggregateOutputType | null
    _avg: Seller_eventsAvgAggregateOutputType | null
    _sum: Seller_eventsSumAggregateOutputType | null
    _min: Seller_eventsMinAggregateOutputType | null
    _max: Seller_eventsMaxAggregateOutputType | null
  }

  export type Seller_eventsAvgAggregateOutputType = {
    minOrder: number | null
    discount: number | null
  }

  export type Seller_eventsSumAggregateOutputType = {
    minOrder: number | null
    discount: number | null
  }

  export type Seller_eventsMinAggregateOutputType = {
    id: string | null
    sellerId: string | null
    title: string | null
    description: string | null
    type: $Enums.sellerEventType | null
    minOrder: number | null
    discount: number | null
    startTime: Date | null
    endTime: Date | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type Seller_eventsMaxAggregateOutputType = {
    id: string | null
    sellerId: string | null
    title: string | null
    description: string | null
    type: $Enums.sellerEventType | null
    minOrder: number | null
    discount: number | null
    startTime: Date | null
    endTime: Date | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type Seller_eventsCountAggregateOutputType = {
    id: number
    sellerId: number
    title: number
    description: number
    type: number
    minOrder: number
    discount: number
    startTime: number
    endTime: number
    isActive: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type Seller_eventsAvgAggregateInputType = {
    minOrder?: true
    discount?: true
  }

  export type Seller_eventsSumAggregateInputType = {
    minOrder?: true
    discount?: true
  }

  export type Seller_eventsMinAggregateInputType = {
    id?: true
    sellerId?: true
    title?: true
    description?: true
    type?: true
    minOrder?: true
    discount?: true
    startTime?: true
    endTime?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type Seller_eventsMaxAggregateInputType = {
    id?: true
    sellerId?: true
    title?: true
    description?: true
    type?: true
    minOrder?: true
    discount?: true
    startTime?: true
    endTime?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type Seller_eventsCountAggregateInputType = {
    id?: true
    sellerId?: true
    title?: true
    description?: true
    type?: true
    minOrder?: true
    discount?: true
    startTime?: true
    endTime?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type Seller_eventsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which seller_events to aggregate.
     */
    where?: seller_eventsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of seller_events to fetch.
     */
    orderBy?: seller_eventsOrderByWithRelationInput | seller_eventsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: seller_eventsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` seller_events from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` seller_events.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned seller_events
    **/
    _count?: true | Seller_eventsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Seller_eventsAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Seller_eventsSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Seller_eventsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Seller_eventsMaxAggregateInputType
  }

  export type GetSeller_eventsAggregateType<T extends Seller_eventsAggregateArgs> = {
        [P in keyof T & keyof AggregateSeller_events]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSeller_events[P]>
      : GetScalarType<T[P], AggregateSeller_events[P]>
  }




  export type seller_eventsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: seller_eventsWhereInput
    orderBy?: seller_eventsOrderByWithAggregationInput | seller_eventsOrderByWithAggregationInput[]
    by: Seller_eventsScalarFieldEnum[] | Seller_eventsScalarFieldEnum
    having?: seller_eventsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Seller_eventsCountAggregateInputType | true
    _avg?: Seller_eventsAvgAggregateInputType
    _sum?: Seller_eventsSumAggregateInputType
    _min?: Seller_eventsMinAggregateInputType
    _max?: Seller_eventsMaxAggregateInputType
  }

  export type Seller_eventsGroupByOutputType = {
    id: string
    sellerId: string
    title: string
    description: string | null
    type: $Enums.sellerEventType
    minOrder: number | null
    discount: number | null
    startTime: Date
    endTime: Date
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    _count: Seller_eventsCountAggregateOutputType | null
    _avg: Seller_eventsAvgAggregateOutputType | null
    _sum: Seller_eventsSumAggregateOutputType | null
    _min: Seller_eventsMinAggregateOutputType | null
    _max: Seller_eventsMaxAggregateOutputType | null
  }

  type GetSeller_eventsGroupByPayload<T extends seller_eventsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Seller_eventsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Seller_eventsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Seller_eventsGroupByOutputType[P]>
            : GetScalarType<T[P], Seller_eventsGroupByOutputType[P]>
        }
      >
    >


  export type seller_eventsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sellerId?: boolean
    title?: boolean
    description?: boolean
    type?: boolean
    minOrder?: boolean
    discount?: boolean
    startTime?: boolean
    endTime?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    seller?: boolean | sellersDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["seller_events"]>


  export type seller_eventsSelectScalar = {
    id?: boolean
    sellerId?: boolean
    title?: boolean
    description?: boolean
    type?: boolean
    minOrder?: boolean
    discount?: boolean
    startTime?: boolean
    endTime?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type seller_eventsInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    seller?: boolean | sellersDefaultArgs<ExtArgs>
  }

  export type $seller_eventsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "seller_events"
    objects: {
      seller: Prisma.$sellersPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      sellerId: string
      title: string
      description: string | null
      type: $Enums.sellerEventType
      minOrder: number | null
      discount: number | null
      startTime: Date
      endTime: Date
      isActive: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["seller_events"]>
    composites: {}
  }

  type seller_eventsGetPayload<S extends boolean | null | undefined | seller_eventsDefaultArgs> = $Result.GetResult<Prisma.$seller_eventsPayload, S>

  type seller_eventsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<seller_eventsFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: Seller_eventsCountAggregateInputType | true
    }

  export interface seller_eventsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['seller_events'], meta: { name: 'seller_events' } }
    /**
     * Find zero or one Seller_events that matches the filter.
     * @param {seller_eventsFindUniqueArgs} args - Arguments to find a Seller_events
     * @example
     * // Get one Seller_events
     * const seller_events = await prisma.seller_events.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends seller_eventsFindUniqueArgs>(args: SelectSubset<T, seller_eventsFindUniqueArgs<ExtArgs>>): Prisma__seller_eventsClient<$Result.GetResult<Prisma.$seller_eventsPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Seller_events that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {seller_eventsFindUniqueOrThrowArgs} args - Arguments to find a Seller_events
     * @example
     * // Get one Seller_events
     * const seller_events = await prisma.seller_events.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends seller_eventsFindUniqueOrThrowArgs>(args: SelectSubset<T, seller_eventsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__seller_eventsClient<$Result.GetResult<Prisma.$seller_eventsPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Seller_events that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {seller_eventsFindFirstArgs} args - Arguments to find a Seller_events
     * @example
     * // Get one Seller_events
     * const seller_events = await prisma.seller_events.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends seller_eventsFindFirstArgs>(args?: SelectSubset<T, seller_eventsFindFirstArgs<ExtArgs>>): Prisma__seller_eventsClient<$Result.GetResult<Prisma.$seller_eventsPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Seller_events that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {seller_eventsFindFirstOrThrowArgs} args - Arguments to find a Seller_events
     * @example
     * // Get one Seller_events
     * const seller_events = await prisma.seller_events.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends seller_eventsFindFirstOrThrowArgs>(args?: SelectSubset<T, seller_eventsFindFirstOrThrowArgs<ExtArgs>>): Prisma__seller_eventsClient<$Result.GetResult<Prisma.$seller_eventsPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Seller_events that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {seller_eventsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Seller_events
     * const seller_events = await prisma.seller_events.findMany()
     * 
     * // Get first 10 Seller_events
     * const seller_events = await prisma.seller_events.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const seller_eventsWithIdOnly = await prisma.seller_events.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends seller_eventsFindManyArgs>(args?: SelectSubset<T, seller_eventsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$seller_eventsPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Seller_events.
     * @param {seller_eventsCreateArgs} args - Arguments to create a Seller_events.
     * @example
     * // Create one Seller_events
     * const Seller_events = await prisma.seller_events.create({
     *   data: {
     *     // ... data to create a Seller_events
     *   }
     * })
     * 
     */
    create<T extends seller_eventsCreateArgs>(args: SelectSubset<T, seller_eventsCreateArgs<ExtArgs>>): Prisma__seller_eventsClient<$Result.GetResult<Prisma.$seller_eventsPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Seller_events.
     * @param {seller_eventsCreateManyArgs} args - Arguments to create many Seller_events.
     * @example
     * // Create many Seller_events
     * const seller_events = await prisma.seller_events.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends seller_eventsCreateManyArgs>(args?: SelectSubset<T, seller_eventsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Seller_events.
     * @param {seller_eventsDeleteArgs} args - Arguments to delete one Seller_events.
     * @example
     * // Delete one Seller_events
     * const Seller_events = await prisma.seller_events.delete({
     *   where: {
     *     // ... filter to delete one Seller_events
     *   }
     * })
     * 
     */
    delete<T extends seller_eventsDeleteArgs>(args: SelectSubset<T, seller_eventsDeleteArgs<ExtArgs>>): Prisma__seller_eventsClient<$Result.GetResult<Prisma.$seller_eventsPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Seller_events.
     * @param {seller_eventsUpdateArgs} args - Arguments to update one Seller_events.
     * @example
     * // Update one Seller_events
     * const seller_events = await prisma.seller_events.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends seller_eventsUpdateArgs>(args: SelectSubset<T, seller_eventsUpdateArgs<ExtArgs>>): Prisma__seller_eventsClient<$Result.GetResult<Prisma.$seller_eventsPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Seller_events.
     * @param {seller_eventsDeleteManyArgs} args - Arguments to filter Seller_events to delete.
     * @example
     * // Delete a few Seller_events
     * const { count } = await prisma.seller_events.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends seller_eventsDeleteManyArgs>(args?: SelectSubset<T, seller_eventsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Seller_events.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {seller_eventsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Seller_events
     * const seller_events = await prisma.seller_events.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends seller_eventsUpdateManyArgs>(args: SelectSubset<T, seller_eventsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Seller_events.
     * @param {seller_eventsUpsertArgs} args - Arguments to update or create a Seller_events.
     * @example
     * // Update or create a Seller_events
     * const seller_events = await prisma.seller_events.upsert({
     *   create: {
     *     // ... data to create a Seller_events
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Seller_events we want to update
     *   }
     * })
     */
    upsert<T extends seller_eventsUpsertArgs>(args: SelectSubset<T, seller_eventsUpsertArgs<ExtArgs>>): Prisma__seller_eventsClient<$Result.GetResult<Prisma.$seller_eventsPayload<ExtArgs>, T, "upsert">, never, ExtArgs>

    /**
     * Find zero or more Seller_events that matches the filter.
     * @param {seller_eventsFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const seller_events = await prisma.seller_events.findRaw({
     *   filter: { age: { $gt: 25 } } 
     * })
     */
    findRaw(args?: seller_eventsFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a Seller_events.
     * @param {seller_eventsAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const seller_events = await prisma.seller_events.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: seller_eventsAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of Seller_events.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {seller_eventsCountArgs} args - Arguments to filter Seller_events to count.
     * @example
     * // Count the number of Seller_events
     * const count = await prisma.seller_events.count({
     *   where: {
     *     // ... the filter for the Seller_events we want to count
     *   }
     * })
    **/
    count<T extends seller_eventsCountArgs>(
      args?: Subset<T, seller_eventsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Seller_eventsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Seller_events.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Seller_eventsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Seller_eventsAggregateArgs>(args: Subset<T, Seller_eventsAggregateArgs>): Prisma.PrismaPromise<GetSeller_eventsAggregateType<T>>

    /**
     * Group by Seller_events.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {seller_eventsGroupByArgs} args - Group by arguments.
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
      T extends seller_eventsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: seller_eventsGroupByArgs['orderBy'] }
        : { orderBy?: seller_eventsGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, seller_eventsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSeller_eventsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the seller_events model
   */
  readonly fields: seller_eventsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for seller_events.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__seller_eventsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    seller<T extends sellersDefaultArgs<ExtArgs> = {}>(args?: Subset<T, sellersDefaultArgs<ExtArgs>>): Prisma__sellersClient<$Result.GetResult<Prisma.$sellersPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
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
   * Fields of the seller_events model
   */ 
  interface seller_eventsFieldRefs {
    readonly id: FieldRef<"seller_events", 'String'>
    readonly sellerId: FieldRef<"seller_events", 'String'>
    readonly title: FieldRef<"seller_events", 'String'>
    readonly description: FieldRef<"seller_events", 'String'>
    readonly type: FieldRef<"seller_events", 'sellerEventType'>
    readonly minOrder: FieldRef<"seller_events", 'Float'>
    readonly discount: FieldRef<"seller_events", 'Float'>
    readonly startTime: FieldRef<"seller_events", 'DateTime'>
    readonly endTime: FieldRef<"seller_events", 'DateTime'>
    readonly isActive: FieldRef<"seller_events", 'Boolean'>
    readonly createdAt: FieldRef<"seller_events", 'DateTime'>
    readonly updatedAt: FieldRef<"seller_events", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * seller_events findUnique
   */
  export type seller_eventsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the seller_events
     */
    select?: seller_eventsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: seller_eventsInclude<ExtArgs> | null
    /**
     * Filter, which seller_events to fetch.
     */
    where: seller_eventsWhereUniqueInput
  }

  /**
   * seller_events findUniqueOrThrow
   */
  export type seller_eventsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the seller_events
     */
    select?: seller_eventsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: seller_eventsInclude<ExtArgs> | null
    /**
     * Filter, which seller_events to fetch.
     */
    where: seller_eventsWhereUniqueInput
  }

  /**
   * seller_events findFirst
   */
  export type seller_eventsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the seller_events
     */
    select?: seller_eventsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: seller_eventsInclude<ExtArgs> | null
    /**
     * Filter, which seller_events to fetch.
     */
    where?: seller_eventsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of seller_events to fetch.
     */
    orderBy?: seller_eventsOrderByWithRelationInput | seller_eventsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for seller_events.
     */
    cursor?: seller_eventsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` seller_events from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` seller_events.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of seller_events.
     */
    distinct?: Seller_eventsScalarFieldEnum | Seller_eventsScalarFieldEnum[]
  }

  /**
   * seller_events findFirstOrThrow
   */
  export type seller_eventsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the seller_events
     */
    select?: seller_eventsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: seller_eventsInclude<ExtArgs> | null
    /**
     * Filter, which seller_events to fetch.
     */
    where?: seller_eventsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of seller_events to fetch.
     */
    orderBy?: seller_eventsOrderByWithRelationInput | seller_eventsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for seller_events.
     */
    cursor?: seller_eventsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` seller_events from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` seller_events.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of seller_events.
     */
    distinct?: Seller_eventsScalarFieldEnum | Seller_eventsScalarFieldEnum[]
  }

  /**
   * seller_events findMany
   */
  export type seller_eventsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the seller_events
     */
    select?: seller_eventsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: seller_eventsInclude<ExtArgs> | null
    /**
     * Filter, which seller_events to fetch.
     */
    where?: seller_eventsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of seller_events to fetch.
     */
    orderBy?: seller_eventsOrderByWithRelationInput | seller_eventsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing seller_events.
     */
    cursor?: seller_eventsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` seller_events from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` seller_events.
     */
    skip?: number
    distinct?: Seller_eventsScalarFieldEnum | Seller_eventsScalarFieldEnum[]
  }

  /**
   * seller_events create
   */
  export type seller_eventsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the seller_events
     */
    select?: seller_eventsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: seller_eventsInclude<ExtArgs> | null
    /**
     * The data needed to create a seller_events.
     */
    data: XOR<seller_eventsCreateInput, seller_eventsUncheckedCreateInput>
  }

  /**
   * seller_events createMany
   */
  export type seller_eventsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many seller_events.
     */
    data: seller_eventsCreateManyInput | seller_eventsCreateManyInput[]
  }

  /**
   * seller_events update
   */
  export type seller_eventsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the seller_events
     */
    select?: seller_eventsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: seller_eventsInclude<ExtArgs> | null
    /**
     * The data needed to update a seller_events.
     */
    data: XOR<seller_eventsUpdateInput, seller_eventsUncheckedUpdateInput>
    /**
     * Choose, which seller_events to update.
     */
    where: seller_eventsWhereUniqueInput
  }

  /**
   * seller_events updateMany
   */
  export type seller_eventsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update seller_events.
     */
    data: XOR<seller_eventsUpdateManyMutationInput, seller_eventsUncheckedUpdateManyInput>
    /**
     * Filter which seller_events to update
     */
    where?: seller_eventsWhereInput
  }

  /**
   * seller_events upsert
   */
  export type seller_eventsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the seller_events
     */
    select?: seller_eventsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: seller_eventsInclude<ExtArgs> | null
    /**
     * The filter to search for the seller_events to update in case it exists.
     */
    where: seller_eventsWhereUniqueInput
    /**
     * In case the seller_events found by the `where` argument doesn't exist, create a new seller_events with this data.
     */
    create: XOR<seller_eventsCreateInput, seller_eventsUncheckedCreateInput>
    /**
     * In case the seller_events was found with the provided `where` argument, update it with this data.
     */
    update: XOR<seller_eventsUpdateInput, seller_eventsUncheckedUpdateInput>
  }

  /**
   * seller_events delete
   */
  export type seller_eventsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the seller_events
     */
    select?: seller_eventsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: seller_eventsInclude<ExtArgs> | null
    /**
     * Filter which seller_events to delete.
     */
    where: seller_eventsWhereUniqueInput
  }

  /**
   * seller_events deleteMany
   */
  export type seller_eventsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which seller_events to delete
     */
    where?: seller_eventsWhereInput
  }

  /**
   * seller_events findRaw
   */
  export type seller_eventsFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
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
   * seller_events aggregateRaw
   */
  export type seller_eventsAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
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
   * seller_events without action
   */
  export type seller_eventsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the seller_events
     */
    select?: seller_eventsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: seller_eventsInclude<ExtArgs> | null
  }


  /**
   * Model SignupAccessCode
   */

  export type AggregateSignupAccessCode = {
    _count: SignupAccessCodeCountAggregateOutputType | null
    _min: SignupAccessCodeMinAggregateOutputType | null
    _max: SignupAccessCodeMaxAggregateOutputType | null
  }

  export type SignupAccessCodeMinAggregateOutputType = {
    id: string | null
    email: string | null
    role: string | null
    code: string | null
    expiresAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SignupAccessCodeMaxAggregateOutputType = {
    id: string | null
    email: string | null
    role: string | null
    code: string | null
    expiresAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SignupAccessCodeCountAggregateOutputType = {
    id: number
    email: number
    role: number
    code: number
    expiresAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type SignupAccessCodeMinAggregateInputType = {
    id?: true
    email?: true
    role?: true
    code?: true
    expiresAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SignupAccessCodeMaxAggregateInputType = {
    id?: true
    email?: true
    role?: true
    code?: true
    expiresAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SignupAccessCodeCountAggregateInputType = {
    id?: true
    email?: true
    role?: true
    code?: true
    expiresAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type SignupAccessCodeAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SignupAccessCode to aggregate.
     */
    where?: SignupAccessCodeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SignupAccessCodes to fetch.
     */
    orderBy?: SignupAccessCodeOrderByWithRelationInput | SignupAccessCodeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SignupAccessCodeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SignupAccessCodes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SignupAccessCodes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SignupAccessCodes
    **/
    _count?: true | SignupAccessCodeCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SignupAccessCodeMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SignupAccessCodeMaxAggregateInputType
  }

  export type GetSignupAccessCodeAggregateType<T extends SignupAccessCodeAggregateArgs> = {
        [P in keyof T & keyof AggregateSignupAccessCode]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSignupAccessCode[P]>
      : GetScalarType<T[P], AggregateSignupAccessCode[P]>
  }




  export type SignupAccessCodeGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SignupAccessCodeWhereInput
    orderBy?: SignupAccessCodeOrderByWithAggregationInput | SignupAccessCodeOrderByWithAggregationInput[]
    by: SignupAccessCodeScalarFieldEnum[] | SignupAccessCodeScalarFieldEnum
    having?: SignupAccessCodeScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SignupAccessCodeCountAggregateInputType | true
    _min?: SignupAccessCodeMinAggregateInputType
    _max?: SignupAccessCodeMaxAggregateInputType
  }

  export type SignupAccessCodeGroupByOutputType = {
    id: string
    email: string | null
    role: string
    code: string
    expiresAt: Date | null
    createdAt: Date
    updatedAt: Date
    _count: SignupAccessCodeCountAggregateOutputType | null
    _min: SignupAccessCodeMinAggregateOutputType | null
    _max: SignupAccessCodeMaxAggregateOutputType | null
  }

  type GetSignupAccessCodeGroupByPayload<T extends SignupAccessCodeGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SignupAccessCodeGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SignupAccessCodeGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SignupAccessCodeGroupByOutputType[P]>
            : GetScalarType<T[P], SignupAccessCodeGroupByOutputType[P]>
        }
      >
    >


  export type SignupAccessCodeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    role?: boolean
    code?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["signupAccessCode"]>


  export type SignupAccessCodeSelectScalar = {
    id?: boolean
    email?: boolean
    role?: boolean
    code?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }


  export type $SignupAccessCodePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SignupAccessCode"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string | null
      role: string
      code: string
      expiresAt: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["signupAccessCode"]>
    composites: {}
  }

  type SignupAccessCodeGetPayload<S extends boolean | null | undefined | SignupAccessCodeDefaultArgs> = $Result.GetResult<Prisma.$SignupAccessCodePayload, S>

  type SignupAccessCodeCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<SignupAccessCodeFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: SignupAccessCodeCountAggregateInputType | true
    }

  export interface SignupAccessCodeDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SignupAccessCode'], meta: { name: 'SignupAccessCode' } }
    /**
     * Find zero or one SignupAccessCode that matches the filter.
     * @param {SignupAccessCodeFindUniqueArgs} args - Arguments to find a SignupAccessCode
     * @example
     * // Get one SignupAccessCode
     * const signupAccessCode = await prisma.signupAccessCode.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SignupAccessCodeFindUniqueArgs>(args: SelectSubset<T, SignupAccessCodeFindUniqueArgs<ExtArgs>>): Prisma__SignupAccessCodeClient<$Result.GetResult<Prisma.$SignupAccessCodePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one SignupAccessCode that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {SignupAccessCodeFindUniqueOrThrowArgs} args - Arguments to find a SignupAccessCode
     * @example
     * // Get one SignupAccessCode
     * const signupAccessCode = await prisma.signupAccessCode.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SignupAccessCodeFindUniqueOrThrowArgs>(args: SelectSubset<T, SignupAccessCodeFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SignupAccessCodeClient<$Result.GetResult<Prisma.$SignupAccessCodePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first SignupAccessCode that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignupAccessCodeFindFirstArgs} args - Arguments to find a SignupAccessCode
     * @example
     * // Get one SignupAccessCode
     * const signupAccessCode = await prisma.signupAccessCode.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SignupAccessCodeFindFirstArgs>(args?: SelectSubset<T, SignupAccessCodeFindFirstArgs<ExtArgs>>): Prisma__SignupAccessCodeClient<$Result.GetResult<Prisma.$SignupAccessCodePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first SignupAccessCode that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignupAccessCodeFindFirstOrThrowArgs} args - Arguments to find a SignupAccessCode
     * @example
     * // Get one SignupAccessCode
     * const signupAccessCode = await prisma.signupAccessCode.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SignupAccessCodeFindFirstOrThrowArgs>(args?: SelectSubset<T, SignupAccessCodeFindFirstOrThrowArgs<ExtArgs>>): Prisma__SignupAccessCodeClient<$Result.GetResult<Prisma.$SignupAccessCodePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more SignupAccessCodes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignupAccessCodeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SignupAccessCodes
     * const signupAccessCodes = await prisma.signupAccessCode.findMany()
     * 
     * // Get first 10 SignupAccessCodes
     * const signupAccessCodes = await prisma.signupAccessCode.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const signupAccessCodeWithIdOnly = await prisma.signupAccessCode.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SignupAccessCodeFindManyArgs>(args?: SelectSubset<T, SignupAccessCodeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SignupAccessCodePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a SignupAccessCode.
     * @param {SignupAccessCodeCreateArgs} args - Arguments to create a SignupAccessCode.
     * @example
     * // Create one SignupAccessCode
     * const SignupAccessCode = await prisma.signupAccessCode.create({
     *   data: {
     *     // ... data to create a SignupAccessCode
     *   }
     * })
     * 
     */
    create<T extends SignupAccessCodeCreateArgs>(args: SelectSubset<T, SignupAccessCodeCreateArgs<ExtArgs>>): Prisma__SignupAccessCodeClient<$Result.GetResult<Prisma.$SignupAccessCodePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many SignupAccessCodes.
     * @param {SignupAccessCodeCreateManyArgs} args - Arguments to create many SignupAccessCodes.
     * @example
     * // Create many SignupAccessCodes
     * const signupAccessCode = await prisma.signupAccessCode.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SignupAccessCodeCreateManyArgs>(args?: SelectSubset<T, SignupAccessCodeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a SignupAccessCode.
     * @param {SignupAccessCodeDeleteArgs} args - Arguments to delete one SignupAccessCode.
     * @example
     * // Delete one SignupAccessCode
     * const SignupAccessCode = await prisma.signupAccessCode.delete({
     *   where: {
     *     // ... filter to delete one SignupAccessCode
     *   }
     * })
     * 
     */
    delete<T extends SignupAccessCodeDeleteArgs>(args: SelectSubset<T, SignupAccessCodeDeleteArgs<ExtArgs>>): Prisma__SignupAccessCodeClient<$Result.GetResult<Prisma.$SignupAccessCodePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one SignupAccessCode.
     * @param {SignupAccessCodeUpdateArgs} args - Arguments to update one SignupAccessCode.
     * @example
     * // Update one SignupAccessCode
     * const signupAccessCode = await prisma.signupAccessCode.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SignupAccessCodeUpdateArgs>(args: SelectSubset<T, SignupAccessCodeUpdateArgs<ExtArgs>>): Prisma__SignupAccessCodeClient<$Result.GetResult<Prisma.$SignupAccessCodePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more SignupAccessCodes.
     * @param {SignupAccessCodeDeleteManyArgs} args - Arguments to filter SignupAccessCodes to delete.
     * @example
     * // Delete a few SignupAccessCodes
     * const { count } = await prisma.signupAccessCode.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SignupAccessCodeDeleteManyArgs>(args?: SelectSubset<T, SignupAccessCodeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SignupAccessCodes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignupAccessCodeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SignupAccessCodes
     * const signupAccessCode = await prisma.signupAccessCode.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SignupAccessCodeUpdateManyArgs>(args: SelectSubset<T, SignupAccessCodeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one SignupAccessCode.
     * @param {SignupAccessCodeUpsertArgs} args - Arguments to update or create a SignupAccessCode.
     * @example
     * // Update or create a SignupAccessCode
     * const signupAccessCode = await prisma.signupAccessCode.upsert({
     *   create: {
     *     // ... data to create a SignupAccessCode
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SignupAccessCode we want to update
     *   }
     * })
     */
    upsert<T extends SignupAccessCodeUpsertArgs>(args: SelectSubset<T, SignupAccessCodeUpsertArgs<ExtArgs>>): Prisma__SignupAccessCodeClient<$Result.GetResult<Prisma.$SignupAccessCodePayload<ExtArgs>, T, "upsert">, never, ExtArgs>

    /**
     * Find zero or more SignupAccessCodes that matches the filter.
     * @param {SignupAccessCodeFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const signupAccessCode = await prisma.signupAccessCode.findRaw({
     *   filter: { age: { $gt: 25 } } 
     * })
     */
    findRaw(args?: SignupAccessCodeFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a SignupAccessCode.
     * @param {SignupAccessCodeAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const signupAccessCode = await prisma.signupAccessCode.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: SignupAccessCodeAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of SignupAccessCodes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignupAccessCodeCountArgs} args - Arguments to filter SignupAccessCodes to count.
     * @example
     * // Count the number of SignupAccessCodes
     * const count = await prisma.signupAccessCode.count({
     *   where: {
     *     // ... the filter for the SignupAccessCodes we want to count
     *   }
     * })
    **/
    count<T extends SignupAccessCodeCountArgs>(
      args?: Subset<T, SignupAccessCodeCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SignupAccessCodeCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SignupAccessCode.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignupAccessCodeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends SignupAccessCodeAggregateArgs>(args: Subset<T, SignupAccessCodeAggregateArgs>): Prisma.PrismaPromise<GetSignupAccessCodeAggregateType<T>>

    /**
     * Group by SignupAccessCode.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignupAccessCodeGroupByArgs} args - Group by arguments.
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
      T extends SignupAccessCodeGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SignupAccessCodeGroupByArgs['orderBy'] }
        : { orderBy?: SignupAccessCodeGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, SignupAccessCodeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSignupAccessCodeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SignupAccessCode model
   */
  readonly fields: SignupAccessCodeFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SignupAccessCode.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SignupAccessCodeClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the SignupAccessCode model
   */ 
  interface SignupAccessCodeFieldRefs {
    readonly id: FieldRef<"SignupAccessCode", 'String'>
    readonly email: FieldRef<"SignupAccessCode", 'String'>
    readonly role: FieldRef<"SignupAccessCode", 'String'>
    readonly code: FieldRef<"SignupAccessCode", 'String'>
    readonly expiresAt: FieldRef<"SignupAccessCode", 'DateTime'>
    readonly createdAt: FieldRef<"SignupAccessCode", 'DateTime'>
    readonly updatedAt: FieldRef<"SignupAccessCode", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * SignupAccessCode findUnique
   */
  export type SignupAccessCodeFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignupAccessCode
     */
    select?: SignupAccessCodeSelect<ExtArgs> | null
    /**
     * Filter, which SignupAccessCode to fetch.
     */
    where: SignupAccessCodeWhereUniqueInput
  }

  /**
   * SignupAccessCode findUniqueOrThrow
   */
  export type SignupAccessCodeFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignupAccessCode
     */
    select?: SignupAccessCodeSelect<ExtArgs> | null
    /**
     * Filter, which SignupAccessCode to fetch.
     */
    where: SignupAccessCodeWhereUniqueInput
  }

  /**
   * SignupAccessCode findFirst
   */
  export type SignupAccessCodeFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignupAccessCode
     */
    select?: SignupAccessCodeSelect<ExtArgs> | null
    /**
     * Filter, which SignupAccessCode to fetch.
     */
    where?: SignupAccessCodeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SignupAccessCodes to fetch.
     */
    orderBy?: SignupAccessCodeOrderByWithRelationInput | SignupAccessCodeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SignupAccessCodes.
     */
    cursor?: SignupAccessCodeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SignupAccessCodes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SignupAccessCodes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SignupAccessCodes.
     */
    distinct?: SignupAccessCodeScalarFieldEnum | SignupAccessCodeScalarFieldEnum[]
  }

  /**
   * SignupAccessCode findFirstOrThrow
   */
  export type SignupAccessCodeFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignupAccessCode
     */
    select?: SignupAccessCodeSelect<ExtArgs> | null
    /**
     * Filter, which SignupAccessCode to fetch.
     */
    where?: SignupAccessCodeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SignupAccessCodes to fetch.
     */
    orderBy?: SignupAccessCodeOrderByWithRelationInput | SignupAccessCodeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SignupAccessCodes.
     */
    cursor?: SignupAccessCodeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SignupAccessCodes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SignupAccessCodes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SignupAccessCodes.
     */
    distinct?: SignupAccessCodeScalarFieldEnum | SignupAccessCodeScalarFieldEnum[]
  }

  /**
   * SignupAccessCode findMany
   */
  export type SignupAccessCodeFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignupAccessCode
     */
    select?: SignupAccessCodeSelect<ExtArgs> | null
    /**
     * Filter, which SignupAccessCodes to fetch.
     */
    where?: SignupAccessCodeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SignupAccessCodes to fetch.
     */
    orderBy?: SignupAccessCodeOrderByWithRelationInput | SignupAccessCodeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SignupAccessCodes.
     */
    cursor?: SignupAccessCodeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SignupAccessCodes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SignupAccessCodes.
     */
    skip?: number
    distinct?: SignupAccessCodeScalarFieldEnum | SignupAccessCodeScalarFieldEnum[]
  }

  /**
   * SignupAccessCode create
   */
  export type SignupAccessCodeCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignupAccessCode
     */
    select?: SignupAccessCodeSelect<ExtArgs> | null
    /**
     * The data needed to create a SignupAccessCode.
     */
    data: XOR<SignupAccessCodeCreateInput, SignupAccessCodeUncheckedCreateInput>
  }

  /**
   * SignupAccessCode createMany
   */
  export type SignupAccessCodeCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SignupAccessCodes.
     */
    data: SignupAccessCodeCreateManyInput | SignupAccessCodeCreateManyInput[]
  }

  /**
   * SignupAccessCode update
   */
  export type SignupAccessCodeUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignupAccessCode
     */
    select?: SignupAccessCodeSelect<ExtArgs> | null
    /**
     * The data needed to update a SignupAccessCode.
     */
    data: XOR<SignupAccessCodeUpdateInput, SignupAccessCodeUncheckedUpdateInput>
    /**
     * Choose, which SignupAccessCode to update.
     */
    where: SignupAccessCodeWhereUniqueInput
  }

  /**
   * SignupAccessCode updateMany
   */
  export type SignupAccessCodeUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SignupAccessCodes.
     */
    data: XOR<SignupAccessCodeUpdateManyMutationInput, SignupAccessCodeUncheckedUpdateManyInput>
    /**
     * Filter which SignupAccessCodes to update
     */
    where?: SignupAccessCodeWhereInput
  }

  /**
   * SignupAccessCode upsert
   */
  export type SignupAccessCodeUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignupAccessCode
     */
    select?: SignupAccessCodeSelect<ExtArgs> | null
    /**
     * The filter to search for the SignupAccessCode to update in case it exists.
     */
    where: SignupAccessCodeWhereUniqueInput
    /**
     * In case the SignupAccessCode found by the `where` argument doesn't exist, create a new SignupAccessCode with this data.
     */
    create: XOR<SignupAccessCodeCreateInput, SignupAccessCodeUncheckedCreateInput>
    /**
     * In case the SignupAccessCode was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SignupAccessCodeUpdateInput, SignupAccessCodeUncheckedUpdateInput>
  }

  /**
   * SignupAccessCode delete
   */
  export type SignupAccessCodeDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignupAccessCode
     */
    select?: SignupAccessCodeSelect<ExtArgs> | null
    /**
     * Filter which SignupAccessCode to delete.
     */
    where: SignupAccessCodeWhereUniqueInput
  }

  /**
   * SignupAccessCode deleteMany
   */
  export type SignupAccessCodeDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SignupAccessCodes to delete
     */
    where?: SignupAccessCodeWhereInput
  }

  /**
   * SignupAccessCode findRaw
   */
  export type SignupAccessCodeFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
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
   * SignupAccessCode aggregateRaw
   */
  export type SignupAccessCodeAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
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
   * SignupAccessCode without action
   */
  export type SignupAccessCodeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignupAccessCode
     */
    select?: SignupAccessCodeSelect<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const AdminsScalarFieldEnum: {
    id: 'id',
    name: 'name',
    email: 'email',
    password: 'password',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type AdminsScalarFieldEnum = (typeof AdminsScalarFieldEnum)[keyof typeof AdminsScalarFieldEnum]


  export const ImagesScalarFieldEnum: {
    id: 'id',
    file_id: 'file_id',
    url: 'url',
    type: 'type',
    productId: 'productId',
    createdAt: 'createdAt'
  };

  export type ImagesScalarFieldEnum = (typeof ImagesScalarFieldEnum)[keyof typeof ImagesScalarFieldEnum]


  export const UsersScalarFieldEnum: {
    id: 'id',
    phone_number: 'phone_number',
    email: 'email',
    name: 'name',
    following: 'following',
    addresses: 'addresses',
    avatarId: 'avatarId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UsersScalarFieldEnum = (typeof UsersScalarFieldEnum)[keyof typeof UsersScalarFieldEnum]


  export const Discount_codesScalarFieldEnum: {
    id: 'id',
    public_name: 'public_name',
    discountType: 'discountType',
    discountValue: 'discountValue',
    minOrderValue: 'minOrderValue',
    discountCode: 'discountCode',
    expiresAt: 'expiresAt',
    maxUses: 'maxUses',
    maxUsesPerUser: 'maxUsesPerUser',
    usedCount: 'usedCount',
    isActive: 'isActive',
    isFirstOrder: 'isFirstOrder',
    sellerId: 'sellerId',
    adminId: 'adminId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type Discount_codesScalarFieldEnum = (typeof Discount_codesScalarFieldEnum)[keyof typeof Discount_codesScalarFieldEnum]


  export const Coupon_usagesScalarFieldEnum: {
    id: 'id',
    couponId: 'couponId',
    userId: 'userId',
    orderId: 'orderId',
    usedAt: 'usedAt'
  };

  export type Coupon_usagesScalarFieldEnum = (typeof Coupon_usagesScalarFieldEnum)[keyof typeof Coupon_usagesScalarFieldEnum]


  export const SellersScalarFieldEnum: {
    id: 'id',
    name: 'name',
    email: 'email',
    phone_number: 'phone_number',
    password: 'password',
    following: 'following',
    isApprovedByAdmin: 'isApprovedByAdmin',
    permissions: 'permissions',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type SellersScalarFieldEnum = (typeof SellersScalarFieldEnum)[keyof typeof SellersScalarFieldEnum]


  export const StaffsScalarFieldEnum: {
    id: 'id',
    name: 'name',
    email: 'email',
    password: 'password',
    isActive: 'isActive',
    sellerId: 'sellerId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type StaffsScalarFieldEnum = (typeof StaffsScalarFieldEnum)[keyof typeof StaffsScalarFieldEnum]


  export const StoresScalarFieldEnum: {
    id: 'id',
    name: 'name',
    bio: 'bio',
    avatarId: 'avatarId',
    address: 'address',
    city: 'city',
    pincode: 'pincode',
    opening_hours: 'opening_hours',
    closing_hours: 'closing_hours',
    is_instant_delivery_enabled: 'is_instant_delivery_enabled',
    instant_delivery_fee: 'instant_delivery_fee',
    instant_delivery_window_start: 'instant_delivery_window_start',
    instant_delivery_window_end: 'instant_delivery_window_end',
    availableCities: 'availableCities',
    cityDeliveryTimes: 'cityDeliveryTimes',
    state: 'state',
    sellerId: 'sellerId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type StoresScalarFieldEnum = (typeof StoresScalarFieldEnum)[keyof typeof StoresScalarFieldEnum]


  export const FavoritesScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    productId: 'productId',
    createdAt: 'createdAt'
  };

  export type FavoritesScalarFieldEnum = (typeof FavoritesScalarFieldEnum)[keyof typeof FavoritesScalarFieldEnum]


  export const Site_configScalarFieldEnum: {
    id: 'id',
    categories: 'categories',
    subCategories: 'subCategories',
    categoryImages: 'categoryImages',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type Site_configScalarFieldEnum = (typeof Site_configScalarFieldEnum)[keyof typeof Site_configScalarFieldEnum]


  export const ProductsScalarFieldEnum: {
    id: 'id',
    title: 'title',
    slug: 'slug',
    isCatalog: 'isCatalog',
    category: 'category',
    subCategory: 'subCategory',
    short_description: 'short_description',
    tags: 'tags',
    sizes: 'sizes',
    sizePricing: 'sizePricing',
    cuttingTypePricing: 'cuttingTypePricing',
    pieceSizePricing: 'pieceSizePricing',
    cuttingTypes: 'cuttingTypes',
    pieceSizes: 'pieceSizes',
    processingWeightLoss: 'processingWeightLoss',
    stock: 'stock',
    sale_price: 'sale_price',
    regular_price: 'regular_price',
    totalSold: 'totalSold',
    ratings: 'ratings',
    cashOnDelivery: 'cashOnDelivery',
    discount_codes: 'discount_codes',
    status: 'status',
    isDeleted: 'isDeleted',
    deletedAt: 'deletedAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    storeId: 'storeId',
    adminId: 'adminId',
    catalogProductId: 'catalogProductId'
  };

  export type ProductsScalarFieldEnum = (typeof ProductsScalarFieldEnum)[keyof typeof ProductsScalarFieldEnum]


  export const BannersScalarFieldEnum: {
    id: 'id',
    imageUrl: 'imageUrl',
    fileId: 'fileId',
    isActive: 'isActive',
    category: 'category',
    status: 'status',
    rejectionReason: 'rejectionReason',
    bannerType: 'bannerType',
    title: 'title',
    subtitle: 'subtitle',
    price: 'price',
    sellerId: 'sellerId',
    adminId: 'adminId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type BannersScalarFieldEnum = (typeof BannersScalarFieldEnum)[keyof typeof BannersScalarFieldEnum]


  export const Seller_eventsScalarFieldEnum: {
    id: 'id',
    sellerId: 'sellerId',
    title: 'title',
    description: 'description',
    type: 'type',
    minOrder: 'minOrder',
    discount: 'discount',
    startTime: 'startTime',
    endTime: 'endTime',
    isActive: 'isActive',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type Seller_eventsScalarFieldEnum = (typeof Seller_eventsScalarFieldEnum)[keyof typeof Seller_eventsScalarFieldEnum]


  export const SignupAccessCodeScalarFieldEnum: {
    id: 'id',
    email: 'email',
    role: 'role',
    code: 'code',
    expiresAt: 'expiresAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type SignupAccessCodeScalarFieldEnum = (typeof SignupAccessCodeScalarFieldEnum)[keyof typeof SignupAccessCodeScalarFieldEnum]


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
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'ImageType'
   */
  export type EnumImageTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ImageType'>
    


  /**
   * Reference to a field of type 'ImageType[]'
   */
  export type ListEnumImageTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ImageType[]'>
    


  /**
   * Reference to a field of type 'Json[]'
   */
  export type ListJsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'productStatus'
   */
  export type EnumproductStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'productStatus'>
    


  /**
   * Reference to a field of type 'productStatus[]'
   */
  export type ListEnumproductStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'productStatus[]'>
    


  /**
   * Reference to a field of type 'sellerEventType'
   */
  export type EnumsellerEventTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'sellerEventType'>
    


  /**
   * Reference to a field of type 'sellerEventType[]'
   */
  export type ListEnumsellerEventTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'sellerEventType[]'>
    
  /**
   * Deep Input Types
   */


  export type adminsWhereInput = {
    AND?: adminsWhereInput | adminsWhereInput[]
    OR?: adminsWhereInput[]
    NOT?: adminsWhereInput | adminsWhereInput[]
    id?: StringFilter<"admins"> | string
    name?: StringFilter<"admins"> | string
    email?: StringFilter<"admins"> | string
    password?: StringFilter<"admins"> | string
    createdAt?: DateTimeFilter<"admins"> | Date | string
    updatedAt?: DateTimeFilter<"admins"> | Date | string
    products?: ProductsListRelationFilter
    coupons?: Discount_codesListRelationFilter
    banners?: BannersListRelationFilter
  }

  export type adminsOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    products?: productsOrderByRelationAggregateInput
    coupons?: discount_codesOrderByRelationAggregateInput
    banners?: bannersOrderByRelationAggregateInput
  }

  export type adminsWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: adminsWhereInput | adminsWhereInput[]
    OR?: adminsWhereInput[]
    NOT?: adminsWhereInput | adminsWhereInput[]
    name?: StringFilter<"admins"> | string
    password?: StringFilter<"admins"> | string
    createdAt?: DateTimeFilter<"admins"> | Date | string
    updatedAt?: DateTimeFilter<"admins"> | Date | string
    products?: ProductsListRelationFilter
    coupons?: Discount_codesListRelationFilter
    banners?: BannersListRelationFilter
  }, "id" | "email">

  export type adminsOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: adminsCountOrderByAggregateInput
    _max?: adminsMaxOrderByAggregateInput
    _min?: adminsMinOrderByAggregateInput
  }

  export type adminsScalarWhereWithAggregatesInput = {
    AND?: adminsScalarWhereWithAggregatesInput | adminsScalarWhereWithAggregatesInput[]
    OR?: adminsScalarWhereWithAggregatesInput[]
    NOT?: adminsScalarWhereWithAggregatesInput | adminsScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"admins"> | string
    name?: StringWithAggregatesFilter<"admins"> | string
    email?: StringWithAggregatesFilter<"admins"> | string
    password?: StringWithAggregatesFilter<"admins"> | string
    createdAt?: DateTimeWithAggregatesFilter<"admins"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"admins"> | Date | string
  }

  export type imagesWhereInput = {
    AND?: imagesWhereInput | imagesWhereInput[]
    OR?: imagesWhereInput[]
    NOT?: imagesWhereInput | imagesWhereInput[]
    id?: StringFilter<"images"> | string
    file_id?: StringFilter<"images"> | string
    url?: StringFilter<"images"> | string
    type?: EnumImageTypeFilter<"images"> | $Enums.ImageType
    productId?: StringNullableFilter<"images"> | string | null
    createdAt?: DateTimeFilter<"images"> | Date | string
    product?: XOR<ProductsNullableRelationFilter, productsWhereInput> | null
    users?: UsersListRelationFilter
    stores?: StoresListRelationFilter
  }

  export type imagesOrderByWithRelationInput = {
    id?: SortOrder
    file_id?: SortOrder
    url?: SortOrder
    type?: SortOrder
    productId?: SortOrder
    createdAt?: SortOrder
    product?: productsOrderByWithRelationInput
    users?: usersOrderByRelationAggregateInput
    stores?: storesOrderByRelationAggregateInput
  }

  export type imagesWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    productId_file_id?: imagesProductIdFile_idCompoundUniqueInput
    AND?: imagesWhereInput | imagesWhereInput[]
    OR?: imagesWhereInput[]
    NOT?: imagesWhereInput | imagesWhereInput[]
    file_id?: StringFilter<"images"> | string
    url?: StringFilter<"images"> | string
    type?: EnumImageTypeFilter<"images"> | $Enums.ImageType
    productId?: StringNullableFilter<"images"> | string | null
    createdAt?: DateTimeFilter<"images"> | Date | string
    product?: XOR<ProductsNullableRelationFilter, productsWhereInput> | null
    users?: UsersListRelationFilter
    stores?: StoresListRelationFilter
  }, "id" | "productId_file_id">

  export type imagesOrderByWithAggregationInput = {
    id?: SortOrder
    file_id?: SortOrder
    url?: SortOrder
    type?: SortOrder
    productId?: SortOrder
    createdAt?: SortOrder
    _count?: imagesCountOrderByAggregateInput
    _max?: imagesMaxOrderByAggregateInput
    _min?: imagesMinOrderByAggregateInput
  }

  export type imagesScalarWhereWithAggregatesInput = {
    AND?: imagesScalarWhereWithAggregatesInput | imagesScalarWhereWithAggregatesInput[]
    OR?: imagesScalarWhereWithAggregatesInput[]
    NOT?: imagesScalarWhereWithAggregatesInput | imagesScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"images"> | string
    file_id?: StringWithAggregatesFilter<"images"> | string
    url?: StringWithAggregatesFilter<"images"> | string
    type?: EnumImageTypeWithAggregatesFilter<"images"> | $Enums.ImageType
    productId?: StringNullableWithAggregatesFilter<"images"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"images"> | Date | string
  }

  export type usersWhereInput = {
    AND?: usersWhereInput | usersWhereInput[]
    OR?: usersWhereInput[]
    NOT?: usersWhereInput | usersWhereInput[]
    id?: StringFilter<"users"> | string
    phone_number?: StringNullableFilter<"users"> | string | null
    email?: StringNullableFilter<"users"> | string | null
    name?: StringFilter<"users"> | string
    following?: StringNullableListFilter<"users">
    addresses?: JsonNullableListFilter<"users">
    avatarId?: StringNullableFilter<"users"> | string | null
    createdAt?: DateTimeFilter<"users"> | Date | string
    updatedAt?: DateTimeFilter<"users"> | Date | string
    avatar?: XOR<ImagesNullableRelationFilter, imagesWhereInput> | null
    favorites?: FavoritesListRelationFilter
  }

  export type usersOrderByWithRelationInput = {
    id?: SortOrder
    phone_number?: SortOrder
    email?: SortOrder
    name?: SortOrder
    following?: SortOrder
    addresses?: SortOrder
    avatarId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    avatar?: imagesOrderByWithRelationInput
    favorites?: favoritesOrderByRelationAggregateInput
  }

  export type usersWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    phone_number?: string
    email?: string
    AND?: usersWhereInput | usersWhereInput[]
    OR?: usersWhereInput[]
    NOT?: usersWhereInput | usersWhereInput[]
    name?: StringFilter<"users"> | string
    following?: StringNullableListFilter<"users">
    addresses?: JsonNullableListFilter<"users">
    avatarId?: StringNullableFilter<"users"> | string | null
    createdAt?: DateTimeFilter<"users"> | Date | string
    updatedAt?: DateTimeFilter<"users"> | Date | string
    avatar?: XOR<ImagesNullableRelationFilter, imagesWhereInput> | null
    favorites?: FavoritesListRelationFilter
  }, "id" | "phone_number" | "email">

  export type usersOrderByWithAggregationInput = {
    id?: SortOrder
    phone_number?: SortOrder
    email?: SortOrder
    name?: SortOrder
    following?: SortOrder
    addresses?: SortOrder
    avatarId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: usersCountOrderByAggregateInput
    _max?: usersMaxOrderByAggregateInput
    _min?: usersMinOrderByAggregateInput
  }

  export type usersScalarWhereWithAggregatesInput = {
    AND?: usersScalarWhereWithAggregatesInput | usersScalarWhereWithAggregatesInput[]
    OR?: usersScalarWhereWithAggregatesInput[]
    NOT?: usersScalarWhereWithAggregatesInput | usersScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"users"> | string
    phone_number?: StringNullableWithAggregatesFilter<"users"> | string | null
    email?: StringNullableWithAggregatesFilter<"users"> | string | null
    name?: StringWithAggregatesFilter<"users"> | string
    following?: StringNullableListFilter<"users">
    addresses?: JsonNullableListFilter<"users">
    avatarId?: StringNullableWithAggregatesFilter<"users"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"users"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"users"> | Date | string
  }

  export type discount_codesWhereInput = {
    AND?: discount_codesWhereInput | discount_codesWhereInput[]
    OR?: discount_codesWhereInput[]
    NOT?: discount_codesWhereInput | discount_codesWhereInput[]
    id?: StringFilter<"discount_codes"> | string
    public_name?: StringFilter<"discount_codes"> | string
    discountType?: StringFilter<"discount_codes"> | string
    discountValue?: FloatFilter<"discount_codes"> | number
    minOrderValue?: FloatFilter<"discount_codes"> | number
    discountCode?: StringFilter<"discount_codes"> | string
    expiresAt?: DateTimeNullableFilter<"discount_codes"> | Date | string | null
    maxUses?: IntNullableFilter<"discount_codes"> | number | null
    maxUsesPerUser?: IntFilter<"discount_codes"> | number
    usedCount?: IntFilter<"discount_codes"> | number
    isActive?: BoolFilter<"discount_codes"> | boolean
    isFirstOrder?: BoolFilter<"discount_codes"> | boolean
    sellerId?: StringNullableFilter<"discount_codes"> | string | null
    adminId?: StringNullableFilter<"discount_codes"> | string | null
    createdAt?: DateTimeFilter<"discount_codes"> | Date | string
    updatedAt?: DateTimeFilter<"discount_codes"> | Date | string
    seller?: XOR<SellersNullableRelationFilter, sellersWhereInput> | null
    admin?: XOR<AdminsNullableRelationFilter, adminsWhereInput> | null
    usages?: Coupon_usagesListRelationFilter
  }

  export type discount_codesOrderByWithRelationInput = {
    id?: SortOrder
    public_name?: SortOrder
    discountType?: SortOrder
    discountValue?: SortOrder
    minOrderValue?: SortOrder
    discountCode?: SortOrder
    expiresAt?: SortOrder
    maxUses?: SortOrder
    maxUsesPerUser?: SortOrder
    usedCount?: SortOrder
    isActive?: SortOrder
    isFirstOrder?: SortOrder
    sellerId?: SortOrder
    adminId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    seller?: sellersOrderByWithRelationInput
    admin?: adminsOrderByWithRelationInput
    usages?: coupon_usagesOrderByRelationAggregateInput
  }

  export type discount_codesWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    discountCode?: string
    AND?: discount_codesWhereInput | discount_codesWhereInput[]
    OR?: discount_codesWhereInput[]
    NOT?: discount_codesWhereInput | discount_codesWhereInput[]
    public_name?: StringFilter<"discount_codes"> | string
    discountType?: StringFilter<"discount_codes"> | string
    discountValue?: FloatFilter<"discount_codes"> | number
    minOrderValue?: FloatFilter<"discount_codes"> | number
    expiresAt?: DateTimeNullableFilter<"discount_codes"> | Date | string | null
    maxUses?: IntNullableFilter<"discount_codes"> | number | null
    maxUsesPerUser?: IntFilter<"discount_codes"> | number
    usedCount?: IntFilter<"discount_codes"> | number
    isActive?: BoolFilter<"discount_codes"> | boolean
    isFirstOrder?: BoolFilter<"discount_codes"> | boolean
    sellerId?: StringNullableFilter<"discount_codes"> | string | null
    adminId?: StringNullableFilter<"discount_codes"> | string | null
    createdAt?: DateTimeFilter<"discount_codes"> | Date | string
    updatedAt?: DateTimeFilter<"discount_codes"> | Date | string
    seller?: XOR<SellersNullableRelationFilter, sellersWhereInput> | null
    admin?: XOR<AdminsNullableRelationFilter, adminsWhereInput> | null
    usages?: Coupon_usagesListRelationFilter
  }, "id" | "discountCode">

  export type discount_codesOrderByWithAggregationInput = {
    id?: SortOrder
    public_name?: SortOrder
    discountType?: SortOrder
    discountValue?: SortOrder
    minOrderValue?: SortOrder
    discountCode?: SortOrder
    expiresAt?: SortOrder
    maxUses?: SortOrder
    maxUsesPerUser?: SortOrder
    usedCount?: SortOrder
    isActive?: SortOrder
    isFirstOrder?: SortOrder
    sellerId?: SortOrder
    adminId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: discount_codesCountOrderByAggregateInput
    _avg?: discount_codesAvgOrderByAggregateInput
    _max?: discount_codesMaxOrderByAggregateInput
    _min?: discount_codesMinOrderByAggregateInput
    _sum?: discount_codesSumOrderByAggregateInput
  }

  export type discount_codesScalarWhereWithAggregatesInput = {
    AND?: discount_codesScalarWhereWithAggregatesInput | discount_codesScalarWhereWithAggregatesInput[]
    OR?: discount_codesScalarWhereWithAggregatesInput[]
    NOT?: discount_codesScalarWhereWithAggregatesInput | discount_codesScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"discount_codes"> | string
    public_name?: StringWithAggregatesFilter<"discount_codes"> | string
    discountType?: StringWithAggregatesFilter<"discount_codes"> | string
    discountValue?: FloatWithAggregatesFilter<"discount_codes"> | number
    minOrderValue?: FloatWithAggregatesFilter<"discount_codes"> | number
    discountCode?: StringWithAggregatesFilter<"discount_codes"> | string
    expiresAt?: DateTimeNullableWithAggregatesFilter<"discount_codes"> | Date | string | null
    maxUses?: IntNullableWithAggregatesFilter<"discount_codes"> | number | null
    maxUsesPerUser?: IntWithAggregatesFilter<"discount_codes"> | number
    usedCount?: IntWithAggregatesFilter<"discount_codes"> | number
    isActive?: BoolWithAggregatesFilter<"discount_codes"> | boolean
    isFirstOrder?: BoolWithAggregatesFilter<"discount_codes"> | boolean
    sellerId?: StringNullableWithAggregatesFilter<"discount_codes"> | string | null
    adminId?: StringNullableWithAggregatesFilter<"discount_codes"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"discount_codes"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"discount_codes"> | Date | string
  }

  export type coupon_usagesWhereInput = {
    AND?: coupon_usagesWhereInput | coupon_usagesWhereInput[]
    OR?: coupon_usagesWhereInput[]
    NOT?: coupon_usagesWhereInput | coupon_usagesWhereInput[]
    id?: StringFilter<"coupon_usages"> | string
    couponId?: StringFilter<"coupon_usages"> | string
    userId?: StringFilter<"coupon_usages"> | string
    orderId?: StringFilter<"coupon_usages"> | string
    usedAt?: DateTimeFilter<"coupon_usages"> | Date | string
    coupon?: XOR<Discount_codesRelationFilter, discount_codesWhereInput>
  }

  export type coupon_usagesOrderByWithRelationInput = {
    id?: SortOrder
    couponId?: SortOrder
    userId?: SortOrder
    orderId?: SortOrder
    usedAt?: SortOrder
    coupon?: discount_codesOrderByWithRelationInput
  }

  export type coupon_usagesWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: coupon_usagesWhereInput | coupon_usagesWhereInput[]
    OR?: coupon_usagesWhereInput[]
    NOT?: coupon_usagesWhereInput | coupon_usagesWhereInput[]
    couponId?: StringFilter<"coupon_usages"> | string
    userId?: StringFilter<"coupon_usages"> | string
    orderId?: StringFilter<"coupon_usages"> | string
    usedAt?: DateTimeFilter<"coupon_usages"> | Date | string
    coupon?: XOR<Discount_codesRelationFilter, discount_codesWhereInput>
  }, "id">

  export type coupon_usagesOrderByWithAggregationInput = {
    id?: SortOrder
    couponId?: SortOrder
    userId?: SortOrder
    orderId?: SortOrder
    usedAt?: SortOrder
    _count?: coupon_usagesCountOrderByAggregateInput
    _max?: coupon_usagesMaxOrderByAggregateInput
    _min?: coupon_usagesMinOrderByAggregateInput
  }

  export type coupon_usagesScalarWhereWithAggregatesInput = {
    AND?: coupon_usagesScalarWhereWithAggregatesInput | coupon_usagesScalarWhereWithAggregatesInput[]
    OR?: coupon_usagesScalarWhereWithAggregatesInput[]
    NOT?: coupon_usagesScalarWhereWithAggregatesInput | coupon_usagesScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"coupon_usages"> | string
    couponId?: StringWithAggregatesFilter<"coupon_usages"> | string
    userId?: StringWithAggregatesFilter<"coupon_usages"> | string
    orderId?: StringWithAggregatesFilter<"coupon_usages"> | string
    usedAt?: DateTimeWithAggregatesFilter<"coupon_usages"> | Date | string
  }

  export type sellersWhereInput = {
    AND?: sellersWhereInput | sellersWhereInput[]
    OR?: sellersWhereInput[]
    NOT?: sellersWhereInput | sellersWhereInput[]
    id?: StringFilter<"sellers"> | string
    name?: StringFilter<"sellers"> | string
    email?: StringFilter<"sellers"> | string
    phone_number?: StringFilter<"sellers"> | string
    password?: StringFilter<"sellers"> | string
    following?: StringNullableListFilter<"sellers">
    isApprovedByAdmin?: BoolFilter<"sellers"> | boolean
    permissions?: JsonNullableFilter<"sellers">
    createdAt?: DateTimeFilter<"sellers"> | Date | string
    updatedAt?: DateTimeFilter<"sellers"> | Date | string
    banners?: BannersListRelationFilter
    events?: Seller_eventsListRelationFilter
    store?: XOR<StoresNullableRelationFilter, storesWhereInput> | null
    coupons?: Discount_codesListRelationFilter
    staffs?: StaffsListRelationFilter
  }

  export type sellersOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    phone_number?: SortOrder
    password?: SortOrder
    following?: SortOrder
    isApprovedByAdmin?: SortOrder
    permissions?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    banners?: bannersOrderByRelationAggregateInput
    events?: seller_eventsOrderByRelationAggregateInput
    store?: storesOrderByWithRelationInput
    coupons?: discount_codesOrderByRelationAggregateInput
    staffs?: staffsOrderByRelationAggregateInput
  }

  export type sellersWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: sellersWhereInput | sellersWhereInput[]
    OR?: sellersWhereInput[]
    NOT?: sellersWhereInput | sellersWhereInput[]
    name?: StringFilter<"sellers"> | string
    phone_number?: StringFilter<"sellers"> | string
    password?: StringFilter<"sellers"> | string
    following?: StringNullableListFilter<"sellers">
    isApprovedByAdmin?: BoolFilter<"sellers"> | boolean
    permissions?: JsonNullableFilter<"sellers">
    createdAt?: DateTimeFilter<"sellers"> | Date | string
    updatedAt?: DateTimeFilter<"sellers"> | Date | string
    banners?: BannersListRelationFilter
    events?: Seller_eventsListRelationFilter
    store?: XOR<StoresNullableRelationFilter, storesWhereInput> | null
    coupons?: Discount_codesListRelationFilter
    staffs?: StaffsListRelationFilter
  }, "id" | "email">

  export type sellersOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    phone_number?: SortOrder
    password?: SortOrder
    following?: SortOrder
    isApprovedByAdmin?: SortOrder
    permissions?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: sellersCountOrderByAggregateInput
    _max?: sellersMaxOrderByAggregateInput
    _min?: sellersMinOrderByAggregateInput
  }

  export type sellersScalarWhereWithAggregatesInput = {
    AND?: sellersScalarWhereWithAggregatesInput | sellersScalarWhereWithAggregatesInput[]
    OR?: sellersScalarWhereWithAggregatesInput[]
    NOT?: sellersScalarWhereWithAggregatesInput | sellersScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"sellers"> | string
    name?: StringWithAggregatesFilter<"sellers"> | string
    email?: StringWithAggregatesFilter<"sellers"> | string
    phone_number?: StringWithAggregatesFilter<"sellers"> | string
    password?: StringWithAggregatesFilter<"sellers"> | string
    following?: StringNullableListFilter<"sellers">
    isApprovedByAdmin?: BoolWithAggregatesFilter<"sellers"> | boolean
    permissions?: JsonNullableWithAggregatesFilter<"sellers">
    createdAt?: DateTimeWithAggregatesFilter<"sellers"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"sellers"> | Date | string
  }

  export type staffsWhereInput = {
    AND?: staffsWhereInput | staffsWhereInput[]
    OR?: staffsWhereInput[]
    NOT?: staffsWhereInput | staffsWhereInput[]
    id?: StringFilter<"staffs"> | string
    name?: StringFilter<"staffs"> | string
    email?: StringFilter<"staffs"> | string
    password?: StringFilter<"staffs"> | string
    isActive?: BoolFilter<"staffs"> | boolean
    sellerId?: StringNullableFilter<"staffs"> | string | null
    createdAt?: DateTimeFilter<"staffs"> | Date | string
    updatedAt?: DateTimeFilter<"staffs"> | Date | string
    seller?: XOR<SellersNullableRelationFilter, sellersWhereInput> | null
  }

  export type staffsOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    isActive?: SortOrder
    sellerId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    seller?: sellersOrderByWithRelationInput
  }

  export type staffsWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: staffsWhereInput | staffsWhereInput[]
    OR?: staffsWhereInput[]
    NOT?: staffsWhereInput | staffsWhereInput[]
    name?: StringFilter<"staffs"> | string
    password?: StringFilter<"staffs"> | string
    isActive?: BoolFilter<"staffs"> | boolean
    sellerId?: StringNullableFilter<"staffs"> | string | null
    createdAt?: DateTimeFilter<"staffs"> | Date | string
    updatedAt?: DateTimeFilter<"staffs"> | Date | string
    seller?: XOR<SellersNullableRelationFilter, sellersWhereInput> | null
  }, "id" | "email">

  export type staffsOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    isActive?: SortOrder
    sellerId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: staffsCountOrderByAggregateInput
    _max?: staffsMaxOrderByAggregateInput
    _min?: staffsMinOrderByAggregateInput
  }

  export type staffsScalarWhereWithAggregatesInput = {
    AND?: staffsScalarWhereWithAggregatesInput | staffsScalarWhereWithAggregatesInput[]
    OR?: staffsScalarWhereWithAggregatesInput[]
    NOT?: staffsScalarWhereWithAggregatesInput | staffsScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"staffs"> | string
    name?: StringWithAggregatesFilter<"staffs"> | string
    email?: StringWithAggregatesFilter<"staffs"> | string
    password?: StringWithAggregatesFilter<"staffs"> | string
    isActive?: BoolWithAggregatesFilter<"staffs"> | boolean
    sellerId?: StringNullableWithAggregatesFilter<"staffs"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"staffs"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"staffs"> | Date | string
  }

  export type storesWhereInput = {
    AND?: storesWhereInput | storesWhereInput[]
    OR?: storesWhereInput[]
    NOT?: storesWhereInput | storesWhereInput[]
    id?: StringFilter<"stores"> | string
    name?: StringFilter<"stores"> | string
    bio?: StringFilter<"stores"> | string
    avatarId?: StringNullableFilter<"stores"> | string | null
    address?: StringFilter<"stores"> | string
    city?: StringFilter<"stores"> | string
    pincode?: StringFilter<"stores"> | string
    opening_hours?: StringFilter<"stores"> | string
    closing_hours?: StringFilter<"stores"> | string
    is_instant_delivery_enabled?: BoolFilter<"stores"> | boolean
    instant_delivery_fee?: FloatFilter<"stores"> | number
    instant_delivery_window_start?: StringFilter<"stores"> | string
    instant_delivery_window_end?: StringFilter<"stores"> | string
    availableCities?: StringNullableListFilter<"stores">
    cityDeliveryTimes?: JsonNullableFilter<"stores">
    state?: StringNullableFilter<"stores"> | string | null
    sellerId?: StringFilter<"stores"> | string
    createdAt?: DateTimeFilter<"stores"> | Date | string
    updatedAt?: DateTimeFilter<"stores"> | Date | string
    avatar?: XOR<ImagesNullableRelationFilter, imagesWhereInput> | null
    seller?: XOR<SellersRelationFilter, sellersWhereInput>
    products?: ProductsListRelationFilter
  }

  export type storesOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    bio?: SortOrder
    avatarId?: SortOrder
    address?: SortOrder
    city?: SortOrder
    pincode?: SortOrder
    opening_hours?: SortOrder
    closing_hours?: SortOrder
    is_instant_delivery_enabled?: SortOrder
    instant_delivery_fee?: SortOrder
    instant_delivery_window_start?: SortOrder
    instant_delivery_window_end?: SortOrder
    availableCities?: SortOrder
    cityDeliveryTimes?: SortOrder
    state?: SortOrder
    sellerId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    avatar?: imagesOrderByWithRelationInput
    seller?: sellersOrderByWithRelationInput
    products?: productsOrderByRelationAggregateInput
  }

  export type storesWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    sellerId?: string
    AND?: storesWhereInput | storesWhereInput[]
    OR?: storesWhereInput[]
    NOT?: storesWhereInput | storesWhereInput[]
    name?: StringFilter<"stores"> | string
    bio?: StringFilter<"stores"> | string
    avatarId?: StringNullableFilter<"stores"> | string | null
    address?: StringFilter<"stores"> | string
    city?: StringFilter<"stores"> | string
    pincode?: StringFilter<"stores"> | string
    opening_hours?: StringFilter<"stores"> | string
    closing_hours?: StringFilter<"stores"> | string
    is_instant_delivery_enabled?: BoolFilter<"stores"> | boolean
    instant_delivery_fee?: FloatFilter<"stores"> | number
    instant_delivery_window_start?: StringFilter<"stores"> | string
    instant_delivery_window_end?: StringFilter<"stores"> | string
    availableCities?: StringNullableListFilter<"stores">
    cityDeliveryTimes?: JsonNullableFilter<"stores">
    state?: StringNullableFilter<"stores"> | string | null
    createdAt?: DateTimeFilter<"stores"> | Date | string
    updatedAt?: DateTimeFilter<"stores"> | Date | string
    avatar?: XOR<ImagesNullableRelationFilter, imagesWhereInput> | null
    seller?: XOR<SellersRelationFilter, sellersWhereInput>
    products?: ProductsListRelationFilter
  }, "id" | "sellerId">

  export type storesOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    bio?: SortOrder
    avatarId?: SortOrder
    address?: SortOrder
    city?: SortOrder
    pincode?: SortOrder
    opening_hours?: SortOrder
    closing_hours?: SortOrder
    is_instant_delivery_enabled?: SortOrder
    instant_delivery_fee?: SortOrder
    instant_delivery_window_start?: SortOrder
    instant_delivery_window_end?: SortOrder
    availableCities?: SortOrder
    cityDeliveryTimes?: SortOrder
    state?: SortOrder
    sellerId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: storesCountOrderByAggregateInput
    _avg?: storesAvgOrderByAggregateInput
    _max?: storesMaxOrderByAggregateInput
    _min?: storesMinOrderByAggregateInput
    _sum?: storesSumOrderByAggregateInput
  }

  export type storesScalarWhereWithAggregatesInput = {
    AND?: storesScalarWhereWithAggregatesInput | storesScalarWhereWithAggregatesInput[]
    OR?: storesScalarWhereWithAggregatesInput[]
    NOT?: storesScalarWhereWithAggregatesInput | storesScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"stores"> | string
    name?: StringWithAggregatesFilter<"stores"> | string
    bio?: StringWithAggregatesFilter<"stores"> | string
    avatarId?: StringNullableWithAggregatesFilter<"stores"> | string | null
    address?: StringWithAggregatesFilter<"stores"> | string
    city?: StringWithAggregatesFilter<"stores"> | string
    pincode?: StringWithAggregatesFilter<"stores"> | string
    opening_hours?: StringWithAggregatesFilter<"stores"> | string
    closing_hours?: StringWithAggregatesFilter<"stores"> | string
    is_instant_delivery_enabled?: BoolWithAggregatesFilter<"stores"> | boolean
    instant_delivery_fee?: FloatWithAggregatesFilter<"stores"> | number
    instant_delivery_window_start?: StringWithAggregatesFilter<"stores"> | string
    instant_delivery_window_end?: StringWithAggregatesFilter<"stores"> | string
    availableCities?: StringNullableListFilter<"stores">
    cityDeliveryTimes?: JsonNullableWithAggregatesFilter<"stores">
    state?: StringNullableWithAggregatesFilter<"stores"> | string | null
    sellerId?: StringWithAggregatesFilter<"stores"> | string
    createdAt?: DateTimeWithAggregatesFilter<"stores"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"stores"> | Date | string
  }

  export type favoritesWhereInput = {
    AND?: favoritesWhereInput | favoritesWhereInput[]
    OR?: favoritesWhereInput[]
    NOT?: favoritesWhereInput | favoritesWhereInput[]
    id?: StringFilter<"favorites"> | string
    userId?: StringFilter<"favorites"> | string
    productId?: StringFilter<"favorites"> | string
    createdAt?: DateTimeFilter<"favorites"> | Date | string
    user?: XOR<UsersRelationFilter, usersWhereInput>
    product?: XOR<ProductsRelationFilter, productsWhereInput>
  }

  export type favoritesOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    productId?: SortOrder
    createdAt?: SortOrder
    user?: usersOrderByWithRelationInput
    product?: productsOrderByWithRelationInput
  }

  export type favoritesWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    userId_productId?: favoritesUserIdProductIdCompoundUniqueInput
    AND?: favoritesWhereInput | favoritesWhereInput[]
    OR?: favoritesWhereInput[]
    NOT?: favoritesWhereInput | favoritesWhereInput[]
    userId?: StringFilter<"favorites"> | string
    productId?: StringFilter<"favorites"> | string
    createdAt?: DateTimeFilter<"favorites"> | Date | string
    user?: XOR<UsersRelationFilter, usersWhereInput>
    product?: XOR<ProductsRelationFilter, productsWhereInput>
  }, "id" | "userId_productId">

  export type favoritesOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    productId?: SortOrder
    createdAt?: SortOrder
    _count?: favoritesCountOrderByAggregateInput
    _max?: favoritesMaxOrderByAggregateInput
    _min?: favoritesMinOrderByAggregateInput
  }

  export type favoritesScalarWhereWithAggregatesInput = {
    AND?: favoritesScalarWhereWithAggregatesInput | favoritesScalarWhereWithAggregatesInput[]
    OR?: favoritesScalarWhereWithAggregatesInput[]
    NOT?: favoritesScalarWhereWithAggregatesInput | favoritesScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"favorites"> | string
    userId?: StringWithAggregatesFilter<"favorites"> | string
    productId?: StringWithAggregatesFilter<"favorites"> | string
    createdAt?: DateTimeWithAggregatesFilter<"favorites"> | Date | string
  }

  export type site_configWhereInput = {
    AND?: site_configWhereInput | site_configWhereInput[]
    OR?: site_configWhereInput[]
    NOT?: site_configWhereInput | site_configWhereInput[]
    id?: StringFilter<"site_config"> | string
    categories?: StringNullableListFilter<"site_config">
    subCategories?: JsonFilter<"site_config">
    categoryImages?: JsonFilter<"site_config">
    createdAt?: DateTimeFilter<"site_config"> | Date | string
    updatedAt?: DateTimeFilter<"site_config"> | Date | string
  }

  export type site_configOrderByWithRelationInput = {
    id?: SortOrder
    categories?: SortOrder
    subCategories?: SortOrder
    categoryImages?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type site_configWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: site_configWhereInput | site_configWhereInput[]
    OR?: site_configWhereInput[]
    NOT?: site_configWhereInput | site_configWhereInput[]
    categories?: StringNullableListFilter<"site_config">
    subCategories?: JsonFilter<"site_config">
    categoryImages?: JsonFilter<"site_config">
    createdAt?: DateTimeFilter<"site_config"> | Date | string
    updatedAt?: DateTimeFilter<"site_config"> | Date | string
  }, "id">

  export type site_configOrderByWithAggregationInput = {
    id?: SortOrder
    categories?: SortOrder
    subCategories?: SortOrder
    categoryImages?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: site_configCountOrderByAggregateInput
    _max?: site_configMaxOrderByAggregateInput
    _min?: site_configMinOrderByAggregateInput
  }

  export type site_configScalarWhereWithAggregatesInput = {
    AND?: site_configScalarWhereWithAggregatesInput | site_configScalarWhereWithAggregatesInput[]
    OR?: site_configScalarWhereWithAggregatesInput[]
    NOT?: site_configScalarWhereWithAggregatesInput | site_configScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"site_config"> | string
    categories?: StringNullableListFilter<"site_config">
    subCategories?: JsonWithAggregatesFilter<"site_config">
    categoryImages?: JsonWithAggregatesFilter<"site_config">
    createdAt?: DateTimeWithAggregatesFilter<"site_config"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"site_config"> | Date | string
  }

  export type productsWhereInput = {
    AND?: productsWhereInput | productsWhereInput[]
    OR?: productsWhereInput[]
    NOT?: productsWhereInput | productsWhereInput[]
    id?: StringFilter<"products"> | string
    title?: StringFilter<"products"> | string
    slug?: StringNullableFilter<"products"> | string | null
    isCatalog?: BoolFilter<"products"> | boolean
    category?: StringFilter<"products"> | string
    subCategory?: StringFilter<"products"> | string
    short_description?: StringFilter<"products"> | string
    tags?: StringNullableListFilter<"products">
    sizes?: StringNullableListFilter<"products">
    sizePricing?: JsonNullableFilter<"products">
    cuttingTypePricing?: JsonNullableFilter<"products">
    pieceSizePricing?: JsonNullableFilter<"products">
    cuttingTypes?: StringNullableListFilter<"products">
    pieceSizes?: StringNullableListFilter<"products">
    processingWeightLoss?: StringNullableFilter<"products"> | string | null
    stock?: IntFilter<"products"> | number
    sale_price?: FloatFilter<"products"> | number
    regular_price?: FloatFilter<"products"> | number
    totalSold?: IntFilter<"products"> | number
    ratings?: FloatFilter<"products"> | number
    cashOnDelivery?: StringNullableFilter<"products"> | string | null
    discount_codes?: StringNullableListFilter<"products">
    status?: EnumproductStatusFilter<"products"> | $Enums.productStatus
    isDeleted?: BoolNullableFilter<"products"> | boolean | null
    deletedAt?: DateTimeNullableFilter<"products"> | Date | string | null
    createdAt?: DateTimeFilter<"products"> | Date | string
    updatedAt?: DateTimeFilter<"products"> | Date | string
    storeId?: StringNullableFilter<"products"> | string | null
    adminId?: StringNullableFilter<"products"> | string | null
    catalogProductId?: StringNullableFilter<"products"> | string | null
    images?: ImagesListRelationFilter
    favorites?: FavoritesListRelationFilter
    store?: XOR<StoresNullableRelationFilter, storesWhereInput> | null
    admin?: XOR<AdminsNullableRelationFilter, adminsWhereInput> | null
    catalogProduct?: XOR<ProductsNullableRelationFilter, productsWhereInput> | null
    storeVariants?: ProductsListRelationFilter
  }

  export type productsOrderByWithRelationInput = {
    id?: SortOrder
    title?: SortOrder
    slug?: SortOrder
    isCatalog?: SortOrder
    category?: SortOrder
    subCategory?: SortOrder
    short_description?: SortOrder
    tags?: SortOrder
    sizes?: SortOrder
    sizePricing?: SortOrder
    cuttingTypePricing?: SortOrder
    pieceSizePricing?: SortOrder
    cuttingTypes?: SortOrder
    pieceSizes?: SortOrder
    processingWeightLoss?: SortOrder
    stock?: SortOrder
    sale_price?: SortOrder
    regular_price?: SortOrder
    totalSold?: SortOrder
    ratings?: SortOrder
    cashOnDelivery?: SortOrder
    discount_codes?: SortOrder
    status?: SortOrder
    isDeleted?: SortOrder
    deletedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    storeId?: SortOrder
    adminId?: SortOrder
    catalogProductId?: SortOrder
    images?: imagesOrderByRelationAggregateInput
    favorites?: favoritesOrderByRelationAggregateInput
    store?: storesOrderByWithRelationInput
    admin?: adminsOrderByWithRelationInput
    catalogProduct?: productsOrderByWithRelationInput
    storeVariants?: productsOrderByRelationAggregateInput
  }

  export type productsWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    slug?: string
    AND?: productsWhereInput | productsWhereInput[]
    OR?: productsWhereInput[]
    NOT?: productsWhereInput | productsWhereInput[]
    title?: StringFilter<"products"> | string
    isCatalog?: BoolFilter<"products"> | boolean
    category?: StringFilter<"products"> | string
    subCategory?: StringFilter<"products"> | string
    short_description?: StringFilter<"products"> | string
    tags?: StringNullableListFilter<"products">
    sizes?: StringNullableListFilter<"products">
    sizePricing?: JsonNullableFilter<"products">
    cuttingTypePricing?: JsonNullableFilter<"products">
    pieceSizePricing?: JsonNullableFilter<"products">
    cuttingTypes?: StringNullableListFilter<"products">
    pieceSizes?: StringNullableListFilter<"products">
    processingWeightLoss?: StringNullableFilter<"products"> | string | null
    stock?: IntFilter<"products"> | number
    sale_price?: FloatFilter<"products"> | number
    regular_price?: FloatFilter<"products"> | number
    totalSold?: IntFilter<"products"> | number
    ratings?: FloatFilter<"products"> | number
    cashOnDelivery?: StringNullableFilter<"products"> | string | null
    discount_codes?: StringNullableListFilter<"products">
    status?: EnumproductStatusFilter<"products"> | $Enums.productStatus
    isDeleted?: BoolNullableFilter<"products"> | boolean | null
    deletedAt?: DateTimeNullableFilter<"products"> | Date | string | null
    createdAt?: DateTimeFilter<"products"> | Date | string
    updatedAt?: DateTimeFilter<"products"> | Date | string
    storeId?: StringNullableFilter<"products"> | string | null
    adminId?: StringNullableFilter<"products"> | string | null
    catalogProductId?: StringNullableFilter<"products"> | string | null
    images?: ImagesListRelationFilter
    favorites?: FavoritesListRelationFilter
    store?: XOR<StoresNullableRelationFilter, storesWhereInput> | null
    admin?: XOR<AdminsNullableRelationFilter, adminsWhereInput> | null
    catalogProduct?: XOR<ProductsNullableRelationFilter, productsWhereInput> | null
    storeVariants?: ProductsListRelationFilter
  }, "id" | "slug">

  export type productsOrderByWithAggregationInput = {
    id?: SortOrder
    title?: SortOrder
    slug?: SortOrder
    isCatalog?: SortOrder
    category?: SortOrder
    subCategory?: SortOrder
    short_description?: SortOrder
    tags?: SortOrder
    sizes?: SortOrder
    sizePricing?: SortOrder
    cuttingTypePricing?: SortOrder
    pieceSizePricing?: SortOrder
    cuttingTypes?: SortOrder
    pieceSizes?: SortOrder
    processingWeightLoss?: SortOrder
    stock?: SortOrder
    sale_price?: SortOrder
    regular_price?: SortOrder
    totalSold?: SortOrder
    ratings?: SortOrder
    cashOnDelivery?: SortOrder
    discount_codes?: SortOrder
    status?: SortOrder
    isDeleted?: SortOrder
    deletedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    storeId?: SortOrder
    adminId?: SortOrder
    catalogProductId?: SortOrder
    _count?: productsCountOrderByAggregateInput
    _avg?: productsAvgOrderByAggregateInput
    _max?: productsMaxOrderByAggregateInput
    _min?: productsMinOrderByAggregateInput
    _sum?: productsSumOrderByAggregateInput
  }

  export type productsScalarWhereWithAggregatesInput = {
    AND?: productsScalarWhereWithAggregatesInput | productsScalarWhereWithAggregatesInput[]
    OR?: productsScalarWhereWithAggregatesInput[]
    NOT?: productsScalarWhereWithAggregatesInput | productsScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"products"> | string
    title?: StringWithAggregatesFilter<"products"> | string
    slug?: StringNullableWithAggregatesFilter<"products"> | string | null
    isCatalog?: BoolWithAggregatesFilter<"products"> | boolean
    category?: StringWithAggregatesFilter<"products"> | string
    subCategory?: StringWithAggregatesFilter<"products"> | string
    short_description?: StringWithAggregatesFilter<"products"> | string
    tags?: StringNullableListFilter<"products">
    sizes?: StringNullableListFilter<"products">
    sizePricing?: JsonNullableWithAggregatesFilter<"products">
    cuttingTypePricing?: JsonNullableWithAggregatesFilter<"products">
    pieceSizePricing?: JsonNullableWithAggregatesFilter<"products">
    cuttingTypes?: StringNullableListFilter<"products">
    pieceSizes?: StringNullableListFilter<"products">
    processingWeightLoss?: StringNullableWithAggregatesFilter<"products"> | string | null
    stock?: IntWithAggregatesFilter<"products"> | number
    sale_price?: FloatWithAggregatesFilter<"products"> | number
    regular_price?: FloatWithAggregatesFilter<"products"> | number
    totalSold?: IntWithAggregatesFilter<"products"> | number
    ratings?: FloatWithAggregatesFilter<"products"> | number
    cashOnDelivery?: StringNullableWithAggregatesFilter<"products"> | string | null
    discount_codes?: StringNullableListFilter<"products">
    status?: EnumproductStatusWithAggregatesFilter<"products"> | $Enums.productStatus
    isDeleted?: BoolNullableWithAggregatesFilter<"products"> | boolean | null
    deletedAt?: DateTimeNullableWithAggregatesFilter<"products"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"products"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"products"> | Date | string
    storeId?: StringNullableWithAggregatesFilter<"products"> | string | null
    adminId?: StringNullableWithAggregatesFilter<"products"> | string | null
    catalogProductId?: StringNullableWithAggregatesFilter<"products"> | string | null
  }

  export type bannersWhereInput = {
    AND?: bannersWhereInput | bannersWhereInput[]
    OR?: bannersWhereInput[]
    NOT?: bannersWhereInput | bannersWhereInput[]
    id?: StringFilter<"banners"> | string
    imageUrl?: StringFilter<"banners"> | string
    fileId?: StringFilter<"banners"> | string
    isActive?: BoolFilter<"banners"> | boolean
    category?: StringNullableFilter<"banners"> | string | null
    status?: StringNullableFilter<"banners"> | string | null
    rejectionReason?: StringNullableFilter<"banners"> | string | null
    bannerType?: StringNullableFilter<"banners"> | string | null
    title?: StringNullableFilter<"banners"> | string | null
    subtitle?: StringNullableFilter<"banners"> | string | null
    price?: StringNullableFilter<"banners"> | string | null
    sellerId?: StringNullableFilter<"banners"> | string | null
    adminId?: StringNullableFilter<"banners"> | string | null
    createdAt?: DateTimeFilter<"banners"> | Date | string
    updatedAt?: DateTimeFilter<"banners"> | Date | string
    seller?: XOR<SellersNullableRelationFilter, sellersWhereInput> | null
    admin?: XOR<AdminsNullableRelationFilter, adminsWhereInput> | null
  }

  export type bannersOrderByWithRelationInput = {
    id?: SortOrder
    imageUrl?: SortOrder
    fileId?: SortOrder
    isActive?: SortOrder
    category?: SortOrder
    status?: SortOrder
    rejectionReason?: SortOrder
    bannerType?: SortOrder
    title?: SortOrder
    subtitle?: SortOrder
    price?: SortOrder
    sellerId?: SortOrder
    adminId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    seller?: sellersOrderByWithRelationInput
    admin?: adminsOrderByWithRelationInput
  }

  export type bannersWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: bannersWhereInput | bannersWhereInput[]
    OR?: bannersWhereInput[]
    NOT?: bannersWhereInput | bannersWhereInput[]
    imageUrl?: StringFilter<"banners"> | string
    fileId?: StringFilter<"banners"> | string
    isActive?: BoolFilter<"banners"> | boolean
    category?: StringNullableFilter<"banners"> | string | null
    status?: StringNullableFilter<"banners"> | string | null
    rejectionReason?: StringNullableFilter<"banners"> | string | null
    bannerType?: StringNullableFilter<"banners"> | string | null
    title?: StringNullableFilter<"banners"> | string | null
    subtitle?: StringNullableFilter<"banners"> | string | null
    price?: StringNullableFilter<"banners"> | string | null
    sellerId?: StringNullableFilter<"banners"> | string | null
    adminId?: StringNullableFilter<"banners"> | string | null
    createdAt?: DateTimeFilter<"banners"> | Date | string
    updatedAt?: DateTimeFilter<"banners"> | Date | string
    seller?: XOR<SellersNullableRelationFilter, sellersWhereInput> | null
    admin?: XOR<AdminsNullableRelationFilter, adminsWhereInput> | null
  }, "id">

  export type bannersOrderByWithAggregationInput = {
    id?: SortOrder
    imageUrl?: SortOrder
    fileId?: SortOrder
    isActive?: SortOrder
    category?: SortOrder
    status?: SortOrder
    rejectionReason?: SortOrder
    bannerType?: SortOrder
    title?: SortOrder
    subtitle?: SortOrder
    price?: SortOrder
    sellerId?: SortOrder
    adminId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: bannersCountOrderByAggregateInput
    _max?: bannersMaxOrderByAggregateInput
    _min?: bannersMinOrderByAggregateInput
  }

  export type bannersScalarWhereWithAggregatesInput = {
    AND?: bannersScalarWhereWithAggregatesInput | bannersScalarWhereWithAggregatesInput[]
    OR?: bannersScalarWhereWithAggregatesInput[]
    NOT?: bannersScalarWhereWithAggregatesInput | bannersScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"banners"> | string
    imageUrl?: StringWithAggregatesFilter<"banners"> | string
    fileId?: StringWithAggregatesFilter<"banners"> | string
    isActive?: BoolWithAggregatesFilter<"banners"> | boolean
    category?: StringNullableWithAggregatesFilter<"banners"> | string | null
    status?: StringNullableWithAggregatesFilter<"banners"> | string | null
    rejectionReason?: StringNullableWithAggregatesFilter<"banners"> | string | null
    bannerType?: StringNullableWithAggregatesFilter<"banners"> | string | null
    title?: StringNullableWithAggregatesFilter<"banners"> | string | null
    subtitle?: StringNullableWithAggregatesFilter<"banners"> | string | null
    price?: StringNullableWithAggregatesFilter<"banners"> | string | null
    sellerId?: StringNullableWithAggregatesFilter<"banners"> | string | null
    adminId?: StringNullableWithAggregatesFilter<"banners"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"banners"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"banners"> | Date | string
  }

  export type seller_eventsWhereInput = {
    AND?: seller_eventsWhereInput | seller_eventsWhereInput[]
    OR?: seller_eventsWhereInput[]
    NOT?: seller_eventsWhereInput | seller_eventsWhereInput[]
    id?: StringFilter<"seller_events"> | string
    sellerId?: StringFilter<"seller_events"> | string
    title?: StringFilter<"seller_events"> | string
    description?: StringNullableFilter<"seller_events"> | string | null
    type?: EnumsellerEventTypeFilter<"seller_events"> | $Enums.sellerEventType
    minOrder?: FloatNullableFilter<"seller_events"> | number | null
    discount?: FloatNullableFilter<"seller_events"> | number | null
    startTime?: DateTimeFilter<"seller_events"> | Date | string
    endTime?: DateTimeFilter<"seller_events"> | Date | string
    isActive?: BoolFilter<"seller_events"> | boolean
    createdAt?: DateTimeFilter<"seller_events"> | Date | string
    updatedAt?: DateTimeFilter<"seller_events"> | Date | string
    seller?: XOR<SellersRelationFilter, sellersWhereInput>
  }

  export type seller_eventsOrderByWithRelationInput = {
    id?: SortOrder
    sellerId?: SortOrder
    title?: SortOrder
    description?: SortOrder
    type?: SortOrder
    minOrder?: SortOrder
    discount?: SortOrder
    startTime?: SortOrder
    endTime?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    seller?: sellersOrderByWithRelationInput
  }

  export type seller_eventsWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: seller_eventsWhereInput | seller_eventsWhereInput[]
    OR?: seller_eventsWhereInput[]
    NOT?: seller_eventsWhereInput | seller_eventsWhereInput[]
    sellerId?: StringFilter<"seller_events"> | string
    title?: StringFilter<"seller_events"> | string
    description?: StringNullableFilter<"seller_events"> | string | null
    type?: EnumsellerEventTypeFilter<"seller_events"> | $Enums.sellerEventType
    minOrder?: FloatNullableFilter<"seller_events"> | number | null
    discount?: FloatNullableFilter<"seller_events"> | number | null
    startTime?: DateTimeFilter<"seller_events"> | Date | string
    endTime?: DateTimeFilter<"seller_events"> | Date | string
    isActive?: BoolFilter<"seller_events"> | boolean
    createdAt?: DateTimeFilter<"seller_events"> | Date | string
    updatedAt?: DateTimeFilter<"seller_events"> | Date | string
    seller?: XOR<SellersRelationFilter, sellersWhereInput>
  }, "id">

  export type seller_eventsOrderByWithAggregationInput = {
    id?: SortOrder
    sellerId?: SortOrder
    title?: SortOrder
    description?: SortOrder
    type?: SortOrder
    minOrder?: SortOrder
    discount?: SortOrder
    startTime?: SortOrder
    endTime?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: seller_eventsCountOrderByAggregateInput
    _avg?: seller_eventsAvgOrderByAggregateInput
    _max?: seller_eventsMaxOrderByAggregateInput
    _min?: seller_eventsMinOrderByAggregateInput
    _sum?: seller_eventsSumOrderByAggregateInput
  }

  export type seller_eventsScalarWhereWithAggregatesInput = {
    AND?: seller_eventsScalarWhereWithAggregatesInput | seller_eventsScalarWhereWithAggregatesInput[]
    OR?: seller_eventsScalarWhereWithAggregatesInput[]
    NOT?: seller_eventsScalarWhereWithAggregatesInput | seller_eventsScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"seller_events"> | string
    sellerId?: StringWithAggregatesFilter<"seller_events"> | string
    title?: StringWithAggregatesFilter<"seller_events"> | string
    description?: StringNullableWithAggregatesFilter<"seller_events"> | string | null
    type?: EnumsellerEventTypeWithAggregatesFilter<"seller_events"> | $Enums.sellerEventType
    minOrder?: FloatNullableWithAggregatesFilter<"seller_events"> | number | null
    discount?: FloatNullableWithAggregatesFilter<"seller_events"> | number | null
    startTime?: DateTimeWithAggregatesFilter<"seller_events"> | Date | string
    endTime?: DateTimeWithAggregatesFilter<"seller_events"> | Date | string
    isActive?: BoolWithAggregatesFilter<"seller_events"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"seller_events"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"seller_events"> | Date | string
  }

  export type SignupAccessCodeWhereInput = {
    AND?: SignupAccessCodeWhereInput | SignupAccessCodeWhereInput[]
    OR?: SignupAccessCodeWhereInput[]
    NOT?: SignupAccessCodeWhereInput | SignupAccessCodeWhereInput[]
    id?: StringFilter<"SignupAccessCode"> | string
    email?: StringNullableFilter<"SignupAccessCode"> | string | null
    role?: StringFilter<"SignupAccessCode"> | string
    code?: StringFilter<"SignupAccessCode"> | string
    expiresAt?: DateTimeNullableFilter<"SignupAccessCode"> | Date | string | null
    createdAt?: DateTimeFilter<"SignupAccessCode"> | Date | string
    updatedAt?: DateTimeFilter<"SignupAccessCode"> | Date | string
  }

  export type SignupAccessCodeOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    role?: SortOrder
    code?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SignupAccessCodeWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email_role?: SignupAccessCodeEmailRoleCompoundUniqueInput
    AND?: SignupAccessCodeWhereInput | SignupAccessCodeWhereInput[]
    OR?: SignupAccessCodeWhereInput[]
    NOT?: SignupAccessCodeWhereInput | SignupAccessCodeWhereInput[]
    email?: StringNullableFilter<"SignupAccessCode"> | string | null
    role?: StringFilter<"SignupAccessCode"> | string
    code?: StringFilter<"SignupAccessCode"> | string
    expiresAt?: DateTimeNullableFilter<"SignupAccessCode"> | Date | string | null
    createdAt?: DateTimeFilter<"SignupAccessCode"> | Date | string
    updatedAt?: DateTimeFilter<"SignupAccessCode"> | Date | string
  }, "id" | "email_role">

  export type SignupAccessCodeOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    role?: SortOrder
    code?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: SignupAccessCodeCountOrderByAggregateInput
    _max?: SignupAccessCodeMaxOrderByAggregateInput
    _min?: SignupAccessCodeMinOrderByAggregateInput
  }

  export type SignupAccessCodeScalarWhereWithAggregatesInput = {
    AND?: SignupAccessCodeScalarWhereWithAggregatesInput | SignupAccessCodeScalarWhereWithAggregatesInput[]
    OR?: SignupAccessCodeScalarWhereWithAggregatesInput[]
    NOT?: SignupAccessCodeScalarWhereWithAggregatesInput | SignupAccessCodeScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"SignupAccessCode"> | string
    email?: StringNullableWithAggregatesFilter<"SignupAccessCode"> | string | null
    role?: StringWithAggregatesFilter<"SignupAccessCode"> | string
    code?: StringWithAggregatesFilter<"SignupAccessCode"> | string
    expiresAt?: DateTimeNullableWithAggregatesFilter<"SignupAccessCode"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"SignupAccessCode"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"SignupAccessCode"> | Date | string
  }

  export type adminsCreateInput = {
    id?: string
    name: string
    email: string
    password: string
    createdAt?: Date | string
    updatedAt?: Date | string
    products?: productsCreateNestedManyWithoutAdminInput
    coupons?: discount_codesCreateNestedManyWithoutAdminInput
    banners?: bannersCreateNestedManyWithoutAdminInput
  }

  export type adminsUncheckedCreateInput = {
    id?: string
    name: string
    email: string
    password: string
    createdAt?: Date | string
    updatedAt?: Date | string
    products?: productsUncheckedCreateNestedManyWithoutAdminInput
    coupons?: discount_codesUncheckedCreateNestedManyWithoutAdminInput
    banners?: bannersUncheckedCreateNestedManyWithoutAdminInput
  }

  export type adminsUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    products?: productsUpdateManyWithoutAdminNestedInput
    coupons?: discount_codesUpdateManyWithoutAdminNestedInput
    banners?: bannersUpdateManyWithoutAdminNestedInput
  }

  export type adminsUncheckedUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    products?: productsUncheckedUpdateManyWithoutAdminNestedInput
    coupons?: discount_codesUncheckedUpdateManyWithoutAdminNestedInput
    banners?: bannersUncheckedUpdateManyWithoutAdminNestedInput
  }

  export type adminsCreateManyInput = {
    id?: string
    name: string
    email: string
    password: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type adminsUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type adminsUncheckedUpdateManyInput = {
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type imagesCreateInput = {
    id?: string
    file_id: string
    url: string
    type?: $Enums.ImageType
    createdAt?: Date | string
    product?: productsCreateNestedOneWithoutImagesInput
    users?: usersCreateNestedManyWithoutAvatarInput
    stores?: storesCreateNestedManyWithoutAvatarInput
  }

  export type imagesUncheckedCreateInput = {
    id?: string
    file_id: string
    url: string
    type?: $Enums.ImageType
    productId?: string | null
    createdAt?: Date | string
    users?: usersUncheckedCreateNestedManyWithoutAvatarInput
    stores?: storesUncheckedCreateNestedManyWithoutAvatarInput
  }

  export type imagesUpdateInput = {
    file_id?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    type?: EnumImageTypeFieldUpdateOperationsInput | $Enums.ImageType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    product?: productsUpdateOneWithoutImagesNestedInput
    users?: usersUpdateManyWithoutAvatarNestedInput
    stores?: storesUpdateManyWithoutAvatarNestedInput
  }

  export type imagesUncheckedUpdateInput = {
    file_id?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    type?: EnumImageTypeFieldUpdateOperationsInput | $Enums.ImageType
    productId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: usersUncheckedUpdateManyWithoutAvatarNestedInput
    stores?: storesUncheckedUpdateManyWithoutAvatarNestedInput
  }

  export type imagesCreateManyInput = {
    id?: string
    file_id: string
    url: string
    type?: $Enums.ImageType
    productId?: string | null
    createdAt?: Date | string
  }

  export type imagesUpdateManyMutationInput = {
    file_id?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    type?: EnumImageTypeFieldUpdateOperationsInput | $Enums.ImageType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type imagesUncheckedUpdateManyInput = {
    file_id?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    type?: EnumImageTypeFieldUpdateOperationsInput | $Enums.ImageType
    productId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type usersCreateInput = {
    id?: string
    phone_number?: string | null
    email?: string | null
    name: string
    following?: usersCreatefollowingInput | string[]
    addresses?: usersCreateaddressesInput | InputJsonValue[]
    createdAt?: Date | string
    updatedAt?: Date | string
    avatar?: imagesCreateNestedOneWithoutUsersInput
    favorites?: favoritesCreateNestedManyWithoutUserInput
  }

  export type usersUncheckedCreateInput = {
    id?: string
    phone_number?: string | null
    email?: string | null
    name: string
    following?: usersCreatefollowingInput | string[]
    addresses?: usersCreateaddressesInput | InputJsonValue[]
    avatarId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    favorites?: favoritesUncheckedCreateNestedManyWithoutUserInput
  }

  export type usersUpdateInput = {
    phone_number?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    following?: usersUpdatefollowingInput | string[]
    addresses?: usersUpdateaddressesInput | InputJsonValue[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    avatar?: imagesUpdateOneWithoutUsersNestedInput
    favorites?: favoritesUpdateManyWithoutUserNestedInput
  }

  export type usersUncheckedUpdateInput = {
    phone_number?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    following?: usersUpdatefollowingInput | string[]
    addresses?: usersUpdateaddressesInput | InputJsonValue[]
    avatarId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    favorites?: favoritesUncheckedUpdateManyWithoutUserNestedInput
  }

  export type usersCreateManyInput = {
    id?: string
    phone_number?: string | null
    email?: string | null
    name: string
    following?: usersCreatefollowingInput | string[]
    addresses?: usersCreateaddressesInput | InputJsonValue[]
    avatarId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type usersUpdateManyMutationInput = {
    phone_number?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    following?: usersUpdatefollowingInput | string[]
    addresses?: usersUpdateaddressesInput | InputJsonValue[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type usersUncheckedUpdateManyInput = {
    phone_number?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    following?: usersUpdatefollowingInput | string[]
    addresses?: usersUpdateaddressesInput | InputJsonValue[]
    avatarId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type discount_codesCreateInput = {
    id?: string
    public_name: string
    discountType: string
    discountValue: number
    minOrderValue?: number
    discountCode: string
    expiresAt?: Date | string | null
    maxUses?: number | null
    maxUsesPerUser?: number
    usedCount?: number
    isActive?: boolean
    isFirstOrder?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    seller?: sellersCreateNestedOneWithoutCouponsInput
    admin?: adminsCreateNestedOneWithoutCouponsInput
    usages?: coupon_usagesCreateNestedManyWithoutCouponInput
  }

  export type discount_codesUncheckedCreateInput = {
    id?: string
    public_name: string
    discountType: string
    discountValue: number
    minOrderValue?: number
    discountCode: string
    expiresAt?: Date | string | null
    maxUses?: number | null
    maxUsesPerUser?: number
    usedCount?: number
    isActive?: boolean
    isFirstOrder?: boolean
    sellerId?: string | null
    adminId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    usages?: coupon_usagesUncheckedCreateNestedManyWithoutCouponInput
  }

  export type discount_codesUpdateInput = {
    public_name?: StringFieldUpdateOperationsInput | string
    discountType?: StringFieldUpdateOperationsInput | string
    discountValue?: FloatFieldUpdateOperationsInput | number
    minOrderValue?: FloatFieldUpdateOperationsInput | number
    discountCode?: StringFieldUpdateOperationsInput | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    maxUses?: NullableIntFieldUpdateOperationsInput | number | null
    maxUsesPerUser?: IntFieldUpdateOperationsInput | number
    usedCount?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isFirstOrder?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    seller?: sellersUpdateOneWithoutCouponsNestedInput
    admin?: adminsUpdateOneWithoutCouponsNestedInput
    usages?: coupon_usagesUpdateManyWithoutCouponNestedInput
  }

  export type discount_codesUncheckedUpdateInput = {
    public_name?: StringFieldUpdateOperationsInput | string
    discountType?: StringFieldUpdateOperationsInput | string
    discountValue?: FloatFieldUpdateOperationsInput | number
    minOrderValue?: FloatFieldUpdateOperationsInput | number
    discountCode?: StringFieldUpdateOperationsInput | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    maxUses?: NullableIntFieldUpdateOperationsInput | number | null
    maxUsesPerUser?: IntFieldUpdateOperationsInput | number
    usedCount?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isFirstOrder?: BoolFieldUpdateOperationsInput | boolean
    sellerId?: NullableStringFieldUpdateOperationsInput | string | null
    adminId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usages?: coupon_usagesUncheckedUpdateManyWithoutCouponNestedInput
  }

  export type discount_codesCreateManyInput = {
    id?: string
    public_name: string
    discountType: string
    discountValue: number
    minOrderValue?: number
    discountCode: string
    expiresAt?: Date | string | null
    maxUses?: number | null
    maxUsesPerUser?: number
    usedCount?: number
    isActive?: boolean
    isFirstOrder?: boolean
    sellerId?: string | null
    adminId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type discount_codesUpdateManyMutationInput = {
    public_name?: StringFieldUpdateOperationsInput | string
    discountType?: StringFieldUpdateOperationsInput | string
    discountValue?: FloatFieldUpdateOperationsInput | number
    minOrderValue?: FloatFieldUpdateOperationsInput | number
    discountCode?: StringFieldUpdateOperationsInput | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    maxUses?: NullableIntFieldUpdateOperationsInput | number | null
    maxUsesPerUser?: IntFieldUpdateOperationsInput | number
    usedCount?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isFirstOrder?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type discount_codesUncheckedUpdateManyInput = {
    public_name?: StringFieldUpdateOperationsInput | string
    discountType?: StringFieldUpdateOperationsInput | string
    discountValue?: FloatFieldUpdateOperationsInput | number
    minOrderValue?: FloatFieldUpdateOperationsInput | number
    discountCode?: StringFieldUpdateOperationsInput | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    maxUses?: NullableIntFieldUpdateOperationsInput | number | null
    maxUsesPerUser?: IntFieldUpdateOperationsInput | number
    usedCount?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isFirstOrder?: BoolFieldUpdateOperationsInput | boolean
    sellerId?: NullableStringFieldUpdateOperationsInput | string | null
    adminId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type coupon_usagesCreateInput = {
    id?: string
    userId: string
    orderId: string
    usedAt?: Date | string
    coupon: discount_codesCreateNestedOneWithoutUsagesInput
  }

  export type coupon_usagesUncheckedCreateInput = {
    id?: string
    couponId: string
    userId: string
    orderId: string
    usedAt?: Date | string
  }

  export type coupon_usagesUpdateInput = {
    userId?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    usedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    coupon?: discount_codesUpdateOneRequiredWithoutUsagesNestedInput
  }

  export type coupon_usagesUncheckedUpdateInput = {
    couponId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    usedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type coupon_usagesCreateManyInput = {
    id?: string
    couponId: string
    userId: string
    orderId: string
    usedAt?: Date | string
  }

  export type coupon_usagesUpdateManyMutationInput = {
    userId?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    usedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type coupon_usagesUncheckedUpdateManyInput = {
    couponId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    usedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type sellersCreateInput = {
    id?: string
    name: string
    email: string
    phone_number: string
    password: string
    following?: sellersCreatefollowingInput | string[]
    isApprovedByAdmin?: boolean
    permissions?: InputJsonValue | null
    createdAt?: Date | string
    updatedAt?: Date | string
    banners?: bannersCreateNestedManyWithoutSellerInput
    events?: seller_eventsCreateNestedManyWithoutSellerInput
    store?: storesCreateNestedOneWithoutSellerInput
    coupons?: discount_codesCreateNestedManyWithoutSellerInput
    staffs?: staffsCreateNestedManyWithoutSellerInput
  }

  export type sellersUncheckedCreateInput = {
    id?: string
    name: string
    email: string
    phone_number: string
    password: string
    following?: sellersCreatefollowingInput | string[]
    isApprovedByAdmin?: boolean
    permissions?: InputJsonValue | null
    createdAt?: Date | string
    updatedAt?: Date | string
    banners?: bannersUncheckedCreateNestedManyWithoutSellerInput
    events?: seller_eventsUncheckedCreateNestedManyWithoutSellerInput
    store?: storesUncheckedCreateNestedOneWithoutSellerInput
    coupons?: discount_codesUncheckedCreateNestedManyWithoutSellerInput
    staffs?: staffsUncheckedCreateNestedManyWithoutSellerInput
  }

  export type sellersUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone_number?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    following?: sellersUpdatefollowingInput | string[]
    isApprovedByAdmin?: BoolFieldUpdateOperationsInput | boolean
    permissions?: InputJsonValue | InputJsonValue | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    banners?: bannersUpdateManyWithoutSellerNestedInput
    events?: seller_eventsUpdateManyWithoutSellerNestedInput
    store?: storesUpdateOneWithoutSellerNestedInput
    coupons?: discount_codesUpdateManyWithoutSellerNestedInput
    staffs?: staffsUpdateManyWithoutSellerNestedInput
  }

  export type sellersUncheckedUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone_number?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    following?: sellersUpdatefollowingInput | string[]
    isApprovedByAdmin?: BoolFieldUpdateOperationsInput | boolean
    permissions?: InputJsonValue | InputJsonValue | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    banners?: bannersUncheckedUpdateManyWithoutSellerNestedInput
    events?: seller_eventsUncheckedUpdateManyWithoutSellerNestedInput
    store?: storesUncheckedUpdateOneWithoutSellerNestedInput
    coupons?: discount_codesUncheckedUpdateManyWithoutSellerNestedInput
    staffs?: staffsUncheckedUpdateManyWithoutSellerNestedInput
  }

  export type sellersCreateManyInput = {
    id?: string
    name: string
    email: string
    phone_number: string
    password: string
    following?: sellersCreatefollowingInput | string[]
    isApprovedByAdmin?: boolean
    permissions?: InputJsonValue | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type sellersUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone_number?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    following?: sellersUpdatefollowingInput | string[]
    isApprovedByAdmin?: BoolFieldUpdateOperationsInput | boolean
    permissions?: InputJsonValue | InputJsonValue | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type sellersUncheckedUpdateManyInput = {
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone_number?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    following?: sellersUpdatefollowingInput | string[]
    isApprovedByAdmin?: BoolFieldUpdateOperationsInput | boolean
    permissions?: InputJsonValue | InputJsonValue | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type staffsCreateInput = {
    id?: string
    name: string
    email: string
    password: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    seller?: sellersCreateNestedOneWithoutStaffsInput
  }

  export type staffsUncheckedCreateInput = {
    id?: string
    name: string
    email: string
    password: string
    isActive?: boolean
    sellerId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type staffsUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    seller?: sellersUpdateOneWithoutStaffsNestedInput
  }

  export type staffsUncheckedUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sellerId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type staffsCreateManyInput = {
    id?: string
    name: string
    email: string
    password: string
    isActive?: boolean
    sellerId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type staffsUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type staffsUncheckedUpdateManyInput = {
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sellerId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type storesCreateInput = {
    id?: string
    name: string
    bio: string
    address: string
    city: string
    pincode: string
    opening_hours: string
    closing_hours: string
    is_instant_delivery_enabled?: boolean
    instant_delivery_fee?: number
    instant_delivery_window_start?: string
    instant_delivery_window_end?: string
    availableCities?: storesCreateavailableCitiesInput | string[]
    cityDeliveryTimes?: InputJsonValue | null
    state?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    avatar?: imagesCreateNestedOneWithoutStoresInput
    seller: sellersCreateNestedOneWithoutStoreInput
    products?: productsCreateNestedManyWithoutStoreInput
  }

  export type storesUncheckedCreateInput = {
    id?: string
    name: string
    bio: string
    avatarId?: string | null
    address: string
    city: string
    pincode: string
    opening_hours: string
    closing_hours: string
    is_instant_delivery_enabled?: boolean
    instant_delivery_fee?: number
    instant_delivery_window_start?: string
    instant_delivery_window_end?: string
    availableCities?: storesCreateavailableCitiesInput | string[]
    cityDeliveryTimes?: InputJsonValue | null
    state?: string | null
    sellerId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    products?: productsUncheckedCreateNestedManyWithoutStoreInput
  }

  export type storesUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    bio?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    city?: StringFieldUpdateOperationsInput | string
    pincode?: StringFieldUpdateOperationsInput | string
    opening_hours?: StringFieldUpdateOperationsInput | string
    closing_hours?: StringFieldUpdateOperationsInput | string
    is_instant_delivery_enabled?: BoolFieldUpdateOperationsInput | boolean
    instant_delivery_fee?: FloatFieldUpdateOperationsInput | number
    instant_delivery_window_start?: StringFieldUpdateOperationsInput | string
    instant_delivery_window_end?: StringFieldUpdateOperationsInput | string
    availableCities?: storesUpdateavailableCitiesInput | string[]
    cityDeliveryTimes?: InputJsonValue | InputJsonValue | null
    state?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    avatar?: imagesUpdateOneWithoutStoresNestedInput
    seller?: sellersUpdateOneRequiredWithoutStoreNestedInput
    products?: productsUpdateManyWithoutStoreNestedInput
  }

  export type storesUncheckedUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    bio?: StringFieldUpdateOperationsInput | string
    avatarId?: NullableStringFieldUpdateOperationsInput | string | null
    address?: StringFieldUpdateOperationsInput | string
    city?: StringFieldUpdateOperationsInput | string
    pincode?: StringFieldUpdateOperationsInput | string
    opening_hours?: StringFieldUpdateOperationsInput | string
    closing_hours?: StringFieldUpdateOperationsInput | string
    is_instant_delivery_enabled?: BoolFieldUpdateOperationsInput | boolean
    instant_delivery_fee?: FloatFieldUpdateOperationsInput | number
    instant_delivery_window_start?: StringFieldUpdateOperationsInput | string
    instant_delivery_window_end?: StringFieldUpdateOperationsInput | string
    availableCities?: storesUpdateavailableCitiesInput | string[]
    cityDeliveryTimes?: InputJsonValue | InputJsonValue | null
    state?: NullableStringFieldUpdateOperationsInput | string | null
    sellerId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    products?: productsUncheckedUpdateManyWithoutStoreNestedInput
  }

  export type storesCreateManyInput = {
    id?: string
    name: string
    bio: string
    avatarId?: string | null
    address: string
    city: string
    pincode: string
    opening_hours: string
    closing_hours: string
    is_instant_delivery_enabled?: boolean
    instant_delivery_fee?: number
    instant_delivery_window_start?: string
    instant_delivery_window_end?: string
    availableCities?: storesCreateavailableCitiesInput | string[]
    cityDeliveryTimes?: InputJsonValue | null
    state?: string | null
    sellerId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type storesUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
    bio?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    city?: StringFieldUpdateOperationsInput | string
    pincode?: StringFieldUpdateOperationsInput | string
    opening_hours?: StringFieldUpdateOperationsInput | string
    closing_hours?: StringFieldUpdateOperationsInput | string
    is_instant_delivery_enabled?: BoolFieldUpdateOperationsInput | boolean
    instant_delivery_fee?: FloatFieldUpdateOperationsInput | number
    instant_delivery_window_start?: StringFieldUpdateOperationsInput | string
    instant_delivery_window_end?: StringFieldUpdateOperationsInput | string
    availableCities?: storesUpdateavailableCitiesInput | string[]
    cityDeliveryTimes?: InputJsonValue | InputJsonValue | null
    state?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type storesUncheckedUpdateManyInput = {
    name?: StringFieldUpdateOperationsInput | string
    bio?: StringFieldUpdateOperationsInput | string
    avatarId?: NullableStringFieldUpdateOperationsInput | string | null
    address?: StringFieldUpdateOperationsInput | string
    city?: StringFieldUpdateOperationsInput | string
    pincode?: StringFieldUpdateOperationsInput | string
    opening_hours?: StringFieldUpdateOperationsInput | string
    closing_hours?: StringFieldUpdateOperationsInput | string
    is_instant_delivery_enabled?: BoolFieldUpdateOperationsInput | boolean
    instant_delivery_fee?: FloatFieldUpdateOperationsInput | number
    instant_delivery_window_start?: StringFieldUpdateOperationsInput | string
    instant_delivery_window_end?: StringFieldUpdateOperationsInput | string
    availableCities?: storesUpdateavailableCitiesInput | string[]
    cityDeliveryTimes?: InputJsonValue | InputJsonValue | null
    state?: NullableStringFieldUpdateOperationsInput | string | null
    sellerId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type favoritesCreateInput = {
    id?: string
    createdAt?: Date | string
    user: usersCreateNestedOneWithoutFavoritesInput
    product: productsCreateNestedOneWithoutFavoritesInput
  }

  export type favoritesUncheckedCreateInput = {
    id?: string
    userId: string
    productId: string
    createdAt?: Date | string
  }

  export type favoritesUpdateInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: usersUpdateOneRequiredWithoutFavoritesNestedInput
    product?: productsUpdateOneRequiredWithoutFavoritesNestedInput
  }

  export type favoritesUncheckedUpdateInput = {
    userId?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type favoritesCreateManyInput = {
    id?: string
    userId: string
    productId: string
    createdAt?: Date | string
  }

  export type favoritesUpdateManyMutationInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type favoritesUncheckedUpdateManyInput = {
    userId?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type site_configCreateInput = {
    id?: string
    categories?: site_configCreatecategoriesInput | string[]
    subCategories: InputJsonValue
    categoryImages?: InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type site_configUncheckedCreateInput = {
    id?: string
    categories?: site_configCreatecategoriesInput | string[]
    subCategories: InputJsonValue
    categoryImages?: InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type site_configUpdateInput = {
    categories?: site_configUpdatecategoriesInput | string[]
    subCategories?: InputJsonValue | InputJsonValue
    categoryImages?: InputJsonValue | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type site_configUncheckedUpdateInput = {
    categories?: site_configUpdatecategoriesInput | string[]
    subCategories?: InputJsonValue | InputJsonValue
    categoryImages?: InputJsonValue | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type site_configCreateManyInput = {
    id?: string
    categories?: site_configCreatecategoriesInput | string[]
    subCategories: InputJsonValue
    categoryImages?: InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type site_configUpdateManyMutationInput = {
    categories?: site_configUpdatecategoriesInput | string[]
    subCategories?: InputJsonValue | InputJsonValue
    categoryImages?: InputJsonValue | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type site_configUncheckedUpdateManyInput = {
    categories?: site_configUpdatecategoriesInput | string[]
    subCategories?: InputJsonValue | InputJsonValue
    categoryImages?: InputJsonValue | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type productsCreateInput = {
    id?: string
    title: string
    slug?: string | null
    isCatalog?: boolean
    category: string
    subCategory: string
    short_description: string
    tags?: productsCreatetagsInput | string[]
    sizes?: productsCreatesizesInput | string[]
    sizePricing?: InputJsonValue | null
    cuttingTypePricing?: InputJsonValue | null
    pieceSizePricing?: InputJsonValue | null
    cuttingTypes?: productsCreatecuttingTypesInput | string[]
    pieceSizes?: productsCreatepieceSizesInput | string[]
    processingWeightLoss?: string | null
    stock: number
    sale_price: number
    regular_price: number
    totalSold?: number
    ratings?: number
    cashOnDelivery?: string | null
    discount_codes?: productsCreatediscount_codesInput | string[]
    status?: $Enums.productStatus
    isDeleted?: boolean | null
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    images?: imagesCreateNestedManyWithoutProductInput
    favorites?: favoritesCreateNestedManyWithoutProductInput
    store?: storesCreateNestedOneWithoutProductsInput
    admin?: adminsCreateNestedOneWithoutProductsInput
    catalogProduct?: productsCreateNestedOneWithoutStoreVariantsInput
    storeVariants?: productsCreateNestedManyWithoutCatalogProductInput
  }

  export type productsUncheckedCreateInput = {
    id?: string
    title: string
    slug?: string | null
    isCatalog?: boolean
    category: string
    subCategory: string
    short_description: string
    tags?: productsCreatetagsInput | string[]
    sizes?: productsCreatesizesInput | string[]
    sizePricing?: InputJsonValue | null
    cuttingTypePricing?: InputJsonValue | null
    pieceSizePricing?: InputJsonValue | null
    cuttingTypes?: productsCreatecuttingTypesInput | string[]
    pieceSizes?: productsCreatepieceSizesInput | string[]
    processingWeightLoss?: string | null
    stock: number
    sale_price: number
    regular_price: number
    totalSold?: number
    ratings?: number
    cashOnDelivery?: string | null
    discount_codes?: productsCreatediscount_codesInput | string[]
    status?: $Enums.productStatus
    isDeleted?: boolean | null
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    storeId?: string | null
    adminId?: string | null
    catalogProductId?: string | null
    images?: imagesUncheckedCreateNestedManyWithoutProductInput
    favorites?: favoritesUncheckedCreateNestedManyWithoutProductInput
    storeVariants?: productsUncheckedCreateNestedManyWithoutCatalogProductInput
  }

  export type productsUpdateInput = {
    title?: StringFieldUpdateOperationsInput | string
    slug?: NullableStringFieldUpdateOperationsInput | string | null
    isCatalog?: BoolFieldUpdateOperationsInput | boolean
    category?: StringFieldUpdateOperationsInput | string
    subCategory?: StringFieldUpdateOperationsInput | string
    short_description?: StringFieldUpdateOperationsInput | string
    tags?: productsUpdatetagsInput | string[]
    sizes?: productsUpdatesizesInput | string[]
    sizePricing?: InputJsonValue | InputJsonValue | null
    cuttingTypePricing?: InputJsonValue | InputJsonValue | null
    pieceSizePricing?: InputJsonValue | InputJsonValue | null
    cuttingTypes?: productsUpdatecuttingTypesInput | string[]
    pieceSizes?: productsUpdatepieceSizesInput | string[]
    processingWeightLoss?: NullableStringFieldUpdateOperationsInput | string | null
    stock?: IntFieldUpdateOperationsInput | number
    sale_price?: FloatFieldUpdateOperationsInput | number
    regular_price?: FloatFieldUpdateOperationsInput | number
    totalSold?: IntFieldUpdateOperationsInput | number
    ratings?: FloatFieldUpdateOperationsInput | number
    cashOnDelivery?: NullableStringFieldUpdateOperationsInput | string | null
    discount_codes?: productsUpdatediscount_codesInput | string[]
    status?: EnumproductStatusFieldUpdateOperationsInput | $Enums.productStatus
    isDeleted?: NullableBoolFieldUpdateOperationsInput | boolean | null
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    images?: imagesUpdateManyWithoutProductNestedInput
    favorites?: favoritesUpdateManyWithoutProductNestedInput
    store?: storesUpdateOneWithoutProductsNestedInput
    admin?: adminsUpdateOneWithoutProductsNestedInput
    catalogProduct?: productsUpdateOneWithoutStoreVariantsNestedInput
    storeVariants?: productsUpdateManyWithoutCatalogProductNestedInput
  }

  export type productsUncheckedUpdateInput = {
    title?: StringFieldUpdateOperationsInput | string
    slug?: NullableStringFieldUpdateOperationsInput | string | null
    isCatalog?: BoolFieldUpdateOperationsInput | boolean
    category?: StringFieldUpdateOperationsInput | string
    subCategory?: StringFieldUpdateOperationsInput | string
    short_description?: StringFieldUpdateOperationsInput | string
    tags?: productsUpdatetagsInput | string[]
    sizes?: productsUpdatesizesInput | string[]
    sizePricing?: InputJsonValue | InputJsonValue | null
    cuttingTypePricing?: InputJsonValue | InputJsonValue | null
    pieceSizePricing?: InputJsonValue | InputJsonValue | null
    cuttingTypes?: productsUpdatecuttingTypesInput | string[]
    pieceSizes?: productsUpdatepieceSizesInput | string[]
    processingWeightLoss?: NullableStringFieldUpdateOperationsInput | string | null
    stock?: IntFieldUpdateOperationsInput | number
    sale_price?: FloatFieldUpdateOperationsInput | number
    regular_price?: FloatFieldUpdateOperationsInput | number
    totalSold?: IntFieldUpdateOperationsInput | number
    ratings?: FloatFieldUpdateOperationsInput | number
    cashOnDelivery?: NullableStringFieldUpdateOperationsInput | string | null
    discount_codes?: productsUpdatediscount_codesInput | string[]
    status?: EnumproductStatusFieldUpdateOperationsInput | $Enums.productStatus
    isDeleted?: NullableBoolFieldUpdateOperationsInput | boolean | null
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    storeId?: NullableStringFieldUpdateOperationsInput | string | null
    adminId?: NullableStringFieldUpdateOperationsInput | string | null
    catalogProductId?: NullableStringFieldUpdateOperationsInput | string | null
    images?: imagesUncheckedUpdateManyWithoutProductNestedInput
    favorites?: favoritesUncheckedUpdateManyWithoutProductNestedInput
    storeVariants?: productsUncheckedUpdateManyWithoutCatalogProductNestedInput
  }

  export type productsCreateManyInput = {
    id?: string
    title: string
    slug?: string | null
    isCatalog?: boolean
    category: string
    subCategory: string
    short_description: string
    tags?: productsCreatetagsInput | string[]
    sizes?: productsCreatesizesInput | string[]
    sizePricing?: InputJsonValue | null
    cuttingTypePricing?: InputJsonValue | null
    pieceSizePricing?: InputJsonValue | null
    cuttingTypes?: productsCreatecuttingTypesInput | string[]
    pieceSizes?: productsCreatepieceSizesInput | string[]
    processingWeightLoss?: string | null
    stock: number
    sale_price: number
    regular_price: number
    totalSold?: number
    ratings?: number
    cashOnDelivery?: string | null
    discount_codes?: productsCreatediscount_codesInput | string[]
    status?: $Enums.productStatus
    isDeleted?: boolean | null
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    storeId?: string | null
    adminId?: string | null
    catalogProductId?: string | null
  }

  export type productsUpdateManyMutationInput = {
    title?: StringFieldUpdateOperationsInput | string
    slug?: NullableStringFieldUpdateOperationsInput | string | null
    isCatalog?: BoolFieldUpdateOperationsInput | boolean
    category?: StringFieldUpdateOperationsInput | string
    subCategory?: StringFieldUpdateOperationsInput | string
    short_description?: StringFieldUpdateOperationsInput | string
    tags?: productsUpdatetagsInput | string[]
    sizes?: productsUpdatesizesInput | string[]
    sizePricing?: InputJsonValue | InputJsonValue | null
    cuttingTypePricing?: InputJsonValue | InputJsonValue | null
    pieceSizePricing?: InputJsonValue | InputJsonValue | null
    cuttingTypes?: productsUpdatecuttingTypesInput | string[]
    pieceSizes?: productsUpdatepieceSizesInput | string[]
    processingWeightLoss?: NullableStringFieldUpdateOperationsInput | string | null
    stock?: IntFieldUpdateOperationsInput | number
    sale_price?: FloatFieldUpdateOperationsInput | number
    regular_price?: FloatFieldUpdateOperationsInput | number
    totalSold?: IntFieldUpdateOperationsInput | number
    ratings?: FloatFieldUpdateOperationsInput | number
    cashOnDelivery?: NullableStringFieldUpdateOperationsInput | string | null
    discount_codes?: productsUpdatediscount_codesInput | string[]
    status?: EnumproductStatusFieldUpdateOperationsInput | $Enums.productStatus
    isDeleted?: NullableBoolFieldUpdateOperationsInput | boolean | null
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type productsUncheckedUpdateManyInput = {
    title?: StringFieldUpdateOperationsInput | string
    slug?: NullableStringFieldUpdateOperationsInput | string | null
    isCatalog?: BoolFieldUpdateOperationsInput | boolean
    category?: StringFieldUpdateOperationsInput | string
    subCategory?: StringFieldUpdateOperationsInput | string
    short_description?: StringFieldUpdateOperationsInput | string
    tags?: productsUpdatetagsInput | string[]
    sizes?: productsUpdatesizesInput | string[]
    sizePricing?: InputJsonValue | InputJsonValue | null
    cuttingTypePricing?: InputJsonValue | InputJsonValue | null
    pieceSizePricing?: InputJsonValue | InputJsonValue | null
    cuttingTypes?: productsUpdatecuttingTypesInput | string[]
    pieceSizes?: productsUpdatepieceSizesInput | string[]
    processingWeightLoss?: NullableStringFieldUpdateOperationsInput | string | null
    stock?: IntFieldUpdateOperationsInput | number
    sale_price?: FloatFieldUpdateOperationsInput | number
    regular_price?: FloatFieldUpdateOperationsInput | number
    totalSold?: IntFieldUpdateOperationsInput | number
    ratings?: FloatFieldUpdateOperationsInput | number
    cashOnDelivery?: NullableStringFieldUpdateOperationsInput | string | null
    discount_codes?: productsUpdatediscount_codesInput | string[]
    status?: EnumproductStatusFieldUpdateOperationsInput | $Enums.productStatus
    isDeleted?: NullableBoolFieldUpdateOperationsInput | boolean | null
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    storeId?: NullableStringFieldUpdateOperationsInput | string | null
    adminId?: NullableStringFieldUpdateOperationsInput | string | null
    catalogProductId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type bannersCreateInput = {
    id?: string
    imageUrl: string
    fileId: string
    isActive?: boolean
    category?: string | null
    status?: string | null
    rejectionReason?: string | null
    bannerType?: string | null
    title?: string | null
    subtitle?: string | null
    price?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    seller?: sellersCreateNestedOneWithoutBannersInput
    admin?: adminsCreateNestedOneWithoutBannersInput
  }

  export type bannersUncheckedCreateInput = {
    id?: string
    imageUrl: string
    fileId: string
    isActive?: boolean
    category?: string | null
    status?: string | null
    rejectionReason?: string | null
    bannerType?: string | null
    title?: string | null
    subtitle?: string | null
    price?: string | null
    sellerId?: string | null
    adminId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type bannersUpdateInput = {
    imageUrl?: StringFieldUpdateOperationsInput | string
    fileId?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    category?: NullableStringFieldUpdateOperationsInput | string | null
    status?: NullableStringFieldUpdateOperationsInput | string | null
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    bannerType?: NullableStringFieldUpdateOperationsInput | string | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    subtitle?: NullableStringFieldUpdateOperationsInput | string | null
    price?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    seller?: sellersUpdateOneWithoutBannersNestedInput
    admin?: adminsUpdateOneWithoutBannersNestedInput
  }

  export type bannersUncheckedUpdateInput = {
    imageUrl?: StringFieldUpdateOperationsInput | string
    fileId?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    category?: NullableStringFieldUpdateOperationsInput | string | null
    status?: NullableStringFieldUpdateOperationsInput | string | null
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    bannerType?: NullableStringFieldUpdateOperationsInput | string | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    subtitle?: NullableStringFieldUpdateOperationsInput | string | null
    price?: NullableStringFieldUpdateOperationsInput | string | null
    sellerId?: NullableStringFieldUpdateOperationsInput | string | null
    adminId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type bannersCreateManyInput = {
    id?: string
    imageUrl: string
    fileId: string
    isActive?: boolean
    category?: string | null
    status?: string | null
    rejectionReason?: string | null
    bannerType?: string | null
    title?: string | null
    subtitle?: string | null
    price?: string | null
    sellerId?: string | null
    adminId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type bannersUpdateManyMutationInput = {
    imageUrl?: StringFieldUpdateOperationsInput | string
    fileId?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    category?: NullableStringFieldUpdateOperationsInput | string | null
    status?: NullableStringFieldUpdateOperationsInput | string | null
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    bannerType?: NullableStringFieldUpdateOperationsInput | string | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    subtitle?: NullableStringFieldUpdateOperationsInput | string | null
    price?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type bannersUncheckedUpdateManyInput = {
    imageUrl?: StringFieldUpdateOperationsInput | string
    fileId?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    category?: NullableStringFieldUpdateOperationsInput | string | null
    status?: NullableStringFieldUpdateOperationsInput | string | null
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    bannerType?: NullableStringFieldUpdateOperationsInput | string | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    subtitle?: NullableStringFieldUpdateOperationsInput | string | null
    price?: NullableStringFieldUpdateOperationsInput | string | null
    sellerId?: NullableStringFieldUpdateOperationsInput | string | null
    adminId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type seller_eventsCreateInput = {
    id?: string
    title: string
    description?: string | null
    type: $Enums.sellerEventType
    minOrder?: number | null
    discount?: number | null
    startTime: Date | string
    endTime: Date | string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    seller: sellersCreateNestedOneWithoutEventsInput
  }

  export type seller_eventsUncheckedCreateInput = {
    id?: string
    sellerId: string
    title: string
    description?: string | null
    type: $Enums.sellerEventType
    minOrder?: number | null
    discount?: number | null
    startTime: Date | string
    endTime: Date | string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type seller_eventsUpdateInput = {
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumsellerEventTypeFieldUpdateOperationsInput | $Enums.sellerEventType
    minOrder?: NullableFloatFieldUpdateOperationsInput | number | null
    discount?: NullableFloatFieldUpdateOperationsInput | number | null
    startTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endTime?: DateTimeFieldUpdateOperationsInput | Date | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    seller?: sellersUpdateOneRequiredWithoutEventsNestedInput
  }

  export type seller_eventsUncheckedUpdateInput = {
    sellerId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumsellerEventTypeFieldUpdateOperationsInput | $Enums.sellerEventType
    minOrder?: NullableFloatFieldUpdateOperationsInput | number | null
    discount?: NullableFloatFieldUpdateOperationsInput | number | null
    startTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endTime?: DateTimeFieldUpdateOperationsInput | Date | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type seller_eventsCreateManyInput = {
    id?: string
    sellerId: string
    title: string
    description?: string | null
    type: $Enums.sellerEventType
    minOrder?: number | null
    discount?: number | null
    startTime: Date | string
    endTime: Date | string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type seller_eventsUpdateManyMutationInput = {
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumsellerEventTypeFieldUpdateOperationsInput | $Enums.sellerEventType
    minOrder?: NullableFloatFieldUpdateOperationsInput | number | null
    discount?: NullableFloatFieldUpdateOperationsInput | number | null
    startTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endTime?: DateTimeFieldUpdateOperationsInput | Date | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type seller_eventsUncheckedUpdateManyInput = {
    sellerId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumsellerEventTypeFieldUpdateOperationsInput | $Enums.sellerEventType
    minOrder?: NullableFloatFieldUpdateOperationsInput | number | null
    discount?: NullableFloatFieldUpdateOperationsInput | number | null
    startTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endTime?: DateTimeFieldUpdateOperationsInput | Date | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SignupAccessCodeCreateInput = {
    id?: string
    email?: string | null
    role: string
    code: string
    expiresAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SignupAccessCodeUncheckedCreateInput = {
    id?: string
    email?: string | null
    role: string
    code: string
    expiresAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SignupAccessCodeUpdateInput = {
    email?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SignupAccessCodeUncheckedUpdateInput = {
    email?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SignupAccessCodeCreateManyInput = {
    id?: string
    email?: string | null
    role: string
    code: string
    expiresAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SignupAccessCodeUpdateManyMutationInput = {
    email?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SignupAccessCodeUncheckedUpdateManyInput = {
    email?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
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

  export type ProductsListRelationFilter = {
    every?: productsWhereInput
    some?: productsWhereInput
    none?: productsWhereInput
  }

  export type Discount_codesListRelationFilter = {
    every?: discount_codesWhereInput
    some?: discount_codesWhereInput
    none?: discount_codesWhereInput
  }

  export type BannersListRelationFilter = {
    every?: bannersWhereInput
    some?: bannersWhereInput
    none?: bannersWhereInput
  }

  export type productsOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type discount_codesOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type bannersOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type adminsCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type adminsMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type adminsMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
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

  export type EnumImageTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.ImageType | EnumImageTypeFieldRefInput<$PrismaModel>
    in?: $Enums.ImageType[] | ListEnumImageTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ImageType[] | ListEnumImageTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumImageTypeFilter<$PrismaModel> | $Enums.ImageType
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

  export type ProductsNullableRelationFilter = {
    is?: productsWhereInput | null
    isNot?: productsWhereInput | null
  }

  export type UsersListRelationFilter = {
    every?: usersWhereInput
    some?: usersWhereInput
    none?: usersWhereInput
  }

  export type StoresListRelationFilter = {
    every?: storesWhereInput
    some?: storesWhereInput
    none?: storesWhereInput
  }

  export type usersOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type storesOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type imagesProductIdFile_idCompoundUniqueInput = {
    productId: string
    file_id: string
  }

  export type imagesCountOrderByAggregateInput = {
    id?: SortOrder
    file_id?: SortOrder
    url?: SortOrder
    type?: SortOrder
    productId?: SortOrder
    createdAt?: SortOrder
  }

  export type imagesMaxOrderByAggregateInput = {
    id?: SortOrder
    file_id?: SortOrder
    url?: SortOrder
    type?: SortOrder
    productId?: SortOrder
    createdAt?: SortOrder
  }

  export type imagesMinOrderByAggregateInput = {
    id?: SortOrder
    file_id?: SortOrder
    url?: SortOrder
    type?: SortOrder
    productId?: SortOrder
    createdAt?: SortOrder
  }

  export type EnumImageTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ImageType | EnumImageTypeFieldRefInput<$PrismaModel>
    in?: $Enums.ImageType[] | ListEnumImageTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ImageType[] | ListEnumImageTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumImageTypeWithAggregatesFilter<$PrismaModel> | $Enums.ImageType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumImageTypeFilter<$PrismaModel>
    _max?: NestedEnumImageTypeFilter<$PrismaModel>
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

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }
  export type JsonNullableListFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonNullableListFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableListFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableListFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableListFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableListFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue[] | ListJsonFieldRefInput<$PrismaModel> | null
    has?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    hasEvery?: InputJsonValue[] | ListJsonFieldRefInput<$PrismaModel>
    hasSome?: InputJsonValue[] | ListJsonFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type ImagesNullableRelationFilter = {
    is?: imagesWhereInput | null
    isNot?: imagesWhereInput | null
  }

  export type FavoritesListRelationFilter = {
    every?: favoritesWhereInput
    some?: favoritesWhereInput
    none?: favoritesWhereInput
  }

  export type favoritesOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type usersCountOrderByAggregateInput = {
    id?: SortOrder
    phone_number?: SortOrder
    email?: SortOrder
    name?: SortOrder
    following?: SortOrder
    addresses?: SortOrder
    avatarId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type usersMaxOrderByAggregateInput = {
    id?: SortOrder
    phone_number?: SortOrder
    email?: SortOrder
    name?: SortOrder
    avatarId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type usersMinOrderByAggregateInput = {
    id?: SortOrder
    phone_number?: SortOrder
    email?: SortOrder
    name?: SortOrder
    avatarId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
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

  export type IntNullableFilter<$PrismaModel = never> = {
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

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type SellersNullableRelationFilter = {
    is?: sellersWhereInput | null
    isNot?: sellersWhereInput | null
  }

  export type AdminsNullableRelationFilter = {
    is?: adminsWhereInput | null
    isNot?: adminsWhereInput | null
  }

  export type Coupon_usagesListRelationFilter = {
    every?: coupon_usagesWhereInput
    some?: coupon_usagesWhereInput
    none?: coupon_usagesWhereInput
  }

  export type coupon_usagesOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type discount_codesCountOrderByAggregateInput = {
    id?: SortOrder
    public_name?: SortOrder
    discountType?: SortOrder
    discountValue?: SortOrder
    minOrderValue?: SortOrder
    discountCode?: SortOrder
    expiresAt?: SortOrder
    maxUses?: SortOrder
    maxUsesPerUser?: SortOrder
    usedCount?: SortOrder
    isActive?: SortOrder
    isFirstOrder?: SortOrder
    sellerId?: SortOrder
    adminId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type discount_codesAvgOrderByAggregateInput = {
    discountValue?: SortOrder
    minOrderValue?: SortOrder
    maxUses?: SortOrder
    maxUsesPerUser?: SortOrder
    usedCount?: SortOrder
  }

  export type discount_codesMaxOrderByAggregateInput = {
    id?: SortOrder
    public_name?: SortOrder
    discountType?: SortOrder
    discountValue?: SortOrder
    minOrderValue?: SortOrder
    discountCode?: SortOrder
    expiresAt?: SortOrder
    maxUses?: SortOrder
    maxUsesPerUser?: SortOrder
    usedCount?: SortOrder
    isActive?: SortOrder
    isFirstOrder?: SortOrder
    sellerId?: SortOrder
    adminId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type discount_codesMinOrderByAggregateInput = {
    id?: SortOrder
    public_name?: SortOrder
    discountType?: SortOrder
    discountValue?: SortOrder
    minOrderValue?: SortOrder
    discountCode?: SortOrder
    expiresAt?: SortOrder
    maxUses?: SortOrder
    maxUsesPerUser?: SortOrder
    usedCount?: SortOrder
    isActive?: SortOrder
    isFirstOrder?: SortOrder
    sellerId?: SortOrder
    adminId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type discount_codesSumOrderByAggregateInput = {
    discountValue?: SortOrder
    minOrderValue?: SortOrder
    maxUses?: SortOrder
    maxUsesPerUser?: SortOrder
    usedCount?: SortOrder
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
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

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
    isSet?: boolean
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

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type Discount_codesRelationFilter = {
    is?: discount_codesWhereInput
    isNot?: discount_codesWhereInput
  }

  export type coupon_usagesCountOrderByAggregateInput = {
    id?: SortOrder
    couponId?: SortOrder
    userId?: SortOrder
    orderId?: SortOrder
    usedAt?: SortOrder
  }

  export type coupon_usagesMaxOrderByAggregateInput = {
    id?: SortOrder
    couponId?: SortOrder
    userId?: SortOrder
    orderId?: SortOrder
    usedAt?: SortOrder
  }

  export type coupon_usagesMinOrderByAggregateInput = {
    id?: SortOrder
    couponId?: SortOrder
    userId?: SortOrder
    orderId?: SortOrder
    usedAt?: SortOrder
  }
  export type JsonNullableFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    isSet?: boolean
  }

  export type Seller_eventsListRelationFilter = {
    every?: seller_eventsWhereInput
    some?: seller_eventsWhereInput
    none?: seller_eventsWhereInput
  }

  export type StoresNullableRelationFilter = {
    is?: storesWhereInput | null
    isNot?: storesWhereInput | null
  }

  export type StaffsListRelationFilter = {
    every?: staffsWhereInput
    some?: staffsWhereInput
    none?: staffsWhereInput
  }

  export type seller_eventsOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type staffsOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type sellersCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    phone_number?: SortOrder
    password?: SortOrder
    following?: SortOrder
    isApprovedByAdmin?: SortOrder
    permissions?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type sellersMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    phone_number?: SortOrder
    password?: SortOrder
    isApprovedByAdmin?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type sellersMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    phone_number?: SortOrder
    password?: SortOrder
    isApprovedByAdmin?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
    isSet?: boolean
  }

  export type staffsCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    isActive?: SortOrder
    sellerId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type staffsMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    isActive?: SortOrder
    sellerId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type staffsMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    isActive?: SortOrder
    sellerId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SellersRelationFilter = {
    is?: sellersWhereInput
    isNot?: sellersWhereInput
  }

  export type storesCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    bio?: SortOrder
    avatarId?: SortOrder
    address?: SortOrder
    city?: SortOrder
    pincode?: SortOrder
    opening_hours?: SortOrder
    closing_hours?: SortOrder
    is_instant_delivery_enabled?: SortOrder
    instant_delivery_fee?: SortOrder
    instant_delivery_window_start?: SortOrder
    instant_delivery_window_end?: SortOrder
    availableCities?: SortOrder
    cityDeliveryTimes?: SortOrder
    state?: SortOrder
    sellerId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type storesAvgOrderByAggregateInput = {
    instant_delivery_fee?: SortOrder
  }

  export type storesMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    bio?: SortOrder
    avatarId?: SortOrder
    address?: SortOrder
    city?: SortOrder
    pincode?: SortOrder
    opening_hours?: SortOrder
    closing_hours?: SortOrder
    is_instant_delivery_enabled?: SortOrder
    instant_delivery_fee?: SortOrder
    instant_delivery_window_start?: SortOrder
    instant_delivery_window_end?: SortOrder
    state?: SortOrder
    sellerId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type storesMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    bio?: SortOrder
    avatarId?: SortOrder
    address?: SortOrder
    city?: SortOrder
    pincode?: SortOrder
    opening_hours?: SortOrder
    closing_hours?: SortOrder
    is_instant_delivery_enabled?: SortOrder
    instant_delivery_fee?: SortOrder
    instant_delivery_window_start?: SortOrder
    instant_delivery_window_end?: SortOrder
    state?: SortOrder
    sellerId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type storesSumOrderByAggregateInput = {
    instant_delivery_fee?: SortOrder
  }

  export type UsersRelationFilter = {
    is?: usersWhereInput
    isNot?: usersWhereInput
  }

  export type ProductsRelationFilter = {
    is?: productsWhereInput
    isNot?: productsWhereInput
  }

  export type favoritesUserIdProductIdCompoundUniqueInput = {
    userId: string
    productId: string
  }

  export type favoritesCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    productId?: SortOrder
    createdAt?: SortOrder
  }

  export type favoritesMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    productId?: SortOrder
    createdAt?: SortOrder
  }

  export type favoritesMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    productId?: SortOrder
    createdAt?: SortOrder
  }
  export type JsonFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
  }

  export type site_configCountOrderByAggregateInput = {
    id?: SortOrder
    categories?: SortOrder
    subCategories?: SortOrder
    categoryImages?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type site_configMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type site_configMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type EnumproductStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.productStatus | EnumproductStatusFieldRefInput<$PrismaModel>
    in?: $Enums.productStatus[] | ListEnumproductStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.productStatus[] | ListEnumproductStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumproductStatusFilter<$PrismaModel> | $Enums.productStatus
  }

  export type BoolNullableFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableFilter<$PrismaModel> | boolean | null
    isSet?: boolean
  }

  export type ImagesListRelationFilter = {
    every?: imagesWhereInput
    some?: imagesWhereInput
    none?: imagesWhereInput
  }

  export type imagesOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type productsCountOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    slug?: SortOrder
    isCatalog?: SortOrder
    category?: SortOrder
    subCategory?: SortOrder
    short_description?: SortOrder
    tags?: SortOrder
    sizes?: SortOrder
    sizePricing?: SortOrder
    cuttingTypePricing?: SortOrder
    pieceSizePricing?: SortOrder
    cuttingTypes?: SortOrder
    pieceSizes?: SortOrder
    processingWeightLoss?: SortOrder
    stock?: SortOrder
    sale_price?: SortOrder
    regular_price?: SortOrder
    totalSold?: SortOrder
    ratings?: SortOrder
    cashOnDelivery?: SortOrder
    discount_codes?: SortOrder
    status?: SortOrder
    isDeleted?: SortOrder
    deletedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    storeId?: SortOrder
    adminId?: SortOrder
    catalogProductId?: SortOrder
  }

  export type productsAvgOrderByAggregateInput = {
    stock?: SortOrder
    sale_price?: SortOrder
    regular_price?: SortOrder
    totalSold?: SortOrder
    ratings?: SortOrder
  }

  export type productsMaxOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    slug?: SortOrder
    isCatalog?: SortOrder
    category?: SortOrder
    subCategory?: SortOrder
    short_description?: SortOrder
    processingWeightLoss?: SortOrder
    stock?: SortOrder
    sale_price?: SortOrder
    regular_price?: SortOrder
    totalSold?: SortOrder
    ratings?: SortOrder
    cashOnDelivery?: SortOrder
    status?: SortOrder
    isDeleted?: SortOrder
    deletedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    storeId?: SortOrder
    adminId?: SortOrder
    catalogProductId?: SortOrder
  }

  export type productsMinOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    slug?: SortOrder
    isCatalog?: SortOrder
    category?: SortOrder
    subCategory?: SortOrder
    short_description?: SortOrder
    processingWeightLoss?: SortOrder
    stock?: SortOrder
    sale_price?: SortOrder
    regular_price?: SortOrder
    totalSold?: SortOrder
    ratings?: SortOrder
    cashOnDelivery?: SortOrder
    status?: SortOrder
    isDeleted?: SortOrder
    deletedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    storeId?: SortOrder
    adminId?: SortOrder
    catalogProductId?: SortOrder
  }

  export type productsSumOrderByAggregateInput = {
    stock?: SortOrder
    sale_price?: SortOrder
    regular_price?: SortOrder
    totalSold?: SortOrder
    ratings?: SortOrder
  }

  export type EnumproductStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.productStatus | EnumproductStatusFieldRefInput<$PrismaModel>
    in?: $Enums.productStatus[] | ListEnumproductStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.productStatus[] | ListEnumproductStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumproductStatusWithAggregatesFilter<$PrismaModel> | $Enums.productStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumproductStatusFilter<$PrismaModel>
    _max?: NestedEnumproductStatusFilter<$PrismaModel>
  }

  export type BoolNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableWithAggregatesFilter<$PrismaModel> | boolean | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBoolNullableFilter<$PrismaModel>
    _max?: NestedBoolNullableFilter<$PrismaModel>
    isSet?: boolean
  }

  export type bannersCountOrderByAggregateInput = {
    id?: SortOrder
    imageUrl?: SortOrder
    fileId?: SortOrder
    isActive?: SortOrder
    category?: SortOrder
    status?: SortOrder
    rejectionReason?: SortOrder
    bannerType?: SortOrder
    title?: SortOrder
    subtitle?: SortOrder
    price?: SortOrder
    sellerId?: SortOrder
    adminId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type bannersMaxOrderByAggregateInput = {
    id?: SortOrder
    imageUrl?: SortOrder
    fileId?: SortOrder
    isActive?: SortOrder
    category?: SortOrder
    status?: SortOrder
    rejectionReason?: SortOrder
    bannerType?: SortOrder
    title?: SortOrder
    subtitle?: SortOrder
    price?: SortOrder
    sellerId?: SortOrder
    adminId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type bannersMinOrderByAggregateInput = {
    id?: SortOrder
    imageUrl?: SortOrder
    fileId?: SortOrder
    isActive?: SortOrder
    category?: SortOrder
    status?: SortOrder
    rejectionReason?: SortOrder
    bannerType?: SortOrder
    title?: SortOrder
    subtitle?: SortOrder
    price?: SortOrder
    sellerId?: SortOrder
    adminId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumsellerEventTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.sellerEventType | EnumsellerEventTypeFieldRefInput<$PrismaModel>
    in?: $Enums.sellerEventType[] | ListEnumsellerEventTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.sellerEventType[] | ListEnumsellerEventTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumsellerEventTypeFilter<$PrismaModel> | $Enums.sellerEventType
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
    isSet?: boolean
  }

  export type seller_eventsCountOrderByAggregateInput = {
    id?: SortOrder
    sellerId?: SortOrder
    title?: SortOrder
    description?: SortOrder
    type?: SortOrder
    minOrder?: SortOrder
    discount?: SortOrder
    startTime?: SortOrder
    endTime?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type seller_eventsAvgOrderByAggregateInput = {
    minOrder?: SortOrder
    discount?: SortOrder
  }

  export type seller_eventsMaxOrderByAggregateInput = {
    id?: SortOrder
    sellerId?: SortOrder
    title?: SortOrder
    description?: SortOrder
    type?: SortOrder
    minOrder?: SortOrder
    discount?: SortOrder
    startTime?: SortOrder
    endTime?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type seller_eventsMinOrderByAggregateInput = {
    id?: SortOrder
    sellerId?: SortOrder
    title?: SortOrder
    description?: SortOrder
    type?: SortOrder
    minOrder?: SortOrder
    discount?: SortOrder
    startTime?: SortOrder
    endTime?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type seller_eventsSumOrderByAggregateInput = {
    minOrder?: SortOrder
    discount?: SortOrder
  }

  export type EnumsellerEventTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.sellerEventType | EnumsellerEventTypeFieldRefInput<$PrismaModel>
    in?: $Enums.sellerEventType[] | ListEnumsellerEventTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.sellerEventType[] | ListEnumsellerEventTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumsellerEventTypeWithAggregatesFilter<$PrismaModel> | $Enums.sellerEventType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumsellerEventTypeFilter<$PrismaModel>
    _max?: NestedEnumsellerEventTypeFilter<$PrismaModel>
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
    isSet?: boolean
  }

  export type SignupAccessCodeEmailRoleCompoundUniqueInput = {
    email: string
    role: string
  }

  export type SignupAccessCodeCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    role?: SortOrder
    code?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SignupAccessCodeMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    role?: SortOrder
    code?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SignupAccessCodeMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    role?: SortOrder
    code?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type productsCreateNestedManyWithoutAdminInput = {
    create?: XOR<productsCreateWithoutAdminInput, productsUncheckedCreateWithoutAdminInput> | productsCreateWithoutAdminInput[] | productsUncheckedCreateWithoutAdminInput[]
    connectOrCreate?: productsCreateOrConnectWithoutAdminInput | productsCreateOrConnectWithoutAdminInput[]
    createMany?: productsCreateManyAdminInputEnvelope
    connect?: productsWhereUniqueInput | productsWhereUniqueInput[]
  }

  export type discount_codesCreateNestedManyWithoutAdminInput = {
    create?: XOR<discount_codesCreateWithoutAdminInput, discount_codesUncheckedCreateWithoutAdminInput> | discount_codesCreateWithoutAdminInput[] | discount_codesUncheckedCreateWithoutAdminInput[]
    connectOrCreate?: discount_codesCreateOrConnectWithoutAdminInput | discount_codesCreateOrConnectWithoutAdminInput[]
    createMany?: discount_codesCreateManyAdminInputEnvelope
    connect?: discount_codesWhereUniqueInput | discount_codesWhereUniqueInput[]
  }

  export type bannersCreateNestedManyWithoutAdminInput = {
    create?: XOR<bannersCreateWithoutAdminInput, bannersUncheckedCreateWithoutAdminInput> | bannersCreateWithoutAdminInput[] | bannersUncheckedCreateWithoutAdminInput[]
    connectOrCreate?: bannersCreateOrConnectWithoutAdminInput | bannersCreateOrConnectWithoutAdminInput[]
    createMany?: bannersCreateManyAdminInputEnvelope
    connect?: bannersWhereUniqueInput | bannersWhereUniqueInput[]
  }

  export type productsUncheckedCreateNestedManyWithoutAdminInput = {
    create?: XOR<productsCreateWithoutAdminInput, productsUncheckedCreateWithoutAdminInput> | productsCreateWithoutAdminInput[] | productsUncheckedCreateWithoutAdminInput[]
    connectOrCreate?: productsCreateOrConnectWithoutAdminInput | productsCreateOrConnectWithoutAdminInput[]
    createMany?: productsCreateManyAdminInputEnvelope
    connect?: productsWhereUniqueInput | productsWhereUniqueInput[]
  }

  export type discount_codesUncheckedCreateNestedManyWithoutAdminInput = {
    create?: XOR<discount_codesCreateWithoutAdminInput, discount_codesUncheckedCreateWithoutAdminInput> | discount_codesCreateWithoutAdminInput[] | discount_codesUncheckedCreateWithoutAdminInput[]
    connectOrCreate?: discount_codesCreateOrConnectWithoutAdminInput | discount_codesCreateOrConnectWithoutAdminInput[]
    createMany?: discount_codesCreateManyAdminInputEnvelope
    connect?: discount_codesWhereUniqueInput | discount_codesWhereUniqueInput[]
  }

  export type bannersUncheckedCreateNestedManyWithoutAdminInput = {
    create?: XOR<bannersCreateWithoutAdminInput, bannersUncheckedCreateWithoutAdminInput> | bannersCreateWithoutAdminInput[] | bannersUncheckedCreateWithoutAdminInput[]
    connectOrCreate?: bannersCreateOrConnectWithoutAdminInput | bannersCreateOrConnectWithoutAdminInput[]
    createMany?: bannersCreateManyAdminInputEnvelope
    connect?: bannersWhereUniqueInput | bannersWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type productsUpdateManyWithoutAdminNestedInput = {
    create?: XOR<productsCreateWithoutAdminInput, productsUncheckedCreateWithoutAdminInput> | productsCreateWithoutAdminInput[] | productsUncheckedCreateWithoutAdminInput[]
    connectOrCreate?: productsCreateOrConnectWithoutAdminInput | productsCreateOrConnectWithoutAdminInput[]
    upsert?: productsUpsertWithWhereUniqueWithoutAdminInput | productsUpsertWithWhereUniqueWithoutAdminInput[]
    createMany?: productsCreateManyAdminInputEnvelope
    set?: productsWhereUniqueInput | productsWhereUniqueInput[]
    disconnect?: productsWhereUniqueInput | productsWhereUniqueInput[]
    delete?: productsWhereUniqueInput | productsWhereUniqueInput[]
    connect?: productsWhereUniqueInput | productsWhereUniqueInput[]
    update?: productsUpdateWithWhereUniqueWithoutAdminInput | productsUpdateWithWhereUniqueWithoutAdminInput[]
    updateMany?: productsUpdateManyWithWhereWithoutAdminInput | productsUpdateManyWithWhereWithoutAdminInput[]
    deleteMany?: productsScalarWhereInput | productsScalarWhereInput[]
  }

  export type discount_codesUpdateManyWithoutAdminNestedInput = {
    create?: XOR<discount_codesCreateWithoutAdminInput, discount_codesUncheckedCreateWithoutAdminInput> | discount_codesCreateWithoutAdminInput[] | discount_codesUncheckedCreateWithoutAdminInput[]
    connectOrCreate?: discount_codesCreateOrConnectWithoutAdminInput | discount_codesCreateOrConnectWithoutAdminInput[]
    upsert?: discount_codesUpsertWithWhereUniqueWithoutAdminInput | discount_codesUpsertWithWhereUniqueWithoutAdminInput[]
    createMany?: discount_codesCreateManyAdminInputEnvelope
    set?: discount_codesWhereUniqueInput | discount_codesWhereUniqueInput[]
    disconnect?: discount_codesWhereUniqueInput | discount_codesWhereUniqueInput[]
    delete?: discount_codesWhereUniqueInput | discount_codesWhereUniqueInput[]
    connect?: discount_codesWhereUniqueInput | discount_codesWhereUniqueInput[]
    update?: discount_codesUpdateWithWhereUniqueWithoutAdminInput | discount_codesUpdateWithWhereUniqueWithoutAdminInput[]
    updateMany?: discount_codesUpdateManyWithWhereWithoutAdminInput | discount_codesUpdateManyWithWhereWithoutAdminInput[]
    deleteMany?: discount_codesScalarWhereInput | discount_codesScalarWhereInput[]
  }

  export type bannersUpdateManyWithoutAdminNestedInput = {
    create?: XOR<bannersCreateWithoutAdminInput, bannersUncheckedCreateWithoutAdminInput> | bannersCreateWithoutAdminInput[] | bannersUncheckedCreateWithoutAdminInput[]
    connectOrCreate?: bannersCreateOrConnectWithoutAdminInput | bannersCreateOrConnectWithoutAdminInput[]
    upsert?: bannersUpsertWithWhereUniqueWithoutAdminInput | bannersUpsertWithWhereUniqueWithoutAdminInput[]
    createMany?: bannersCreateManyAdminInputEnvelope
    set?: bannersWhereUniqueInput | bannersWhereUniqueInput[]
    disconnect?: bannersWhereUniqueInput | bannersWhereUniqueInput[]
    delete?: bannersWhereUniqueInput | bannersWhereUniqueInput[]
    connect?: bannersWhereUniqueInput | bannersWhereUniqueInput[]
    update?: bannersUpdateWithWhereUniqueWithoutAdminInput | bannersUpdateWithWhereUniqueWithoutAdminInput[]
    updateMany?: bannersUpdateManyWithWhereWithoutAdminInput | bannersUpdateManyWithWhereWithoutAdminInput[]
    deleteMany?: bannersScalarWhereInput | bannersScalarWhereInput[]
  }

  export type productsUncheckedUpdateManyWithoutAdminNestedInput = {
    create?: XOR<productsCreateWithoutAdminInput, productsUncheckedCreateWithoutAdminInput> | productsCreateWithoutAdminInput[] | productsUncheckedCreateWithoutAdminInput[]
    connectOrCreate?: productsCreateOrConnectWithoutAdminInput | productsCreateOrConnectWithoutAdminInput[]
    upsert?: productsUpsertWithWhereUniqueWithoutAdminInput | productsUpsertWithWhereUniqueWithoutAdminInput[]
    createMany?: productsCreateManyAdminInputEnvelope
    set?: productsWhereUniqueInput | productsWhereUniqueInput[]
    disconnect?: productsWhereUniqueInput | productsWhereUniqueInput[]
    delete?: productsWhereUniqueInput | productsWhereUniqueInput[]
    connect?: productsWhereUniqueInput | productsWhereUniqueInput[]
    update?: productsUpdateWithWhereUniqueWithoutAdminInput | productsUpdateWithWhereUniqueWithoutAdminInput[]
    updateMany?: productsUpdateManyWithWhereWithoutAdminInput | productsUpdateManyWithWhereWithoutAdminInput[]
    deleteMany?: productsScalarWhereInput | productsScalarWhereInput[]
  }

  export type discount_codesUncheckedUpdateManyWithoutAdminNestedInput = {
    create?: XOR<discount_codesCreateWithoutAdminInput, discount_codesUncheckedCreateWithoutAdminInput> | discount_codesCreateWithoutAdminInput[] | discount_codesUncheckedCreateWithoutAdminInput[]
    connectOrCreate?: discount_codesCreateOrConnectWithoutAdminInput | discount_codesCreateOrConnectWithoutAdminInput[]
    upsert?: discount_codesUpsertWithWhereUniqueWithoutAdminInput | discount_codesUpsertWithWhereUniqueWithoutAdminInput[]
    createMany?: discount_codesCreateManyAdminInputEnvelope
    set?: discount_codesWhereUniqueInput | discount_codesWhereUniqueInput[]
    disconnect?: discount_codesWhereUniqueInput | discount_codesWhereUniqueInput[]
    delete?: discount_codesWhereUniqueInput | discount_codesWhereUniqueInput[]
    connect?: discount_codesWhereUniqueInput | discount_codesWhereUniqueInput[]
    update?: discount_codesUpdateWithWhereUniqueWithoutAdminInput | discount_codesUpdateWithWhereUniqueWithoutAdminInput[]
    updateMany?: discount_codesUpdateManyWithWhereWithoutAdminInput | discount_codesUpdateManyWithWhereWithoutAdminInput[]
    deleteMany?: discount_codesScalarWhereInput | discount_codesScalarWhereInput[]
  }

  export type bannersUncheckedUpdateManyWithoutAdminNestedInput = {
    create?: XOR<bannersCreateWithoutAdminInput, bannersUncheckedCreateWithoutAdminInput> | bannersCreateWithoutAdminInput[] | bannersUncheckedCreateWithoutAdminInput[]
    connectOrCreate?: bannersCreateOrConnectWithoutAdminInput | bannersCreateOrConnectWithoutAdminInput[]
    upsert?: bannersUpsertWithWhereUniqueWithoutAdminInput | bannersUpsertWithWhereUniqueWithoutAdminInput[]
    createMany?: bannersCreateManyAdminInputEnvelope
    set?: bannersWhereUniqueInput | bannersWhereUniqueInput[]
    disconnect?: bannersWhereUniqueInput | bannersWhereUniqueInput[]
    delete?: bannersWhereUniqueInput | bannersWhereUniqueInput[]
    connect?: bannersWhereUniqueInput | bannersWhereUniqueInput[]
    update?: bannersUpdateWithWhereUniqueWithoutAdminInput | bannersUpdateWithWhereUniqueWithoutAdminInput[]
    updateMany?: bannersUpdateManyWithWhereWithoutAdminInput | bannersUpdateManyWithWhereWithoutAdminInput[]
    deleteMany?: bannersScalarWhereInput | bannersScalarWhereInput[]
  }

  export type productsCreateNestedOneWithoutImagesInput = {
    create?: XOR<productsCreateWithoutImagesInput, productsUncheckedCreateWithoutImagesInput>
    connectOrCreate?: productsCreateOrConnectWithoutImagesInput
    connect?: productsWhereUniqueInput
  }

  export type usersCreateNestedManyWithoutAvatarInput = {
    create?: XOR<usersCreateWithoutAvatarInput, usersUncheckedCreateWithoutAvatarInput> | usersCreateWithoutAvatarInput[] | usersUncheckedCreateWithoutAvatarInput[]
    connectOrCreate?: usersCreateOrConnectWithoutAvatarInput | usersCreateOrConnectWithoutAvatarInput[]
    createMany?: usersCreateManyAvatarInputEnvelope
    connect?: usersWhereUniqueInput | usersWhereUniqueInput[]
  }

  export type storesCreateNestedManyWithoutAvatarInput = {
    create?: XOR<storesCreateWithoutAvatarInput, storesUncheckedCreateWithoutAvatarInput> | storesCreateWithoutAvatarInput[] | storesUncheckedCreateWithoutAvatarInput[]
    connectOrCreate?: storesCreateOrConnectWithoutAvatarInput | storesCreateOrConnectWithoutAvatarInput[]
    createMany?: storesCreateManyAvatarInputEnvelope
    connect?: storesWhereUniqueInput | storesWhereUniqueInput[]
  }

  export type usersUncheckedCreateNestedManyWithoutAvatarInput = {
    create?: XOR<usersCreateWithoutAvatarInput, usersUncheckedCreateWithoutAvatarInput> | usersCreateWithoutAvatarInput[] | usersUncheckedCreateWithoutAvatarInput[]
    connectOrCreate?: usersCreateOrConnectWithoutAvatarInput | usersCreateOrConnectWithoutAvatarInput[]
    createMany?: usersCreateManyAvatarInputEnvelope
    connect?: usersWhereUniqueInput | usersWhereUniqueInput[]
  }

  export type storesUncheckedCreateNestedManyWithoutAvatarInput = {
    create?: XOR<storesCreateWithoutAvatarInput, storesUncheckedCreateWithoutAvatarInput> | storesCreateWithoutAvatarInput[] | storesUncheckedCreateWithoutAvatarInput[]
    connectOrCreate?: storesCreateOrConnectWithoutAvatarInput | storesCreateOrConnectWithoutAvatarInput[]
    createMany?: storesCreateManyAvatarInputEnvelope
    connect?: storesWhereUniqueInput | storesWhereUniqueInput[]
  }

  export type EnumImageTypeFieldUpdateOperationsInput = {
    set?: $Enums.ImageType
  }

  export type productsUpdateOneWithoutImagesNestedInput = {
    create?: XOR<productsCreateWithoutImagesInput, productsUncheckedCreateWithoutImagesInput>
    connectOrCreate?: productsCreateOrConnectWithoutImagesInput
    upsert?: productsUpsertWithoutImagesInput
    disconnect?: boolean
    delete?: productsWhereInput | boolean
    connect?: productsWhereUniqueInput
    update?: XOR<XOR<productsUpdateToOneWithWhereWithoutImagesInput, productsUpdateWithoutImagesInput>, productsUncheckedUpdateWithoutImagesInput>
  }

  export type usersUpdateManyWithoutAvatarNestedInput = {
    create?: XOR<usersCreateWithoutAvatarInput, usersUncheckedCreateWithoutAvatarInput> | usersCreateWithoutAvatarInput[] | usersUncheckedCreateWithoutAvatarInput[]
    connectOrCreate?: usersCreateOrConnectWithoutAvatarInput | usersCreateOrConnectWithoutAvatarInput[]
    upsert?: usersUpsertWithWhereUniqueWithoutAvatarInput | usersUpsertWithWhereUniqueWithoutAvatarInput[]
    createMany?: usersCreateManyAvatarInputEnvelope
    set?: usersWhereUniqueInput | usersWhereUniqueInput[]
    disconnect?: usersWhereUniqueInput | usersWhereUniqueInput[]
    delete?: usersWhereUniqueInput | usersWhereUniqueInput[]
    connect?: usersWhereUniqueInput | usersWhereUniqueInput[]
    update?: usersUpdateWithWhereUniqueWithoutAvatarInput | usersUpdateWithWhereUniqueWithoutAvatarInput[]
    updateMany?: usersUpdateManyWithWhereWithoutAvatarInput | usersUpdateManyWithWhereWithoutAvatarInput[]
    deleteMany?: usersScalarWhereInput | usersScalarWhereInput[]
  }

  export type storesUpdateManyWithoutAvatarNestedInput = {
    create?: XOR<storesCreateWithoutAvatarInput, storesUncheckedCreateWithoutAvatarInput> | storesCreateWithoutAvatarInput[] | storesUncheckedCreateWithoutAvatarInput[]
    connectOrCreate?: storesCreateOrConnectWithoutAvatarInput | storesCreateOrConnectWithoutAvatarInput[]
    upsert?: storesUpsertWithWhereUniqueWithoutAvatarInput | storesUpsertWithWhereUniqueWithoutAvatarInput[]
    createMany?: storesCreateManyAvatarInputEnvelope
    set?: storesWhereUniqueInput | storesWhereUniqueInput[]
    disconnect?: storesWhereUniqueInput | storesWhereUniqueInput[]
    delete?: storesWhereUniqueInput | storesWhereUniqueInput[]
    connect?: storesWhereUniqueInput | storesWhereUniqueInput[]
    update?: storesUpdateWithWhereUniqueWithoutAvatarInput | storesUpdateWithWhereUniqueWithoutAvatarInput[]
    updateMany?: storesUpdateManyWithWhereWithoutAvatarInput | storesUpdateManyWithWhereWithoutAvatarInput[]
    deleteMany?: storesScalarWhereInput | storesScalarWhereInput[]
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
    unset?: boolean
  }

  export type usersUncheckedUpdateManyWithoutAvatarNestedInput = {
    create?: XOR<usersCreateWithoutAvatarInput, usersUncheckedCreateWithoutAvatarInput> | usersCreateWithoutAvatarInput[] | usersUncheckedCreateWithoutAvatarInput[]
    connectOrCreate?: usersCreateOrConnectWithoutAvatarInput | usersCreateOrConnectWithoutAvatarInput[]
    upsert?: usersUpsertWithWhereUniqueWithoutAvatarInput | usersUpsertWithWhereUniqueWithoutAvatarInput[]
    createMany?: usersCreateManyAvatarInputEnvelope
    set?: usersWhereUniqueInput | usersWhereUniqueInput[]
    disconnect?: usersWhereUniqueInput | usersWhereUniqueInput[]
    delete?: usersWhereUniqueInput | usersWhereUniqueInput[]
    connect?: usersWhereUniqueInput | usersWhereUniqueInput[]
    update?: usersUpdateWithWhereUniqueWithoutAvatarInput | usersUpdateWithWhereUniqueWithoutAvatarInput[]
    updateMany?: usersUpdateManyWithWhereWithoutAvatarInput | usersUpdateManyWithWhereWithoutAvatarInput[]
    deleteMany?: usersScalarWhereInput | usersScalarWhereInput[]
  }

  export type storesUncheckedUpdateManyWithoutAvatarNestedInput = {
    create?: XOR<storesCreateWithoutAvatarInput, storesUncheckedCreateWithoutAvatarInput> | storesCreateWithoutAvatarInput[] | storesUncheckedCreateWithoutAvatarInput[]
    connectOrCreate?: storesCreateOrConnectWithoutAvatarInput | storesCreateOrConnectWithoutAvatarInput[]
    upsert?: storesUpsertWithWhereUniqueWithoutAvatarInput | storesUpsertWithWhereUniqueWithoutAvatarInput[]
    createMany?: storesCreateManyAvatarInputEnvelope
    set?: storesWhereUniqueInput | storesWhereUniqueInput[]
    disconnect?: storesWhereUniqueInput | storesWhereUniqueInput[]
    delete?: storesWhereUniqueInput | storesWhereUniqueInput[]
    connect?: storesWhereUniqueInput | storesWhereUniqueInput[]
    update?: storesUpdateWithWhereUniqueWithoutAvatarInput | storesUpdateWithWhereUniqueWithoutAvatarInput[]
    updateMany?: storesUpdateManyWithWhereWithoutAvatarInput | storesUpdateManyWithWhereWithoutAvatarInput[]
    deleteMany?: storesScalarWhereInput | storesScalarWhereInput[]
  }

  export type usersCreatefollowingInput = {
    set: string[]
  }

  export type usersCreateaddressesInput = {
    set: InputJsonValue[]
  }

  export type imagesCreateNestedOneWithoutUsersInput = {
    create?: XOR<imagesCreateWithoutUsersInput, imagesUncheckedCreateWithoutUsersInput>
    connectOrCreate?: imagesCreateOrConnectWithoutUsersInput
    connect?: imagesWhereUniqueInput
  }

  export type favoritesCreateNestedManyWithoutUserInput = {
    create?: XOR<favoritesCreateWithoutUserInput, favoritesUncheckedCreateWithoutUserInput> | favoritesCreateWithoutUserInput[] | favoritesUncheckedCreateWithoutUserInput[]
    connectOrCreate?: favoritesCreateOrConnectWithoutUserInput | favoritesCreateOrConnectWithoutUserInput[]
    createMany?: favoritesCreateManyUserInputEnvelope
    connect?: favoritesWhereUniqueInput | favoritesWhereUniqueInput[]
  }

  export type favoritesUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<favoritesCreateWithoutUserInput, favoritesUncheckedCreateWithoutUserInput> | favoritesCreateWithoutUserInput[] | favoritesUncheckedCreateWithoutUserInput[]
    connectOrCreate?: favoritesCreateOrConnectWithoutUserInput | favoritesCreateOrConnectWithoutUserInput[]
    createMany?: favoritesCreateManyUserInputEnvelope
    connect?: favoritesWhereUniqueInput | favoritesWhereUniqueInput[]
  }

  export type usersUpdatefollowingInput = {
    set?: string[]
    push?: string | string[]
  }

  export type usersUpdateaddressesInput = {
    set?: InputJsonValue[]
    push?: InputJsonValue | InputJsonValue[]
  }

  export type imagesUpdateOneWithoutUsersNestedInput = {
    create?: XOR<imagesCreateWithoutUsersInput, imagesUncheckedCreateWithoutUsersInput>
    connectOrCreate?: imagesCreateOrConnectWithoutUsersInput
    upsert?: imagesUpsertWithoutUsersInput
    disconnect?: boolean
    delete?: imagesWhereInput | boolean
    connect?: imagesWhereUniqueInput
    update?: XOR<XOR<imagesUpdateToOneWithWhereWithoutUsersInput, imagesUpdateWithoutUsersInput>, imagesUncheckedUpdateWithoutUsersInput>
  }

  export type favoritesUpdateManyWithoutUserNestedInput = {
    create?: XOR<favoritesCreateWithoutUserInput, favoritesUncheckedCreateWithoutUserInput> | favoritesCreateWithoutUserInput[] | favoritesUncheckedCreateWithoutUserInput[]
    connectOrCreate?: favoritesCreateOrConnectWithoutUserInput | favoritesCreateOrConnectWithoutUserInput[]
    upsert?: favoritesUpsertWithWhereUniqueWithoutUserInput | favoritesUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: favoritesCreateManyUserInputEnvelope
    set?: favoritesWhereUniqueInput | favoritesWhereUniqueInput[]
    disconnect?: favoritesWhereUniqueInput | favoritesWhereUniqueInput[]
    delete?: favoritesWhereUniqueInput | favoritesWhereUniqueInput[]
    connect?: favoritesWhereUniqueInput | favoritesWhereUniqueInput[]
    update?: favoritesUpdateWithWhereUniqueWithoutUserInput | favoritesUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: favoritesUpdateManyWithWhereWithoutUserInput | favoritesUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: favoritesScalarWhereInput | favoritesScalarWhereInput[]
  }

  export type favoritesUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<favoritesCreateWithoutUserInput, favoritesUncheckedCreateWithoutUserInput> | favoritesCreateWithoutUserInput[] | favoritesUncheckedCreateWithoutUserInput[]
    connectOrCreate?: favoritesCreateOrConnectWithoutUserInput | favoritesCreateOrConnectWithoutUserInput[]
    upsert?: favoritesUpsertWithWhereUniqueWithoutUserInput | favoritesUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: favoritesCreateManyUserInputEnvelope
    set?: favoritesWhereUniqueInput | favoritesWhereUniqueInput[]
    disconnect?: favoritesWhereUniqueInput | favoritesWhereUniqueInput[]
    delete?: favoritesWhereUniqueInput | favoritesWhereUniqueInput[]
    connect?: favoritesWhereUniqueInput | favoritesWhereUniqueInput[]
    update?: favoritesUpdateWithWhereUniqueWithoutUserInput | favoritesUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: favoritesUpdateManyWithWhereWithoutUserInput | favoritesUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: favoritesScalarWhereInput | favoritesScalarWhereInput[]
  }

  export type sellersCreateNestedOneWithoutCouponsInput = {
    create?: XOR<sellersCreateWithoutCouponsInput, sellersUncheckedCreateWithoutCouponsInput>
    connectOrCreate?: sellersCreateOrConnectWithoutCouponsInput
    connect?: sellersWhereUniqueInput
  }

  export type adminsCreateNestedOneWithoutCouponsInput = {
    create?: XOR<adminsCreateWithoutCouponsInput, adminsUncheckedCreateWithoutCouponsInput>
    connectOrCreate?: adminsCreateOrConnectWithoutCouponsInput
    connect?: adminsWhereUniqueInput
  }

  export type coupon_usagesCreateNestedManyWithoutCouponInput = {
    create?: XOR<coupon_usagesCreateWithoutCouponInput, coupon_usagesUncheckedCreateWithoutCouponInput> | coupon_usagesCreateWithoutCouponInput[] | coupon_usagesUncheckedCreateWithoutCouponInput[]
    connectOrCreate?: coupon_usagesCreateOrConnectWithoutCouponInput | coupon_usagesCreateOrConnectWithoutCouponInput[]
    createMany?: coupon_usagesCreateManyCouponInputEnvelope
    connect?: coupon_usagesWhereUniqueInput | coupon_usagesWhereUniqueInput[]
  }

  export type coupon_usagesUncheckedCreateNestedManyWithoutCouponInput = {
    create?: XOR<coupon_usagesCreateWithoutCouponInput, coupon_usagesUncheckedCreateWithoutCouponInput> | coupon_usagesCreateWithoutCouponInput[] | coupon_usagesUncheckedCreateWithoutCouponInput[]
    connectOrCreate?: coupon_usagesCreateOrConnectWithoutCouponInput | coupon_usagesCreateOrConnectWithoutCouponInput[]
    createMany?: coupon_usagesCreateManyCouponInputEnvelope
    connect?: coupon_usagesWhereUniqueInput | coupon_usagesWhereUniqueInput[]
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
    unset?: boolean
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
    unset?: boolean
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type sellersUpdateOneWithoutCouponsNestedInput = {
    create?: XOR<sellersCreateWithoutCouponsInput, sellersUncheckedCreateWithoutCouponsInput>
    connectOrCreate?: sellersCreateOrConnectWithoutCouponsInput
    upsert?: sellersUpsertWithoutCouponsInput
    disconnect?: boolean
    delete?: sellersWhereInput | boolean
    connect?: sellersWhereUniqueInput
    update?: XOR<XOR<sellersUpdateToOneWithWhereWithoutCouponsInput, sellersUpdateWithoutCouponsInput>, sellersUncheckedUpdateWithoutCouponsInput>
  }

  export type adminsUpdateOneWithoutCouponsNestedInput = {
    create?: XOR<adminsCreateWithoutCouponsInput, adminsUncheckedCreateWithoutCouponsInput>
    connectOrCreate?: adminsCreateOrConnectWithoutCouponsInput
    upsert?: adminsUpsertWithoutCouponsInput
    disconnect?: boolean
    delete?: adminsWhereInput | boolean
    connect?: adminsWhereUniqueInput
    update?: XOR<XOR<adminsUpdateToOneWithWhereWithoutCouponsInput, adminsUpdateWithoutCouponsInput>, adminsUncheckedUpdateWithoutCouponsInput>
  }

  export type coupon_usagesUpdateManyWithoutCouponNestedInput = {
    create?: XOR<coupon_usagesCreateWithoutCouponInput, coupon_usagesUncheckedCreateWithoutCouponInput> | coupon_usagesCreateWithoutCouponInput[] | coupon_usagesUncheckedCreateWithoutCouponInput[]
    connectOrCreate?: coupon_usagesCreateOrConnectWithoutCouponInput | coupon_usagesCreateOrConnectWithoutCouponInput[]
    upsert?: coupon_usagesUpsertWithWhereUniqueWithoutCouponInput | coupon_usagesUpsertWithWhereUniqueWithoutCouponInput[]
    createMany?: coupon_usagesCreateManyCouponInputEnvelope
    set?: coupon_usagesWhereUniqueInput | coupon_usagesWhereUniqueInput[]
    disconnect?: coupon_usagesWhereUniqueInput | coupon_usagesWhereUniqueInput[]
    delete?: coupon_usagesWhereUniqueInput | coupon_usagesWhereUniqueInput[]
    connect?: coupon_usagesWhereUniqueInput | coupon_usagesWhereUniqueInput[]
    update?: coupon_usagesUpdateWithWhereUniqueWithoutCouponInput | coupon_usagesUpdateWithWhereUniqueWithoutCouponInput[]
    updateMany?: coupon_usagesUpdateManyWithWhereWithoutCouponInput | coupon_usagesUpdateManyWithWhereWithoutCouponInput[]
    deleteMany?: coupon_usagesScalarWhereInput | coupon_usagesScalarWhereInput[]
  }

  export type coupon_usagesUncheckedUpdateManyWithoutCouponNestedInput = {
    create?: XOR<coupon_usagesCreateWithoutCouponInput, coupon_usagesUncheckedCreateWithoutCouponInput> | coupon_usagesCreateWithoutCouponInput[] | coupon_usagesUncheckedCreateWithoutCouponInput[]
    connectOrCreate?: coupon_usagesCreateOrConnectWithoutCouponInput | coupon_usagesCreateOrConnectWithoutCouponInput[]
    upsert?: coupon_usagesUpsertWithWhereUniqueWithoutCouponInput | coupon_usagesUpsertWithWhereUniqueWithoutCouponInput[]
    createMany?: coupon_usagesCreateManyCouponInputEnvelope
    set?: coupon_usagesWhereUniqueInput | coupon_usagesWhereUniqueInput[]
    disconnect?: coupon_usagesWhereUniqueInput | coupon_usagesWhereUniqueInput[]
    delete?: coupon_usagesWhereUniqueInput | coupon_usagesWhereUniqueInput[]
    connect?: coupon_usagesWhereUniqueInput | coupon_usagesWhereUniqueInput[]
    update?: coupon_usagesUpdateWithWhereUniqueWithoutCouponInput | coupon_usagesUpdateWithWhereUniqueWithoutCouponInput[]
    updateMany?: coupon_usagesUpdateManyWithWhereWithoutCouponInput | coupon_usagesUpdateManyWithWhereWithoutCouponInput[]
    deleteMany?: coupon_usagesScalarWhereInput | coupon_usagesScalarWhereInput[]
  }

  export type discount_codesCreateNestedOneWithoutUsagesInput = {
    create?: XOR<discount_codesCreateWithoutUsagesInput, discount_codesUncheckedCreateWithoutUsagesInput>
    connectOrCreate?: discount_codesCreateOrConnectWithoutUsagesInput
    connect?: discount_codesWhereUniqueInput
  }

  export type discount_codesUpdateOneRequiredWithoutUsagesNestedInput = {
    create?: XOR<discount_codesCreateWithoutUsagesInput, discount_codesUncheckedCreateWithoutUsagesInput>
    connectOrCreate?: discount_codesCreateOrConnectWithoutUsagesInput
    upsert?: discount_codesUpsertWithoutUsagesInput
    connect?: discount_codesWhereUniqueInput
    update?: XOR<XOR<discount_codesUpdateToOneWithWhereWithoutUsagesInput, discount_codesUpdateWithoutUsagesInput>, discount_codesUncheckedUpdateWithoutUsagesInput>
  }

  export type sellersCreatefollowingInput = {
    set: string[]
  }

  export type bannersCreateNestedManyWithoutSellerInput = {
    create?: XOR<bannersCreateWithoutSellerInput, bannersUncheckedCreateWithoutSellerInput> | bannersCreateWithoutSellerInput[] | bannersUncheckedCreateWithoutSellerInput[]
    connectOrCreate?: bannersCreateOrConnectWithoutSellerInput | bannersCreateOrConnectWithoutSellerInput[]
    createMany?: bannersCreateManySellerInputEnvelope
    connect?: bannersWhereUniqueInput | bannersWhereUniqueInput[]
  }

  export type seller_eventsCreateNestedManyWithoutSellerInput = {
    create?: XOR<seller_eventsCreateWithoutSellerInput, seller_eventsUncheckedCreateWithoutSellerInput> | seller_eventsCreateWithoutSellerInput[] | seller_eventsUncheckedCreateWithoutSellerInput[]
    connectOrCreate?: seller_eventsCreateOrConnectWithoutSellerInput | seller_eventsCreateOrConnectWithoutSellerInput[]
    createMany?: seller_eventsCreateManySellerInputEnvelope
    connect?: seller_eventsWhereUniqueInput | seller_eventsWhereUniqueInput[]
  }

  export type storesCreateNestedOneWithoutSellerInput = {
    create?: XOR<storesCreateWithoutSellerInput, storesUncheckedCreateWithoutSellerInput>
    connectOrCreate?: storesCreateOrConnectWithoutSellerInput
    connect?: storesWhereUniqueInput
  }

  export type discount_codesCreateNestedManyWithoutSellerInput = {
    create?: XOR<discount_codesCreateWithoutSellerInput, discount_codesUncheckedCreateWithoutSellerInput> | discount_codesCreateWithoutSellerInput[] | discount_codesUncheckedCreateWithoutSellerInput[]
    connectOrCreate?: discount_codesCreateOrConnectWithoutSellerInput | discount_codesCreateOrConnectWithoutSellerInput[]
    createMany?: discount_codesCreateManySellerInputEnvelope
    connect?: discount_codesWhereUniqueInput | discount_codesWhereUniqueInput[]
  }

  export type staffsCreateNestedManyWithoutSellerInput = {
    create?: XOR<staffsCreateWithoutSellerInput, staffsUncheckedCreateWithoutSellerInput> | staffsCreateWithoutSellerInput[] | staffsUncheckedCreateWithoutSellerInput[]
    connectOrCreate?: staffsCreateOrConnectWithoutSellerInput | staffsCreateOrConnectWithoutSellerInput[]
    createMany?: staffsCreateManySellerInputEnvelope
    connect?: staffsWhereUniqueInput | staffsWhereUniqueInput[]
  }

  export type bannersUncheckedCreateNestedManyWithoutSellerInput = {
    create?: XOR<bannersCreateWithoutSellerInput, bannersUncheckedCreateWithoutSellerInput> | bannersCreateWithoutSellerInput[] | bannersUncheckedCreateWithoutSellerInput[]
    connectOrCreate?: bannersCreateOrConnectWithoutSellerInput | bannersCreateOrConnectWithoutSellerInput[]
    createMany?: bannersCreateManySellerInputEnvelope
    connect?: bannersWhereUniqueInput | bannersWhereUniqueInput[]
  }

  export type seller_eventsUncheckedCreateNestedManyWithoutSellerInput = {
    create?: XOR<seller_eventsCreateWithoutSellerInput, seller_eventsUncheckedCreateWithoutSellerInput> | seller_eventsCreateWithoutSellerInput[] | seller_eventsUncheckedCreateWithoutSellerInput[]
    connectOrCreate?: seller_eventsCreateOrConnectWithoutSellerInput | seller_eventsCreateOrConnectWithoutSellerInput[]
    createMany?: seller_eventsCreateManySellerInputEnvelope
    connect?: seller_eventsWhereUniqueInput | seller_eventsWhereUniqueInput[]
  }

  export type storesUncheckedCreateNestedOneWithoutSellerInput = {
    create?: XOR<storesCreateWithoutSellerInput, storesUncheckedCreateWithoutSellerInput>
    connectOrCreate?: storesCreateOrConnectWithoutSellerInput
    connect?: storesWhereUniqueInput
  }

  export type discount_codesUncheckedCreateNestedManyWithoutSellerInput = {
    create?: XOR<discount_codesCreateWithoutSellerInput, discount_codesUncheckedCreateWithoutSellerInput> | discount_codesCreateWithoutSellerInput[] | discount_codesUncheckedCreateWithoutSellerInput[]
    connectOrCreate?: discount_codesCreateOrConnectWithoutSellerInput | discount_codesCreateOrConnectWithoutSellerInput[]
    createMany?: discount_codesCreateManySellerInputEnvelope
    connect?: discount_codesWhereUniqueInput | discount_codesWhereUniqueInput[]
  }

  export type staffsUncheckedCreateNestedManyWithoutSellerInput = {
    create?: XOR<staffsCreateWithoutSellerInput, staffsUncheckedCreateWithoutSellerInput> | staffsCreateWithoutSellerInput[] | staffsUncheckedCreateWithoutSellerInput[]
    connectOrCreate?: staffsCreateOrConnectWithoutSellerInput | staffsCreateOrConnectWithoutSellerInput[]
    createMany?: staffsCreateManySellerInputEnvelope
    connect?: staffsWhereUniqueInput | staffsWhereUniqueInput[]
  }

  export type sellersUpdatefollowingInput = {
    set?: string[]
    push?: string | string[]
  }

  export type bannersUpdateManyWithoutSellerNestedInput = {
    create?: XOR<bannersCreateWithoutSellerInput, bannersUncheckedCreateWithoutSellerInput> | bannersCreateWithoutSellerInput[] | bannersUncheckedCreateWithoutSellerInput[]
    connectOrCreate?: bannersCreateOrConnectWithoutSellerInput | bannersCreateOrConnectWithoutSellerInput[]
    upsert?: bannersUpsertWithWhereUniqueWithoutSellerInput | bannersUpsertWithWhereUniqueWithoutSellerInput[]
    createMany?: bannersCreateManySellerInputEnvelope
    set?: bannersWhereUniqueInput | bannersWhereUniqueInput[]
    disconnect?: bannersWhereUniqueInput | bannersWhereUniqueInput[]
    delete?: bannersWhereUniqueInput | bannersWhereUniqueInput[]
    connect?: bannersWhereUniqueInput | bannersWhereUniqueInput[]
    update?: bannersUpdateWithWhereUniqueWithoutSellerInput | bannersUpdateWithWhereUniqueWithoutSellerInput[]
    updateMany?: bannersUpdateManyWithWhereWithoutSellerInput | bannersUpdateManyWithWhereWithoutSellerInput[]
    deleteMany?: bannersScalarWhereInput | bannersScalarWhereInput[]
  }

  export type seller_eventsUpdateManyWithoutSellerNestedInput = {
    create?: XOR<seller_eventsCreateWithoutSellerInput, seller_eventsUncheckedCreateWithoutSellerInput> | seller_eventsCreateWithoutSellerInput[] | seller_eventsUncheckedCreateWithoutSellerInput[]
    connectOrCreate?: seller_eventsCreateOrConnectWithoutSellerInput | seller_eventsCreateOrConnectWithoutSellerInput[]
    upsert?: seller_eventsUpsertWithWhereUniqueWithoutSellerInput | seller_eventsUpsertWithWhereUniqueWithoutSellerInput[]
    createMany?: seller_eventsCreateManySellerInputEnvelope
    set?: seller_eventsWhereUniqueInput | seller_eventsWhereUniqueInput[]
    disconnect?: seller_eventsWhereUniqueInput | seller_eventsWhereUniqueInput[]
    delete?: seller_eventsWhereUniqueInput | seller_eventsWhereUniqueInput[]
    connect?: seller_eventsWhereUniqueInput | seller_eventsWhereUniqueInput[]
    update?: seller_eventsUpdateWithWhereUniqueWithoutSellerInput | seller_eventsUpdateWithWhereUniqueWithoutSellerInput[]
    updateMany?: seller_eventsUpdateManyWithWhereWithoutSellerInput | seller_eventsUpdateManyWithWhereWithoutSellerInput[]
    deleteMany?: seller_eventsScalarWhereInput | seller_eventsScalarWhereInput[]
  }

  export type storesUpdateOneWithoutSellerNestedInput = {
    create?: XOR<storesCreateWithoutSellerInput, storesUncheckedCreateWithoutSellerInput>
    connectOrCreate?: storesCreateOrConnectWithoutSellerInput
    upsert?: storesUpsertWithoutSellerInput
    disconnect?: storesWhereInput | boolean
    delete?: storesWhereInput | boolean
    connect?: storesWhereUniqueInput
    update?: XOR<XOR<storesUpdateToOneWithWhereWithoutSellerInput, storesUpdateWithoutSellerInput>, storesUncheckedUpdateWithoutSellerInput>
  }

  export type discount_codesUpdateManyWithoutSellerNestedInput = {
    create?: XOR<discount_codesCreateWithoutSellerInput, discount_codesUncheckedCreateWithoutSellerInput> | discount_codesCreateWithoutSellerInput[] | discount_codesUncheckedCreateWithoutSellerInput[]
    connectOrCreate?: discount_codesCreateOrConnectWithoutSellerInput | discount_codesCreateOrConnectWithoutSellerInput[]
    upsert?: discount_codesUpsertWithWhereUniqueWithoutSellerInput | discount_codesUpsertWithWhereUniqueWithoutSellerInput[]
    createMany?: discount_codesCreateManySellerInputEnvelope
    set?: discount_codesWhereUniqueInput | discount_codesWhereUniqueInput[]
    disconnect?: discount_codesWhereUniqueInput | discount_codesWhereUniqueInput[]
    delete?: discount_codesWhereUniqueInput | discount_codesWhereUniqueInput[]
    connect?: discount_codesWhereUniqueInput | discount_codesWhereUniqueInput[]
    update?: discount_codesUpdateWithWhereUniqueWithoutSellerInput | discount_codesUpdateWithWhereUniqueWithoutSellerInput[]
    updateMany?: discount_codesUpdateManyWithWhereWithoutSellerInput | discount_codesUpdateManyWithWhereWithoutSellerInput[]
    deleteMany?: discount_codesScalarWhereInput | discount_codesScalarWhereInput[]
  }

  export type staffsUpdateManyWithoutSellerNestedInput = {
    create?: XOR<staffsCreateWithoutSellerInput, staffsUncheckedCreateWithoutSellerInput> | staffsCreateWithoutSellerInput[] | staffsUncheckedCreateWithoutSellerInput[]
    connectOrCreate?: staffsCreateOrConnectWithoutSellerInput | staffsCreateOrConnectWithoutSellerInput[]
    upsert?: staffsUpsertWithWhereUniqueWithoutSellerInput | staffsUpsertWithWhereUniqueWithoutSellerInput[]
    createMany?: staffsCreateManySellerInputEnvelope
    set?: staffsWhereUniqueInput | staffsWhereUniqueInput[]
    disconnect?: staffsWhereUniqueInput | staffsWhereUniqueInput[]
    delete?: staffsWhereUniqueInput | staffsWhereUniqueInput[]
    connect?: staffsWhereUniqueInput | staffsWhereUniqueInput[]
    update?: staffsUpdateWithWhereUniqueWithoutSellerInput | staffsUpdateWithWhereUniqueWithoutSellerInput[]
    updateMany?: staffsUpdateManyWithWhereWithoutSellerInput | staffsUpdateManyWithWhereWithoutSellerInput[]
    deleteMany?: staffsScalarWhereInput | staffsScalarWhereInput[]
  }

  export type bannersUncheckedUpdateManyWithoutSellerNestedInput = {
    create?: XOR<bannersCreateWithoutSellerInput, bannersUncheckedCreateWithoutSellerInput> | bannersCreateWithoutSellerInput[] | bannersUncheckedCreateWithoutSellerInput[]
    connectOrCreate?: bannersCreateOrConnectWithoutSellerInput | bannersCreateOrConnectWithoutSellerInput[]
    upsert?: bannersUpsertWithWhereUniqueWithoutSellerInput | bannersUpsertWithWhereUniqueWithoutSellerInput[]
    createMany?: bannersCreateManySellerInputEnvelope
    set?: bannersWhereUniqueInput | bannersWhereUniqueInput[]
    disconnect?: bannersWhereUniqueInput | bannersWhereUniqueInput[]
    delete?: bannersWhereUniqueInput | bannersWhereUniqueInput[]
    connect?: bannersWhereUniqueInput | bannersWhereUniqueInput[]
    update?: bannersUpdateWithWhereUniqueWithoutSellerInput | bannersUpdateWithWhereUniqueWithoutSellerInput[]
    updateMany?: bannersUpdateManyWithWhereWithoutSellerInput | bannersUpdateManyWithWhereWithoutSellerInput[]
    deleteMany?: bannersScalarWhereInput | bannersScalarWhereInput[]
  }

  export type seller_eventsUncheckedUpdateManyWithoutSellerNestedInput = {
    create?: XOR<seller_eventsCreateWithoutSellerInput, seller_eventsUncheckedCreateWithoutSellerInput> | seller_eventsCreateWithoutSellerInput[] | seller_eventsUncheckedCreateWithoutSellerInput[]
    connectOrCreate?: seller_eventsCreateOrConnectWithoutSellerInput | seller_eventsCreateOrConnectWithoutSellerInput[]
    upsert?: seller_eventsUpsertWithWhereUniqueWithoutSellerInput | seller_eventsUpsertWithWhereUniqueWithoutSellerInput[]
    createMany?: seller_eventsCreateManySellerInputEnvelope
    set?: seller_eventsWhereUniqueInput | seller_eventsWhereUniqueInput[]
    disconnect?: seller_eventsWhereUniqueInput | seller_eventsWhereUniqueInput[]
    delete?: seller_eventsWhereUniqueInput | seller_eventsWhereUniqueInput[]
    connect?: seller_eventsWhereUniqueInput | seller_eventsWhereUniqueInput[]
    update?: seller_eventsUpdateWithWhereUniqueWithoutSellerInput | seller_eventsUpdateWithWhereUniqueWithoutSellerInput[]
    updateMany?: seller_eventsUpdateManyWithWhereWithoutSellerInput | seller_eventsUpdateManyWithWhereWithoutSellerInput[]
    deleteMany?: seller_eventsScalarWhereInput | seller_eventsScalarWhereInput[]
  }

  export type storesUncheckedUpdateOneWithoutSellerNestedInput = {
    create?: XOR<storesCreateWithoutSellerInput, storesUncheckedCreateWithoutSellerInput>
    connectOrCreate?: storesCreateOrConnectWithoutSellerInput
    upsert?: storesUpsertWithoutSellerInput
    disconnect?: storesWhereInput | boolean
    delete?: storesWhereInput | boolean
    connect?: storesWhereUniqueInput
    update?: XOR<XOR<storesUpdateToOneWithWhereWithoutSellerInput, storesUpdateWithoutSellerInput>, storesUncheckedUpdateWithoutSellerInput>
  }

  export type discount_codesUncheckedUpdateManyWithoutSellerNestedInput = {
    create?: XOR<discount_codesCreateWithoutSellerInput, discount_codesUncheckedCreateWithoutSellerInput> | discount_codesCreateWithoutSellerInput[] | discount_codesUncheckedCreateWithoutSellerInput[]
    connectOrCreate?: discount_codesCreateOrConnectWithoutSellerInput | discount_codesCreateOrConnectWithoutSellerInput[]
    upsert?: discount_codesUpsertWithWhereUniqueWithoutSellerInput | discount_codesUpsertWithWhereUniqueWithoutSellerInput[]
    createMany?: discount_codesCreateManySellerInputEnvelope
    set?: discount_codesWhereUniqueInput | discount_codesWhereUniqueInput[]
    disconnect?: discount_codesWhereUniqueInput | discount_codesWhereUniqueInput[]
    delete?: discount_codesWhereUniqueInput | discount_codesWhereUniqueInput[]
    connect?: discount_codesWhereUniqueInput | discount_codesWhereUniqueInput[]
    update?: discount_codesUpdateWithWhereUniqueWithoutSellerInput | discount_codesUpdateWithWhereUniqueWithoutSellerInput[]
    updateMany?: discount_codesUpdateManyWithWhereWithoutSellerInput | discount_codesUpdateManyWithWhereWithoutSellerInput[]
    deleteMany?: discount_codesScalarWhereInput | discount_codesScalarWhereInput[]
  }

  export type staffsUncheckedUpdateManyWithoutSellerNestedInput = {
    create?: XOR<staffsCreateWithoutSellerInput, staffsUncheckedCreateWithoutSellerInput> | staffsCreateWithoutSellerInput[] | staffsUncheckedCreateWithoutSellerInput[]
    connectOrCreate?: staffsCreateOrConnectWithoutSellerInput | staffsCreateOrConnectWithoutSellerInput[]
    upsert?: staffsUpsertWithWhereUniqueWithoutSellerInput | staffsUpsertWithWhereUniqueWithoutSellerInput[]
    createMany?: staffsCreateManySellerInputEnvelope
    set?: staffsWhereUniqueInput | staffsWhereUniqueInput[]
    disconnect?: staffsWhereUniqueInput | staffsWhereUniqueInput[]
    delete?: staffsWhereUniqueInput | staffsWhereUniqueInput[]
    connect?: staffsWhereUniqueInput | staffsWhereUniqueInput[]
    update?: staffsUpdateWithWhereUniqueWithoutSellerInput | staffsUpdateWithWhereUniqueWithoutSellerInput[]
    updateMany?: staffsUpdateManyWithWhereWithoutSellerInput | staffsUpdateManyWithWhereWithoutSellerInput[]
    deleteMany?: staffsScalarWhereInput | staffsScalarWhereInput[]
  }

  export type sellersCreateNestedOneWithoutStaffsInput = {
    create?: XOR<sellersCreateWithoutStaffsInput, sellersUncheckedCreateWithoutStaffsInput>
    connectOrCreate?: sellersCreateOrConnectWithoutStaffsInput
    connect?: sellersWhereUniqueInput
  }

  export type sellersUpdateOneWithoutStaffsNestedInput = {
    create?: XOR<sellersCreateWithoutStaffsInput, sellersUncheckedCreateWithoutStaffsInput>
    connectOrCreate?: sellersCreateOrConnectWithoutStaffsInput
    upsert?: sellersUpsertWithoutStaffsInput
    disconnect?: boolean
    delete?: sellersWhereInput | boolean
    connect?: sellersWhereUniqueInput
    update?: XOR<XOR<sellersUpdateToOneWithWhereWithoutStaffsInput, sellersUpdateWithoutStaffsInput>, sellersUncheckedUpdateWithoutStaffsInput>
  }

  export type storesCreateavailableCitiesInput = {
    set: string[]
  }

  export type imagesCreateNestedOneWithoutStoresInput = {
    create?: XOR<imagesCreateWithoutStoresInput, imagesUncheckedCreateWithoutStoresInput>
    connectOrCreate?: imagesCreateOrConnectWithoutStoresInput
    connect?: imagesWhereUniqueInput
  }

  export type sellersCreateNestedOneWithoutStoreInput = {
    create?: XOR<sellersCreateWithoutStoreInput, sellersUncheckedCreateWithoutStoreInput>
    connectOrCreate?: sellersCreateOrConnectWithoutStoreInput
    connect?: sellersWhereUniqueInput
  }

  export type productsCreateNestedManyWithoutStoreInput = {
    create?: XOR<productsCreateWithoutStoreInput, productsUncheckedCreateWithoutStoreInput> | productsCreateWithoutStoreInput[] | productsUncheckedCreateWithoutStoreInput[]
    connectOrCreate?: productsCreateOrConnectWithoutStoreInput | productsCreateOrConnectWithoutStoreInput[]
    createMany?: productsCreateManyStoreInputEnvelope
    connect?: productsWhereUniqueInput | productsWhereUniqueInput[]
  }

  export type productsUncheckedCreateNestedManyWithoutStoreInput = {
    create?: XOR<productsCreateWithoutStoreInput, productsUncheckedCreateWithoutStoreInput> | productsCreateWithoutStoreInput[] | productsUncheckedCreateWithoutStoreInput[]
    connectOrCreate?: productsCreateOrConnectWithoutStoreInput | productsCreateOrConnectWithoutStoreInput[]
    createMany?: productsCreateManyStoreInputEnvelope
    connect?: productsWhereUniqueInput | productsWhereUniqueInput[]
  }

  export type storesUpdateavailableCitiesInput = {
    set?: string[]
    push?: string | string[]
  }

  export type imagesUpdateOneWithoutStoresNestedInput = {
    create?: XOR<imagesCreateWithoutStoresInput, imagesUncheckedCreateWithoutStoresInput>
    connectOrCreate?: imagesCreateOrConnectWithoutStoresInput
    upsert?: imagesUpsertWithoutStoresInput
    disconnect?: boolean
    delete?: imagesWhereInput | boolean
    connect?: imagesWhereUniqueInput
    update?: XOR<XOR<imagesUpdateToOneWithWhereWithoutStoresInput, imagesUpdateWithoutStoresInput>, imagesUncheckedUpdateWithoutStoresInput>
  }

  export type sellersUpdateOneRequiredWithoutStoreNestedInput = {
    create?: XOR<sellersCreateWithoutStoreInput, sellersUncheckedCreateWithoutStoreInput>
    connectOrCreate?: sellersCreateOrConnectWithoutStoreInput
    upsert?: sellersUpsertWithoutStoreInput
    connect?: sellersWhereUniqueInput
    update?: XOR<XOR<sellersUpdateToOneWithWhereWithoutStoreInput, sellersUpdateWithoutStoreInput>, sellersUncheckedUpdateWithoutStoreInput>
  }

  export type productsUpdateManyWithoutStoreNestedInput = {
    create?: XOR<productsCreateWithoutStoreInput, productsUncheckedCreateWithoutStoreInput> | productsCreateWithoutStoreInput[] | productsUncheckedCreateWithoutStoreInput[]
    connectOrCreate?: productsCreateOrConnectWithoutStoreInput | productsCreateOrConnectWithoutStoreInput[]
    upsert?: productsUpsertWithWhereUniqueWithoutStoreInput | productsUpsertWithWhereUniqueWithoutStoreInput[]
    createMany?: productsCreateManyStoreInputEnvelope
    set?: productsWhereUniqueInput | productsWhereUniqueInput[]
    disconnect?: productsWhereUniqueInput | productsWhereUniqueInput[]
    delete?: productsWhereUniqueInput | productsWhereUniqueInput[]
    connect?: productsWhereUniqueInput | productsWhereUniqueInput[]
    update?: productsUpdateWithWhereUniqueWithoutStoreInput | productsUpdateWithWhereUniqueWithoutStoreInput[]
    updateMany?: productsUpdateManyWithWhereWithoutStoreInput | productsUpdateManyWithWhereWithoutStoreInput[]
    deleteMany?: productsScalarWhereInput | productsScalarWhereInput[]
  }

  export type productsUncheckedUpdateManyWithoutStoreNestedInput = {
    create?: XOR<productsCreateWithoutStoreInput, productsUncheckedCreateWithoutStoreInput> | productsCreateWithoutStoreInput[] | productsUncheckedCreateWithoutStoreInput[]
    connectOrCreate?: productsCreateOrConnectWithoutStoreInput | productsCreateOrConnectWithoutStoreInput[]
    upsert?: productsUpsertWithWhereUniqueWithoutStoreInput | productsUpsertWithWhereUniqueWithoutStoreInput[]
    createMany?: productsCreateManyStoreInputEnvelope
    set?: productsWhereUniqueInput | productsWhereUniqueInput[]
    disconnect?: productsWhereUniqueInput | productsWhereUniqueInput[]
    delete?: productsWhereUniqueInput | productsWhereUniqueInput[]
    connect?: productsWhereUniqueInput | productsWhereUniqueInput[]
    update?: productsUpdateWithWhereUniqueWithoutStoreInput | productsUpdateWithWhereUniqueWithoutStoreInput[]
    updateMany?: productsUpdateManyWithWhereWithoutStoreInput | productsUpdateManyWithWhereWithoutStoreInput[]
    deleteMany?: productsScalarWhereInput | productsScalarWhereInput[]
  }

  export type usersCreateNestedOneWithoutFavoritesInput = {
    create?: XOR<usersCreateWithoutFavoritesInput, usersUncheckedCreateWithoutFavoritesInput>
    connectOrCreate?: usersCreateOrConnectWithoutFavoritesInput
    connect?: usersWhereUniqueInput
  }

  export type productsCreateNestedOneWithoutFavoritesInput = {
    create?: XOR<productsCreateWithoutFavoritesInput, productsUncheckedCreateWithoutFavoritesInput>
    connectOrCreate?: productsCreateOrConnectWithoutFavoritesInput
    connect?: productsWhereUniqueInput
  }

  export type usersUpdateOneRequiredWithoutFavoritesNestedInput = {
    create?: XOR<usersCreateWithoutFavoritesInput, usersUncheckedCreateWithoutFavoritesInput>
    connectOrCreate?: usersCreateOrConnectWithoutFavoritesInput
    upsert?: usersUpsertWithoutFavoritesInput
    connect?: usersWhereUniqueInput
    update?: XOR<XOR<usersUpdateToOneWithWhereWithoutFavoritesInput, usersUpdateWithoutFavoritesInput>, usersUncheckedUpdateWithoutFavoritesInput>
  }

  export type productsUpdateOneRequiredWithoutFavoritesNestedInput = {
    create?: XOR<productsCreateWithoutFavoritesInput, productsUncheckedCreateWithoutFavoritesInput>
    connectOrCreate?: productsCreateOrConnectWithoutFavoritesInput
    upsert?: productsUpsertWithoutFavoritesInput
    connect?: productsWhereUniqueInput
    update?: XOR<XOR<productsUpdateToOneWithWhereWithoutFavoritesInput, productsUpdateWithoutFavoritesInput>, productsUncheckedUpdateWithoutFavoritesInput>
  }

  export type site_configCreatecategoriesInput = {
    set: string[]
  }

  export type site_configUpdatecategoriesInput = {
    set?: string[]
    push?: string | string[]
  }

  export type productsCreatetagsInput = {
    set: string[]
  }

  export type productsCreatesizesInput = {
    set: string[]
  }

  export type productsCreatecuttingTypesInput = {
    set: string[]
  }

  export type productsCreatepieceSizesInput = {
    set: string[]
  }

  export type productsCreatediscount_codesInput = {
    set: string[]
  }

  export type imagesCreateNestedManyWithoutProductInput = {
    create?: XOR<imagesCreateWithoutProductInput, imagesUncheckedCreateWithoutProductInput> | imagesCreateWithoutProductInput[] | imagesUncheckedCreateWithoutProductInput[]
    connectOrCreate?: imagesCreateOrConnectWithoutProductInput | imagesCreateOrConnectWithoutProductInput[]
    createMany?: imagesCreateManyProductInputEnvelope
    connect?: imagesWhereUniqueInput | imagesWhereUniqueInput[]
  }

  export type favoritesCreateNestedManyWithoutProductInput = {
    create?: XOR<favoritesCreateWithoutProductInput, favoritesUncheckedCreateWithoutProductInput> | favoritesCreateWithoutProductInput[] | favoritesUncheckedCreateWithoutProductInput[]
    connectOrCreate?: favoritesCreateOrConnectWithoutProductInput | favoritesCreateOrConnectWithoutProductInput[]
    createMany?: favoritesCreateManyProductInputEnvelope
    connect?: favoritesWhereUniqueInput | favoritesWhereUniqueInput[]
  }

  export type storesCreateNestedOneWithoutProductsInput = {
    create?: XOR<storesCreateWithoutProductsInput, storesUncheckedCreateWithoutProductsInput>
    connectOrCreate?: storesCreateOrConnectWithoutProductsInput
    connect?: storesWhereUniqueInput
  }

  export type adminsCreateNestedOneWithoutProductsInput = {
    create?: XOR<adminsCreateWithoutProductsInput, adminsUncheckedCreateWithoutProductsInput>
    connectOrCreate?: adminsCreateOrConnectWithoutProductsInput
    connect?: adminsWhereUniqueInput
  }

  export type productsCreateNestedOneWithoutStoreVariantsInput = {
    create?: XOR<productsCreateWithoutStoreVariantsInput, productsUncheckedCreateWithoutStoreVariantsInput>
    connectOrCreate?: productsCreateOrConnectWithoutStoreVariantsInput
    connect?: productsWhereUniqueInput
  }

  export type productsCreateNestedManyWithoutCatalogProductInput = {
    create?: XOR<productsCreateWithoutCatalogProductInput, productsUncheckedCreateWithoutCatalogProductInput> | productsCreateWithoutCatalogProductInput[] | productsUncheckedCreateWithoutCatalogProductInput[]
    connectOrCreate?: productsCreateOrConnectWithoutCatalogProductInput | productsCreateOrConnectWithoutCatalogProductInput[]
    createMany?: productsCreateManyCatalogProductInputEnvelope
    connect?: productsWhereUniqueInput | productsWhereUniqueInput[]
  }

  export type imagesUncheckedCreateNestedManyWithoutProductInput = {
    create?: XOR<imagesCreateWithoutProductInput, imagesUncheckedCreateWithoutProductInput> | imagesCreateWithoutProductInput[] | imagesUncheckedCreateWithoutProductInput[]
    connectOrCreate?: imagesCreateOrConnectWithoutProductInput | imagesCreateOrConnectWithoutProductInput[]
    createMany?: imagesCreateManyProductInputEnvelope
    connect?: imagesWhereUniqueInput | imagesWhereUniqueInput[]
  }

  export type favoritesUncheckedCreateNestedManyWithoutProductInput = {
    create?: XOR<favoritesCreateWithoutProductInput, favoritesUncheckedCreateWithoutProductInput> | favoritesCreateWithoutProductInput[] | favoritesUncheckedCreateWithoutProductInput[]
    connectOrCreate?: favoritesCreateOrConnectWithoutProductInput | favoritesCreateOrConnectWithoutProductInput[]
    createMany?: favoritesCreateManyProductInputEnvelope
    connect?: favoritesWhereUniqueInput | favoritesWhereUniqueInput[]
  }

  export type productsUncheckedCreateNestedManyWithoutCatalogProductInput = {
    create?: XOR<productsCreateWithoutCatalogProductInput, productsUncheckedCreateWithoutCatalogProductInput> | productsCreateWithoutCatalogProductInput[] | productsUncheckedCreateWithoutCatalogProductInput[]
    connectOrCreate?: productsCreateOrConnectWithoutCatalogProductInput | productsCreateOrConnectWithoutCatalogProductInput[]
    createMany?: productsCreateManyCatalogProductInputEnvelope
    connect?: productsWhereUniqueInput | productsWhereUniqueInput[]
  }

  export type productsUpdatetagsInput = {
    set?: string[]
    push?: string | string[]
  }

  export type productsUpdatesizesInput = {
    set?: string[]
    push?: string | string[]
  }

  export type productsUpdatecuttingTypesInput = {
    set?: string[]
    push?: string | string[]
  }

  export type productsUpdatepieceSizesInput = {
    set?: string[]
    push?: string | string[]
  }

  export type productsUpdatediscount_codesInput = {
    set?: string[]
    push?: string | string[]
  }

  export type EnumproductStatusFieldUpdateOperationsInput = {
    set?: $Enums.productStatus
  }

  export type NullableBoolFieldUpdateOperationsInput = {
    set?: boolean | null
    unset?: boolean
  }

  export type imagesUpdateManyWithoutProductNestedInput = {
    create?: XOR<imagesCreateWithoutProductInput, imagesUncheckedCreateWithoutProductInput> | imagesCreateWithoutProductInput[] | imagesUncheckedCreateWithoutProductInput[]
    connectOrCreate?: imagesCreateOrConnectWithoutProductInput | imagesCreateOrConnectWithoutProductInput[]
    upsert?: imagesUpsertWithWhereUniqueWithoutProductInput | imagesUpsertWithWhereUniqueWithoutProductInput[]
    createMany?: imagesCreateManyProductInputEnvelope
    set?: imagesWhereUniqueInput | imagesWhereUniqueInput[]
    disconnect?: imagesWhereUniqueInput | imagesWhereUniqueInput[]
    delete?: imagesWhereUniqueInput | imagesWhereUniqueInput[]
    connect?: imagesWhereUniqueInput | imagesWhereUniqueInput[]
    update?: imagesUpdateWithWhereUniqueWithoutProductInput | imagesUpdateWithWhereUniqueWithoutProductInput[]
    updateMany?: imagesUpdateManyWithWhereWithoutProductInput | imagesUpdateManyWithWhereWithoutProductInput[]
    deleteMany?: imagesScalarWhereInput | imagesScalarWhereInput[]
  }

  export type favoritesUpdateManyWithoutProductNestedInput = {
    create?: XOR<favoritesCreateWithoutProductInput, favoritesUncheckedCreateWithoutProductInput> | favoritesCreateWithoutProductInput[] | favoritesUncheckedCreateWithoutProductInput[]
    connectOrCreate?: favoritesCreateOrConnectWithoutProductInput | favoritesCreateOrConnectWithoutProductInput[]
    upsert?: favoritesUpsertWithWhereUniqueWithoutProductInput | favoritesUpsertWithWhereUniqueWithoutProductInput[]
    createMany?: favoritesCreateManyProductInputEnvelope
    set?: favoritesWhereUniqueInput | favoritesWhereUniqueInput[]
    disconnect?: favoritesWhereUniqueInput | favoritesWhereUniqueInput[]
    delete?: favoritesWhereUniqueInput | favoritesWhereUniqueInput[]
    connect?: favoritesWhereUniqueInput | favoritesWhereUniqueInput[]
    update?: favoritesUpdateWithWhereUniqueWithoutProductInput | favoritesUpdateWithWhereUniqueWithoutProductInput[]
    updateMany?: favoritesUpdateManyWithWhereWithoutProductInput | favoritesUpdateManyWithWhereWithoutProductInput[]
    deleteMany?: favoritesScalarWhereInput | favoritesScalarWhereInput[]
  }

  export type storesUpdateOneWithoutProductsNestedInput = {
    create?: XOR<storesCreateWithoutProductsInput, storesUncheckedCreateWithoutProductsInput>
    connectOrCreate?: storesCreateOrConnectWithoutProductsInput
    upsert?: storesUpsertWithoutProductsInput
    disconnect?: boolean
    delete?: storesWhereInput | boolean
    connect?: storesWhereUniqueInput
    update?: XOR<XOR<storesUpdateToOneWithWhereWithoutProductsInput, storesUpdateWithoutProductsInput>, storesUncheckedUpdateWithoutProductsInput>
  }

  export type adminsUpdateOneWithoutProductsNestedInput = {
    create?: XOR<adminsCreateWithoutProductsInput, adminsUncheckedCreateWithoutProductsInput>
    connectOrCreate?: adminsCreateOrConnectWithoutProductsInput
    upsert?: adminsUpsertWithoutProductsInput
    disconnect?: boolean
    delete?: adminsWhereInput | boolean
    connect?: adminsWhereUniqueInput
    update?: XOR<XOR<adminsUpdateToOneWithWhereWithoutProductsInput, adminsUpdateWithoutProductsInput>, adminsUncheckedUpdateWithoutProductsInput>
  }

  export type productsUpdateOneWithoutStoreVariantsNestedInput = {
    create?: XOR<productsCreateWithoutStoreVariantsInput, productsUncheckedCreateWithoutStoreVariantsInput>
    connectOrCreate?: productsCreateOrConnectWithoutStoreVariantsInput
    upsert?: productsUpsertWithoutStoreVariantsInput
    disconnect?: boolean
    delete?: productsWhereInput | boolean
    connect?: productsWhereUniqueInput
    update?: XOR<XOR<productsUpdateToOneWithWhereWithoutStoreVariantsInput, productsUpdateWithoutStoreVariantsInput>, productsUncheckedUpdateWithoutStoreVariantsInput>
  }

  export type productsUpdateManyWithoutCatalogProductNestedInput = {
    create?: XOR<productsCreateWithoutCatalogProductInput, productsUncheckedCreateWithoutCatalogProductInput> | productsCreateWithoutCatalogProductInput[] | productsUncheckedCreateWithoutCatalogProductInput[]
    connectOrCreate?: productsCreateOrConnectWithoutCatalogProductInput | productsCreateOrConnectWithoutCatalogProductInput[]
    upsert?: productsUpsertWithWhereUniqueWithoutCatalogProductInput | productsUpsertWithWhereUniqueWithoutCatalogProductInput[]
    createMany?: productsCreateManyCatalogProductInputEnvelope
    set?: productsWhereUniqueInput | productsWhereUniqueInput[]
    disconnect?: productsWhereUniqueInput | productsWhereUniqueInput[]
    delete?: productsWhereUniqueInput | productsWhereUniqueInput[]
    connect?: productsWhereUniqueInput | productsWhereUniqueInput[]
    update?: productsUpdateWithWhereUniqueWithoutCatalogProductInput | productsUpdateWithWhereUniqueWithoutCatalogProductInput[]
    updateMany?: productsUpdateManyWithWhereWithoutCatalogProductInput | productsUpdateManyWithWhereWithoutCatalogProductInput[]
    deleteMany?: productsScalarWhereInput | productsScalarWhereInput[]
  }

  export type imagesUncheckedUpdateManyWithoutProductNestedInput = {
    create?: XOR<imagesCreateWithoutProductInput, imagesUncheckedCreateWithoutProductInput> | imagesCreateWithoutProductInput[] | imagesUncheckedCreateWithoutProductInput[]
    connectOrCreate?: imagesCreateOrConnectWithoutProductInput | imagesCreateOrConnectWithoutProductInput[]
    upsert?: imagesUpsertWithWhereUniqueWithoutProductInput | imagesUpsertWithWhereUniqueWithoutProductInput[]
    createMany?: imagesCreateManyProductInputEnvelope
    set?: imagesWhereUniqueInput | imagesWhereUniqueInput[]
    disconnect?: imagesWhereUniqueInput | imagesWhereUniqueInput[]
    delete?: imagesWhereUniqueInput | imagesWhereUniqueInput[]
    connect?: imagesWhereUniqueInput | imagesWhereUniqueInput[]
    update?: imagesUpdateWithWhereUniqueWithoutProductInput | imagesUpdateWithWhereUniqueWithoutProductInput[]
    updateMany?: imagesUpdateManyWithWhereWithoutProductInput | imagesUpdateManyWithWhereWithoutProductInput[]
    deleteMany?: imagesScalarWhereInput | imagesScalarWhereInput[]
  }

  export type favoritesUncheckedUpdateManyWithoutProductNestedInput = {
    create?: XOR<favoritesCreateWithoutProductInput, favoritesUncheckedCreateWithoutProductInput> | favoritesCreateWithoutProductInput[] | favoritesUncheckedCreateWithoutProductInput[]
    connectOrCreate?: favoritesCreateOrConnectWithoutProductInput | favoritesCreateOrConnectWithoutProductInput[]
    upsert?: favoritesUpsertWithWhereUniqueWithoutProductInput | favoritesUpsertWithWhereUniqueWithoutProductInput[]
    createMany?: favoritesCreateManyProductInputEnvelope
    set?: favoritesWhereUniqueInput | favoritesWhereUniqueInput[]
    disconnect?: favoritesWhereUniqueInput | favoritesWhereUniqueInput[]
    delete?: favoritesWhereUniqueInput | favoritesWhereUniqueInput[]
    connect?: favoritesWhereUniqueInput | favoritesWhereUniqueInput[]
    update?: favoritesUpdateWithWhereUniqueWithoutProductInput | favoritesUpdateWithWhereUniqueWithoutProductInput[]
    updateMany?: favoritesUpdateManyWithWhereWithoutProductInput | favoritesUpdateManyWithWhereWithoutProductInput[]
    deleteMany?: favoritesScalarWhereInput | favoritesScalarWhereInput[]
  }

  export type productsUncheckedUpdateManyWithoutCatalogProductNestedInput = {
    create?: XOR<productsCreateWithoutCatalogProductInput, productsUncheckedCreateWithoutCatalogProductInput> | productsCreateWithoutCatalogProductInput[] | productsUncheckedCreateWithoutCatalogProductInput[]
    connectOrCreate?: productsCreateOrConnectWithoutCatalogProductInput | productsCreateOrConnectWithoutCatalogProductInput[]
    upsert?: productsUpsertWithWhereUniqueWithoutCatalogProductInput | productsUpsertWithWhereUniqueWithoutCatalogProductInput[]
    createMany?: productsCreateManyCatalogProductInputEnvelope
    set?: productsWhereUniqueInput | productsWhereUniqueInput[]
    disconnect?: productsWhereUniqueInput | productsWhereUniqueInput[]
    delete?: productsWhereUniqueInput | productsWhereUniqueInput[]
    connect?: productsWhereUniqueInput | productsWhereUniqueInput[]
    update?: productsUpdateWithWhereUniqueWithoutCatalogProductInput | productsUpdateWithWhereUniqueWithoutCatalogProductInput[]
    updateMany?: productsUpdateManyWithWhereWithoutCatalogProductInput | productsUpdateManyWithWhereWithoutCatalogProductInput[]
    deleteMany?: productsScalarWhereInput | productsScalarWhereInput[]
  }

  export type sellersCreateNestedOneWithoutBannersInput = {
    create?: XOR<sellersCreateWithoutBannersInput, sellersUncheckedCreateWithoutBannersInput>
    connectOrCreate?: sellersCreateOrConnectWithoutBannersInput
    connect?: sellersWhereUniqueInput
  }

  export type adminsCreateNestedOneWithoutBannersInput = {
    create?: XOR<adminsCreateWithoutBannersInput, adminsUncheckedCreateWithoutBannersInput>
    connectOrCreate?: adminsCreateOrConnectWithoutBannersInput
    connect?: adminsWhereUniqueInput
  }

  export type sellersUpdateOneWithoutBannersNestedInput = {
    create?: XOR<sellersCreateWithoutBannersInput, sellersUncheckedCreateWithoutBannersInput>
    connectOrCreate?: sellersCreateOrConnectWithoutBannersInput
    upsert?: sellersUpsertWithoutBannersInput
    disconnect?: boolean
    delete?: sellersWhereInput | boolean
    connect?: sellersWhereUniqueInput
    update?: XOR<XOR<sellersUpdateToOneWithWhereWithoutBannersInput, sellersUpdateWithoutBannersInput>, sellersUncheckedUpdateWithoutBannersInput>
  }

  export type adminsUpdateOneWithoutBannersNestedInput = {
    create?: XOR<adminsCreateWithoutBannersInput, adminsUncheckedCreateWithoutBannersInput>
    connectOrCreate?: adminsCreateOrConnectWithoutBannersInput
    upsert?: adminsUpsertWithoutBannersInput
    disconnect?: boolean
    delete?: adminsWhereInput | boolean
    connect?: adminsWhereUniqueInput
    update?: XOR<XOR<adminsUpdateToOneWithWhereWithoutBannersInput, adminsUpdateWithoutBannersInput>, adminsUncheckedUpdateWithoutBannersInput>
  }

  export type sellersCreateNestedOneWithoutEventsInput = {
    create?: XOR<sellersCreateWithoutEventsInput, sellersUncheckedCreateWithoutEventsInput>
    connectOrCreate?: sellersCreateOrConnectWithoutEventsInput
    connect?: sellersWhereUniqueInput
  }

  export type EnumsellerEventTypeFieldUpdateOperationsInput = {
    set?: $Enums.sellerEventType
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
    unset?: boolean
  }

  export type sellersUpdateOneRequiredWithoutEventsNestedInput = {
    create?: XOR<sellersCreateWithoutEventsInput, sellersUncheckedCreateWithoutEventsInput>
    connectOrCreate?: sellersCreateOrConnectWithoutEventsInput
    upsert?: sellersUpsertWithoutEventsInput
    connect?: sellersWhereUniqueInput
    update?: XOR<XOR<sellersUpdateToOneWithWhereWithoutEventsInput, sellersUpdateWithoutEventsInput>, sellersUncheckedUpdateWithoutEventsInput>
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

  export type NestedEnumImageTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.ImageType | EnumImageTypeFieldRefInput<$PrismaModel>
    in?: $Enums.ImageType[] | ListEnumImageTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ImageType[] | ListEnumImageTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumImageTypeFilter<$PrismaModel> | $Enums.ImageType
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

  export type NestedEnumImageTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ImageType | EnumImageTypeFieldRefInput<$PrismaModel>
    in?: $Enums.ImageType[] | ListEnumImageTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ImageType[] | ListEnumImageTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumImageTypeWithAggregatesFilter<$PrismaModel> | $Enums.ImageType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumImageTypeFilter<$PrismaModel>
    _max?: NestedEnumImageTypeFilter<$PrismaModel>
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

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
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

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
    isSet?: boolean
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
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

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    isSet?: boolean
  }
  export type NestedJsonFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
  }

  export type NestedEnumproductStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.productStatus | EnumproductStatusFieldRefInput<$PrismaModel>
    in?: $Enums.productStatus[] | ListEnumproductStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.productStatus[] | ListEnumproductStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumproductStatusFilter<$PrismaModel> | $Enums.productStatus
  }

  export type NestedBoolNullableFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableFilter<$PrismaModel> | boolean | null
    isSet?: boolean
  }

  export type NestedEnumproductStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.productStatus | EnumproductStatusFieldRefInput<$PrismaModel>
    in?: $Enums.productStatus[] | ListEnumproductStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.productStatus[] | ListEnumproductStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumproductStatusWithAggregatesFilter<$PrismaModel> | $Enums.productStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumproductStatusFilter<$PrismaModel>
    _max?: NestedEnumproductStatusFilter<$PrismaModel>
  }

  export type NestedBoolNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableWithAggregatesFilter<$PrismaModel> | boolean | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBoolNullableFilter<$PrismaModel>
    _max?: NestedBoolNullableFilter<$PrismaModel>
    isSet?: boolean
  }

  export type NestedEnumsellerEventTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.sellerEventType | EnumsellerEventTypeFieldRefInput<$PrismaModel>
    in?: $Enums.sellerEventType[] | ListEnumsellerEventTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.sellerEventType[] | ListEnumsellerEventTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumsellerEventTypeFilter<$PrismaModel> | $Enums.sellerEventType
  }

  export type NestedEnumsellerEventTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.sellerEventType | EnumsellerEventTypeFieldRefInput<$PrismaModel>
    in?: $Enums.sellerEventType[] | ListEnumsellerEventTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.sellerEventType[] | ListEnumsellerEventTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumsellerEventTypeWithAggregatesFilter<$PrismaModel> | $Enums.sellerEventType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumsellerEventTypeFilter<$PrismaModel>
    _max?: NestedEnumsellerEventTypeFilter<$PrismaModel>
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
    isSet?: boolean
  }

  export type productsCreateWithoutAdminInput = {
    id?: string
    title: string
    slug?: string | null
    isCatalog?: boolean
    category: string
    subCategory: string
    short_description: string
    tags?: productsCreatetagsInput | string[]
    sizes?: productsCreatesizesInput | string[]
    sizePricing?: InputJsonValue | null
    cuttingTypePricing?: InputJsonValue | null
    pieceSizePricing?: InputJsonValue | null
    cuttingTypes?: productsCreatecuttingTypesInput | string[]
    pieceSizes?: productsCreatepieceSizesInput | string[]
    processingWeightLoss?: string | null
    stock: number
    sale_price: number
    regular_price: number
    totalSold?: number
    ratings?: number
    cashOnDelivery?: string | null
    discount_codes?: productsCreatediscount_codesInput | string[]
    status?: $Enums.productStatus
    isDeleted?: boolean | null
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    images?: imagesCreateNestedManyWithoutProductInput
    favorites?: favoritesCreateNestedManyWithoutProductInput
    store?: storesCreateNestedOneWithoutProductsInput
    catalogProduct?: productsCreateNestedOneWithoutStoreVariantsInput
    storeVariants?: productsCreateNestedManyWithoutCatalogProductInput
  }

  export type productsUncheckedCreateWithoutAdminInput = {
    id?: string
    title: string
    slug?: string | null
    isCatalog?: boolean
    category: string
    subCategory: string
    short_description: string
    tags?: productsCreatetagsInput | string[]
    sizes?: productsCreatesizesInput | string[]
    sizePricing?: InputJsonValue | null
    cuttingTypePricing?: InputJsonValue | null
    pieceSizePricing?: InputJsonValue | null
    cuttingTypes?: productsCreatecuttingTypesInput | string[]
    pieceSizes?: productsCreatepieceSizesInput | string[]
    processingWeightLoss?: string | null
    stock: number
    sale_price: number
    regular_price: number
    totalSold?: number
    ratings?: number
    cashOnDelivery?: string | null
    discount_codes?: productsCreatediscount_codesInput | string[]
    status?: $Enums.productStatus
    isDeleted?: boolean | null
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    storeId?: string | null
    catalogProductId?: string | null
    images?: imagesUncheckedCreateNestedManyWithoutProductInput
    favorites?: favoritesUncheckedCreateNestedManyWithoutProductInput
    storeVariants?: productsUncheckedCreateNestedManyWithoutCatalogProductInput
  }

  export type productsCreateOrConnectWithoutAdminInput = {
    where: productsWhereUniqueInput
    create: XOR<productsCreateWithoutAdminInput, productsUncheckedCreateWithoutAdminInput>
  }

  export type productsCreateManyAdminInputEnvelope = {
    data: productsCreateManyAdminInput | productsCreateManyAdminInput[]
  }

  export type discount_codesCreateWithoutAdminInput = {
    id?: string
    public_name: string
    discountType: string
    discountValue: number
    minOrderValue?: number
    discountCode: string
    expiresAt?: Date | string | null
    maxUses?: number | null
    maxUsesPerUser?: number
    usedCount?: number
    isActive?: boolean
    isFirstOrder?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    seller?: sellersCreateNestedOneWithoutCouponsInput
    usages?: coupon_usagesCreateNestedManyWithoutCouponInput
  }

  export type discount_codesUncheckedCreateWithoutAdminInput = {
    id?: string
    public_name: string
    discountType: string
    discountValue: number
    minOrderValue?: number
    discountCode: string
    expiresAt?: Date | string | null
    maxUses?: number | null
    maxUsesPerUser?: number
    usedCount?: number
    isActive?: boolean
    isFirstOrder?: boolean
    sellerId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    usages?: coupon_usagesUncheckedCreateNestedManyWithoutCouponInput
  }

  export type discount_codesCreateOrConnectWithoutAdminInput = {
    where: discount_codesWhereUniqueInput
    create: XOR<discount_codesCreateWithoutAdminInput, discount_codesUncheckedCreateWithoutAdminInput>
  }

  export type discount_codesCreateManyAdminInputEnvelope = {
    data: discount_codesCreateManyAdminInput | discount_codesCreateManyAdminInput[]
  }

  export type bannersCreateWithoutAdminInput = {
    id?: string
    imageUrl: string
    fileId: string
    isActive?: boolean
    category?: string | null
    status?: string | null
    rejectionReason?: string | null
    bannerType?: string | null
    title?: string | null
    subtitle?: string | null
    price?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    seller?: sellersCreateNestedOneWithoutBannersInput
  }

  export type bannersUncheckedCreateWithoutAdminInput = {
    id?: string
    imageUrl: string
    fileId: string
    isActive?: boolean
    category?: string | null
    status?: string | null
    rejectionReason?: string | null
    bannerType?: string | null
    title?: string | null
    subtitle?: string | null
    price?: string | null
    sellerId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type bannersCreateOrConnectWithoutAdminInput = {
    where: bannersWhereUniqueInput
    create: XOR<bannersCreateWithoutAdminInput, bannersUncheckedCreateWithoutAdminInput>
  }

  export type bannersCreateManyAdminInputEnvelope = {
    data: bannersCreateManyAdminInput | bannersCreateManyAdminInput[]
  }

  export type productsUpsertWithWhereUniqueWithoutAdminInput = {
    where: productsWhereUniqueInput
    update: XOR<productsUpdateWithoutAdminInput, productsUncheckedUpdateWithoutAdminInput>
    create: XOR<productsCreateWithoutAdminInput, productsUncheckedCreateWithoutAdminInput>
  }

  export type productsUpdateWithWhereUniqueWithoutAdminInput = {
    where: productsWhereUniqueInput
    data: XOR<productsUpdateWithoutAdminInput, productsUncheckedUpdateWithoutAdminInput>
  }

  export type productsUpdateManyWithWhereWithoutAdminInput = {
    where: productsScalarWhereInput
    data: XOR<productsUpdateManyMutationInput, productsUncheckedUpdateManyWithoutAdminInput>
  }

  export type productsScalarWhereInput = {
    AND?: productsScalarWhereInput | productsScalarWhereInput[]
    OR?: productsScalarWhereInput[]
    NOT?: productsScalarWhereInput | productsScalarWhereInput[]
    id?: StringFilter<"products"> | string
    title?: StringFilter<"products"> | string
    slug?: StringNullableFilter<"products"> | string | null
    isCatalog?: BoolFilter<"products"> | boolean
    category?: StringFilter<"products"> | string
    subCategory?: StringFilter<"products"> | string
    short_description?: StringFilter<"products"> | string
    tags?: StringNullableListFilter<"products">
    sizes?: StringNullableListFilter<"products">
    sizePricing?: JsonNullableFilter<"products">
    cuttingTypePricing?: JsonNullableFilter<"products">
    pieceSizePricing?: JsonNullableFilter<"products">
    cuttingTypes?: StringNullableListFilter<"products">
    pieceSizes?: StringNullableListFilter<"products">
    processingWeightLoss?: StringNullableFilter<"products"> | string | null
    stock?: IntFilter<"products"> | number
    sale_price?: FloatFilter<"products"> | number
    regular_price?: FloatFilter<"products"> | number
    totalSold?: IntFilter<"products"> | number
    ratings?: FloatFilter<"products"> | number
    cashOnDelivery?: StringNullableFilter<"products"> | string | null
    discount_codes?: StringNullableListFilter<"products">
    status?: EnumproductStatusFilter<"products"> | $Enums.productStatus
    isDeleted?: BoolNullableFilter<"products"> | boolean | null
    deletedAt?: DateTimeNullableFilter<"products"> | Date | string | null
    createdAt?: DateTimeFilter<"products"> | Date | string
    updatedAt?: DateTimeFilter<"products"> | Date | string
    storeId?: StringNullableFilter<"products"> | string | null
    adminId?: StringNullableFilter<"products"> | string | null
    catalogProductId?: StringNullableFilter<"products"> | string | null
  }

  export type discount_codesUpsertWithWhereUniqueWithoutAdminInput = {
    where: discount_codesWhereUniqueInput
    update: XOR<discount_codesUpdateWithoutAdminInput, discount_codesUncheckedUpdateWithoutAdminInput>
    create: XOR<discount_codesCreateWithoutAdminInput, discount_codesUncheckedCreateWithoutAdminInput>
  }

  export type discount_codesUpdateWithWhereUniqueWithoutAdminInput = {
    where: discount_codesWhereUniqueInput
    data: XOR<discount_codesUpdateWithoutAdminInput, discount_codesUncheckedUpdateWithoutAdminInput>
  }

  export type discount_codesUpdateManyWithWhereWithoutAdminInput = {
    where: discount_codesScalarWhereInput
    data: XOR<discount_codesUpdateManyMutationInput, discount_codesUncheckedUpdateManyWithoutAdminInput>
  }

  export type discount_codesScalarWhereInput = {
    AND?: discount_codesScalarWhereInput | discount_codesScalarWhereInput[]
    OR?: discount_codesScalarWhereInput[]
    NOT?: discount_codesScalarWhereInput | discount_codesScalarWhereInput[]
    id?: StringFilter<"discount_codes"> | string
    public_name?: StringFilter<"discount_codes"> | string
    discountType?: StringFilter<"discount_codes"> | string
    discountValue?: FloatFilter<"discount_codes"> | number
    minOrderValue?: FloatFilter<"discount_codes"> | number
    discountCode?: StringFilter<"discount_codes"> | string
    expiresAt?: DateTimeNullableFilter<"discount_codes"> | Date | string | null
    maxUses?: IntNullableFilter<"discount_codes"> | number | null
    maxUsesPerUser?: IntFilter<"discount_codes"> | number
    usedCount?: IntFilter<"discount_codes"> | number
    isActive?: BoolFilter<"discount_codes"> | boolean
    isFirstOrder?: BoolFilter<"discount_codes"> | boolean
    sellerId?: StringNullableFilter<"discount_codes"> | string | null
    adminId?: StringNullableFilter<"discount_codes"> | string | null
    createdAt?: DateTimeFilter<"discount_codes"> | Date | string
    updatedAt?: DateTimeFilter<"discount_codes"> | Date | string
  }

  export type bannersUpsertWithWhereUniqueWithoutAdminInput = {
    where: bannersWhereUniqueInput
    update: XOR<bannersUpdateWithoutAdminInput, bannersUncheckedUpdateWithoutAdminInput>
    create: XOR<bannersCreateWithoutAdminInput, bannersUncheckedCreateWithoutAdminInput>
  }

  export type bannersUpdateWithWhereUniqueWithoutAdminInput = {
    where: bannersWhereUniqueInput
    data: XOR<bannersUpdateWithoutAdminInput, bannersUncheckedUpdateWithoutAdminInput>
  }

  export type bannersUpdateManyWithWhereWithoutAdminInput = {
    where: bannersScalarWhereInput
    data: XOR<bannersUpdateManyMutationInput, bannersUncheckedUpdateManyWithoutAdminInput>
  }

  export type bannersScalarWhereInput = {
    AND?: bannersScalarWhereInput | bannersScalarWhereInput[]
    OR?: bannersScalarWhereInput[]
    NOT?: bannersScalarWhereInput | bannersScalarWhereInput[]
    id?: StringFilter<"banners"> | string
    imageUrl?: StringFilter<"banners"> | string
    fileId?: StringFilter<"banners"> | string
    isActive?: BoolFilter<"banners"> | boolean
    category?: StringNullableFilter<"banners"> | string | null
    status?: StringNullableFilter<"banners"> | string | null
    rejectionReason?: StringNullableFilter<"banners"> | string | null
    bannerType?: StringNullableFilter<"banners"> | string | null
    title?: StringNullableFilter<"banners"> | string | null
    subtitle?: StringNullableFilter<"banners"> | string | null
    price?: StringNullableFilter<"banners"> | string | null
    sellerId?: StringNullableFilter<"banners"> | string | null
    adminId?: StringNullableFilter<"banners"> | string | null
    createdAt?: DateTimeFilter<"banners"> | Date | string
    updatedAt?: DateTimeFilter<"banners"> | Date | string
  }

  export type productsCreateWithoutImagesInput = {
    id?: string
    title: string
    slug?: string | null
    isCatalog?: boolean
    category: string
    subCategory: string
    short_description: string
    tags?: productsCreatetagsInput | string[]
    sizes?: productsCreatesizesInput | string[]
    sizePricing?: InputJsonValue | null
    cuttingTypePricing?: InputJsonValue | null
    pieceSizePricing?: InputJsonValue | null
    cuttingTypes?: productsCreatecuttingTypesInput | string[]
    pieceSizes?: productsCreatepieceSizesInput | string[]
    processingWeightLoss?: string | null
    stock: number
    sale_price: number
    regular_price: number
    totalSold?: number
    ratings?: number
    cashOnDelivery?: string | null
    discount_codes?: productsCreatediscount_codesInput | string[]
    status?: $Enums.productStatus
    isDeleted?: boolean | null
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    favorites?: favoritesCreateNestedManyWithoutProductInput
    store?: storesCreateNestedOneWithoutProductsInput
    admin?: adminsCreateNestedOneWithoutProductsInput
    catalogProduct?: productsCreateNestedOneWithoutStoreVariantsInput
    storeVariants?: productsCreateNestedManyWithoutCatalogProductInput
  }

  export type productsUncheckedCreateWithoutImagesInput = {
    id?: string
    title: string
    slug?: string | null
    isCatalog?: boolean
    category: string
    subCategory: string
    short_description: string
    tags?: productsCreatetagsInput | string[]
    sizes?: productsCreatesizesInput | string[]
    sizePricing?: InputJsonValue | null
    cuttingTypePricing?: InputJsonValue | null
    pieceSizePricing?: InputJsonValue | null
    cuttingTypes?: productsCreatecuttingTypesInput | string[]
    pieceSizes?: productsCreatepieceSizesInput | string[]
    processingWeightLoss?: string | null
    stock: number
    sale_price: number
    regular_price: number
    totalSold?: number
    ratings?: number
    cashOnDelivery?: string | null
    discount_codes?: productsCreatediscount_codesInput | string[]
    status?: $Enums.productStatus
    isDeleted?: boolean | null
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    storeId?: string | null
    adminId?: string | null
    catalogProductId?: string | null
    favorites?: favoritesUncheckedCreateNestedManyWithoutProductInput
    storeVariants?: productsUncheckedCreateNestedManyWithoutCatalogProductInput
  }

  export type productsCreateOrConnectWithoutImagesInput = {
    where: productsWhereUniqueInput
    create: XOR<productsCreateWithoutImagesInput, productsUncheckedCreateWithoutImagesInput>
  }

  export type usersCreateWithoutAvatarInput = {
    id?: string
    phone_number?: string | null
    email?: string | null
    name: string
    following?: usersCreatefollowingInput | string[]
    addresses?: usersCreateaddressesInput | InputJsonValue[]
    createdAt?: Date | string
    updatedAt?: Date | string
    favorites?: favoritesCreateNestedManyWithoutUserInput
  }

  export type usersUncheckedCreateWithoutAvatarInput = {
    id?: string
    phone_number?: string | null
    email?: string | null
    name: string
    following?: usersCreatefollowingInput | string[]
    addresses?: usersCreateaddressesInput | InputJsonValue[]
    createdAt?: Date | string
    updatedAt?: Date | string
    favorites?: favoritesUncheckedCreateNestedManyWithoutUserInput
  }

  export type usersCreateOrConnectWithoutAvatarInput = {
    where: usersWhereUniqueInput
    create: XOR<usersCreateWithoutAvatarInput, usersUncheckedCreateWithoutAvatarInput>
  }

  export type usersCreateManyAvatarInputEnvelope = {
    data: usersCreateManyAvatarInput | usersCreateManyAvatarInput[]
  }

  export type storesCreateWithoutAvatarInput = {
    id?: string
    name: string
    bio: string
    address: string
    city: string
    pincode: string
    opening_hours: string
    closing_hours: string
    is_instant_delivery_enabled?: boolean
    instant_delivery_fee?: number
    instant_delivery_window_start?: string
    instant_delivery_window_end?: string
    availableCities?: storesCreateavailableCitiesInput | string[]
    cityDeliveryTimes?: InputJsonValue | null
    state?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    seller: sellersCreateNestedOneWithoutStoreInput
    products?: productsCreateNestedManyWithoutStoreInput
  }

  export type storesUncheckedCreateWithoutAvatarInput = {
    id?: string
    name: string
    bio: string
    address: string
    city: string
    pincode: string
    opening_hours: string
    closing_hours: string
    is_instant_delivery_enabled?: boolean
    instant_delivery_fee?: number
    instant_delivery_window_start?: string
    instant_delivery_window_end?: string
    availableCities?: storesCreateavailableCitiesInput | string[]
    cityDeliveryTimes?: InputJsonValue | null
    state?: string | null
    sellerId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    products?: productsUncheckedCreateNestedManyWithoutStoreInput
  }

  export type storesCreateOrConnectWithoutAvatarInput = {
    where: storesWhereUniqueInput
    create: XOR<storesCreateWithoutAvatarInput, storesUncheckedCreateWithoutAvatarInput>
  }

  export type storesCreateManyAvatarInputEnvelope = {
    data: storesCreateManyAvatarInput | storesCreateManyAvatarInput[]
  }

  export type productsUpsertWithoutImagesInput = {
    update: XOR<productsUpdateWithoutImagesInput, productsUncheckedUpdateWithoutImagesInput>
    create: XOR<productsCreateWithoutImagesInput, productsUncheckedCreateWithoutImagesInput>
    where?: productsWhereInput
  }

  export type productsUpdateToOneWithWhereWithoutImagesInput = {
    where?: productsWhereInput
    data: XOR<productsUpdateWithoutImagesInput, productsUncheckedUpdateWithoutImagesInput>
  }

  export type productsUpdateWithoutImagesInput = {
    title?: StringFieldUpdateOperationsInput | string
    slug?: NullableStringFieldUpdateOperationsInput | string | null
    isCatalog?: BoolFieldUpdateOperationsInput | boolean
    category?: StringFieldUpdateOperationsInput | string
    subCategory?: StringFieldUpdateOperationsInput | string
    short_description?: StringFieldUpdateOperationsInput | string
    tags?: productsUpdatetagsInput | string[]
    sizes?: productsUpdatesizesInput | string[]
    sizePricing?: InputJsonValue | InputJsonValue | null
    cuttingTypePricing?: InputJsonValue | InputJsonValue | null
    pieceSizePricing?: InputJsonValue | InputJsonValue | null
    cuttingTypes?: productsUpdatecuttingTypesInput | string[]
    pieceSizes?: productsUpdatepieceSizesInput | string[]
    processingWeightLoss?: NullableStringFieldUpdateOperationsInput | string | null
    stock?: IntFieldUpdateOperationsInput | number
    sale_price?: FloatFieldUpdateOperationsInput | number
    regular_price?: FloatFieldUpdateOperationsInput | number
    totalSold?: IntFieldUpdateOperationsInput | number
    ratings?: FloatFieldUpdateOperationsInput | number
    cashOnDelivery?: NullableStringFieldUpdateOperationsInput | string | null
    discount_codes?: productsUpdatediscount_codesInput | string[]
    status?: EnumproductStatusFieldUpdateOperationsInput | $Enums.productStatus
    isDeleted?: NullableBoolFieldUpdateOperationsInput | boolean | null
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    favorites?: favoritesUpdateManyWithoutProductNestedInput
    store?: storesUpdateOneWithoutProductsNestedInput
    admin?: adminsUpdateOneWithoutProductsNestedInput
    catalogProduct?: productsUpdateOneWithoutStoreVariantsNestedInput
    storeVariants?: productsUpdateManyWithoutCatalogProductNestedInput
  }

  export type productsUncheckedUpdateWithoutImagesInput = {
    title?: StringFieldUpdateOperationsInput | string
    slug?: NullableStringFieldUpdateOperationsInput | string | null
    isCatalog?: BoolFieldUpdateOperationsInput | boolean
    category?: StringFieldUpdateOperationsInput | string
    subCategory?: StringFieldUpdateOperationsInput | string
    short_description?: StringFieldUpdateOperationsInput | string
    tags?: productsUpdatetagsInput | string[]
    sizes?: productsUpdatesizesInput | string[]
    sizePricing?: InputJsonValue | InputJsonValue | null
    cuttingTypePricing?: InputJsonValue | InputJsonValue | null
    pieceSizePricing?: InputJsonValue | InputJsonValue | null
    cuttingTypes?: productsUpdatecuttingTypesInput | string[]
    pieceSizes?: productsUpdatepieceSizesInput | string[]
    processingWeightLoss?: NullableStringFieldUpdateOperationsInput | string | null
    stock?: IntFieldUpdateOperationsInput | number
    sale_price?: FloatFieldUpdateOperationsInput | number
    regular_price?: FloatFieldUpdateOperationsInput | number
    totalSold?: IntFieldUpdateOperationsInput | number
    ratings?: FloatFieldUpdateOperationsInput | number
    cashOnDelivery?: NullableStringFieldUpdateOperationsInput | string | null
    discount_codes?: productsUpdatediscount_codesInput | string[]
    status?: EnumproductStatusFieldUpdateOperationsInput | $Enums.productStatus
    isDeleted?: NullableBoolFieldUpdateOperationsInput | boolean | null
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    storeId?: NullableStringFieldUpdateOperationsInput | string | null
    adminId?: NullableStringFieldUpdateOperationsInput | string | null
    catalogProductId?: NullableStringFieldUpdateOperationsInput | string | null
    favorites?: favoritesUncheckedUpdateManyWithoutProductNestedInput
    storeVariants?: productsUncheckedUpdateManyWithoutCatalogProductNestedInput
  }

  export type usersUpsertWithWhereUniqueWithoutAvatarInput = {
    where: usersWhereUniqueInput
    update: XOR<usersUpdateWithoutAvatarInput, usersUncheckedUpdateWithoutAvatarInput>
    create: XOR<usersCreateWithoutAvatarInput, usersUncheckedCreateWithoutAvatarInput>
  }

  export type usersUpdateWithWhereUniqueWithoutAvatarInput = {
    where: usersWhereUniqueInput
    data: XOR<usersUpdateWithoutAvatarInput, usersUncheckedUpdateWithoutAvatarInput>
  }

  export type usersUpdateManyWithWhereWithoutAvatarInput = {
    where: usersScalarWhereInput
    data: XOR<usersUpdateManyMutationInput, usersUncheckedUpdateManyWithoutAvatarInput>
  }

  export type usersScalarWhereInput = {
    AND?: usersScalarWhereInput | usersScalarWhereInput[]
    OR?: usersScalarWhereInput[]
    NOT?: usersScalarWhereInput | usersScalarWhereInput[]
    id?: StringFilter<"users"> | string
    phone_number?: StringNullableFilter<"users"> | string | null
    email?: StringNullableFilter<"users"> | string | null
    name?: StringFilter<"users"> | string
    following?: StringNullableListFilter<"users">
    addresses?: JsonNullableListFilter<"users">
    avatarId?: StringNullableFilter<"users"> | string | null
    createdAt?: DateTimeFilter<"users"> | Date | string
    updatedAt?: DateTimeFilter<"users"> | Date | string
  }

  export type storesUpsertWithWhereUniqueWithoutAvatarInput = {
    where: storesWhereUniqueInput
    update: XOR<storesUpdateWithoutAvatarInput, storesUncheckedUpdateWithoutAvatarInput>
    create: XOR<storesCreateWithoutAvatarInput, storesUncheckedCreateWithoutAvatarInput>
  }

  export type storesUpdateWithWhereUniqueWithoutAvatarInput = {
    where: storesWhereUniqueInput
    data: XOR<storesUpdateWithoutAvatarInput, storesUncheckedUpdateWithoutAvatarInput>
  }

  export type storesUpdateManyWithWhereWithoutAvatarInput = {
    where: storesScalarWhereInput
    data: XOR<storesUpdateManyMutationInput, storesUncheckedUpdateManyWithoutAvatarInput>
  }

  export type storesScalarWhereInput = {
    AND?: storesScalarWhereInput | storesScalarWhereInput[]
    OR?: storesScalarWhereInput[]
    NOT?: storesScalarWhereInput | storesScalarWhereInput[]
    id?: StringFilter<"stores"> | string
    name?: StringFilter<"stores"> | string
    bio?: StringFilter<"stores"> | string
    avatarId?: StringNullableFilter<"stores"> | string | null
    address?: StringFilter<"stores"> | string
    city?: StringFilter<"stores"> | string
    pincode?: StringFilter<"stores"> | string
    opening_hours?: StringFilter<"stores"> | string
    closing_hours?: StringFilter<"stores"> | string
    is_instant_delivery_enabled?: BoolFilter<"stores"> | boolean
    instant_delivery_fee?: FloatFilter<"stores"> | number
    instant_delivery_window_start?: StringFilter<"stores"> | string
    instant_delivery_window_end?: StringFilter<"stores"> | string
    availableCities?: StringNullableListFilter<"stores">
    cityDeliveryTimes?: JsonNullableFilter<"stores">
    state?: StringNullableFilter<"stores"> | string | null
    sellerId?: StringFilter<"stores"> | string
    createdAt?: DateTimeFilter<"stores"> | Date | string
    updatedAt?: DateTimeFilter<"stores"> | Date | string
  }

  export type imagesCreateWithoutUsersInput = {
    id?: string
    file_id: string
    url: string
    type?: $Enums.ImageType
    createdAt?: Date | string
    product?: productsCreateNestedOneWithoutImagesInput
    stores?: storesCreateNestedManyWithoutAvatarInput
  }

  export type imagesUncheckedCreateWithoutUsersInput = {
    id?: string
    file_id: string
    url: string
    type?: $Enums.ImageType
    productId?: string | null
    createdAt?: Date | string
    stores?: storesUncheckedCreateNestedManyWithoutAvatarInput
  }

  export type imagesCreateOrConnectWithoutUsersInput = {
    where: imagesWhereUniqueInput
    create: XOR<imagesCreateWithoutUsersInput, imagesUncheckedCreateWithoutUsersInput>
  }

  export type favoritesCreateWithoutUserInput = {
    id?: string
    createdAt?: Date | string
    product: productsCreateNestedOneWithoutFavoritesInput
  }

  export type favoritesUncheckedCreateWithoutUserInput = {
    id?: string
    productId: string
    createdAt?: Date | string
  }

  export type favoritesCreateOrConnectWithoutUserInput = {
    where: favoritesWhereUniqueInput
    create: XOR<favoritesCreateWithoutUserInput, favoritesUncheckedCreateWithoutUserInput>
  }

  export type favoritesCreateManyUserInputEnvelope = {
    data: favoritesCreateManyUserInput | favoritesCreateManyUserInput[]
  }

  export type imagesUpsertWithoutUsersInput = {
    update: XOR<imagesUpdateWithoutUsersInput, imagesUncheckedUpdateWithoutUsersInput>
    create: XOR<imagesCreateWithoutUsersInput, imagesUncheckedCreateWithoutUsersInput>
    where?: imagesWhereInput
  }

  export type imagesUpdateToOneWithWhereWithoutUsersInput = {
    where?: imagesWhereInput
    data: XOR<imagesUpdateWithoutUsersInput, imagesUncheckedUpdateWithoutUsersInput>
  }

  export type imagesUpdateWithoutUsersInput = {
    file_id?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    type?: EnumImageTypeFieldUpdateOperationsInput | $Enums.ImageType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    product?: productsUpdateOneWithoutImagesNestedInput
    stores?: storesUpdateManyWithoutAvatarNestedInput
  }

  export type imagesUncheckedUpdateWithoutUsersInput = {
    file_id?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    type?: EnumImageTypeFieldUpdateOperationsInput | $Enums.ImageType
    productId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    stores?: storesUncheckedUpdateManyWithoutAvatarNestedInput
  }

  export type favoritesUpsertWithWhereUniqueWithoutUserInput = {
    where: favoritesWhereUniqueInput
    update: XOR<favoritesUpdateWithoutUserInput, favoritesUncheckedUpdateWithoutUserInput>
    create: XOR<favoritesCreateWithoutUserInput, favoritesUncheckedCreateWithoutUserInput>
  }

  export type favoritesUpdateWithWhereUniqueWithoutUserInput = {
    where: favoritesWhereUniqueInput
    data: XOR<favoritesUpdateWithoutUserInput, favoritesUncheckedUpdateWithoutUserInput>
  }

  export type favoritesUpdateManyWithWhereWithoutUserInput = {
    where: favoritesScalarWhereInput
    data: XOR<favoritesUpdateManyMutationInput, favoritesUncheckedUpdateManyWithoutUserInput>
  }

  export type favoritesScalarWhereInput = {
    AND?: favoritesScalarWhereInput | favoritesScalarWhereInput[]
    OR?: favoritesScalarWhereInput[]
    NOT?: favoritesScalarWhereInput | favoritesScalarWhereInput[]
    id?: StringFilter<"favorites"> | string
    userId?: StringFilter<"favorites"> | string
    productId?: StringFilter<"favorites"> | string
    createdAt?: DateTimeFilter<"favorites"> | Date | string
  }

  export type sellersCreateWithoutCouponsInput = {
    id?: string
    name: string
    email: string
    phone_number: string
    password: string
    following?: sellersCreatefollowingInput | string[]
    isApprovedByAdmin?: boolean
    permissions?: InputJsonValue | null
    createdAt?: Date | string
    updatedAt?: Date | string
    banners?: bannersCreateNestedManyWithoutSellerInput
    events?: seller_eventsCreateNestedManyWithoutSellerInput
    store?: storesCreateNestedOneWithoutSellerInput
    staffs?: staffsCreateNestedManyWithoutSellerInput
  }

  export type sellersUncheckedCreateWithoutCouponsInput = {
    id?: string
    name: string
    email: string
    phone_number: string
    password: string
    following?: sellersCreatefollowingInput | string[]
    isApprovedByAdmin?: boolean
    permissions?: InputJsonValue | null
    createdAt?: Date | string
    updatedAt?: Date | string
    banners?: bannersUncheckedCreateNestedManyWithoutSellerInput
    events?: seller_eventsUncheckedCreateNestedManyWithoutSellerInput
    store?: storesUncheckedCreateNestedOneWithoutSellerInput
    staffs?: staffsUncheckedCreateNestedManyWithoutSellerInput
  }

  export type sellersCreateOrConnectWithoutCouponsInput = {
    where: sellersWhereUniqueInput
    create: XOR<sellersCreateWithoutCouponsInput, sellersUncheckedCreateWithoutCouponsInput>
  }

  export type adminsCreateWithoutCouponsInput = {
    id?: string
    name: string
    email: string
    password: string
    createdAt?: Date | string
    updatedAt?: Date | string
    products?: productsCreateNestedManyWithoutAdminInput
    banners?: bannersCreateNestedManyWithoutAdminInput
  }

  export type adminsUncheckedCreateWithoutCouponsInput = {
    id?: string
    name: string
    email: string
    password: string
    createdAt?: Date | string
    updatedAt?: Date | string
    products?: productsUncheckedCreateNestedManyWithoutAdminInput
    banners?: bannersUncheckedCreateNestedManyWithoutAdminInput
  }

  export type adminsCreateOrConnectWithoutCouponsInput = {
    where: adminsWhereUniqueInput
    create: XOR<adminsCreateWithoutCouponsInput, adminsUncheckedCreateWithoutCouponsInput>
  }

  export type coupon_usagesCreateWithoutCouponInput = {
    id?: string
    userId: string
    orderId: string
    usedAt?: Date | string
  }

  export type coupon_usagesUncheckedCreateWithoutCouponInput = {
    id?: string
    userId: string
    orderId: string
    usedAt?: Date | string
  }

  export type coupon_usagesCreateOrConnectWithoutCouponInput = {
    where: coupon_usagesWhereUniqueInput
    create: XOR<coupon_usagesCreateWithoutCouponInput, coupon_usagesUncheckedCreateWithoutCouponInput>
  }

  export type coupon_usagesCreateManyCouponInputEnvelope = {
    data: coupon_usagesCreateManyCouponInput | coupon_usagesCreateManyCouponInput[]
  }

  export type sellersUpsertWithoutCouponsInput = {
    update: XOR<sellersUpdateWithoutCouponsInput, sellersUncheckedUpdateWithoutCouponsInput>
    create: XOR<sellersCreateWithoutCouponsInput, sellersUncheckedCreateWithoutCouponsInput>
    where?: sellersWhereInput
  }

  export type sellersUpdateToOneWithWhereWithoutCouponsInput = {
    where?: sellersWhereInput
    data: XOR<sellersUpdateWithoutCouponsInput, sellersUncheckedUpdateWithoutCouponsInput>
  }

  export type sellersUpdateWithoutCouponsInput = {
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone_number?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    following?: sellersUpdatefollowingInput | string[]
    isApprovedByAdmin?: BoolFieldUpdateOperationsInput | boolean
    permissions?: InputJsonValue | InputJsonValue | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    banners?: bannersUpdateManyWithoutSellerNestedInput
    events?: seller_eventsUpdateManyWithoutSellerNestedInput
    store?: storesUpdateOneWithoutSellerNestedInput
    staffs?: staffsUpdateManyWithoutSellerNestedInput
  }

  export type sellersUncheckedUpdateWithoutCouponsInput = {
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone_number?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    following?: sellersUpdatefollowingInput | string[]
    isApprovedByAdmin?: BoolFieldUpdateOperationsInput | boolean
    permissions?: InputJsonValue | InputJsonValue | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    banners?: bannersUncheckedUpdateManyWithoutSellerNestedInput
    events?: seller_eventsUncheckedUpdateManyWithoutSellerNestedInput
    store?: storesUncheckedUpdateOneWithoutSellerNestedInput
    staffs?: staffsUncheckedUpdateManyWithoutSellerNestedInput
  }

  export type adminsUpsertWithoutCouponsInput = {
    update: XOR<adminsUpdateWithoutCouponsInput, adminsUncheckedUpdateWithoutCouponsInput>
    create: XOR<adminsCreateWithoutCouponsInput, adminsUncheckedCreateWithoutCouponsInput>
    where?: adminsWhereInput
  }

  export type adminsUpdateToOneWithWhereWithoutCouponsInput = {
    where?: adminsWhereInput
    data: XOR<adminsUpdateWithoutCouponsInput, adminsUncheckedUpdateWithoutCouponsInput>
  }

  export type adminsUpdateWithoutCouponsInput = {
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    products?: productsUpdateManyWithoutAdminNestedInput
    banners?: bannersUpdateManyWithoutAdminNestedInput
  }

  export type adminsUncheckedUpdateWithoutCouponsInput = {
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    products?: productsUncheckedUpdateManyWithoutAdminNestedInput
    banners?: bannersUncheckedUpdateManyWithoutAdminNestedInput
  }

  export type coupon_usagesUpsertWithWhereUniqueWithoutCouponInput = {
    where: coupon_usagesWhereUniqueInput
    update: XOR<coupon_usagesUpdateWithoutCouponInput, coupon_usagesUncheckedUpdateWithoutCouponInput>
    create: XOR<coupon_usagesCreateWithoutCouponInput, coupon_usagesUncheckedCreateWithoutCouponInput>
  }

  export type coupon_usagesUpdateWithWhereUniqueWithoutCouponInput = {
    where: coupon_usagesWhereUniqueInput
    data: XOR<coupon_usagesUpdateWithoutCouponInput, coupon_usagesUncheckedUpdateWithoutCouponInput>
  }

  export type coupon_usagesUpdateManyWithWhereWithoutCouponInput = {
    where: coupon_usagesScalarWhereInput
    data: XOR<coupon_usagesUpdateManyMutationInput, coupon_usagesUncheckedUpdateManyWithoutCouponInput>
  }

  export type coupon_usagesScalarWhereInput = {
    AND?: coupon_usagesScalarWhereInput | coupon_usagesScalarWhereInput[]
    OR?: coupon_usagesScalarWhereInput[]
    NOT?: coupon_usagesScalarWhereInput | coupon_usagesScalarWhereInput[]
    id?: StringFilter<"coupon_usages"> | string
    couponId?: StringFilter<"coupon_usages"> | string
    userId?: StringFilter<"coupon_usages"> | string
    orderId?: StringFilter<"coupon_usages"> | string
    usedAt?: DateTimeFilter<"coupon_usages"> | Date | string
  }

  export type discount_codesCreateWithoutUsagesInput = {
    id?: string
    public_name: string
    discountType: string
    discountValue: number
    minOrderValue?: number
    discountCode: string
    expiresAt?: Date | string | null
    maxUses?: number | null
    maxUsesPerUser?: number
    usedCount?: number
    isActive?: boolean
    isFirstOrder?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    seller?: sellersCreateNestedOneWithoutCouponsInput
    admin?: adminsCreateNestedOneWithoutCouponsInput
  }

  export type discount_codesUncheckedCreateWithoutUsagesInput = {
    id?: string
    public_name: string
    discountType: string
    discountValue: number
    minOrderValue?: number
    discountCode: string
    expiresAt?: Date | string | null
    maxUses?: number | null
    maxUsesPerUser?: number
    usedCount?: number
    isActive?: boolean
    isFirstOrder?: boolean
    sellerId?: string | null
    adminId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type discount_codesCreateOrConnectWithoutUsagesInput = {
    where: discount_codesWhereUniqueInput
    create: XOR<discount_codesCreateWithoutUsagesInput, discount_codesUncheckedCreateWithoutUsagesInput>
  }

  export type discount_codesUpsertWithoutUsagesInput = {
    update: XOR<discount_codesUpdateWithoutUsagesInput, discount_codesUncheckedUpdateWithoutUsagesInput>
    create: XOR<discount_codesCreateWithoutUsagesInput, discount_codesUncheckedCreateWithoutUsagesInput>
    where?: discount_codesWhereInput
  }

  export type discount_codesUpdateToOneWithWhereWithoutUsagesInput = {
    where?: discount_codesWhereInput
    data: XOR<discount_codesUpdateWithoutUsagesInput, discount_codesUncheckedUpdateWithoutUsagesInput>
  }

  export type discount_codesUpdateWithoutUsagesInput = {
    public_name?: StringFieldUpdateOperationsInput | string
    discountType?: StringFieldUpdateOperationsInput | string
    discountValue?: FloatFieldUpdateOperationsInput | number
    minOrderValue?: FloatFieldUpdateOperationsInput | number
    discountCode?: StringFieldUpdateOperationsInput | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    maxUses?: NullableIntFieldUpdateOperationsInput | number | null
    maxUsesPerUser?: IntFieldUpdateOperationsInput | number
    usedCount?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isFirstOrder?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    seller?: sellersUpdateOneWithoutCouponsNestedInput
    admin?: adminsUpdateOneWithoutCouponsNestedInput
  }

  export type discount_codesUncheckedUpdateWithoutUsagesInput = {
    public_name?: StringFieldUpdateOperationsInput | string
    discountType?: StringFieldUpdateOperationsInput | string
    discountValue?: FloatFieldUpdateOperationsInput | number
    minOrderValue?: FloatFieldUpdateOperationsInput | number
    discountCode?: StringFieldUpdateOperationsInput | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    maxUses?: NullableIntFieldUpdateOperationsInput | number | null
    maxUsesPerUser?: IntFieldUpdateOperationsInput | number
    usedCount?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isFirstOrder?: BoolFieldUpdateOperationsInput | boolean
    sellerId?: NullableStringFieldUpdateOperationsInput | string | null
    adminId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type bannersCreateWithoutSellerInput = {
    id?: string
    imageUrl: string
    fileId: string
    isActive?: boolean
    category?: string | null
    status?: string | null
    rejectionReason?: string | null
    bannerType?: string | null
    title?: string | null
    subtitle?: string | null
    price?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    admin?: adminsCreateNestedOneWithoutBannersInput
  }

  export type bannersUncheckedCreateWithoutSellerInput = {
    id?: string
    imageUrl: string
    fileId: string
    isActive?: boolean
    category?: string | null
    status?: string | null
    rejectionReason?: string | null
    bannerType?: string | null
    title?: string | null
    subtitle?: string | null
    price?: string | null
    adminId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type bannersCreateOrConnectWithoutSellerInput = {
    where: bannersWhereUniqueInput
    create: XOR<bannersCreateWithoutSellerInput, bannersUncheckedCreateWithoutSellerInput>
  }

  export type bannersCreateManySellerInputEnvelope = {
    data: bannersCreateManySellerInput | bannersCreateManySellerInput[]
  }

  export type seller_eventsCreateWithoutSellerInput = {
    id?: string
    title: string
    description?: string | null
    type: $Enums.sellerEventType
    minOrder?: number | null
    discount?: number | null
    startTime: Date | string
    endTime: Date | string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type seller_eventsUncheckedCreateWithoutSellerInput = {
    id?: string
    title: string
    description?: string | null
    type: $Enums.sellerEventType
    minOrder?: number | null
    discount?: number | null
    startTime: Date | string
    endTime: Date | string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type seller_eventsCreateOrConnectWithoutSellerInput = {
    where: seller_eventsWhereUniqueInput
    create: XOR<seller_eventsCreateWithoutSellerInput, seller_eventsUncheckedCreateWithoutSellerInput>
  }

  export type seller_eventsCreateManySellerInputEnvelope = {
    data: seller_eventsCreateManySellerInput | seller_eventsCreateManySellerInput[]
  }

  export type storesCreateWithoutSellerInput = {
    id?: string
    name: string
    bio: string
    address: string
    city: string
    pincode: string
    opening_hours: string
    closing_hours: string
    is_instant_delivery_enabled?: boolean
    instant_delivery_fee?: number
    instant_delivery_window_start?: string
    instant_delivery_window_end?: string
    availableCities?: storesCreateavailableCitiesInput | string[]
    cityDeliveryTimes?: InputJsonValue | null
    state?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    avatar?: imagesCreateNestedOneWithoutStoresInput
    products?: productsCreateNestedManyWithoutStoreInput
  }

  export type storesUncheckedCreateWithoutSellerInput = {
    id?: string
    name: string
    bio: string
    avatarId?: string | null
    address: string
    city: string
    pincode: string
    opening_hours: string
    closing_hours: string
    is_instant_delivery_enabled?: boolean
    instant_delivery_fee?: number
    instant_delivery_window_start?: string
    instant_delivery_window_end?: string
    availableCities?: storesCreateavailableCitiesInput | string[]
    cityDeliveryTimes?: InputJsonValue | null
    state?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    products?: productsUncheckedCreateNestedManyWithoutStoreInput
  }

  export type storesCreateOrConnectWithoutSellerInput = {
    where: storesWhereUniqueInput
    create: XOR<storesCreateWithoutSellerInput, storesUncheckedCreateWithoutSellerInput>
  }

  export type discount_codesCreateWithoutSellerInput = {
    id?: string
    public_name: string
    discountType: string
    discountValue: number
    minOrderValue?: number
    discountCode: string
    expiresAt?: Date | string | null
    maxUses?: number | null
    maxUsesPerUser?: number
    usedCount?: number
    isActive?: boolean
    isFirstOrder?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    admin?: adminsCreateNestedOneWithoutCouponsInput
    usages?: coupon_usagesCreateNestedManyWithoutCouponInput
  }

  export type discount_codesUncheckedCreateWithoutSellerInput = {
    id?: string
    public_name: string
    discountType: string
    discountValue: number
    minOrderValue?: number
    discountCode: string
    expiresAt?: Date | string | null
    maxUses?: number | null
    maxUsesPerUser?: number
    usedCount?: number
    isActive?: boolean
    isFirstOrder?: boolean
    adminId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    usages?: coupon_usagesUncheckedCreateNestedManyWithoutCouponInput
  }

  export type discount_codesCreateOrConnectWithoutSellerInput = {
    where: discount_codesWhereUniqueInput
    create: XOR<discount_codesCreateWithoutSellerInput, discount_codesUncheckedCreateWithoutSellerInput>
  }

  export type discount_codesCreateManySellerInputEnvelope = {
    data: discount_codesCreateManySellerInput | discount_codesCreateManySellerInput[]
  }

  export type staffsCreateWithoutSellerInput = {
    id?: string
    name: string
    email: string
    password: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type staffsUncheckedCreateWithoutSellerInput = {
    id?: string
    name: string
    email: string
    password: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type staffsCreateOrConnectWithoutSellerInput = {
    where: staffsWhereUniqueInput
    create: XOR<staffsCreateWithoutSellerInput, staffsUncheckedCreateWithoutSellerInput>
  }

  export type staffsCreateManySellerInputEnvelope = {
    data: staffsCreateManySellerInput | staffsCreateManySellerInput[]
  }

  export type bannersUpsertWithWhereUniqueWithoutSellerInput = {
    where: bannersWhereUniqueInput
    update: XOR<bannersUpdateWithoutSellerInput, bannersUncheckedUpdateWithoutSellerInput>
    create: XOR<bannersCreateWithoutSellerInput, bannersUncheckedCreateWithoutSellerInput>
  }

  export type bannersUpdateWithWhereUniqueWithoutSellerInput = {
    where: bannersWhereUniqueInput
    data: XOR<bannersUpdateWithoutSellerInput, bannersUncheckedUpdateWithoutSellerInput>
  }

  export type bannersUpdateManyWithWhereWithoutSellerInput = {
    where: bannersScalarWhereInput
    data: XOR<bannersUpdateManyMutationInput, bannersUncheckedUpdateManyWithoutSellerInput>
  }

  export type seller_eventsUpsertWithWhereUniqueWithoutSellerInput = {
    where: seller_eventsWhereUniqueInput
    update: XOR<seller_eventsUpdateWithoutSellerInput, seller_eventsUncheckedUpdateWithoutSellerInput>
    create: XOR<seller_eventsCreateWithoutSellerInput, seller_eventsUncheckedCreateWithoutSellerInput>
  }

  export type seller_eventsUpdateWithWhereUniqueWithoutSellerInput = {
    where: seller_eventsWhereUniqueInput
    data: XOR<seller_eventsUpdateWithoutSellerInput, seller_eventsUncheckedUpdateWithoutSellerInput>
  }

  export type seller_eventsUpdateManyWithWhereWithoutSellerInput = {
    where: seller_eventsScalarWhereInput
    data: XOR<seller_eventsUpdateManyMutationInput, seller_eventsUncheckedUpdateManyWithoutSellerInput>
  }

  export type seller_eventsScalarWhereInput = {
    AND?: seller_eventsScalarWhereInput | seller_eventsScalarWhereInput[]
    OR?: seller_eventsScalarWhereInput[]
    NOT?: seller_eventsScalarWhereInput | seller_eventsScalarWhereInput[]
    id?: StringFilter<"seller_events"> | string
    sellerId?: StringFilter<"seller_events"> | string
    title?: StringFilter<"seller_events"> | string
    description?: StringNullableFilter<"seller_events"> | string | null
    type?: EnumsellerEventTypeFilter<"seller_events"> | $Enums.sellerEventType
    minOrder?: FloatNullableFilter<"seller_events"> | number | null
    discount?: FloatNullableFilter<"seller_events"> | number | null
    startTime?: DateTimeFilter<"seller_events"> | Date | string
    endTime?: DateTimeFilter<"seller_events"> | Date | string
    isActive?: BoolFilter<"seller_events"> | boolean
    createdAt?: DateTimeFilter<"seller_events"> | Date | string
    updatedAt?: DateTimeFilter<"seller_events"> | Date | string
  }

  export type storesUpsertWithoutSellerInput = {
    update: XOR<storesUpdateWithoutSellerInput, storesUncheckedUpdateWithoutSellerInput>
    create: XOR<storesCreateWithoutSellerInput, storesUncheckedCreateWithoutSellerInput>
    where?: storesWhereInput
  }

  export type storesUpdateToOneWithWhereWithoutSellerInput = {
    where?: storesWhereInput
    data: XOR<storesUpdateWithoutSellerInput, storesUncheckedUpdateWithoutSellerInput>
  }

  export type storesUpdateWithoutSellerInput = {
    name?: StringFieldUpdateOperationsInput | string
    bio?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    city?: StringFieldUpdateOperationsInput | string
    pincode?: StringFieldUpdateOperationsInput | string
    opening_hours?: StringFieldUpdateOperationsInput | string
    closing_hours?: StringFieldUpdateOperationsInput | string
    is_instant_delivery_enabled?: BoolFieldUpdateOperationsInput | boolean
    instant_delivery_fee?: FloatFieldUpdateOperationsInput | number
    instant_delivery_window_start?: StringFieldUpdateOperationsInput | string
    instant_delivery_window_end?: StringFieldUpdateOperationsInput | string
    availableCities?: storesUpdateavailableCitiesInput | string[]
    cityDeliveryTimes?: InputJsonValue | InputJsonValue | null
    state?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    avatar?: imagesUpdateOneWithoutStoresNestedInput
    products?: productsUpdateManyWithoutStoreNestedInput
  }

  export type storesUncheckedUpdateWithoutSellerInput = {
    name?: StringFieldUpdateOperationsInput | string
    bio?: StringFieldUpdateOperationsInput | string
    avatarId?: NullableStringFieldUpdateOperationsInput | string | null
    address?: StringFieldUpdateOperationsInput | string
    city?: StringFieldUpdateOperationsInput | string
    pincode?: StringFieldUpdateOperationsInput | string
    opening_hours?: StringFieldUpdateOperationsInput | string
    closing_hours?: StringFieldUpdateOperationsInput | string
    is_instant_delivery_enabled?: BoolFieldUpdateOperationsInput | boolean
    instant_delivery_fee?: FloatFieldUpdateOperationsInput | number
    instant_delivery_window_start?: StringFieldUpdateOperationsInput | string
    instant_delivery_window_end?: StringFieldUpdateOperationsInput | string
    availableCities?: storesUpdateavailableCitiesInput | string[]
    cityDeliveryTimes?: InputJsonValue | InputJsonValue | null
    state?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    products?: productsUncheckedUpdateManyWithoutStoreNestedInput
  }

  export type discount_codesUpsertWithWhereUniqueWithoutSellerInput = {
    where: discount_codesWhereUniqueInput
    update: XOR<discount_codesUpdateWithoutSellerInput, discount_codesUncheckedUpdateWithoutSellerInput>
    create: XOR<discount_codesCreateWithoutSellerInput, discount_codesUncheckedCreateWithoutSellerInput>
  }

  export type discount_codesUpdateWithWhereUniqueWithoutSellerInput = {
    where: discount_codesWhereUniqueInput
    data: XOR<discount_codesUpdateWithoutSellerInput, discount_codesUncheckedUpdateWithoutSellerInput>
  }

  export type discount_codesUpdateManyWithWhereWithoutSellerInput = {
    where: discount_codesScalarWhereInput
    data: XOR<discount_codesUpdateManyMutationInput, discount_codesUncheckedUpdateManyWithoutSellerInput>
  }

  export type staffsUpsertWithWhereUniqueWithoutSellerInput = {
    where: staffsWhereUniqueInput
    update: XOR<staffsUpdateWithoutSellerInput, staffsUncheckedUpdateWithoutSellerInput>
    create: XOR<staffsCreateWithoutSellerInput, staffsUncheckedCreateWithoutSellerInput>
  }

  export type staffsUpdateWithWhereUniqueWithoutSellerInput = {
    where: staffsWhereUniqueInput
    data: XOR<staffsUpdateWithoutSellerInput, staffsUncheckedUpdateWithoutSellerInput>
  }

  export type staffsUpdateManyWithWhereWithoutSellerInput = {
    where: staffsScalarWhereInput
    data: XOR<staffsUpdateManyMutationInput, staffsUncheckedUpdateManyWithoutSellerInput>
  }

  export type staffsScalarWhereInput = {
    AND?: staffsScalarWhereInput | staffsScalarWhereInput[]
    OR?: staffsScalarWhereInput[]
    NOT?: staffsScalarWhereInput | staffsScalarWhereInput[]
    id?: StringFilter<"staffs"> | string
    name?: StringFilter<"staffs"> | string
    email?: StringFilter<"staffs"> | string
    password?: StringFilter<"staffs"> | string
    isActive?: BoolFilter<"staffs"> | boolean
    sellerId?: StringNullableFilter<"staffs"> | string | null
    createdAt?: DateTimeFilter<"staffs"> | Date | string
    updatedAt?: DateTimeFilter<"staffs"> | Date | string
  }

  export type sellersCreateWithoutStaffsInput = {
    id?: string
    name: string
    email: string
    phone_number: string
    password: string
    following?: sellersCreatefollowingInput | string[]
    isApprovedByAdmin?: boolean
    permissions?: InputJsonValue | null
    createdAt?: Date | string
    updatedAt?: Date | string
    banners?: bannersCreateNestedManyWithoutSellerInput
    events?: seller_eventsCreateNestedManyWithoutSellerInput
    store?: storesCreateNestedOneWithoutSellerInput
    coupons?: discount_codesCreateNestedManyWithoutSellerInput
  }

  export type sellersUncheckedCreateWithoutStaffsInput = {
    id?: string
    name: string
    email: string
    phone_number: string
    password: string
    following?: sellersCreatefollowingInput | string[]
    isApprovedByAdmin?: boolean
    permissions?: InputJsonValue | null
    createdAt?: Date | string
    updatedAt?: Date | string
    banners?: bannersUncheckedCreateNestedManyWithoutSellerInput
    events?: seller_eventsUncheckedCreateNestedManyWithoutSellerInput
    store?: storesUncheckedCreateNestedOneWithoutSellerInput
    coupons?: discount_codesUncheckedCreateNestedManyWithoutSellerInput
  }

  export type sellersCreateOrConnectWithoutStaffsInput = {
    where: sellersWhereUniqueInput
    create: XOR<sellersCreateWithoutStaffsInput, sellersUncheckedCreateWithoutStaffsInput>
  }

  export type sellersUpsertWithoutStaffsInput = {
    update: XOR<sellersUpdateWithoutStaffsInput, sellersUncheckedUpdateWithoutStaffsInput>
    create: XOR<sellersCreateWithoutStaffsInput, sellersUncheckedCreateWithoutStaffsInput>
    where?: sellersWhereInput
  }

  export type sellersUpdateToOneWithWhereWithoutStaffsInput = {
    where?: sellersWhereInput
    data: XOR<sellersUpdateWithoutStaffsInput, sellersUncheckedUpdateWithoutStaffsInput>
  }

  export type sellersUpdateWithoutStaffsInput = {
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone_number?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    following?: sellersUpdatefollowingInput | string[]
    isApprovedByAdmin?: BoolFieldUpdateOperationsInput | boolean
    permissions?: InputJsonValue | InputJsonValue | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    banners?: bannersUpdateManyWithoutSellerNestedInput
    events?: seller_eventsUpdateManyWithoutSellerNestedInput
    store?: storesUpdateOneWithoutSellerNestedInput
    coupons?: discount_codesUpdateManyWithoutSellerNestedInput
  }

  export type sellersUncheckedUpdateWithoutStaffsInput = {
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone_number?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    following?: sellersUpdatefollowingInput | string[]
    isApprovedByAdmin?: BoolFieldUpdateOperationsInput | boolean
    permissions?: InputJsonValue | InputJsonValue | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    banners?: bannersUncheckedUpdateManyWithoutSellerNestedInput
    events?: seller_eventsUncheckedUpdateManyWithoutSellerNestedInput
    store?: storesUncheckedUpdateOneWithoutSellerNestedInput
    coupons?: discount_codesUncheckedUpdateManyWithoutSellerNestedInput
  }

  export type imagesCreateWithoutStoresInput = {
    id?: string
    file_id: string
    url: string
    type?: $Enums.ImageType
    createdAt?: Date | string
    product?: productsCreateNestedOneWithoutImagesInput
    users?: usersCreateNestedManyWithoutAvatarInput
  }

  export type imagesUncheckedCreateWithoutStoresInput = {
    id?: string
    file_id: string
    url: string
    type?: $Enums.ImageType
    productId?: string | null
    createdAt?: Date | string
    users?: usersUncheckedCreateNestedManyWithoutAvatarInput
  }

  export type imagesCreateOrConnectWithoutStoresInput = {
    where: imagesWhereUniqueInput
    create: XOR<imagesCreateWithoutStoresInput, imagesUncheckedCreateWithoutStoresInput>
  }

  export type sellersCreateWithoutStoreInput = {
    id?: string
    name: string
    email: string
    phone_number: string
    password: string
    following?: sellersCreatefollowingInput | string[]
    isApprovedByAdmin?: boolean
    permissions?: InputJsonValue | null
    createdAt?: Date | string
    updatedAt?: Date | string
    banners?: bannersCreateNestedManyWithoutSellerInput
    events?: seller_eventsCreateNestedManyWithoutSellerInput
    coupons?: discount_codesCreateNestedManyWithoutSellerInput
    staffs?: staffsCreateNestedManyWithoutSellerInput
  }

  export type sellersUncheckedCreateWithoutStoreInput = {
    id?: string
    name: string
    email: string
    phone_number: string
    password: string
    following?: sellersCreatefollowingInput | string[]
    isApprovedByAdmin?: boolean
    permissions?: InputJsonValue | null
    createdAt?: Date | string
    updatedAt?: Date | string
    banners?: bannersUncheckedCreateNestedManyWithoutSellerInput
    events?: seller_eventsUncheckedCreateNestedManyWithoutSellerInput
    coupons?: discount_codesUncheckedCreateNestedManyWithoutSellerInput
    staffs?: staffsUncheckedCreateNestedManyWithoutSellerInput
  }

  export type sellersCreateOrConnectWithoutStoreInput = {
    where: sellersWhereUniqueInput
    create: XOR<sellersCreateWithoutStoreInput, sellersUncheckedCreateWithoutStoreInput>
  }

  export type productsCreateWithoutStoreInput = {
    id?: string
    title: string
    slug?: string | null
    isCatalog?: boolean
    category: string
    subCategory: string
    short_description: string
    tags?: productsCreatetagsInput | string[]
    sizes?: productsCreatesizesInput | string[]
    sizePricing?: InputJsonValue | null
    cuttingTypePricing?: InputJsonValue | null
    pieceSizePricing?: InputJsonValue | null
    cuttingTypes?: productsCreatecuttingTypesInput | string[]
    pieceSizes?: productsCreatepieceSizesInput | string[]
    processingWeightLoss?: string | null
    stock: number
    sale_price: number
    regular_price: number
    totalSold?: number
    ratings?: number
    cashOnDelivery?: string | null
    discount_codes?: productsCreatediscount_codesInput | string[]
    status?: $Enums.productStatus
    isDeleted?: boolean | null
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    images?: imagesCreateNestedManyWithoutProductInput
    favorites?: favoritesCreateNestedManyWithoutProductInput
    admin?: adminsCreateNestedOneWithoutProductsInput
    catalogProduct?: productsCreateNestedOneWithoutStoreVariantsInput
    storeVariants?: productsCreateNestedManyWithoutCatalogProductInput
  }

  export type productsUncheckedCreateWithoutStoreInput = {
    id?: string
    title: string
    slug?: string | null
    isCatalog?: boolean
    category: string
    subCategory: string
    short_description: string
    tags?: productsCreatetagsInput | string[]
    sizes?: productsCreatesizesInput | string[]
    sizePricing?: InputJsonValue | null
    cuttingTypePricing?: InputJsonValue | null
    pieceSizePricing?: InputJsonValue | null
    cuttingTypes?: productsCreatecuttingTypesInput | string[]
    pieceSizes?: productsCreatepieceSizesInput | string[]
    processingWeightLoss?: string | null
    stock: number
    sale_price: number
    regular_price: number
    totalSold?: number
    ratings?: number
    cashOnDelivery?: string | null
    discount_codes?: productsCreatediscount_codesInput | string[]
    status?: $Enums.productStatus
    isDeleted?: boolean | null
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    adminId?: string | null
    catalogProductId?: string | null
    images?: imagesUncheckedCreateNestedManyWithoutProductInput
    favorites?: favoritesUncheckedCreateNestedManyWithoutProductInput
    storeVariants?: productsUncheckedCreateNestedManyWithoutCatalogProductInput
  }

  export type productsCreateOrConnectWithoutStoreInput = {
    where: productsWhereUniqueInput
    create: XOR<productsCreateWithoutStoreInput, productsUncheckedCreateWithoutStoreInput>
  }

  export type productsCreateManyStoreInputEnvelope = {
    data: productsCreateManyStoreInput | productsCreateManyStoreInput[]
  }

  export type imagesUpsertWithoutStoresInput = {
    update: XOR<imagesUpdateWithoutStoresInput, imagesUncheckedUpdateWithoutStoresInput>
    create: XOR<imagesCreateWithoutStoresInput, imagesUncheckedCreateWithoutStoresInput>
    where?: imagesWhereInput
  }

  export type imagesUpdateToOneWithWhereWithoutStoresInput = {
    where?: imagesWhereInput
    data: XOR<imagesUpdateWithoutStoresInput, imagesUncheckedUpdateWithoutStoresInput>
  }

  export type imagesUpdateWithoutStoresInput = {
    file_id?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    type?: EnumImageTypeFieldUpdateOperationsInput | $Enums.ImageType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    product?: productsUpdateOneWithoutImagesNestedInput
    users?: usersUpdateManyWithoutAvatarNestedInput
  }

  export type imagesUncheckedUpdateWithoutStoresInput = {
    file_id?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    type?: EnumImageTypeFieldUpdateOperationsInput | $Enums.ImageType
    productId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: usersUncheckedUpdateManyWithoutAvatarNestedInput
  }

  export type sellersUpsertWithoutStoreInput = {
    update: XOR<sellersUpdateWithoutStoreInput, sellersUncheckedUpdateWithoutStoreInput>
    create: XOR<sellersCreateWithoutStoreInput, sellersUncheckedCreateWithoutStoreInput>
    where?: sellersWhereInput
  }

  export type sellersUpdateToOneWithWhereWithoutStoreInput = {
    where?: sellersWhereInput
    data: XOR<sellersUpdateWithoutStoreInput, sellersUncheckedUpdateWithoutStoreInput>
  }

  export type sellersUpdateWithoutStoreInput = {
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone_number?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    following?: sellersUpdatefollowingInput | string[]
    isApprovedByAdmin?: BoolFieldUpdateOperationsInput | boolean
    permissions?: InputJsonValue | InputJsonValue | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    banners?: bannersUpdateManyWithoutSellerNestedInput
    events?: seller_eventsUpdateManyWithoutSellerNestedInput
    coupons?: discount_codesUpdateManyWithoutSellerNestedInput
    staffs?: staffsUpdateManyWithoutSellerNestedInput
  }

  export type sellersUncheckedUpdateWithoutStoreInput = {
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone_number?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    following?: sellersUpdatefollowingInput | string[]
    isApprovedByAdmin?: BoolFieldUpdateOperationsInput | boolean
    permissions?: InputJsonValue | InputJsonValue | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    banners?: bannersUncheckedUpdateManyWithoutSellerNestedInput
    events?: seller_eventsUncheckedUpdateManyWithoutSellerNestedInput
    coupons?: discount_codesUncheckedUpdateManyWithoutSellerNestedInput
    staffs?: staffsUncheckedUpdateManyWithoutSellerNestedInput
  }

  export type productsUpsertWithWhereUniqueWithoutStoreInput = {
    where: productsWhereUniqueInput
    update: XOR<productsUpdateWithoutStoreInput, productsUncheckedUpdateWithoutStoreInput>
    create: XOR<productsCreateWithoutStoreInput, productsUncheckedCreateWithoutStoreInput>
  }

  export type productsUpdateWithWhereUniqueWithoutStoreInput = {
    where: productsWhereUniqueInput
    data: XOR<productsUpdateWithoutStoreInput, productsUncheckedUpdateWithoutStoreInput>
  }

  export type productsUpdateManyWithWhereWithoutStoreInput = {
    where: productsScalarWhereInput
    data: XOR<productsUpdateManyMutationInput, productsUncheckedUpdateManyWithoutStoreInput>
  }

  export type usersCreateWithoutFavoritesInput = {
    id?: string
    phone_number?: string | null
    email?: string | null
    name: string
    following?: usersCreatefollowingInput | string[]
    addresses?: usersCreateaddressesInput | InputJsonValue[]
    createdAt?: Date | string
    updatedAt?: Date | string
    avatar?: imagesCreateNestedOneWithoutUsersInput
  }

  export type usersUncheckedCreateWithoutFavoritesInput = {
    id?: string
    phone_number?: string | null
    email?: string | null
    name: string
    following?: usersCreatefollowingInput | string[]
    addresses?: usersCreateaddressesInput | InputJsonValue[]
    avatarId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type usersCreateOrConnectWithoutFavoritesInput = {
    where: usersWhereUniqueInput
    create: XOR<usersCreateWithoutFavoritesInput, usersUncheckedCreateWithoutFavoritesInput>
  }

  export type productsCreateWithoutFavoritesInput = {
    id?: string
    title: string
    slug?: string | null
    isCatalog?: boolean
    category: string
    subCategory: string
    short_description: string
    tags?: productsCreatetagsInput | string[]
    sizes?: productsCreatesizesInput | string[]
    sizePricing?: InputJsonValue | null
    cuttingTypePricing?: InputJsonValue | null
    pieceSizePricing?: InputJsonValue | null
    cuttingTypes?: productsCreatecuttingTypesInput | string[]
    pieceSizes?: productsCreatepieceSizesInput | string[]
    processingWeightLoss?: string | null
    stock: number
    sale_price: number
    regular_price: number
    totalSold?: number
    ratings?: number
    cashOnDelivery?: string | null
    discount_codes?: productsCreatediscount_codesInput | string[]
    status?: $Enums.productStatus
    isDeleted?: boolean | null
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    images?: imagesCreateNestedManyWithoutProductInput
    store?: storesCreateNestedOneWithoutProductsInput
    admin?: adminsCreateNestedOneWithoutProductsInput
    catalogProduct?: productsCreateNestedOneWithoutStoreVariantsInput
    storeVariants?: productsCreateNestedManyWithoutCatalogProductInput
  }

  export type productsUncheckedCreateWithoutFavoritesInput = {
    id?: string
    title: string
    slug?: string | null
    isCatalog?: boolean
    category: string
    subCategory: string
    short_description: string
    tags?: productsCreatetagsInput | string[]
    sizes?: productsCreatesizesInput | string[]
    sizePricing?: InputJsonValue | null
    cuttingTypePricing?: InputJsonValue | null
    pieceSizePricing?: InputJsonValue | null
    cuttingTypes?: productsCreatecuttingTypesInput | string[]
    pieceSizes?: productsCreatepieceSizesInput | string[]
    processingWeightLoss?: string | null
    stock: number
    sale_price: number
    regular_price: number
    totalSold?: number
    ratings?: number
    cashOnDelivery?: string | null
    discount_codes?: productsCreatediscount_codesInput | string[]
    status?: $Enums.productStatus
    isDeleted?: boolean | null
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    storeId?: string | null
    adminId?: string | null
    catalogProductId?: string | null
    images?: imagesUncheckedCreateNestedManyWithoutProductInput
    storeVariants?: productsUncheckedCreateNestedManyWithoutCatalogProductInput
  }

  export type productsCreateOrConnectWithoutFavoritesInput = {
    where: productsWhereUniqueInput
    create: XOR<productsCreateWithoutFavoritesInput, productsUncheckedCreateWithoutFavoritesInput>
  }

  export type usersUpsertWithoutFavoritesInput = {
    update: XOR<usersUpdateWithoutFavoritesInput, usersUncheckedUpdateWithoutFavoritesInput>
    create: XOR<usersCreateWithoutFavoritesInput, usersUncheckedCreateWithoutFavoritesInput>
    where?: usersWhereInput
  }

  export type usersUpdateToOneWithWhereWithoutFavoritesInput = {
    where?: usersWhereInput
    data: XOR<usersUpdateWithoutFavoritesInput, usersUncheckedUpdateWithoutFavoritesInput>
  }

  export type usersUpdateWithoutFavoritesInput = {
    phone_number?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    following?: usersUpdatefollowingInput | string[]
    addresses?: usersUpdateaddressesInput | InputJsonValue[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    avatar?: imagesUpdateOneWithoutUsersNestedInput
  }

  export type usersUncheckedUpdateWithoutFavoritesInput = {
    phone_number?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    following?: usersUpdatefollowingInput | string[]
    addresses?: usersUpdateaddressesInput | InputJsonValue[]
    avatarId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type productsUpsertWithoutFavoritesInput = {
    update: XOR<productsUpdateWithoutFavoritesInput, productsUncheckedUpdateWithoutFavoritesInput>
    create: XOR<productsCreateWithoutFavoritesInput, productsUncheckedCreateWithoutFavoritesInput>
    where?: productsWhereInput
  }

  export type productsUpdateToOneWithWhereWithoutFavoritesInput = {
    where?: productsWhereInput
    data: XOR<productsUpdateWithoutFavoritesInput, productsUncheckedUpdateWithoutFavoritesInput>
  }

  export type productsUpdateWithoutFavoritesInput = {
    title?: StringFieldUpdateOperationsInput | string
    slug?: NullableStringFieldUpdateOperationsInput | string | null
    isCatalog?: BoolFieldUpdateOperationsInput | boolean
    category?: StringFieldUpdateOperationsInput | string
    subCategory?: StringFieldUpdateOperationsInput | string
    short_description?: StringFieldUpdateOperationsInput | string
    tags?: productsUpdatetagsInput | string[]
    sizes?: productsUpdatesizesInput | string[]
    sizePricing?: InputJsonValue | InputJsonValue | null
    cuttingTypePricing?: InputJsonValue | InputJsonValue | null
    pieceSizePricing?: InputJsonValue | InputJsonValue | null
    cuttingTypes?: productsUpdatecuttingTypesInput | string[]
    pieceSizes?: productsUpdatepieceSizesInput | string[]
    processingWeightLoss?: NullableStringFieldUpdateOperationsInput | string | null
    stock?: IntFieldUpdateOperationsInput | number
    sale_price?: FloatFieldUpdateOperationsInput | number
    regular_price?: FloatFieldUpdateOperationsInput | number
    totalSold?: IntFieldUpdateOperationsInput | number
    ratings?: FloatFieldUpdateOperationsInput | number
    cashOnDelivery?: NullableStringFieldUpdateOperationsInput | string | null
    discount_codes?: productsUpdatediscount_codesInput | string[]
    status?: EnumproductStatusFieldUpdateOperationsInput | $Enums.productStatus
    isDeleted?: NullableBoolFieldUpdateOperationsInput | boolean | null
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    images?: imagesUpdateManyWithoutProductNestedInput
    store?: storesUpdateOneWithoutProductsNestedInput
    admin?: adminsUpdateOneWithoutProductsNestedInput
    catalogProduct?: productsUpdateOneWithoutStoreVariantsNestedInput
    storeVariants?: productsUpdateManyWithoutCatalogProductNestedInput
  }

  export type productsUncheckedUpdateWithoutFavoritesInput = {
    title?: StringFieldUpdateOperationsInput | string
    slug?: NullableStringFieldUpdateOperationsInput | string | null
    isCatalog?: BoolFieldUpdateOperationsInput | boolean
    category?: StringFieldUpdateOperationsInput | string
    subCategory?: StringFieldUpdateOperationsInput | string
    short_description?: StringFieldUpdateOperationsInput | string
    tags?: productsUpdatetagsInput | string[]
    sizes?: productsUpdatesizesInput | string[]
    sizePricing?: InputJsonValue | InputJsonValue | null
    cuttingTypePricing?: InputJsonValue | InputJsonValue | null
    pieceSizePricing?: InputJsonValue | InputJsonValue | null
    cuttingTypes?: productsUpdatecuttingTypesInput | string[]
    pieceSizes?: productsUpdatepieceSizesInput | string[]
    processingWeightLoss?: NullableStringFieldUpdateOperationsInput | string | null
    stock?: IntFieldUpdateOperationsInput | number
    sale_price?: FloatFieldUpdateOperationsInput | number
    regular_price?: FloatFieldUpdateOperationsInput | number
    totalSold?: IntFieldUpdateOperationsInput | number
    ratings?: FloatFieldUpdateOperationsInput | number
    cashOnDelivery?: NullableStringFieldUpdateOperationsInput | string | null
    discount_codes?: productsUpdatediscount_codesInput | string[]
    status?: EnumproductStatusFieldUpdateOperationsInput | $Enums.productStatus
    isDeleted?: NullableBoolFieldUpdateOperationsInput | boolean | null
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    storeId?: NullableStringFieldUpdateOperationsInput | string | null
    adminId?: NullableStringFieldUpdateOperationsInput | string | null
    catalogProductId?: NullableStringFieldUpdateOperationsInput | string | null
    images?: imagesUncheckedUpdateManyWithoutProductNestedInput
    storeVariants?: productsUncheckedUpdateManyWithoutCatalogProductNestedInput
  }

  export type imagesCreateWithoutProductInput = {
    id?: string
    file_id: string
    url: string
    type?: $Enums.ImageType
    createdAt?: Date | string
    users?: usersCreateNestedManyWithoutAvatarInput
    stores?: storesCreateNestedManyWithoutAvatarInput
  }

  export type imagesUncheckedCreateWithoutProductInput = {
    id?: string
    file_id: string
    url: string
    type?: $Enums.ImageType
    createdAt?: Date | string
    users?: usersUncheckedCreateNestedManyWithoutAvatarInput
    stores?: storesUncheckedCreateNestedManyWithoutAvatarInput
  }

  export type imagesCreateOrConnectWithoutProductInput = {
    where: imagesWhereUniqueInput
    create: XOR<imagesCreateWithoutProductInput, imagesUncheckedCreateWithoutProductInput>
  }

  export type imagesCreateManyProductInputEnvelope = {
    data: imagesCreateManyProductInput | imagesCreateManyProductInput[]
  }

  export type favoritesCreateWithoutProductInput = {
    id?: string
    createdAt?: Date | string
    user: usersCreateNestedOneWithoutFavoritesInput
  }

  export type favoritesUncheckedCreateWithoutProductInput = {
    id?: string
    userId: string
    createdAt?: Date | string
  }

  export type favoritesCreateOrConnectWithoutProductInput = {
    where: favoritesWhereUniqueInput
    create: XOR<favoritesCreateWithoutProductInput, favoritesUncheckedCreateWithoutProductInput>
  }

  export type favoritesCreateManyProductInputEnvelope = {
    data: favoritesCreateManyProductInput | favoritesCreateManyProductInput[]
  }

  export type storesCreateWithoutProductsInput = {
    id?: string
    name: string
    bio: string
    address: string
    city: string
    pincode: string
    opening_hours: string
    closing_hours: string
    is_instant_delivery_enabled?: boolean
    instant_delivery_fee?: number
    instant_delivery_window_start?: string
    instant_delivery_window_end?: string
    availableCities?: storesCreateavailableCitiesInput | string[]
    cityDeliveryTimes?: InputJsonValue | null
    state?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    avatar?: imagesCreateNestedOneWithoutStoresInput
    seller: sellersCreateNestedOneWithoutStoreInput
  }

  export type storesUncheckedCreateWithoutProductsInput = {
    id?: string
    name: string
    bio: string
    avatarId?: string | null
    address: string
    city: string
    pincode: string
    opening_hours: string
    closing_hours: string
    is_instant_delivery_enabled?: boolean
    instant_delivery_fee?: number
    instant_delivery_window_start?: string
    instant_delivery_window_end?: string
    availableCities?: storesCreateavailableCitiesInput | string[]
    cityDeliveryTimes?: InputJsonValue | null
    state?: string | null
    sellerId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type storesCreateOrConnectWithoutProductsInput = {
    where: storesWhereUniqueInput
    create: XOR<storesCreateWithoutProductsInput, storesUncheckedCreateWithoutProductsInput>
  }

  export type adminsCreateWithoutProductsInput = {
    id?: string
    name: string
    email: string
    password: string
    createdAt?: Date | string
    updatedAt?: Date | string
    coupons?: discount_codesCreateNestedManyWithoutAdminInput
    banners?: bannersCreateNestedManyWithoutAdminInput
  }

  export type adminsUncheckedCreateWithoutProductsInput = {
    id?: string
    name: string
    email: string
    password: string
    createdAt?: Date | string
    updatedAt?: Date | string
    coupons?: discount_codesUncheckedCreateNestedManyWithoutAdminInput
    banners?: bannersUncheckedCreateNestedManyWithoutAdminInput
  }

  export type adminsCreateOrConnectWithoutProductsInput = {
    where: adminsWhereUniqueInput
    create: XOR<adminsCreateWithoutProductsInput, adminsUncheckedCreateWithoutProductsInput>
  }

  export type productsCreateWithoutStoreVariantsInput = {
    id?: string
    title: string
    slug?: string | null
    isCatalog?: boolean
    category: string
    subCategory: string
    short_description: string
    tags?: productsCreatetagsInput | string[]
    sizes?: productsCreatesizesInput | string[]
    sizePricing?: InputJsonValue | null
    cuttingTypePricing?: InputJsonValue | null
    pieceSizePricing?: InputJsonValue | null
    cuttingTypes?: productsCreatecuttingTypesInput | string[]
    pieceSizes?: productsCreatepieceSizesInput | string[]
    processingWeightLoss?: string | null
    stock: number
    sale_price: number
    regular_price: number
    totalSold?: number
    ratings?: number
    cashOnDelivery?: string | null
    discount_codes?: productsCreatediscount_codesInput | string[]
    status?: $Enums.productStatus
    isDeleted?: boolean | null
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    images?: imagesCreateNestedManyWithoutProductInput
    favorites?: favoritesCreateNestedManyWithoutProductInput
    store?: storesCreateNestedOneWithoutProductsInput
    admin?: adminsCreateNestedOneWithoutProductsInput
    catalogProduct?: productsCreateNestedOneWithoutStoreVariantsInput
  }

  export type productsUncheckedCreateWithoutStoreVariantsInput = {
    id?: string
    title: string
    slug?: string | null
    isCatalog?: boolean
    category: string
    subCategory: string
    short_description: string
    tags?: productsCreatetagsInput | string[]
    sizes?: productsCreatesizesInput | string[]
    sizePricing?: InputJsonValue | null
    cuttingTypePricing?: InputJsonValue | null
    pieceSizePricing?: InputJsonValue | null
    cuttingTypes?: productsCreatecuttingTypesInput | string[]
    pieceSizes?: productsCreatepieceSizesInput | string[]
    processingWeightLoss?: string | null
    stock: number
    sale_price: number
    regular_price: number
    totalSold?: number
    ratings?: number
    cashOnDelivery?: string | null
    discount_codes?: productsCreatediscount_codesInput | string[]
    status?: $Enums.productStatus
    isDeleted?: boolean | null
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    storeId?: string | null
    adminId?: string | null
    catalogProductId?: string | null
    images?: imagesUncheckedCreateNestedManyWithoutProductInput
    favorites?: favoritesUncheckedCreateNestedManyWithoutProductInput
  }

  export type productsCreateOrConnectWithoutStoreVariantsInput = {
    where: productsWhereUniqueInput
    create: XOR<productsCreateWithoutStoreVariantsInput, productsUncheckedCreateWithoutStoreVariantsInput>
  }

  export type productsCreateWithoutCatalogProductInput = {
    id?: string
    title: string
    slug?: string | null
    isCatalog?: boolean
    category: string
    subCategory: string
    short_description: string
    tags?: productsCreatetagsInput | string[]
    sizes?: productsCreatesizesInput | string[]
    sizePricing?: InputJsonValue | null
    cuttingTypePricing?: InputJsonValue | null
    pieceSizePricing?: InputJsonValue | null
    cuttingTypes?: productsCreatecuttingTypesInput | string[]
    pieceSizes?: productsCreatepieceSizesInput | string[]
    processingWeightLoss?: string | null
    stock: number
    sale_price: number
    regular_price: number
    totalSold?: number
    ratings?: number
    cashOnDelivery?: string | null
    discount_codes?: productsCreatediscount_codesInput | string[]
    status?: $Enums.productStatus
    isDeleted?: boolean | null
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    images?: imagesCreateNestedManyWithoutProductInput
    favorites?: favoritesCreateNestedManyWithoutProductInput
    store?: storesCreateNestedOneWithoutProductsInput
    admin?: adminsCreateNestedOneWithoutProductsInput
    storeVariants?: productsCreateNestedManyWithoutCatalogProductInput
  }

  export type productsUncheckedCreateWithoutCatalogProductInput = {
    id?: string
    title: string
    slug?: string | null
    isCatalog?: boolean
    category: string
    subCategory: string
    short_description: string
    tags?: productsCreatetagsInput | string[]
    sizes?: productsCreatesizesInput | string[]
    sizePricing?: InputJsonValue | null
    cuttingTypePricing?: InputJsonValue | null
    pieceSizePricing?: InputJsonValue | null
    cuttingTypes?: productsCreatecuttingTypesInput | string[]
    pieceSizes?: productsCreatepieceSizesInput | string[]
    processingWeightLoss?: string | null
    stock: number
    sale_price: number
    regular_price: number
    totalSold?: number
    ratings?: number
    cashOnDelivery?: string | null
    discount_codes?: productsCreatediscount_codesInput | string[]
    status?: $Enums.productStatus
    isDeleted?: boolean | null
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    storeId?: string | null
    adminId?: string | null
    images?: imagesUncheckedCreateNestedManyWithoutProductInput
    favorites?: favoritesUncheckedCreateNestedManyWithoutProductInput
    storeVariants?: productsUncheckedCreateNestedManyWithoutCatalogProductInput
  }

  export type productsCreateOrConnectWithoutCatalogProductInput = {
    where: productsWhereUniqueInput
    create: XOR<productsCreateWithoutCatalogProductInput, productsUncheckedCreateWithoutCatalogProductInput>
  }

  export type productsCreateManyCatalogProductInputEnvelope = {
    data: productsCreateManyCatalogProductInput | productsCreateManyCatalogProductInput[]
  }

  export type imagesUpsertWithWhereUniqueWithoutProductInput = {
    where: imagesWhereUniqueInput
    update: XOR<imagesUpdateWithoutProductInput, imagesUncheckedUpdateWithoutProductInput>
    create: XOR<imagesCreateWithoutProductInput, imagesUncheckedCreateWithoutProductInput>
  }

  export type imagesUpdateWithWhereUniqueWithoutProductInput = {
    where: imagesWhereUniqueInput
    data: XOR<imagesUpdateWithoutProductInput, imagesUncheckedUpdateWithoutProductInput>
  }

  export type imagesUpdateManyWithWhereWithoutProductInput = {
    where: imagesScalarWhereInput
    data: XOR<imagesUpdateManyMutationInput, imagesUncheckedUpdateManyWithoutProductInput>
  }

  export type imagesScalarWhereInput = {
    AND?: imagesScalarWhereInput | imagesScalarWhereInput[]
    OR?: imagesScalarWhereInput[]
    NOT?: imagesScalarWhereInput | imagesScalarWhereInput[]
    id?: StringFilter<"images"> | string
    file_id?: StringFilter<"images"> | string
    url?: StringFilter<"images"> | string
    type?: EnumImageTypeFilter<"images"> | $Enums.ImageType
    productId?: StringNullableFilter<"images"> | string | null
    createdAt?: DateTimeFilter<"images"> | Date | string
  }

  export type favoritesUpsertWithWhereUniqueWithoutProductInput = {
    where: favoritesWhereUniqueInput
    update: XOR<favoritesUpdateWithoutProductInput, favoritesUncheckedUpdateWithoutProductInput>
    create: XOR<favoritesCreateWithoutProductInput, favoritesUncheckedCreateWithoutProductInput>
  }

  export type favoritesUpdateWithWhereUniqueWithoutProductInput = {
    where: favoritesWhereUniqueInput
    data: XOR<favoritesUpdateWithoutProductInput, favoritesUncheckedUpdateWithoutProductInput>
  }

  export type favoritesUpdateManyWithWhereWithoutProductInput = {
    where: favoritesScalarWhereInput
    data: XOR<favoritesUpdateManyMutationInput, favoritesUncheckedUpdateManyWithoutProductInput>
  }

  export type storesUpsertWithoutProductsInput = {
    update: XOR<storesUpdateWithoutProductsInput, storesUncheckedUpdateWithoutProductsInput>
    create: XOR<storesCreateWithoutProductsInput, storesUncheckedCreateWithoutProductsInput>
    where?: storesWhereInput
  }

  export type storesUpdateToOneWithWhereWithoutProductsInput = {
    where?: storesWhereInput
    data: XOR<storesUpdateWithoutProductsInput, storesUncheckedUpdateWithoutProductsInput>
  }

  export type storesUpdateWithoutProductsInput = {
    name?: StringFieldUpdateOperationsInput | string
    bio?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    city?: StringFieldUpdateOperationsInput | string
    pincode?: StringFieldUpdateOperationsInput | string
    opening_hours?: StringFieldUpdateOperationsInput | string
    closing_hours?: StringFieldUpdateOperationsInput | string
    is_instant_delivery_enabled?: BoolFieldUpdateOperationsInput | boolean
    instant_delivery_fee?: FloatFieldUpdateOperationsInput | number
    instant_delivery_window_start?: StringFieldUpdateOperationsInput | string
    instant_delivery_window_end?: StringFieldUpdateOperationsInput | string
    availableCities?: storesUpdateavailableCitiesInput | string[]
    cityDeliveryTimes?: InputJsonValue | InputJsonValue | null
    state?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    avatar?: imagesUpdateOneWithoutStoresNestedInput
    seller?: sellersUpdateOneRequiredWithoutStoreNestedInput
  }

  export type storesUncheckedUpdateWithoutProductsInput = {
    name?: StringFieldUpdateOperationsInput | string
    bio?: StringFieldUpdateOperationsInput | string
    avatarId?: NullableStringFieldUpdateOperationsInput | string | null
    address?: StringFieldUpdateOperationsInput | string
    city?: StringFieldUpdateOperationsInput | string
    pincode?: StringFieldUpdateOperationsInput | string
    opening_hours?: StringFieldUpdateOperationsInput | string
    closing_hours?: StringFieldUpdateOperationsInput | string
    is_instant_delivery_enabled?: BoolFieldUpdateOperationsInput | boolean
    instant_delivery_fee?: FloatFieldUpdateOperationsInput | number
    instant_delivery_window_start?: StringFieldUpdateOperationsInput | string
    instant_delivery_window_end?: StringFieldUpdateOperationsInput | string
    availableCities?: storesUpdateavailableCitiesInput | string[]
    cityDeliveryTimes?: InputJsonValue | InputJsonValue | null
    state?: NullableStringFieldUpdateOperationsInput | string | null
    sellerId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type adminsUpsertWithoutProductsInput = {
    update: XOR<adminsUpdateWithoutProductsInput, adminsUncheckedUpdateWithoutProductsInput>
    create: XOR<adminsCreateWithoutProductsInput, adminsUncheckedCreateWithoutProductsInput>
    where?: adminsWhereInput
  }

  export type adminsUpdateToOneWithWhereWithoutProductsInput = {
    where?: adminsWhereInput
    data: XOR<adminsUpdateWithoutProductsInput, adminsUncheckedUpdateWithoutProductsInput>
  }

  export type adminsUpdateWithoutProductsInput = {
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    coupons?: discount_codesUpdateManyWithoutAdminNestedInput
    banners?: bannersUpdateManyWithoutAdminNestedInput
  }

  export type adminsUncheckedUpdateWithoutProductsInput = {
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    coupons?: discount_codesUncheckedUpdateManyWithoutAdminNestedInput
    banners?: bannersUncheckedUpdateManyWithoutAdminNestedInput
  }

  export type productsUpsertWithoutStoreVariantsInput = {
    update: XOR<productsUpdateWithoutStoreVariantsInput, productsUncheckedUpdateWithoutStoreVariantsInput>
    create: XOR<productsCreateWithoutStoreVariantsInput, productsUncheckedCreateWithoutStoreVariantsInput>
    where?: productsWhereInput
  }

  export type productsUpdateToOneWithWhereWithoutStoreVariantsInput = {
    where?: productsWhereInput
    data: XOR<productsUpdateWithoutStoreVariantsInput, productsUncheckedUpdateWithoutStoreVariantsInput>
  }

  export type productsUpdateWithoutStoreVariantsInput = {
    title?: StringFieldUpdateOperationsInput | string
    slug?: NullableStringFieldUpdateOperationsInput | string | null
    isCatalog?: BoolFieldUpdateOperationsInput | boolean
    category?: StringFieldUpdateOperationsInput | string
    subCategory?: StringFieldUpdateOperationsInput | string
    short_description?: StringFieldUpdateOperationsInput | string
    tags?: productsUpdatetagsInput | string[]
    sizes?: productsUpdatesizesInput | string[]
    sizePricing?: InputJsonValue | InputJsonValue | null
    cuttingTypePricing?: InputJsonValue | InputJsonValue | null
    pieceSizePricing?: InputJsonValue | InputJsonValue | null
    cuttingTypes?: productsUpdatecuttingTypesInput | string[]
    pieceSizes?: productsUpdatepieceSizesInput | string[]
    processingWeightLoss?: NullableStringFieldUpdateOperationsInput | string | null
    stock?: IntFieldUpdateOperationsInput | number
    sale_price?: FloatFieldUpdateOperationsInput | number
    regular_price?: FloatFieldUpdateOperationsInput | number
    totalSold?: IntFieldUpdateOperationsInput | number
    ratings?: FloatFieldUpdateOperationsInput | number
    cashOnDelivery?: NullableStringFieldUpdateOperationsInput | string | null
    discount_codes?: productsUpdatediscount_codesInput | string[]
    status?: EnumproductStatusFieldUpdateOperationsInput | $Enums.productStatus
    isDeleted?: NullableBoolFieldUpdateOperationsInput | boolean | null
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    images?: imagesUpdateManyWithoutProductNestedInput
    favorites?: favoritesUpdateManyWithoutProductNestedInput
    store?: storesUpdateOneWithoutProductsNestedInput
    admin?: adminsUpdateOneWithoutProductsNestedInput
    catalogProduct?: productsUpdateOneWithoutStoreVariantsNestedInput
  }

  export type productsUncheckedUpdateWithoutStoreVariantsInput = {
    title?: StringFieldUpdateOperationsInput | string
    slug?: NullableStringFieldUpdateOperationsInput | string | null
    isCatalog?: BoolFieldUpdateOperationsInput | boolean
    category?: StringFieldUpdateOperationsInput | string
    subCategory?: StringFieldUpdateOperationsInput | string
    short_description?: StringFieldUpdateOperationsInput | string
    tags?: productsUpdatetagsInput | string[]
    sizes?: productsUpdatesizesInput | string[]
    sizePricing?: InputJsonValue | InputJsonValue | null
    cuttingTypePricing?: InputJsonValue | InputJsonValue | null
    pieceSizePricing?: InputJsonValue | InputJsonValue | null
    cuttingTypes?: productsUpdatecuttingTypesInput | string[]
    pieceSizes?: productsUpdatepieceSizesInput | string[]
    processingWeightLoss?: NullableStringFieldUpdateOperationsInput | string | null
    stock?: IntFieldUpdateOperationsInput | number
    sale_price?: FloatFieldUpdateOperationsInput | number
    regular_price?: FloatFieldUpdateOperationsInput | number
    totalSold?: IntFieldUpdateOperationsInput | number
    ratings?: FloatFieldUpdateOperationsInput | number
    cashOnDelivery?: NullableStringFieldUpdateOperationsInput | string | null
    discount_codes?: productsUpdatediscount_codesInput | string[]
    status?: EnumproductStatusFieldUpdateOperationsInput | $Enums.productStatus
    isDeleted?: NullableBoolFieldUpdateOperationsInput | boolean | null
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    storeId?: NullableStringFieldUpdateOperationsInput | string | null
    adminId?: NullableStringFieldUpdateOperationsInput | string | null
    catalogProductId?: NullableStringFieldUpdateOperationsInput | string | null
    images?: imagesUncheckedUpdateManyWithoutProductNestedInput
    favorites?: favoritesUncheckedUpdateManyWithoutProductNestedInput
  }

  export type productsUpsertWithWhereUniqueWithoutCatalogProductInput = {
    where: productsWhereUniqueInput
    update: XOR<productsUpdateWithoutCatalogProductInput, productsUncheckedUpdateWithoutCatalogProductInput>
    create: XOR<productsCreateWithoutCatalogProductInput, productsUncheckedCreateWithoutCatalogProductInput>
  }

  export type productsUpdateWithWhereUniqueWithoutCatalogProductInput = {
    where: productsWhereUniqueInput
    data: XOR<productsUpdateWithoutCatalogProductInput, productsUncheckedUpdateWithoutCatalogProductInput>
  }

  export type productsUpdateManyWithWhereWithoutCatalogProductInput = {
    where: productsScalarWhereInput
    data: XOR<productsUpdateManyMutationInput, productsUncheckedUpdateManyWithoutCatalogProductInput>
  }

  export type sellersCreateWithoutBannersInput = {
    id?: string
    name: string
    email: string
    phone_number: string
    password: string
    following?: sellersCreatefollowingInput | string[]
    isApprovedByAdmin?: boolean
    permissions?: InputJsonValue | null
    createdAt?: Date | string
    updatedAt?: Date | string
    events?: seller_eventsCreateNestedManyWithoutSellerInput
    store?: storesCreateNestedOneWithoutSellerInput
    coupons?: discount_codesCreateNestedManyWithoutSellerInput
    staffs?: staffsCreateNestedManyWithoutSellerInput
  }

  export type sellersUncheckedCreateWithoutBannersInput = {
    id?: string
    name: string
    email: string
    phone_number: string
    password: string
    following?: sellersCreatefollowingInput | string[]
    isApprovedByAdmin?: boolean
    permissions?: InputJsonValue | null
    createdAt?: Date | string
    updatedAt?: Date | string
    events?: seller_eventsUncheckedCreateNestedManyWithoutSellerInput
    store?: storesUncheckedCreateNestedOneWithoutSellerInput
    coupons?: discount_codesUncheckedCreateNestedManyWithoutSellerInput
    staffs?: staffsUncheckedCreateNestedManyWithoutSellerInput
  }

  export type sellersCreateOrConnectWithoutBannersInput = {
    where: sellersWhereUniqueInput
    create: XOR<sellersCreateWithoutBannersInput, sellersUncheckedCreateWithoutBannersInput>
  }

  export type adminsCreateWithoutBannersInput = {
    id?: string
    name: string
    email: string
    password: string
    createdAt?: Date | string
    updatedAt?: Date | string
    products?: productsCreateNestedManyWithoutAdminInput
    coupons?: discount_codesCreateNestedManyWithoutAdminInput
  }

  export type adminsUncheckedCreateWithoutBannersInput = {
    id?: string
    name: string
    email: string
    password: string
    createdAt?: Date | string
    updatedAt?: Date | string
    products?: productsUncheckedCreateNestedManyWithoutAdminInput
    coupons?: discount_codesUncheckedCreateNestedManyWithoutAdminInput
  }

  export type adminsCreateOrConnectWithoutBannersInput = {
    where: adminsWhereUniqueInput
    create: XOR<adminsCreateWithoutBannersInput, adminsUncheckedCreateWithoutBannersInput>
  }

  export type sellersUpsertWithoutBannersInput = {
    update: XOR<sellersUpdateWithoutBannersInput, sellersUncheckedUpdateWithoutBannersInput>
    create: XOR<sellersCreateWithoutBannersInput, sellersUncheckedCreateWithoutBannersInput>
    where?: sellersWhereInput
  }

  export type sellersUpdateToOneWithWhereWithoutBannersInput = {
    where?: sellersWhereInput
    data: XOR<sellersUpdateWithoutBannersInput, sellersUncheckedUpdateWithoutBannersInput>
  }

  export type sellersUpdateWithoutBannersInput = {
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone_number?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    following?: sellersUpdatefollowingInput | string[]
    isApprovedByAdmin?: BoolFieldUpdateOperationsInput | boolean
    permissions?: InputJsonValue | InputJsonValue | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    events?: seller_eventsUpdateManyWithoutSellerNestedInput
    store?: storesUpdateOneWithoutSellerNestedInput
    coupons?: discount_codesUpdateManyWithoutSellerNestedInput
    staffs?: staffsUpdateManyWithoutSellerNestedInput
  }

  export type sellersUncheckedUpdateWithoutBannersInput = {
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone_number?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    following?: sellersUpdatefollowingInput | string[]
    isApprovedByAdmin?: BoolFieldUpdateOperationsInput | boolean
    permissions?: InputJsonValue | InputJsonValue | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    events?: seller_eventsUncheckedUpdateManyWithoutSellerNestedInput
    store?: storesUncheckedUpdateOneWithoutSellerNestedInput
    coupons?: discount_codesUncheckedUpdateManyWithoutSellerNestedInput
    staffs?: staffsUncheckedUpdateManyWithoutSellerNestedInput
  }

  export type adminsUpsertWithoutBannersInput = {
    update: XOR<adminsUpdateWithoutBannersInput, adminsUncheckedUpdateWithoutBannersInput>
    create: XOR<adminsCreateWithoutBannersInput, adminsUncheckedCreateWithoutBannersInput>
    where?: adminsWhereInput
  }

  export type adminsUpdateToOneWithWhereWithoutBannersInput = {
    where?: adminsWhereInput
    data: XOR<adminsUpdateWithoutBannersInput, adminsUncheckedUpdateWithoutBannersInput>
  }

  export type adminsUpdateWithoutBannersInput = {
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    products?: productsUpdateManyWithoutAdminNestedInput
    coupons?: discount_codesUpdateManyWithoutAdminNestedInput
  }

  export type adminsUncheckedUpdateWithoutBannersInput = {
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    products?: productsUncheckedUpdateManyWithoutAdminNestedInput
    coupons?: discount_codesUncheckedUpdateManyWithoutAdminNestedInput
  }

  export type sellersCreateWithoutEventsInput = {
    id?: string
    name: string
    email: string
    phone_number: string
    password: string
    following?: sellersCreatefollowingInput | string[]
    isApprovedByAdmin?: boolean
    permissions?: InputJsonValue | null
    createdAt?: Date | string
    updatedAt?: Date | string
    banners?: bannersCreateNestedManyWithoutSellerInput
    store?: storesCreateNestedOneWithoutSellerInput
    coupons?: discount_codesCreateNestedManyWithoutSellerInput
    staffs?: staffsCreateNestedManyWithoutSellerInput
  }

  export type sellersUncheckedCreateWithoutEventsInput = {
    id?: string
    name: string
    email: string
    phone_number: string
    password: string
    following?: sellersCreatefollowingInput | string[]
    isApprovedByAdmin?: boolean
    permissions?: InputJsonValue | null
    createdAt?: Date | string
    updatedAt?: Date | string
    banners?: bannersUncheckedCreateNestedManyWithoutSellerInput
    store?: storesUncheckedCreateNestedOneWithoutSellerInput
    coupons?: discount_codesUncheckedCreateNestedManyWithoutSellerInput
    staffs?: staffsUncheckedCreateNestedManyWithoutSellerInput
  }

  export type sellersCreateOrConnectWithoutEventsInput = {
    where: sellersWhereUniqueInput
    create: XOR<sellersCreateWithoutEventsInput, sellersUncheckedCreateWithoutEventsInput>
  }

  export type sellersUpsertWithoutEventsInput = {
    update: XOR<sellersUpdateWithoutEventsInput, sellersUncheckedUpdateWithoutEventsInput>
    create: XOR<sellersCreateWithoutEventsInput, sellersUncheckedCreateWithoutEventsInput>
    where?: sellersWhereInput
  }

  export type sellersUpdateToOneWithWhereWithoutEventsInput = {
    where?: sellersWhereInput
    data: XOR<sellersUpdateWithoutEventsInput, sellersUncheckedUpdateWithoutEventsInput>
  }

  export type sellersUpdateWithoutEventsInput = {
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone_number?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    following?: sellersUpdatefollowingInput | string[]
    isApprovedByAdmin?: BoolFieldUpdateOperationsInput | boolean
    permissions?: InputJsonValue | InputJsonValue | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    banners?: bannersUpdateManyWithoutSellerNestedInput
    store?: storesUpdateOneWithoutSellerNestedInput
    coupons?: discount_codesUpdateManyWithoutSellerNestedInput
    staffs?: staffsUpdateManyWithoutSellerNestedInput
  }

  export type sellersUncheckedUpdateWithoutEventsInput = {
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone_number?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    following?: sellersUpdatefollowingInput | string[]
    isApprovedByAdmin?: BoolFieldUpdateOperationsInput | boolean
    permissions?: InputJsonValue | InputJsonValue | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    banners?: bannersUncheckedUpdateManyWithoutSellerNestedInput
    store?: storesUncheckedUpdateOneWithoutSellerNestedInput
    coupons?: discount_codesUncheckedUpdateManyWithoutSellerNestedInput
    staffs?: staffsUncheckedUpdateManyWithoutSellerNestedInput
  }

  export type productsCreateManyAdminInput = {
    id?: string
    title: string
    slug?: string | null
    isCatalog?: boolean
    category: string
    subCategory: string
    short_description: string
    tags?: productsCreatetagsInput | string[]
    sizes?: productsCreatesizesInput | string[]
    sizePricing?: InputJsonValue | null
    cuttingTypePricing?: InputJsonValue | null
    pieceSizePricing?: InputJsonValue | null
    cuttingTypes?: productsCreatecuttingTypesInput | string[]
    pieceSizes?: productsCreatepieceSizesInput | string[]
    processingWeightLoss?: string | null
    stock: number
    sale_price: number
    regular_price: number
    totalSold?: number
    ratings?: number
    cashOnDelivery?: string | null
    discount_codes?: productsCreatediscount_codesInput | string[]
    status?: $Enums.productStatus
    isDeleted?: boolean | null
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    storeId?: string | null
    catalogProductId?: string | null
  }

  export type discount_codesCreateManyAdminInput = {
    id?: string
    public_name: string
    discountType: string
    discountValue: number
    minOrderValue?: number
    discountCode: string
    expiresAt?: Date | string | null
    maxUses?: number | null
    maxUsesPerUser?: number
    usedCount?: number
    isActive?: boolean
    isFirstOrder?: boolean
    sellerId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type bannersCreateManyAdminInput = {
    id?: string
    imageUrl: string
    fileId: string
    isActive?: boolean
    category?: string | null
    status?: string | null
    rejectionReason?: string | null
    bannerType?: string | null
    title?: string | null
    subtitle?: string | null
    price?: string | null
    sellerId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type productsUpdateWithoutAdminInput = {
    title?: StringFieldUpdateOperationsInput | string
    slug?: NullableStringFieldUpdateOperationsInput | string | null
    isCatalog?: BoolFieldUpdateOperationsInput | boolean
    category?: StringFieldUpdateOperationsInput | string
    subCategory?: StringFieldUpdateOperationsInput | string
    short_description?: StringFieldUpdateOperationsInput | string
    tags?: productsUpdatetagsInput | string[]
    sizes?: productsUpdatesizesInput | string[]
    sizePricing?: InputJsonValue | InputJsonValue | null
    cuttingTypePricing?: InputJsonValue | InputJsonValue | null
    pieceSizePricing?: InputJsonValue | InputJsonValue | null
    cuttingTypes?: productsUpdatecuttingTypesInput | string[]
    pieceSizes?: productsUpdatepieceSizesInput | string[]
    processingWeightLoss?: NullableStringFieldUpdateOperationsInput | string | null
    stock?: IntFieldUpdateOperationsInput | number
    sale_price?: FloatFieldUpdateOperationsInput | number
    regular_price?: FloatFieldUpdateOperationsInput | number
    totalSold?: IntFieldUpdateOperationsInput | number
    ratings?: FloatFieldUpdateOperationsInput | number
    cashOnDelivery?: NullableStringFieldUpdateOperationsInput | string | null
    discount_codes?: productsUpdatediscount_codesInput | string[]
    status?: EnumproductStatusFieldUpdateOperationsInput | $Enums.productStatus
    isDeleted?: NullableBoolFieldUpdateOperationsInput | boolean | null
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    images?: imagesUpdateManyWithoutProductNestedInput
    favorites?: favoritesUpdateManyWithoutProductNestedInput
    store?: storesUpdateOneWithoutProductsNestedInput
    catalogProduct?: productsUpdateOneWithoutStoreVariantsNestedInput
    storeVariants?: productsUpdateManyWithoutCatalogProductNestedInput
  }

  export type productsUncheckedUpdateWithoutAdminInput = {
    title?: StringFieldUpdateOperationsInput | string
    slug?: NullableStringFieldUpdateOperationsInput | string | null
    isCatalog?: BoolFieldUpdateOperationsInput | boolean
    category?: StringFieldUpdateOperationsInput | string
    subCategory?: StringFieldUpdateOperationsInput | string
    short_description?: StringFieldUpdateOperationsInput | string
    tags?: productsUpdatetagsInput | string[]
    sizes?: productsUpdatesizesInput | string[]
    sizePricing?: InputJsonValue | InputJsonValue | null
    cuttingTypePricing?: InputJsonValue | InputJsonValue | null
    pieceSizePricing?: InputJsonValue | InputJsonValue | null
    cuttingTypes?: productsUpdatecuttingTypesInput | string[]
    pieceSizes?: productsUpdatepieceSizesInput | string[]
    processingWeightLoss?: NullableStringFieldUpdateOperationsInput | string | null
    stock?: IntFieldUpdateOperationsInput | number
    sale_price?: FloatFieldUpdateOperationsInput | number
    regular_price?: FloatFieldUpdateOperationsInput | number
    totalSold?: IntFieldUpdateOperationsInput | number
    ratings?: FloatFieldUpdateOperationsInput | number
    cashOnDelivery?: NullableStringFieldUpdateOperationsInput | string | null
    discount_codes?: productsUpdatediscount_codesInput | string[]
    status?: EnumproductStatusFieldUpdateOperationsInput | $Enums.productStatus
    isDeleted?: NullableBoolFieldUpdateOperationsInput | boolean | null
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    storeId?: NullableStringFieldUpdateOperationsInput | string | null
    catalogProductId?: NullableStringFieldUpdateOperationsInput | string | null
    images?: imagesUncheckedUpdateManyWithoutProductNestedInput
    favorites?: favoritesUncheckedUpdateManyWithoutProductNestedInput
    storeVariants?: productsUncheckedUpdateManyWithoutCatalogProductNestedInput
  }

  export type productsUncheckedUpdateManyWithoutAdminInput = {
    title?: StringFieldUpdateOperationsInput | string
    slug?: NullableStringFieldUpdateOperationsInput | string | null
    isCatalog?: BoolFieldUpdateOperationsInput | boolean
    category?: StringFieldUpdateOperationsInput | string
    subCategory?: StringFieldUpdateOperationsInput | string
    short_description?: StringFieldUpdateOperationsInput | string
    tags?: productsUpdatetagsInput | string[]
    sizes?: productsUpdatesizesInput | string[]
    sizePricing?: InputJsonValue | InputJsonValue | null
    cuttingTypePricing?: InputJsonValue | InputJsonValue | null
    pieceSizePricing?: InputJsonValue | InputJsonValue | null
    cuttingTypes?: productsUpdatecuttingTypesInput | string[]
    pieceSizes?: productsUpdatepieceSizesInput | string[]
    processingWeightLoss?: NullableStringFieldUpdateOperationsInput | string | null
    stock?: IntFieldUpdateOperationsInput | number
    sale_price?: FloatFieldUpdateOperationsInput | number
    regular_price?: FloatFieldUpdateOperationsInput | number
    totalSold?: IntFieldUpdateOperationsInput | number
    ratings?: FloatFieldUpdateOperationsInput | number
    cashOnDelivery?: NullableStringFieldUpdateOperationsInput | string | null
    discount_codes?: productsUpdatediscount_codesInput | string[]
    status?: EnumproductStatusFieldUpdateOperationsInput | $Enums.productStatus
    isDeleted?: NullableBoolFieldUpdateOperationsInput | boolean | null
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    storeId?: NullableStringFieldUpdateOperationsInput | string | null
    catalogProductId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type discount_codesUpdateWithoutAdminInput = {
    public_name?: StringFieldUpdateOperationsInput | string
    discountType?: StringFieldUpdateOperationsInput | string
    discountValue?: FloatFieldUpdateOperationsInput | number
    minOrderValue?: FloatFieldUpdateOperationsInput | number
    discountCode?: StringFieldUpdateOperationsInput | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    maxUses?: NullableIntFieldUpdateOperationsInput | number | null
    maxUsesPerUser?: IntFieldUpdateOperationsInput | number
    usedCount?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isFirstOrder?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    seller?: sellersUpdateOneWithoutCouponsNestedInput
    usages?: coupon_usagesUpdateManyWithoutCouponNestedInput
  }

  export type discount_codesUncheckedUpdateWithoutAdminInput = {
    public_name?: StringFieldUpdateOperationsInput | string
    discountType?: StringFieldUpdateOperationsInput | string
    discountValue?: FloatFieldUpdateOperationsInput | number
    minOrderValue?: FloatFieldUpdateOperationsInput | number
    discountCode?: StringFieldUpdateOperationsInput | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    maxUses?: NullableIntFieldUpdateOperationsInput | number | null
    maxUsesPerUser?: IntFieldUpdateOperationsInput | number
    usedCount?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isFirstOrder?: BoolFieldUpdateOperationsInput | boolean
    sellerId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usages?: coupon_usagesUncheckedUpdateManyWithoutCouponNestedInput
  }

  export type discount_codesUncheckedUpdateManyWithoutAdminInput = {
    public_name?: StringFieldUpdateOperationsInput | string
    discountType?: StringFieldUpdateOperationsInput | string
    discountValue?: FloatFieldUpdateOperationsInput | number
    minOrderValue?: FloatFieldUpdateOperationsInput | number
    discountCode?: StringFieldUpdateOperationsInput | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    maxUses?: NullableIntFieldUpdateOperationsInput | number | null
    maxUsesPerUser?: IntFieldUpdateOperationsInput | number
    usedCount?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isFirstOrder?: BoolFieldUpdateOperationsInput | boolean
    sellerId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type bannersUpdateWithoutAdminInput = {
    imageUrl?: StringFieldUpdateOperationsInput | string
    fileId?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    category?: NullableStringFieldUpdateOperationsInput | string | null
    status?: NullableStringFieldUpdateOperationsInput | string | null
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    bannerType?: NullableStringFieldUpdateOperationsInput | string | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    subtitle?: NullableStringFieldUpdateOperationsInput | string | null
    price?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    seller?: sellersUpdateOneWithoutBannersNestedInput
  }

  export type bannersUncheckedUpdateWithoutAdminInput = {
    imageUrl?: StringFieldUpdateOperationsInput | string
    fileId?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    category?: NullableStringFieldUpdateOperationsInput | string | null
    status?: NullableStringFieldUpdateOperationsInput | string | null
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    bannerType?: NullableStringFieldUpdateOperationsInput | string | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    subtitle?: NullableStringFieldUpdateOperationsInput | string | null
    price?: NullableStringFieldUpdateOperationsInput | string | null
    sellerId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type bannersUncheckedUpdateManyWithoutAdminInput = {
    imageUrl?: StringFieldUpdateOperationsInput | string
    fileId?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    category?: NullableStringFieldUpdateOperationsInput | string | null
    status?: NullableStringFieldUpdateOperationsInput | string | null
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    bannerType?: NullableStringFieldUpdateOperationsInput | string | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    subtitle?: NullableStringFieldUpdateOperationsInput | string | null
    price?: NullableStringFieldUpdateOperationsInput | string | null
    sellerId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type usersCreateManyAvatarInput = {
    id?: string
    phone_number?: string | null
    email?: string | null
    name: string
    following?: usersCreatefollowingInput | string[]
    addresses?: usersCreateaddressesInput | InputJsonValue[]
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type storesCreateManyAvatarInput = {
    id?: string
    name: string
    bio: string
    address: string
    city: string
    pincode: string
    opening_hours: string
    closing_hours: string
    is_instant_delivery_enabled?: boolean
    instant_delivery_fee?: number
    instant_delivery_window_start?: string
    instant_delivery_window_end?: string
    availableCities?: storesCreateavailableCitiesInput | string[]
    cityDeliveryTimes?: InputJsonValue | null
    state?: string | null
    sellerId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type usersUpdateWithoutAvatarInput = {
    phone_number?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    following?: usersUpdatefollowingInput | string[]
    addresses?: usersUpdateaddressesInput | InputJsonValue[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    favorites?: favoritesUpdateManyWithoutUserNestedInput
  }

  export type usersUncheckedUpdateWithoutAvatarInput = {
    phone_number?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    following?: usersUpdatefollowingInput | string[]
    addresses?: usersUpdateaddressesInput | InputJsonValue[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    favorites?: favoritesUncheckedUpdateManyWithoutUserNestedInput
  }

  export type usersUncheckedUpdateManyWithoutAvatarInput = {
    phone_number?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    following?: usersUpdatefollowingInput | string[]
    addresses?: usersUpdateaddressesInput | InputJsonValue[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type storesUpdateWithoutAvatarInput = {
    name?: StringFieldUpdateOperationsInput | string
    bio?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    city?: StringFieldUpdateOperationsInput | string
    pincode?: StringFieldUpdateOperationsInput | string
    opening_hours?: StringFieldUpdateOperationsInput | string
    closing_hours?: StringFieldUpdateOperationsInput | string
    is_instant_delivery_enabled?: BoolFieldUpdateOperationsInput | boolean
    instant_delivery_fee?: FloatFieldUpdateOperationsInput | number
    instant_delivery_window_start?: StringFieldUpdateOperationsInput | string
    instant_delivery_window_end?: StringFieldUpdateOperationsInput | string
    availableCities?: storesUpdateavailableCitiesInput | string[]
    cityDeliveryTimes?: InputJsonValue | InputJsonValue | null
    state?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    seller?: sellersUpdateOneRequiredWithoutStoreNestedInput
    products?: productsUpdateManyWithoutStoreNestedInput
  }

  export type storesUncheckedUpdateWithoutAvatarInput = {
    name?: StringFieldUpdateOperationsInput | string
    bio?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    city?: StringFieldUpdateOperationsInput | string
    pincode?: StringFieldUpdateOperationsInput | string
    opening_hours?: StringFieldUpdateOperationsInput | string
    closing_hours?: StringFieldUpdateOperationsInput | string
    is_instant_delivery_enabled?: BoolFieldUpdateOperationsInput | boolean
    instant_delivery_fee?: FloatFieldUpdateOperationsInput | number
    instant_delivery_window_start?: StringFieldUpdateOperationsInput | string
    instant_delivery_window_end?: StringFieldUpdateOperationsInput | string
    availableCities?: storesUpdateavailableCitiesInput | string[]
    cityDeliveryTimes?: InputJsonValue | InputJsonValue | null
    state?: NullableStringFieldUpdateOperationsInput | string | null
    sellerId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    products?: productsUncheckedUpdateManyWithoutStoreNestedInput
  }

  export type storesUncheckedUpdateManyWithoutAvatarInput = {
    name?: StringFieldUpdateOperationsInput | string
    bio?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    city?: StringFieldUpdateOperationsInput | string
    pincode?: StringFieldUpdateOperationsInput | string
    opening_hours?: StringFieldUpdateOperationsInput | string
    closing_hours?: StringFieldUpdateOperationsInput | string
    is_instant_delivery_enabled?: BoolFieldUpdateOperationsInput | boolean
    instant_delivery_fee?: FloatFieldUpdateOperationsInput | number
    instant_delivery_window_start?: StringFieldUpdateOperationsInput | string
    instant_delivery_window_end?: StringFieldUpdateOperationsInput | string
    availableCities?: storesUpdateavailableCitiesInput | string[]
    cityDeliveryTimes?: InputJsonValue | InputJsonValue | null
    state?: NullableStringFieldUpdateOperationsInput | string | null
    sellerId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type favoritesCreateManyUserInput = {
    id?: string
    productId: string
    createdAt?: Date | string
  }

  export type favoritesUpdateWithoutUserInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    product?: productsUpdateOneRequiredWithoutFavoritesNestedInput
  }

  export type favoritesUncheckedUpdateWithoutUserInput = {
    productId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type favoritesUncheckedUpdateManyWithoutUserInput = {
    productId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type coupon_usagesCreateManyCouponInput = {
    id?: string
    userId: string
    orderId: string
    usedAt?: Date | string
  }

  export type coupon_usagesUpdateWithoutCouponInput = {
    userId?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    usedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type coupon_usagesUncheckedUpdateWithoutCouponInput = {
    userId?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    usedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type coupon_usagesUncheckedUpdateManyWithoutCouponInput = {
    userId?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    usedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type bannersCreateManySellerInput = {
    id?: string
    imageUrl: string
    fileId: string
    isActive?: boolean
    category?: string | null
    status?: string | null
    rejectionReason?: string | null
    bannerType?: string | null
    title?: string | null
    subtitle?: string | null
    price?: string | null
    adminId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type seller_eventsCreateManySellerInput = {
    id?: string
    title: string
    description?: string | null
    type: $Enums.sellerEventType
    minOrder?: number | null
    discount?: number | null
    startTime: Date | string
    endTime: Date | string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type discount_codesCreateManySellerInput = {
    id?: string
    public_name: string
    discountType: string
    discountValue: number
    minOrderValue?: number
    discountCode: string
    expiresAt?: Date | string | null
    maxUses?: number | null
    maxUsesPerUser?: number
    usedCount?: number
    isActive?: boolean
    isFirstOrder?: boolean
    adminId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type staffsCreateManySellerInput = {
    id?: string
    name: string
    email: string
    password: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type bannersUpdateWithoutSellerInput = {
    imageUrl?: StringFieldUpdateOperationsInput | string
    fileId?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    category?: NullableStringFieldUpdateOperationsInput | string | null
    status?: NullableStringFieldUpdateOperationsInput | string | null
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    bannerType?: NullableStringFieldUpdateOperationsInput | string | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    subtitle?: NullableStringFieldUpdateOperationsInput | string | null
    price?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    admin?: adminsUpdateOneWithoutBannersNestedInput
  }

  export type bannersUncheckedUpdateWithoutSellerInput = {
    imageUrl?: StringFieldUpdateOperationsInput | string
    fileId?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    category?: NullableStringFieldUpdateOperationsInput | string | null
    status?: NullableStringFieldUpdateOperationsInput | string | null
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    bannerType?: NullableStringFieldUpdateOperationsInput | string | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    subtitle?: NullableStringFieldUpdateOperationsInput | string | null
    price?: NullableStringFieldUpdateOperationsInput | string | null
    adminId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type bannersUncheckedUpdateManyWithoutSellerInput = {
    imageUrl?: StringFieldUpdateOperationsInput | string
    fileId?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    category?: NullableStringFieldUpdateOperationsInput | string | null
    status?: NullableStringFieldUpdateOperationsInput | string | null
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    bannerType?: NullableStringFieldUpdateOperationsInput | string | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    subtitle?: NullableStringFieldUpdateOperationsInput | string | null
    price?: NullableStringFieldUpdateOperationsInput | string | null
    adminId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type seller_eventsUpdateWithoutSellerInput = {
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumsellerEventTypeFieldUpdateOperationsInput | $Enums.sellerEventType
    minOrder?: NullableFloatFieldUpdateOperationsInput | number | null
    discount?: NullableFloatFieldUpdateOperationsInput | number | null
    startTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endTime?: DateTimeFieldUpdateOperationsInput | Date | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type seller_eventsUncheckedUpdateWithoutSellerInput = {
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumsellerEventTypeFieldUpdateOperationsInput | $Enums.sellerEventType
    minOrder?: NullableFloatFieldUpdateOperationsInput | number | null
    discount?: NullableFloatFieldUpdateOperationsInput | number | null
    startTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endTime?: DateTimeFieldUpdateOperationsInput | Date | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type seller_eventsUncheckedUpdateManyWithoutSellerInput = {
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumsellerEventTypeFieldUpdateOperationsInput | $Enums.sellerEventType
    minOrder?: NullableFloatFieldUpdateOperationsInput | number | null
    discount?: NullableFloatFieldUpdateOperationsInput | number | null
    startTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endTime?: DateTimeFieldUpdateOperationsInput | Date | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type discount_codesUpdateWithoutSellerInput = {
    public_name?: StringFieldUpdateOperationsInput | string
    discountType?: StringFieldUpdateOperationsInput | string
    discountValue?: FloatFieldUpdateOperationsInput | number
    minOrderValue?: FloatFieldUpdateOperationsInput | number
    discountCode?: StringFieldUpdateOperationsInput | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    maxUses?: NullableIntFieldUpdateOperationsInput | number | null
    maxUsesPerUser?: IntFieldUpdateOperationsInput | number
    usedCount?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isFirstOrder?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    admin?: adminsUpdateOneWithoutCouponsNestedInput
    usages?: coupon_usagesUpdateManyWithoutCouponNestedInput
  }

  export type discount_codesUncheckedUpdateWithoutSellerInput = {
    public_name?: StringFieldUpdateOperationsInput | string
    discountType?: StringFieldUpdateOperationsInput | string
    discountValue?: FloatFieldUpdateOperationsInput | number
    minOrderValue?: FloatFieldUpdateOperationsInput | number
    discountCode?: StringFieldUpdateOperationsInput | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    maxUses?: NullableIntFieldUpdateOperationsInput | number | null
    maxUsesPerUser?: IntFieldUpdateOperationsInput | number
    usedCount?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isFirstOrder?: BoolFieldUpdateOperationsInput | boolean
    adminId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usages?: coupon_usagesUncheckedUpdateManyWithoutCouponNestedInput
  }

  export type discount_codesUncheckedUpdateManyWithoutSellerInput = {
    public_name?: StringFieldUpdateOperationsInput | string
    discountType?: StringFieldUpdateOperationsInput | string
    discountValue?: FloatFieldUpdateOperationsInput | number
    minOrderValue?: FloatFieldUpdateOperationsInput | number
    discountCode?: StringFieldUpdateOperationsInput | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    maxUses?: NullableIntFieldUpdateOperationsInput | number | null
    maxUsesPerUser?: IntFieldUpdateOperationsInput | number
    usedCount?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isFirstOrder?: BoolFieldUpdateOperationsInput | boolean
    adminId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type staffsUpdateWithoutSellerInput = {
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type staffsUncheckedUpdateWithoutSellerInput = {
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type staffsUncheckedUpdateManyWithoutSellerInput = {
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type productsCreateManyStoreInput = {
    id?: string
    title: string
    slug?: string | null
    isCatalog?: boolean
    category: string
    subCategory: string
    short_description: string
    tags?: productsCreatetagsInput | string[]
    sizes?: productsCreatesizesInput | string[]
    sizePricing?: InputJsonValue | null
    cuttingTypePricing?: InputJsonValue | null
    pieceSizePricing?: InputJsonValue | null
    cuttingTypes?: productsCreatecuttingTypesInput | string[]
    pieceSizes?: productsCreatepieceSizesInput | string[]
    processingWeightLoss?: string | null
    stock: number
    sale_price: number
    regular_price: number
    totalSold?: number
    ratings?: number
    cashOnDelivery?: string | null
    discount_codes?: productsCreatediscount_codesInput | string[]
    status?: $Enums.productStatus
    isDeleted?: boolean | null
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    adminId?: string | null
    catalogProductId?: string | null
  }

  export type productsUpdateWithoutStoreInput = {
    title?: StringFieldUpdateOperationsInput | string
    slug?: NullableStringFieldUpdateOperationsInput | string | null
    isCatalog?: BoolFieldUpdateOperationsInput | boolean
    category?: StringFieldUpdateOperationsInput | string
    subCategory?: StringFieldUpdateOperationsInput | string
    short_description?: StringFieldUpdateOperationsInput | string
    tags?: productsUpdatetagsInput | string[]
    sizes?: productsUpdatesizesInput | string[]
    sizePricing?: InputJsonValue | InputJsonValue | null
    cuttingTypePricing?: InputJsonValue | InputJsonValue | null
    pieceSizePricing?: InputJsonValue | InputJsonValue | null
    cuttingTypes?: productsUpdatecuttingTypesInput | string[]
    pieceSizes?: productsUpdatepieceSizesInput | string[]
    processingWeightLoss?: NullableStringFieldUpdateOperationsInput | string | null
    stock?: IntFieldUpdateOperationsInput | number
    sale_price?: FloatFieldUpdateOperationsInput | number
    regular_price?: FloatFieldUpdateOperationsInput | number
    totalSold?: IntFieldUpdateOperationsInput | number
    ratings?: FloatFieldUpdateOperationsInput | number
    cashOnDelivery?: NullableStringFieldUpdateOperationsInput | string | null
    discount_codes?: productsUpdatediscount_codesInput | string[]
    status?: EnumproductStatusFieldUpdateOperationsInput | $Enums.productStatus
    isDeleted?: NullableBoolFieldUpdateOperationsInput | boolean | null
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    images?: imagesUpdateManyWithoutProductNestedInput
    favorites?: favoritesUpdateManyWithoutProductNestedInput
    admin?: adminsUpdateOneWithoutProductsNestedInput
    catalogProduct?: productsUpdateOneWithoutStoreVariantsNestedInput
    storeVariants?: productsUpdateManyWithoutCatalogProductNestedInput
  }

  export type productsUncheckedUpdateWithoutStoreInput = {
    title?: StringFieldUpdateOperationsInput | string
    slug?: NullableStringFieldUpdateOperationsInput | string | null
    isCatalog?: BoolFieldUpdateOperationsInput | boolean
    category?: StringFieldUpdateOperationsInput | string
    subCategory?: StringFieldUpdateOperationsInput | string
    short_description?: StringFieldUpdateOperationsInput | string
    tags?: productsUpdatetagsInput | string[]
    sizes?: productsUpdatesizesInput | string[]
    sizePricing?: InputJsonValue | InputJsonValue | null
    cuttingTypePricing?: InputJsonValue | InputJsonValue | null
    pieceSizePricing?: InputJsonValue | InputJsonValue | null
    cuttingTypes?: productsUpdatecuttingTypesInput | string[]
    pieceSizes?: productsUpdatepieceSizesInput | string[]
    processingWeightLoss?: NullableStringFieldUpdateOperationsInput | string | null
    stock?: IntFieldUpdateOperationsInput | number
    sale_price?: FloatFieldUpdateOperationsInput | number
    regular_price?: FloatFieldUpdateOperationsInput | number
    totalSold?: IntFieldUpdateOperationsInput | number
    ratings?: FloatFieldUpdateOperationsInput | number
    cashOnDelivery?: NullableStringFieldUpdateOperationsInput | string | null
    discount_codes?: productsUpdatediscount_codesInput | string[]
    status?: EnumproductStatusFieldUpdateOperationsInput | $Enums.productStatus
    isDeleted?: NullableBoolFieldUpdateOperationsInput | boolean | null
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    adminId?: NullableStringFieldUpdateOperationsInput | string | null
    catalogProductId?: NullableStringFieldUpdateOperationsInput | string | null
    images?: imagesUncheckedUpdateManyWithoutProductNestedInput
    favorites?: favoritesUncheckedUpdateManyWithoutProductNestedInput
    storeVariants?: productsUncheckedUpdateManyWithoutCatalogProductNestedInput
  }

  export type productsUncheckedUpdateManyWithoutStoreInput = {
    title?: StringFieldUpdateOperationsInput | string
    slug?: NullableStringFieldUpdateOperationsInput | string | null
    isCatalog?: BoolFieldUpdateOperationsInput | boolean
    category?: StringFieldUpdateOperationsInput | string
    subCategory?: StringFieldUpdateOperationsInput | string
    short_description?: StringFieldUpdateOperationsInput | string
    tags?: productsUpdatetagsInput | string[]
    sizes?: productsUpdatesizesInput | string[]
    sizePricing?: InputJsonValue | InputJsonValue | null
    cuttingTypePricing?: InputJsonValue | InputJsonValue | null
    pieceSizePricing?: InputJsonValue | InputJsonValue | null
    cuttingTypes?: productsUpdatecuttingTypesInput | string[]
    pieceSizes?: productsUpdatepieceSizesInput | string[]
    processingWeightLoss?: NullableStringFieldUpdateOperationsInput | string | null
    stock?: IntFieldUpdateOperationsInput | number
    sale_price?: FloatFieldUpdateOperationsInput | number
    regular_price?: FloatFieldUpdateOperationsInput | number
    totalSold?: IntFieldUpdateOperationsInput | number
    ratings?: FloatFieldUpdateOperationsInput | number
    cashOnDelivery?: NullableStringFieldUpdateOperationsInput | string | null
    discount_codes?: productsUpdatediscount_codesInput | string[]
    status?: EnumproductStatusFieldUpdateOperationsInput | $Enums.productStatus
    isDeleted?: NullableBoolFieldUpdateOperationsInput | boolean | null
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    adminId?: NullableStringFieldUpdateOperationsInput | string | null
    catalogProductId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type imagesCreateManyProductInput = {
    id?: string
    file_id: string
    url: string
    type?: $Enums.ImageType
    createdAt?: Date | string
  }

  export type favoritesCreateManyProductInput = {
    id?: string
    userId: string
    createdAt?: Date | string
  }

  export type productsCreateManyCatalogProductInput = {
    id?: string
    title: string
    slug?: string | null
    isCatalog?: boolean
    category: string
    subCategory: string
    short_description: string
    tags?: productsCreatetagsInput | string[]
    sizes?: productsCreatesizesInput | string[]
    sizePricing?: InputJsonValue | null
    cuttingTypePricing?: InputJsonValue | null
    pieceSizePricing?: InputJsonValue | null
    cuttingTypes?: productsCreatecuttingTypesInput | string[]
    pieceSizes?: productsCreatepieceSizesInput | string[]
    processingWeightLoss?: string | null
    stock: number
    sale_price: number
    regular_price: number
    totalSold?: number
    ratings?: number
    cashOnDelivery?: string | null
    discount_codes?: productsCreatediscount_codesInput | string[]
    status?: $Enums.productStatus
    isDeleted?: boolean | null
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    storeId?: string | null
    adminId?: string | null
  }

  export type imagesUpdateWithoutProductInput = {
    file_id?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    type?: EnumImageTypeFieldUpdateOperationsInput | $Enums.ImageType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: usersUpdateManyWithoutAvatarNestedInput
    stores?: storesUpdateManyWithoutAvatarNestedInput
  }

  export type imagesUncheckedUpdateWithoutProductInput = {
    file_id?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    type?: EnumImageTypeFieldUpdateOperationsInput | $Enums.ImageType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: usersUncheckedUpdateManyWithoutAvatarNestedInput
    stores?: storesUncheckedUpdateManyWithoutAvatarNestedInput
  }

  export type imagesUncheckedUpdateManyWithoutProductInput = {
    file_id?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    type?: EnumImageTypeFieldUpdateOperationsInput | $Enums.ImageType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type favoritesUpdateWithoutProductInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: usersUpdateOneRequiredWithoutFavoritesNestedInput
  }

  export type favoritesUncheckedUpdateWithoutProductInput = {
    userId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type favoritesUncheckedUpdateManyWithoutProductInput = {
    userId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type productsUpdateWithoutCatalogProductInput = {
    title?: StringFieldUpdateOperationsInput | string
    slug?: NullableStringFieldUpdateOperationsInput | string | null
    isCatalog?: BoolFieldUpdateOperationsInput | boolean
    category?: StringFieldUpdateOperationsInput | string
    subCategory?: StringFieldUpdateOperationsInput | string
    short_description?: StringFieldUpdateOperationsInput | string
    tags?: productsUpdatetagsInput | string[]
    sizes?: productsUpdatesizesInput | string[]
    sizePricing?: InputJsonValue | InputJsonValue | null
    cuttingTypePricing?: InputJsonValue | InputJsonValue | null
    pieceSizePricing?: InputJsonValue | InputJsonValue | null
    cuttingTypes?: productsUpdatecuttingTypesInput | string[]
    pieceSizes?: productsUpdatepieceSizesInput | string[]
    processingWeightLoss?: NullableStringFieldUpdateOperationsInput | string | null
    stock?: IntFieldUpdateOperationsInput | number
    sale_price?: FloatFieldUpdateOperationsInput | number
    regular_price?: FloatFieldUpdateOperationsInput | number
    totalSold?: IntFieldUpdateOperationsInput | number
    ratings?: FloatFieldUpdateOperationsInput | number
    cashOnDelivery?: NullableStringFieldUpdateOperationsInput | string | null
    discount_codes?: productsUpdatediscount_codesInput | string[]
    status?: EnumproductStatusFieldUpdateOperationsInput | $Enums.productStatus
    isDeleted?: NullableBoolFieldUpdateOperationsInput | boolean | null
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    images?: imagesUpdateManyWithoutProductNestedInput
    favorites?: favoritesUpdateManyWithoutProductNestedInput
    store?: storesUpdateOneWithoutProductsNestedInput
    admin?: adminsUpdateOneWithoutProductsNestedInput
    storeVariants?: productsUpdateManyWithoutCatalogProductNestedInput
  }

  export type productsUncheckedUpdateWithoutCatalogProductInput = {
    title?: StringFieldUpdateOperationsInput | string
    slug?: NullableStringFieldUpdateOperationsInput | string | null
    isCatalog?: BoolFieldUpdateOperationsInput | boolean
    category?: StringFieldUpdateOperationsInput | string
    subCategory?: StringFieldUpdateOperationsInput | string
    short_description?: StringFieldUpdateOperationsInput | string
    tags?: productsUpdatetagsInput | string[]
    sizes?: productsUpdatesizesInput | string[]
    sizePricing?: InputJsonValue | InputJsonValue | null
    cuttingTypePricing?: InputJsonValue | InputJsonValue | null
    pieceSizePricing?: InputJsonValue | InputJsonValue | null
    cuttingTypes?: productsUpdatecuttingTypesInput | string[]
    pieceSizes?: productsUpdatepieceSizesInput | string[]
    processingWeightLoss?: NullableStringFieldUpdateOperationsInput | string | null
    stock?: IntFieldUpdateOperationsInput | number
    sale_price?: FloatFieldUpdateOperationsInput | number
    regular_price?: FloatFieldUpdateOperationsInput | number
    totalSold?: IntFieldUpdateOperationsInput | number
    ratings?: FloatFieldUpdateOperationsInput | number
    cashOnDelivery?: NullableStringFieldUpdateOperationsInput | string | null
    discount_codes?: productsUpdatediscount_codesInput | string[]
    status?: EnumproductStatusFieldUpdateOperationsInput | $Enums.productStatus
    isDeleted?: NullableBoolFieldUpdateOperationsInput | boolean | null
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    storeId?: NullableStringFieldUpdateOperationsInput | string | null
    adminId?: NullableStringFieldUpdateOperationsInput | string | null
    images?: imagesUncheckedUpdateManyWithoutProductNestedInput
    favorites?: favoritesUncheckedUpdateManyWithoutProductNestedInput
    storeVariants?: productsUncheckedUpdateManyWithoutCatalogProductNestedInput
  }

  export type productsUncheckedUpdateManyWithoutCatalogProductInput = {
    title?: StringFieldUpdateOperationsInput | string
    slug?: NullableStringFieldUpdateOperationsInput | string | null
    isCatalog?: BoolFieldUpdateOperationsInput | boolean
    category?: StringFieldUpdateOperationsInput | string
    subCategory?: StringFieldUpdateOperationsInput | string
    short_description?: StringFieldUpdateOperationsInput | string
    tags?: productsUpdatetagsInput | string[]
    sizes?: productsUpdatesizesInput | string[]
    sizePricing?: InputJsonValue | InputJsonValue | null
    cuttingTypePricing?: InputJsonValue | InputJsonValue | null
    pieceSizePricing?: InputJsonValue | InputJsonValue | null
    cuttingTypes?: productsUpdatecuttingTypesInput | string[]
    pieceSizes?: productsUpdatepieceSizesInput | string[]
    processingWeightLoss?: NullableStringFieldUpdateOperationsInput | string | null
    stock?: IntFieldUpdateOperationsInput | number
    sale_price?: FloatFieldUpdateOperationsInput | number
    regular_price?: FloatFieldUpdateOperationsInput | number
    totalSold?: IntFieldUpdateOperationsInput | number
    ratings?: FloatFieldUpdateOperationsInput | number
    cashOnDelivery?: NullableStringFieldUpdateOperationsInput | string | null
    discount_codes?: productsUpdatediscount_codesInput | string[]
    status?: EnumproductStatusFieldUpdateOperationsInput | $Enums.productStatus
    isDeleted?: NullableBoolFieldUpdateOperationsInput | boolean | null
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    storeId?: NullableStringFieldUpdateOperationsInput | string | null
    adminId?: NullableStringFieldUpdateOperationsInput | string | null
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use AdminsCountOutputTypeDefaultArgs instead
     */
    export type AdminsCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = AdminsCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ImagesCountOutputTypeDefaultArgs instead
     */
    export type ImagesCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ImagesCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use UsersCountOutputTypeDefaultArgs instead
     */
    export type UsersCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UsersCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use Discount_codesCountOutputTypeDefaultArgs instead
     */
    export type Discount_codesCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = Discount_codesCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use SellersCountOutputTypeDefaultArgs instead
     */
    export type SellersCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = SellersCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use StoresCountOutputTypeDefaultArgs instead
     */
    export type StoresCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = StoresCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ProductsCountOutputTypeDefaultArgs instead
     */
    export type ProductsCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ProductsCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use adminsDefaultArgs instead
     */
    export type adminsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = adminsDefaultArgs<ExtArgs>
    /**
     * @deprecated Use imagesDefaultArgs instead
     */
    export type imagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = imagesDefaultArgs<ExtArgs>
    /**
     * @deprecated Use usersDefaultArgs instead
     */
    export type usersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = usersDefaultArgs<ExtArgs>
    /**
     * @deprecated Use discount_codesDefaultArgs instead
     */
    export type discount_codesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = discount_codesDefaultArgs<ExtArgs>
    /**
     * @deprecated Use coupon_usagesDefaultArgs instead
     */
    export type coupon_usagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = coupon_usagesDefaultArgs<ExtArgs>
    /**
     * @deprecated Use sellersDefaultArgs instead
     */
    export type sellersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = sellersDefaultArgs<ExtArgs>
    /**
     * @deprecated Use staffsDefaultArgs instead
     */
    export type staffsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = staffsDefaultArgs<ExtArgs>
    /**
     * @deprecated Use storesDefaultArgs instead
     */
    export type storesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = storesDefaultArgs<ExtArgs>
    /**
     * @deprecated Use favoritesDefaultArgs instead
     */
    export type favoritesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = favoritesDefaultArgs<ExtArgs>
    /**
     * @deprecated Use site_configDefaultArgs instead
     */
    export type site_configArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = site_configDefaultArgs<ExtArgs>
    /**
     * @deprecated Use productsDefaultArgs instead
     */
    export type productsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = productsDefaultArgs<ExtArgs>
    /**
     * @deprecated Use bannersDefaultArgs instead
     */
    export type bannersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = bannersDefaultArgs<ExtArgs>
    /**
     * @deprecated Use seller_eventsDefaultArgs instead
     */
    export type seller_eventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = seller_eventsDefaultArgs<ExtArgs>
    /**
     * @deprecated Use SignupAccessCodeDefaultArgs instead
     */
    export type SignupAccessCodeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = SignupAccessCodeDefaultArgs<ExtArgs>

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