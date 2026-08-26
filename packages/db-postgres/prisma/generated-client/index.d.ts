
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
 * Model Order
 * 
 */
export type Order = $Result.DefaultSelection<Prisma.$OrderPayload>
/**
 * Model OrderItem
 * 
 */
export type OrderItem = $Result.DefaultSelection<Prisma.$OrderItemPayload>
/**
 * Model Payment
 * 
 */
export type Payment = $Result.DefaultSelection<Prisma.$PaymentPayload>
/**
 * Model CouponUsage
 * 
 */
export type CouponUsage = $Result.DefaultSelection<Prisma.$CouponUsagePayload>
/**
 * Model Notification
 * 
 */
export type Notification = $Result.DefaultSelection<Prisma.$NotificationPayload>
/**
 * Model AuditLog
 * 
 */
export type AuditLog = $Result.DefaultSelection<Prisma.$AuditLogPayload>
/**
 * Model WebhookEvent
 * 
 */
export type WebhookEvent = $Result.DefaultSelection<Prisma.$WebhookEventPayload>
/**
 * Model OutboxEvent
 * 
 */
export type OutboxEvent = $Result.DefaultSelection<Prisma.$OutboxEventPayload>
/**
 * Model StockReservation
 * 
 */
export type StockReservation = $Result.DefaultSelection<Prisma.$StockReservationPayload>
/**
 * Model ProductCoPurchase
 * 
 */
export type ProductCoPurchase = $Result.DefaultSelection<Prisma.$ProductCoPurchasePayload>
/**
 * Model ProductOrderStat
 * 
 */
export type ProductOrderStat = $Result.DefaultSelection<Prisma.$ProductOrderStatPayload>
/**
 * Model CoPurchaseState
 * 
 */
export type CoPurchaseState = $Result.DefaultSelection<Prisma.$CoPurchaseStatePayload>

/**
 * Enums
 */
export namespace $Enums {
  export const OrderStatus: {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  PREPARING: 'PREPARING',
  READY_FOR_PICKUP: 'READY_FOR_PICKUP',
  ASSIGNED_TO_RIDER: 'ASSIGNED_TO_RIDER',
  REJECTED: 'REJECTED',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED'
};

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus]


export const PaymentStatus: {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  NOT_PAID: 'NOT_PAID',
  REFUND_PENDING: 'REFUND_PENDING',
  REFUNDED: 'REFUNDED'
};

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus]


export const PaymentMethod: {
  COD: 'COD',
  RAZORPAY: 'RAZORPAY',
  ONLINE: 'ONLINE'
};

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod]


export const OrderRiderStatus: {
  ASSIGNED: 'ASSIGNED',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED'
};

export type OrderRiderStatus = (typeof OrderRiderStatus)[keyof typeof OrderRiderStatus]


export const CancelledBy: {
  CUSTOMER: 'CUSTOMER',
  SELLER: 'SELLER',
  STAFF: 'STAFF',
  SYSTEM: 'SYSTEM'
};

export type CancelledBy = (typeof CancelledBy)[keyof typeof CancelledBy]


export const RefundStatus: {
  NONE: 'NONE',
  REQUESTED: 'REQUESTED',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED'
};

export type RefundStatus = (typeof RefundStatus)[keyof typeof RefundStatus]


export const AuditEntityType: {
  ORDER: 'ORDER',
  PAYMENT: 'PAYMENT',
  COUPON: 'COUPON',
  STOCK: 'STOCK',
  REFUND: 'REFUND',
  REFERRAL: 'REFERRAL'
};

export type AuditEntityType = (typeof AuditEntityType)[keyof typeof AuditEntityType]


export const ActorType: {
  USER: 'USER',
  SELLER: 'SELLER',
  ADMIN: 'ADMIN',
  SYSTEM: 'SYSTEM'
};

export type ActorType = (typeof ActorType)[keyof typeof ActorType]


export const OutboxStatus: {
  PENDING: 'PENDING',
  PUBLISHED: 'PUBLISHED',
  FAILED: 'FAILED'
};

export type OutboxStatus = (typeof OutboxStatus)[keyof typeof OutboxStatus]


export const StockReservationStatus: {
  HELD: 'HELD',
  CONSUMED: 'CONSUMED',
  RELEASED: 'RELEASED'
};

export type StockReservationStatus = (typeof StockReservationStatus)[keyof typeof StockReservationStatus]

}

export type OrderStatus = $Enums.OrderStatus

export const OrderStatus: typeof $Enums.OrderStatus

export type PaymentStatus = $Enums.PaymentStatus

export const PaymentStatus: typeof $Enums.PaymentStatus

export type PaymentMethod = $Enums.PaymentMethod

export const PaymentMethod: typeof $Enums.PaymentMethod

export type OrderRiderStatus = $Enums.OrderRiderStatus

export const OrderRiderStatus: typeof $Enums.OrderRiderStatus

export type CancelledBy = $Enums.CancelledBy

export const CancelledBy: typeof $Enums.CancelledBy

export type RefundStatus = $Enums.RefundStatus

export const RefundStatus: typeof $Enums.RefundStatus

export type AuditEntityType = $Enums.AuditEntityType

export const AuditEntityType: typeof $Enums.AuditEntityType

export type ActorType = $Enums.ActorType

export const ActorType: typeof $Enums.ActorType

export type OutboxStatus = $Enums.OutboxStatus

export const OutboxStatus: typeof $Enums.OutboxStatus

export type StockReservationStatus = $Enums.StockReservationStatus

export const StockReservationStatus: typeof $Enums.StockReservationStatus

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Orders
 * const orders = await prisma.order.findMany()
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
   * // Fetch zero or more Orders
   * const orders = await prisma.order.findMany()
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
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


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
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.order`: Exposes CRUD operations for the **Order** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Orders
    * const orders = await prisma.order.findMany()
    * ```
    */
  get order(): Prisma.OrderDelegate<ExtArgs>;

  /**
   * `prisma.orderItem`: Exposes CRUD operations for the **OrderItem** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more OrderItems
    * const orderItems = await prisma.orderItem.findMany()
    * ```
    */
  get orderItem(): Prisma.OrderItemDelegate<ExtArgs>;

  /**
   * `prisma.payment`: Exposes CRUD operations for the **Payment** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Payments
    * const payments = await prisma.payment.findMany()
    * ```
    */
  get payment(): Prisma.PaymentDelegate<ExtArgs>;

  /**
   * `prisma.couponUsage`: Exposes CRUD operations for the **CouponUsage** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CouponUsages
    * const couponUsages = await prisma.couponUsage.findMany()
    * ```
    */
  get couponUsage(): Prisma.CouponUsageDelegate<ExtArgs>;

  /**
   * `prisma.notification`: Exposes CRUD operations for the **Notification** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Notifications
    * const notifications = await prisma.notification.findMany()
    * ```
    */
  get notification(): Prisma.NotificationDelegate<ExtArgs>;

  /**
   * `prisma.auditLog`: Exposes CRUD operations for the **AuditLog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AuditLogs
    * const auditLogs = await prisma.auditLog.findMany()
    * ```
    */
  get auditLog(): Prisma.AuditLogDelegate<ExtArgs>;

  /**
   * `prisma.webhookEvent`: Exposes CRUD operations for the **WebhookEvent** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more WebhookEvents
    * const webhookEvents = await prisma.webhookEvent.findMany()
    * ```
    */
  get webhookEvent(): Prisma.WebhookEventDelegate<ExtArgs>;

  /**
   * `prisma.outboxEvent`: Exposes CRUD operations for the **OutboxEvent** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more OutboxEvents
    * const outboxEvents = await prisma.outboxEvent.findMany()
    * ```
    */
  get outboxEvent(): Prisma.OutboxEventDelegate<ExtArgs>;

  /**
   * `prisma.stockReservation`: Exposes CRUD operations for the **StockReservation** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more StockReservations
    * const stockReservations = await prisma.stockReservation.findMany()
    * ```
    */
  get stockReservation(): Prisma.StockReservationDelegate<ExtArgs>;

  /**
   * `prisma.productCoPurchase`: Exposes CRUD operations for the **ProductCoPurchase** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ProductCoPurchases
    * const productCoPurchases = await prisma.productCoPurchase.findMany()
    * ```
    */
  get productCoPurchase(): Prisma.ProductCoPurchaseDelegate<ExtArgs>;

  /**
   * `prisma.productOrderStat`: Exposes CRUD operations for the **ProductOrderStat** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ProductOrderStats
    * const productOrderStats = await prisma.productOrderStat.findMany()
    * ```
    */
  get productOrderStat(): Prisma.ProductOrderStatDelegate<ExtArgs>;

  /**
   * `prisma.coPurchaseState`: Exposes CRUD operations for the **CoPurchaseState** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CoPurchaseStates
    * const coPurchaseStates = await prisma.coPurchaseState.findMany()
    * ```
    */
  get coPurchaseState(): Prisma.CoPurchaseStateDelegate<ExtArgs>;
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
    Order: 'Order',
    OrderItem: 'OrderItem',
    Payment: 'Payment',
    CouponUsage: 'CouponUsage',
    Notification: 'Notification',
    AuditLog: 'AuditLog',
    WebhookEvent: 'WebhookEvent',
    OutboxEvent: 'OutboxEvent',
    StockReservation: 'StockReservation',
    ProductCoPurchase: 'ProductCoPurchase',
    ProductOrderStat: 'ProductOrderStat',
    CoPurchaseState: 'CoPurchaseState'
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
      modelProps: "order" | "orderItem" | "payment" | "couponUsage" | "notification" | "auditLog" | "webhookEvent" | "outboxEvent" | "stockReservation" | "productCoPurchase" | "productOrderStat" | "coPurchaseState"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Order: {
        payload: Prisma.$OrderPayload<ExtArgs>
        fields: Prisma.OrderFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OrderFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OrderFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>
          }
          findFirst: {
            args: Prisma.OrderFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OrderFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>
          }
          findMany: {
            args: Prisma.OrderFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>[]
          }
          create: {
            args: Prisma.OrderCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>
          }
          createMany: {
            args: Prisma.OrderCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OrderCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>[]
          }
          delete: {
            args: Prisma.OrderDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>
          }
          update: {
            args: Prisma.OrderUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>
          }
          deleteMany: {
            args: Prisma.OrderDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OrderUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.OrderUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>
          }
          aggregate: {
            args: Prisma.OrderAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOrder>
          }
          groupBy: {
            args: Prisma.OrderGroupByArgs<ExtArgs>
            result: $Utils.Optional<OrderGroupByOutputType>[]
          }
          count: {
            args: Prisma.OrderCountArgs<ExtArgs>
            result: $Utils.Optional<OrderCountAggregateOutputType> | number
          }
        }
      }
      OrderItem: {
        payload: Prisma.$OrderItemPayload<ExtArgs>
        fields: Prisma.OrderItemFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OrderItemFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderItemPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OrderItemFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderItemPayload>
          }
          findFirst: {
            args: Prisma.OrderItemFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderItemPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OrderItemFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderItemPayload>
          }
          findMany: {
            args: Prisma.OrderItemFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderItemPayload>[]
          }
          create: {
            args: Prisma.OrderItemCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderItemPayload>
          }
          createMany: {
            args: Prisma.OrderItemCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OrderItemCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderItemPayload>[]
          }
          delete: {
            args: Prisma.OrderItemDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderItemPayload>
          }
          update: {
            args: Prisma.OrderItemUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderItemPayload>
          }
          deleteMany: {
            args: Prisma.OrderItemDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OrderItemUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.OrderItemUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderItemPayload>
          }
          aggregate: {
            args: Prisma.OrderItemAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOrderItem>
          }
          groupBy: {
            args: Prisma.OrderItemGroupByArgs<ExtArgs>
            result: $Utils.Optional<OrderItemGroupByOutputType>[]
          }
          count: {
            args: Prisma.OrderItemCountArgs<ExtArgs>
            result: $Utils.Optional<OrderItemCountAggregateOutputType> | number
          }
        }
      }
      Payment: {
        payload: Prisma.$PaymentPayload<ExtArgs>
        fields: Prisma.PaymentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PaymentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PaymentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload>
          }
          findFirst: {
            args: Prisma.PaymentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PaymentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload>
          }
          findMany: {
            args: Prisma.PaymentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload>[]
          }
          create: {
            args: Prisma.PaymentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload>
          }
          createMany: {
            args: Prisma.PaymentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PaymentCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload>[]
          }
          delete: {
            args: Prisma.PaymentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload>
          }
          update: {
            args: Prisma.PaymentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload>
          }
          deleteMany: {
            args: Prisma.PaymentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PaymentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PaymentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload>
          }
          aggregate: {
            args: Prisma.PaymentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePayment>
          }
          groupBy: {
            args: Prisma.PaymentGroupByArgs<ExtArgs>
            result: $Utils.Optional<PaymentGroupByOutputType>[]
          }
          count: {
            args: Prisma.PaymentCountArgs<ExtArgs>
            result: $Utils.Optional<PaymentCountAggregateOutputType> | number
          }
        }
      }
      CouponUsage: {
        payload: Prisma.$CouponUsagePayload<ExtArgs>
        fields: Prisma.CouponUsageFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CouponUsageFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CouponUsagePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CouponUsageFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CouponUsagePayload>
          }
          findFirst: {
            args: Prisma.CouponUsageFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CouponUsagePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CouponUsageFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CouponUsagePayload>
          }
          findMany: {
            args: Prisma.CouponUsageFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CouponUsagePayload>[]
          }
          create: {
            args: Prisma.CouponUsageCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CouponUsagePayload>
          }
          createMany: {
            args: Prisma.CouponUsageCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CouponUsageCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CouponUsagePayload>[]
          }
          delete: {
            args: Prisma.CouponUsageDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CouponUsagePayload>
          }
          update: {
            args: Prisma.CouponUsageUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CouponUsagePayload>
          }
          deleteMany: {
            args: Prisma.CouponUsageDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CouponUsageUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.CouponUsageUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CouponUsagePayload>
          }
          aggregate: {
            args: Prisma.CouponUsageAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCouponUsage>
          }
          groupBy: {
            args: Prisma.CouponUsageGroupByArgs<ExtArgs>
            result: $Utils.Optional<CouponUsageGroupByOutputType>[]
          }
          count: {
            args: Prisma.CouponUsageCountArgs<ExtArgs>
            result: $Utils.Optional<CouponUsageCountAggregateOutputType> | number
          }
        }
      }
      Notification: {
        payload: Prisma.$NotificationPayload<ExtArgs>
        fields: Prisma.NotificationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.NotificationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.NotificationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          findFirst: {
            args: Prisma.NotificationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.NotificationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          findMany: {
            args: Prisma.NotificationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>[]
          }
          create: {
            args: Prisma.NotificationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          createMany: {
            args: Prisma.NotificationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.NotificationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>[]
          }
          delete: {
            args: Prisma.NotificationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          update: {
            args: Prisma.NotificationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          deleteMany: {
            args: Prisma.NotificationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.NotificationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.NotificationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          aggregate: {
            args: Prisma.NotificationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateNotification>
          }
          groupBy: {
            args: Prisma.NotificationGroupByArgs<ExtArgs>
            result: $Utils.Optional<NotificationGroupByOutputType>[]
          }
          count: {
            args: Prisma.NotificationCountArgs<ExtArgs>
            result: $Utils.Optional<NotificationCountAggregateOutputType> | number
          }
        }
      }
      AuditLog: {
        payload: Prisma.$AuditLogPayload<ExtArgs>
        fields: Prisma.AuditLogFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AuditLogFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AuditLogFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          findFirst: {
            args: Prisma.AuditLogFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AuditLogFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          findMany: {
            args: Prisma.AuditLogFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>[]
          }
          create: {
            args: Prisma.AuditLogCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          createMany: {
            args: Prisma.AuditLogCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AuditLogCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>[]
          }
          delete: {
            args: Prisma.AuditLogDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          update: {
            args: Prisma.AuditLogUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          deleteMany: {
            args: Prisma.AuditLogDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AuditLogUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.AuditLogUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          aggregate: {
            args: Prisma.AuditLogAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAuditLog>
          }
          groupBy: {
            args: Prisma.AuditLogGroupByArgs<ExtArgs>
            result: $Utils.Optional<AuditLogGroupByOutputType>[]
          }
          count: {
            args: Prisma.AuditLogCountArgs<ExtArgs>
            result: $Utils.Optional<AuditLogCountAggregateOutputType> | number
          }
        }
      }
      WebhookEvent: {
        payload: Prisma.$WebhookEventPayload<ExtArgs>
        fields: Prisma.WebhookEventFieldRefs
        operations: {
          findUnique: {
            args: Prisma.WebhookEventFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WebhookEventPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.WebhookEventFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WebhookEventPayload>
          }
          findFirst: {
            args: Prisma.WebhookEventFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WebhookEventPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.WebhookEventFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WebhookEventPayload>
          }
          findMany: {
            args: Prisma.WebhookEventFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WebhookEventPayload>[]
          }
          create: {
            args: Prisma.WebhookEventCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WebhookEventPayload>
          }
          createMany: {
            args: Prisma.WebhookEventCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.WebhookEventCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WebhookEventPayload>[]
          }
          delete: {
            args: Prisma.WebhookEventDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WebhookEventPayload>
          }
          update: {
            args: Prisma.WebhookEventUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WebhookEventPayload>
          }
          deleteMany: {
            args: Prisma.WebhookEventDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.WebhookEventUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.WebhookEventUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WebhookEventPayload>
          }
          aggregate: {
            args: Prisma.WebhookEventAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateWebhookEvent>
          }
          groupBy: {
            args: Prisma.WebhookEventGroupByArgs<ExtArgs>
            result: $Utils.Optional<WebhookEventGroupByOutputType>[]
          }
          count: {
            args: Prisma.WebhookEventCountArgs<ExtArgs>
            result: $Utils.Optional<WebhookEventCountAggregateOutputType> | number
          }
        }
      }
      OutboxEvent: {
        payload: Prisma.$OutboxEventPayload<ExtArgs>
        fields: Prisma.OutboxEventFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OutboxEventFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutboxEventPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OutboxEventFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutboxEventPayload>
          }
          findFirst: {
            args: Prisma.OutboxEventFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutboxEventPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OutboxEventFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutboxEventPayload>
          }
          findMany: {
            args: Prisma.OutboxEventFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutboxEventPayload>[]
          }
          create: {
            args: Prisma.OutboxEventCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutboxEventPayload>
          }
          createMany: {
            args: Prisma.OutboxEventCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OutboxEventCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutboxEventPayload>[]
          }
          delete: {
            args: Prisma.OutboxEventDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutboxEventPayload>
          }
          update: {
            args: Prisma.OutboxEventUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutboxEventPayload>
          }
          deleteMany: {
            args: Prisma.OutboxEventDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OutboxEventUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.OutboxEventUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutboxEventPayload>
          }
          aggregate: {
            args: Prisma.OutboxEventAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOutboxEvent>
          }
          groupBy: {
            args: Prisma.OutboxEventGroupByArgs<ExtArgs>
            result: $Utils.Optional<OutboxEventGroupByOutputType>[]
          }
          count: {
            args: Prisma.OutboxEventCountArgs<ExtArgs>
            result: $Utils.Optional<OutboxEventCountAggregateOutputType> | number
          }
        }
      }
      StockReservation: {
        payload: Prisma.$StockReservationPayload<ExtArgs>
        fields: Prisma.StockReservationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.StockReservationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StockReservationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.StockReservationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StockReservationPayload>
          }
          findFirst: {
            args: Prisma.StockReservationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StockReservationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.StockReservationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StockReservationPayload>
          }
          findMany: {
            args: Prisma.StockReservationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StockReservationPayload>[]
          }
          create: {
            args: Prisma.StockReservationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StockReservationPayload>
          }
          createMany: {
            args: Prisma.StockReservationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.StockReservationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StockReservationPayload>[]
          }
          delete: {
            args: Prisma.StockReservationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StockReservationPayload>
          }
          update: {
            args: Prisma.StockReservationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StockReservationPayload>
          }
          deleteMany: {
            args: Prisma.StockReservationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.StockReservationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.StockReservationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StockReservationPayload>
          }
          aggregate: {
            args: Prisma.StockReservationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateStockReservation>
          }
          groupBy: {
            args: Prisma.StockReservationGroupByArgs<ExtArgs>
            result: $Utils.Optional<StockReservationGroupByOutputType>[]
          }
          count: {
            args: Prisma.StockReservationCountArgs<ExtArgs>
            result: $Utils.Optional<StockReservationCountAggregateOutputType> | number
          }
        }
      }
      ProductCoPurchase: {
        payload: Prisma.$ProductCoPurchasePayload<ExtArgs>
        fields: Prisma.ProductCoPurchaseFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProductCoPurchaseFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductCoPurchasePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProductCoPurchaseFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductCoPurchasePayload>
          }
          findFirst: {
            args: Prisma.ProductCoPurchaseFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductCoPurchasePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProductCoPurchaseFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductCoPurchasePayload>
          }
          findMany: {
            args: Prisma.ProductCoPurchaseFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductCoPurchasePayload>[]
          }
          create: {
            args: Prisma.ProductCoPurchaseCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductCoPurchasePayload>
          }
          createMany: {
            args: Prisma.ProductCoPurchaseCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProductCoPurchaseCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductCoPurchasePayload>[]
          }
          delete: {
            args: Prisma.ProductCoPurchaseDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductCoPurchasePayload>
          }
          update: {
            args: Prisma.ProductCoPurchaseUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductCoPurchasePayload>
          }
          deleteMany: {
            args: Prisma.ProductCoPurchaseDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProductCoPurchaseUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ProductCoPurchaseUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductCoPurchasePayload>
          }
          aggregate: {
            args: Prisma.ProductCoPurchaseAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProductCoPurchase>
          }
          groupBy: {
            args: Prisma.ProductCoPurchaseGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProductCoPurchaseGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProductCoPurchaseCountArgs<ExtArgs>
            result: $Utils.Optional<ProductCoPurchaseCountAggregateOutputType> | number
          }
        }
      }
      ProductOrderStat: {
        payload: Prisma.$ProductOrderStatPayload<ExtArgs>
        fields: Prisma.ProductOrderStatFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProductOrderStatFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductOrderStatPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProductOrderStatFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductOrderStatPayload>
          }
          findFirst: {
            args: Prisma.ProductOrderStatFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductOrderStatPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProductOrderStatFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductOrderStatPayload>
          }
          findMany: {
            args: Prisma.ProductOrderStatFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductOrderStatPayload>[]
          }
          create: {
            args: Prisma.ProductOrderStatCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductOrderStatPayload>
          }
          createMany: {
            args: Prisma.ProductOrderStatCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProductOrderStatCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductOrderStatPayload>[]
          }
          delete: {
            args: Prisma.ProductOrderStatDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductOrderStatPayload>
          }
          update: {
            args: Prisma.ProductOrderStatUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductOrderStatPayload>
          }
          deleteMany: {
            args: Prisma.ProductOrderStatDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProductOrderStatUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ProductOrderStatUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductOrderStatPayload>
          }
          aggregate: {
            args: Prisma.ProductOrderStatAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProductOrderStat>
          }
          groupBy: {
            args: Prisma.ProductOrderStatGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProductOrderStatGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProductOrderStatCountArgs<ExtArgs>
            result: $Utils.Optional<ProductOrderStatCountAggregateOutputType> | number
          }
        }
      }
      CoPurchaseState: {
        payload: Prisma.$CoPurchaseStatePayload<ExtArgs>
        fields: Prisma.CoPurchaseStateFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CoPurchaseStateFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoPurchaseStatePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CoPurchaseStateFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoPurchaseStatePayload>
          }
          findFirst: {
            args: Prisma.CoPurchaseStateFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoPurchaseStatePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CoPurchaseStateFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoPurchaseStatePayload>
          }
          findMany: {
            args: Prisma.CoPurchaseStateFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoPurchaseStatePayload>[]
          }
          create: {
            args: Prisma.CoPurchaseStateCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoPurchaseStatePayload>
          }
          createMany: {
            args: Prisma.CoPurchaseStateCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CoPurchaseStateCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoPurchaseStatePayload>[]
          }
          delete: {
            args: Prisma.CoPurchaseStateDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoPurchaseStatePayload>
          }
          update: {
            args: Prisma.CoPurchaseStateUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoPurchaseStatePayload>
          }
          deleteMany: {
            args: Prisma.CoPurchaseStateDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CoPurchaseStateUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.CoPurchaseStateUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoPurchaseStatePayload>
          }
          aggregate: {
            args: Prisma.CoPurchaseStateAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCoPurchaseState>
          }
          groupBy: {
            args: Prisma.CoPurchaseStateGroupByArgs<ExtArgs>
            result: $Utils.Optional<CoPurchaseStateGroupByOutputType>[]
          }
          count: {
            args: Prisma.CoPurchaseStateCountArgs<ExtArgs>
            result: $Utils.Optional<CoPurchaseStateCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
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
      isolationLevel?: Prisma.TransactionIsolationLevel
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
   * Count Type OrderCountOutputType
   */

  export type OrderCountOutputType = {
    orderItems: number
    payments: number
    couponUsages: number
  }

  export type OrderCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    orderItems?: boolean | OrderCountOutputTypeCountOrderItemsArgs
    payments?: boolean | OrderCountOutputTypeCountPaymentsArgs
    couponUsages?: boolean | OrderCountOutputTypeCountCouponUsagesArgs
  }

  // Custom InputTypes
  /**
   * OrderCountOutputType without action
   */
  export type OrderCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderCountOutputType
     */
    select?: OrderCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * OrderCountOutputType without action
   */
  export type OrderCountOutputTypeCountOrderItemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrderItemWhereInput
  }

  /**
   * OrderCountOutputType without action
   */
  export type OrderCountOutputTypeCountPaymentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PaymentWhereInput
  }

  /**
   * OrderCountOutputType without action
   */
  export type OrderCountOutputTypeCountCouponUsagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CouponUsageWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Order
   */

  export type AggregateOrder = {
    _count: OrderCountAggregateOutputType | null
    _avg: OrderAvgAggregateOutputType | null
    _sum: OrderSumAggregateOutputType | null
    _min: OrderMinAggregateOutputType | null
    _max: OrderMaxAggregateOutputType | null
  }

  export type OrderAvgAggregateOutputType = {
    totalAmount: Decimal | null
    discountAmount: Decimal | null
    deliveryLatitude: Decimal | null
    deliveryLongitude: Decimal | null
    deliveryCharge: Decimal | null
  }

  export type OrderSumAggregateOutputType = {
    totalAmount: Decimal | null
    discountAmount: Decimal | null
    deliveryLatitude: Decimal | null
    deliveryLongitude: Decimal | null
    deliveryCharge: Decimal | null
  }

  export type OrderMinAggregateOutputType = {
    id: string | null
    userId: string | null
    storeId: string | null
    totalAmount: Decimal | null
    discountAmount: Decimal | null
    couponCode: string | null
    deliverySlot: string | null
    deliveryName: string | null
    deliveryPhone: string | null
    deliveryAddress: string | null
    deliveryCity: string | null
    deliveryPincode: string | null
    deliveryLandmark: string | null
    deliveryInstructions: string | null
    deliveryLatitude: Decimal | null
    deliveryLongitude: Decimal | null
    deliveryCharge: Decimal | null
    status: $Enums.OrderStatus | null
    paymentStatus: $Enums.PaymentStatus | null
    paymentMethod: $Enums.PaymentMethod | null
    paymentRef: string | null
    riderId: string | null
    riderStatus: $Enums.OrderRiderStatus | null
    assignedAt: Date | null
    assignedBy: string | null
    pickupStartedAt: Date | null
    deliveredAt: Date | null
    deliveryProofPhotoUrl: string | null
    deliveryProofPhotoPublicId: string | null
    deliveryProofUploadedAt: Date | null
    rejectionReason: string | null
    cancellationReason: string | null
    cancelledBy: $Enums.CancelledBy | null
    cancelledAt: Date | null
    refundStatus: $Enums.RefundStatus | null
    refundFailureReason: string | null
    refundFailedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OrderMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    storeId: string | null
    totalAmount: Decimal | null
    discountAmount: Decimal | null
    couponCode: string | null
    deliverySlot: string | null
    deliveryName: string | null
    deliveryPhone: string | null
    deliveryAddress: string | null
    deliveryCity: string | null
    deliveryPincode: string | null
    deliveryLandmark: string | null
    deliveryInstructions: string | null
    deliveryLatitude: Decimal | null
    deliveryLongitude: Decimal | null
    deliveryCharge: Decimal | null
    status: $Enums.OrderStatus | null
    paymentStatus: $Enums.PaymentStatus | null
    paymentMethod: $Enums.PaymentMethod | null
    paymentRef: string | null
    riderId: string | null
    riderStatus: $Enums.OrderRiderStatus | null
    assignedAt: Date | null
    assignedBy: string | null
    pickupStartedAt: Date | null
    deliveredAt: Date | null
    deliveryProofPhotoUrl: string | null
    deliveryProofPhotoPublicId: string | null
    deliveryProofUploadedAt: Date | null
    rejectionReason: string | null
    cancellationReason: string | null
    cancelledBy: $Enums.CancelledBy | null
    cancelledAt: Date | null
    refundStatus: $Enums.RefundStatus | null
    refundFailureReason: string | null
    refundFailedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OrderCountAggregateOutputType = {
    id: number
    userId: number
    storeId: number
    totalAmount: number
    discountAmount: number
    couponCode: number
    deliverySlot: number
    deliveryName: number
    deliveryPhone: number
    deliveryAddress: number
    deliveryCity: number
    deliveryPincode: number
    deliveryLandmark: number
    deliveryInstructions: number
    deliveryLatitude: number
    deliveryLongitude: number
    deliveryCharge: number
    billDetails: number
    status: number
    paymentStatus: number
    paymentMethod: number
    paymentRef: number
    riderId: number
    riderStatus: number
    assignedAt: number
    assignedBy: number
    pickupStartedAt: number
    deliveredAt: number
    preparationPhotos: number
    deliveryProofPhotoUrl: number
    deliveryProofPhotoPublicId: number
    deliveryProofUploadedAt: number
    rejectionReason: number
    cancellationReason: number
    cancelledBy: number
    cancelledAt: number
    refundStatus: number
    refundFailureReason: number
    refundFailedAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type OrderAvgAggregateInputType = {
    totalAmount?: true
    discountAmount?: true
    deliveryLatitude?: true
    deliveryLongitude?: true
    deliveryCharge?: true
  }

  export type OrderSumAggregateInputType = {
    totalAmount?: true
    discountAmount?: true
    deliveryLatitude?: true
    deliveryLongitude?: true
    deliveryCharge?: true
  }

  export type OrderMinAggregateInputType = {
    id?: true
    userId?: true
    storeId?: true
    totalAmount?: true
    discountAmount?: true
    couponCode?: true
    deliverySlot?: true
    deliveryName?: true
    deliveryPhone?: true
    deliveryAddress?: true
    deliveryCity?: true
    deliveryPincode?: true
    deliveryLandmark?: true
    deliveryInstructions?: true
    deliveryLatitude?: true
    deliveryLongitude?: true
    deliveryCharge?: true
    status?: true
    paymentStatus?: true
    paymentMethod?: true
    paymentRef?: true
    riderId?: true
    riderStatus?: true
    assignedAt?: true
    assignedBy?: true
    pickupStartedAt?: true
    deliveredAt?: true
    deliveryProofPhotoUrl?: true
    deliveryProofPhotoPublicId?: true
    deliveryProofUploadedAt?: true
    rejectionReason?: true
    cancellationReason?: true
    cancelledBy?: true
    cancelledAt?: true
    refundStatus?: true
    refundFailureReason?: true
    refundFailedAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OrderMaxAggregateInputType = {
    id?: true
    userId?: true
    storeId?: true
    totalAmount?: true
    discountAmount?: true
    couponCode?: true
    deliverySlot?: true
    deliveryName?: true
    deliveryPhone?: true
    deliveryAddress?: true
    deliveryCity?: true
    deliveryPincode?: true
    deliveryLandmark?: true
    deliveryInstructions?: true
    deliveryLatitude?: true
    deliveryLongitude?: true
    deliveryCharge?: true
    status?: true
    paymentStatus?: true
    paymentMethod?: true
    paymentRef?: true
    riderId?: true
    riderStatus?: true
    assignedAt?: true
    assignedBy?: true
    pickupStartedAt?: true
    deliveredAt?: true
    deliveryProofPhotoUrl?: true
    deliveryProofPhotoPublicId?: true
    deliveryProofUploadedAt?: true
    rejectionReason?: true
    cancellationReason?: true
    cancelledBy?: true
    cancelledAt?: true
    refundStatus?: true
    refundFailureReason?: true
    refundFailedAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OrderCountAggregateInputType = {
    id?: true
    userId?: true
    storeId?: true
    totalAmount?: true
    discountAmount?: true
    couponCode?: true
    deliverySlot?: true
    deliveryName?: true
    deliveryPhone?: true
    deliveryAddress?: true
    deliveryCity?: true
    deliveryPincode?: true
    deliveryLandmark?: true
    deliveryInstructions?: true
    deliveryLatitude?: true
    deliveryLongitude?: true
    deliveryCharge?: true
    billDetails?: true
    status?: true
    paymentStatus?: true
    paymentMethod?: true
    paymentRef?: true
    riderId?: true
    riderStatus?: true
    assignedAt?: true
    assignedBy?: true
    pickupStartedAt?: true
    deliveredAt?: true
    preparationPhotos?: true
    deliveryProofPhotoUrl?: true
    deliveryProofPhotoPublicId?: true
    deliveryProofUploadedAt?: true
    rejectionReason?: true
    cancellationReason?: true
    cancelledBy?: true
    cancelledAt?: true
    refundStatus?: true
    refundFailureReason?: true
    refundFailedAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type OrderAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Order to aggregate.
     */
    where?: OrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Orders to fetch.
     */
    orderBy?: OrderOrderByWithRelationInput | OrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Orders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Orders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Orders
    **/
    _count?: true | OrderCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: OrderAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: OrderSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OrderMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OrderMaxAggregateInputType
  }

  export type GetOrderAggregateType<T extends OrderAggregateArgs> = {
        [P in keyof T & keyof AggregateOrder]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOrder[P]>
      : GetScalarType<T[P], AggregateOrder[P]>
  }




  export type OrderGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrderWhereInput
    orderBy?: OrderOrderByWithAggregationInput | OrderOrderByWithAggregationInput[]
    by: OrderScalarFieldEnum[] | OrderScalarFieldEnum
    having?: OrderScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OrderCountAggregateInputType | true
    _avg?: OrderAvgAggregateInputType
    _sum?: OrderSumAggregateInputType
    _min?: OrderMinAggregateInputType
    _max?: OrderMaxAggregateInputType
  }

  export type OrderGroupByOutputType = {
    id: string
    userId: string
    storeId: string
    totalAmount: Decimal
    discountAmount: Decimal
    couponCode: string | null
    deliverySlot: string | null
    deliveryName: string | null
    deliveryPhone: string | null
    deliveryAddress: string | null
    deliveryCity: string | null
    deliveryPincode: string | null
    deliveryLandmark: string | null
    deliveryInstructions: string | null
    deliveryLatitude: Decimal | null
    deliveryLongitude: Decimal | null
    deliveryCharge: Decimal
    billDetails: JsonValue | null
    status: $Enums.OrderStatus
    paymentStatus: $Enums.PaymentStatus
    paymentMethod: $Enums.PaymentMethod | null
    paymentRef: string | null
    riderId: string | null
    riderStatus: $Enums.OrderRiderStatus | null
    assignedAt: Date | null
    assignedBy: string | null
    pickupStartedAt: Date | null
    deliveredAt: Date | null
    preparationPhotos: JsonValue | null
    deliveryProofPhotoUrl: string | null
    deliveryProofPhotoPublicId: string | null
    deliveryProofUploadedAt: Date | null
    rejectionReason: string | null
    cancellationReason: string | null
    cancelledBy: $Enums.CancelledBy | null
    cancelledAt: Date | null
    refundStatus: $Enums.RefundStatus
    refundFailureReason: string | null
    refundFailedAt: Date | null
    createdAt: Date
    updatedAt: Date
    _count: OrderCountAggregateOutputType | null
    _avg: OrderAvgAggregateOutputType | null
    _sum: OrderSumAggregateOutputType | null
    _min: OrderMinAggregateOutputType | null
    _max: OrderMaxAggregateOutputType | null
  }

  type GetOrderGroupByPayload<T extends OrderGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OrderGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OrderGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OrderGroupByOutputType[P]>
            : GetScalarType<T[P], OrderGroupByOutputType[P]>
        }
      >
    >


  export type OrderSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    storeId?: boolean
    totalAmount?: boolean
    discountAmount?: boolean
    couponCode?: boolean
    deliverySlot?: boolean
    deliveryName?: boolean
    deliveryPhone?: boolean
    deliveryAddress?: boolean
    deliveryCity?: boolean
    deliveryPincode?: boolean
    deliveryLandmark?: boolean
    deliveryInstructions?: boolean
    deliveryLatitude?: boolean
    deliveryLongitude?: boolean
    deliveryCharge?: boolean
    billDetails?: boolean
    status?: boolean
    paymentStatus?: boolean
    paymentMethod?: boolean
    paymentRef?: boolean
    riderId?: boolean
    riderStatus?: boolean
    assignedAt?: boolean
    assignedBy?: boolean
    pickupStartedAt?: boolean
    deliveredAt?: boolean
    preparationPhotos?: boolean
    deliveryProofPhotoUrl?: boolean
    deliveryProofPhotoPublicId?: boolean
    deliveryProofUploadedAt?: boolean
    rejectionReason?: boolean
    cancellationReason?: boolean
    cancelledBy?: boolean
    cancelledAt?: boolean
    refundStatus?: boolean
    refundFailureReason?: boolean
    refundFailedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    orderItems?: boolean | Order$orderItemsArgs<ExtArgs>
    payments?: boolean | Order$paymentsArgs<ExtArgs>
    couponUsages?: boolean | Order$couponUsagesArgs<ExtArgs>
    _count?: boolean | OrderCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["order"]>

  export type OrderSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    storeId?: boolean
    totalAmount?: boolean
    discountAmount?: boolean
    couponCode?: boolean
    deliverySlot?: boolean
    deliveryName?: boolean
    deliveryPhone?: boolean
    deliveryAddress?: boolean
    deliveryCity?: boolean
    deliveryPincode?: boolean
    deliveryLandmark?: boolean
    deliveryInstructions?: boolean
    deliveryLatitude?: boolean
    deliveryLongitude?: boolean
    deliveryCharge?: boolean
    billDetails?: boolean
    status?: boolean
    paymentStatus?: boolean
    paymentMethod?: boolean
    paymentRef?: boolean
    riderId?: boolean
    riderStatus?: boolean
    assignedAt?: boolean
    assignedBy?: boolean
    pickupStartedAt?: boolean
    deliveredAt?: boolean
    preparationPhotos?: boolean
    deliveryProofPhotoUrl?: boolean
    deliveryProofPhotoPublicId?: boolean
    deliveryProofUploadedAt?: boolean
    rejectionReason?: boolean
    cancellationReason?: boolean
    cancelledBy?: boolean
    cancelledAt?: boolean
    refundStatus?: boolean
    refundFailureReason?: boolean
    refundFailedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["order"]>

  export type OrderSelectScalar = {
    id?: boolean
    userId?: boolean
    storeId?: boolean
    totalAmount?: boolean
    discountAmount?: boolean
    couponCode?: boolean
    deliverySlot?: boolean
    deliveryName?: boolean
    deliveryPhone?: boolean
    deliveryAddress?: boolean
    deliveryCity?: boolean
    deliveryPincode?: boolean
    deliveryLandmark?: boolean
    deliveryInstructions?: boolean
    deliveryLatitude?: boolean
    deliveryLongitude?: boolean
    deliveryCharge?: boolean
    billDetails?: boolean
    status?: boolean
    paymentStatus?: boolean
    paymentMethod?: boolean
    paymentRef?: boolean
    riderId?: boolean
    riderStatus?: boolean
    assignedAt?: boolean
    assignedBy?: boolean
    pickupStartedAt?: boolean
    deliveredAt?: boolean
    preparationPhotos?: boolean
    deliveryProofPhotoUrl?: boolean
    deliveryProofPhotoPublicId?: boolean
    deliveryProofUploadedAt?: boolean
    rejectionReason?: boolean
    cancellationReason?: boolean
    cancelledBy?: boolean
    cancelledAt?: boolean
    refundStatus?: boolean
    refundFailureReason?: boolean
    refundFailedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type OrderInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    orderItems?: boolean | Order$orderItemsArgs<ExtArgs>
    payments?: boolean | Order$paymentsArgs<ExtArgs>
    couponUsages?: boolean | Order$couponUsagesArgs<ExtArgs>
    _count?: boolean | OrderCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type OrderIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $OrderPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Order"
    objects: {
      orderItems: Prisma.$OrderItemPayload<ExtArgs>[]
      payments: Prisma.$PaymentPayload<ExtArgs>[]
      couponUsages: Prisma.$CouponUsagePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      storeId: string
      totalAmount: Prisma.Decimal
      discountAmount: Prisma.Decimal
      couponCode: string | null
      deliverySlot: string | null
      deliveryName: string | null
      deliveryPhone: string | null
      deliveryAddress: string | null
      deliveryCity: string | null
      deliveryPincode: string | null
      deliveryLandmark: string | null
      deliveryInstructions: string | null
      deliveryLatitude: Prisma.Decimal | null
      deliveryLongitude: Prisma.Decimal | null
      deliveryCharge: Prisma.Decimal
      billDetails: Prisma.JsonValue | null
      status: $Enums.OrderStatus
      paymentStatus: $Enums.PaymentStatus
      paymentMethod: $Enums.PaymentMethod | null
      paymentRef: string | null
      riderId: string | null
      riderStatus: $Enums.OrderRiderStatus | null
      assignedAt: Date | null
      assignedBy: string | null
      pickupStartedAt: Date | null
      deliveredAt: Date | null
      preparationPhotos: Prisma.JsonValue | null
      deliveryProofPhotoUrl: string | null
      deliveryProofPhotoPublicId: string | null
      deliveryProofUploadedAt: Date | null
      rejectionReason: string | null
      cancellationReason: string | null
      cancelledBy: $Enums.CancelledBy | null
      cancelledAt: Date | null
      refundStatus: $Enums.RefundStatus
      refundFailureReason: string | null
      refundFailedAt: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["order"]>
    composites: {}
  }

  type OrderGetPayload<S extends boolean | null | undefined | OrderDefaultArgs> = $Result.GetResult<Prisma.$OrderPayload, S>

  type OrderCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<OrderFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: OrderCountAggregateInputType | true
    }

  export interface OrderDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Order'], meta: { name: 'Order' } }
    /**
     * Find zero or one Order that matches the filter.
     * @param {OrderFindUniqueArgs} args - Arguments to find a Order
     * @example
     * // Get one Order
     * const order = await prisma.order.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OrderFindUniqueArgs>(args: SelectSubset<T, OrderFindUniqueArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Order that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {OrderFindUniqueOrThrowArgs} args - Arguments to find a Order
     * @example
     * // Get one Order
     * const order = await prisma.order.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OrderFindUniqueOrThrowArgs>(args: SelectSubset<T, OrderFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Order that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderFindFirstArgs} args - Arguments to find a Order
     * @example
     * // Get one Order
     * const order = await prisma.order.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OrderFindFirstArgs>(args?: SelectSubset<T, OrderFindFirstArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Order that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderFindFirstOrThrowArgs} args - Arguments to find a Order
     * @example
     * // Get one Order
     * const order = await prisma.order.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OrderFindFirstOrThrowArgs>(args?: SelectSubset<T, OrderFindFirstOrThrowArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Orders that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Orders
     * const orders = await prisma.order.findMany()
     * 
     * // Get first 10 Orders
     * const orders = await prisma.order.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const orderWithIdOnly = await prisma.order.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OrderFindManyArgs>(args?: SelectSubset<T, OrderFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Order.
     * @param {OrderCreateArgs} args - Arguments to create a Order.
     * @example
     * // Create one Order
     * const Order = await prisma.order.create({
     *   data: {
     *     // ... data to create a Order
     *   }
     * })
     * 
     */
    create<T extends OrderCreateArgs>(args: SelectSubset<T, OrderCreateArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Orders.
     * @param {OrderCreateManyArgs} args - Arguments to create many Orders.
     * @example
     * // Create many Orders
     * const order = await prisma.order.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OrderCreateManyArgs>(args?: SelectSubset<T, OrderCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Orders and returns the data saved in the database.
     * @param {OrderCreateManyAndReturnArgs} args - Arguments to create many Orders.
     * @example
     * // Create many Orders
     * const order = await prisma.order.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Orders and only return the `id`
     * const orderWithIdOnly = await prisma.order.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OrderCreateManyAndReturnArgs>(args?: SelectSubset<T, OrderCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Order.
     * @param {OrderDeleteArgs} args - Arguments to delete one Order.
     * @example
     * // Delete one Order
     * const Order = await prisma.order.delete({
     *   where: {
     *     // ... filter to delete one Order
     *   }
     * })
     * 
     */
    delete<T extends OrderDeleteArgs>(args: SelectSubset<T, OrderDeleteArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Order.
     * @param {OrderUpdateArgs} args - Arguments to update one Order.
     * @example
     * // Update one Order
     * const order = await prisma.order.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OrderUpdateArgs>(args: SelectSubset<T, OrderUpdateArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Orders.
     * @param {OrderDeleteManyArgs} args - Arguments to filter Orders to delete.
     * @example
     * // Delete a few Orders
     * const { count } = await prisma.order.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OrderDeleteManyArgs>(args?: SelectSubset<T, OrderDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Orders.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Orders
     * const order = await prisma.order.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OrderUpdateManyArgs>(args: SelectSubset<T, OrderUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Order.
     * @param {OrderUpsertArgs} args - Arguments to update or create a Order.
     * @example
     * // Update or create a Order
     * const order = await prisma.order.upsert({
     *   create: {
     *     // ... data to create a Order
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Order we want to update
     *   }
     * })
     */
    upsert<T extends OrderUpsertArgs>(args: SelectSubset<T, OrderUpsertArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Orders.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderCountArgs} args - Arguments to filter Orders to count.
     * @example
     * // Count the number of Orders
     * const count = await prisma.order.count({
     *   where: {
     *     // ... the filter for the Orders we want to count
     *   }
     * })
    **/
    count<T extends OrderCountArgs>(
      args?: Subset<T, OrderCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OrderCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Order.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends OrderAggregateArgs>(args: Subset<T, OrderAggregateArgs>): Prisma.PrismaPromise<GetOrderAggregateType<T>>

    /**
     * Group by Order.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderGroupByArgs} args - Group by arguments.
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
      T extends OrderGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OrderGroupByArgs['orderBy'] }
        : { orderBy?: OrderGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, OrderGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOrderGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Order model
   */
  readonly fields: OrderFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Order.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OrderClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    orderItems<T extends Order$orderItemsArgs<ExtArgs> = {}>(args?: Subset<T, Order$orderItemsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "findMany"> | Null>
    payments<T extends Order$paymentsArgs<ExtArgs> = {}>(args?: Subset<T, Order$paymentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "findMany"> | Null>
    couponUsages<T extends Order$couponUsagesArgs<ExtArgs> = {}>(args?: Subset<T, Order$couponUsagesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CouponUsagePayload<ExtArgs>, T, "findMany"> | Null>
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
   * Fields of the Order model
   */ 
  interface OrderFieldRefs {
    readonly id: FieldRef<"Order", 'String'>
    readonly userId: FieldRef<"Order", 'String'>
    readonly storeId: FieldRef<"Order", 'String'>
    readonly totalAmount: FieldRef<"Order", 'Decimal'>
    readonly discountAmount: FieldRef<"Order", 'Decimal'>
    readonly couponCode: FieldRef<"Order", 'String'>
    readonly deliverySlot: FieldRef<"Order", 'String'>
    readonly deliveryName: FieldRef<"Order", 'String'>
    readonly deliveryPhone: FieldRef<"Order", 'String'>
    readonly deliveryAddress: FieldRef<"Order", 'String'>
    readonly deliveryCity: FieldRef<"Order", 'String'>
    readonly deliveryPincode: FieldRef<"Order", 'String'>
    readonly deliveryLandmark: FieldRef<"Order", 'String'>
    readonly deliveryInstructions: FieldRef<"Order", 'String'>
    readonly deliveryLatitude: FieldRef<"Order", 'Decimal'>
    readonly deliveryLongitude: FieldRef<"Order", 'Decimal'>
    readonly deliveryCharge: FieldRef<"Order", 'Decimal'>
    readonly billDetails: FieldRef<"Order", 'Json'>
    readonly status: FieldRef<"Order", 'OrderStatus'>
    readonly paymentStatus: FieldRef<"Order", 'PaymentStatus'>
    readonly paymentMethod: FieldRef<"Order", 'PaymentMethod'>
    readonly paymentRef: FieldRef<"Order", 'String'>
    readonly riderId: FieldRef<"Order", 'String'>
    readonly riderStatus: FieldRef<"Order", 'OrderRiderStatus'>
    readonly assignedAt: FieldRef<"Order", 'DateTime'>
    readonly assignedBy: FieldRef<"Order", 'String'>
    readonly pickupStartedAt: FieldRef<"Order", 'DateTime'>
    readonly deliveredAt: FieldRef<"Order", 'DateTime'>
    readonly preparationPhotos: FieldRef<"Order", 'Json'>
    readonly deliveryProofPhotoUrl: FieldRef<"Order", 'String'>
    readonly deliveryProofPhotoPublicId: FieldRef<"Order", 'String'>
    readonly deliveryProofUploadedAt: FieldRef<"Order", 'DateTime'>
    readonly rejectionReason: FieldRef<"Order", 'String'>
    readonly cancellationReason: FieldRef<"Order", 'String'>
    readonly cancelledBy: FieldRef<"Order", 'CancelledBy'>
    readonly cancelledAt: FieldRef<"Order", 'DateTime'>
    readonly refundStatus: FieldRef<"Order", 'RefundStatus'>
    readonly refundFailureReason: FieldRef<"Order", 'String'>
    readonly refundFailedAt: FieldRef<"Order", 'DateTime'>
    readonly createdAt: FieldRef<"Order", 'DateTime'>
    readonly updatedAt: FieldRef<"Order", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Order findUnique
   */
  export type OrderFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * Filter, which Order to fetch.
     */
    where: OrderWhereUniqueInput
  }

  /**
   * Order findUniqueOrThrow
   */
  export type OrderFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * Filter, which Order to fetch.
     */
    where: OrderWhereUniqueInput
  }

  /**
   * Order findFirst
   */
  export type OrderFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * Filter, which Order to fetch.
     */
    where?: OrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Orders to fetch.
     */
    orderBy?: OrderOrderByWithRelationInput | OrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Orders.
     */
    cursor?: OrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Orders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Orders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Orders.
     */
    distinct?: OrderScalarFieldEnum | OrderScalarFieldEnum[]
  }

  /**
   * Order findFirstOrThrow
   */
  export type OrderFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * Filter, which Order to fetch.
     */
    where?: OrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Orders to fetch.
     */
    orderBy?: OrderOrderByWithRelationInput | OrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Orders.
     */
    cursor?: OrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Orders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Orders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Orders.
     */
    distinct?: OrderScalarFieldEnum | OrderScalarFieldEnum[]
  }

  /**
   * Order findMany
   */
  export type OrderFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * Filter, which Orders to fetch.
     */
    where?: OrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Orders to fetch.
     */
    orderBy?: OrderOrderByWithRelationInput | OrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Orders.
     */
    cursor?: OrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Orders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Orders.
     */
    skip?: number
    distinct?: OrderScalarFieldEnum | OrderScalarFieldEnum[]
  }

  /**
   * Order create
   */
  export type OrderCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * The data needed to create a Order.
     */
    data: XOR<OrderCreateInput, OrderUncheckedCreateInput>
  }

  /**
   * Order createMany
   */
  export type OrderCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Orders.
     */
    data: OrderCreateManyInput | OrderCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Order createManyAndReturn
   */
  export type OrderCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Orders.
     */
    data: OrderCreateManyInput | OrderCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Order update
   */
  export type OrderUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * The data needed to update a Order.
     */
    data: XOR<OrderUpdateInput, OrderUncheckedUpdateInput>
    /**
     * Choose, which Order to update.
     */
    where: OrderWhereUniqueInput
  }

  /**
   * Order updateMany
   */
  export type OrderUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Orders.
     */
    data: XOR<OrderUpdateManyMutationInput, OrderUncheckedUpdateManyInput>
    /**
     * Filter which Orders to update
     */
    where?: OrderWhereInput
  }

  /**
   * Order upsert
   */
  export type OrderUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * The filter to search for the Order to update in case it exists.
     */
    where: OrderWhereUniqueInput
    /**
     * In case the Order found by the `where` argument doesn't exist, create a new Order with this data.
     */
    create: XOR<OrderCreateInput, OrderUncheckedCreateInput>
    /**
     * In case the Order was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OrderUpdateInput, OrderUncheckedUpdateInput>
  }

  /**
   * Order delete
   */
  export type OrderDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * Filter which Order to delete.
     */
    where: OrderWhereUniqueInput
  }

  /**
   * Order deleteMany
   */
  export type OrderDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Orders to delete
     */
    where?: OrderWhereInput
  }

  /**
   * Order.orderItems
   */
  export type Order$orderItemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemInclude<ExtArgs> | null
    where?: OrderItemWhereInput
    orderBy?: OrderItemOrderByWithRelationInput | OrderItemOrderByWithRelationInput[]
    cursor?: OrderItemWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OrderItemScalarFieldEnum | OrderItemScalarFieldEnum[]
  }

  /**
   * Order.payments
   */
  export type Order$paymentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentInclude<ExtArgs> | null
    where?: PaymentWhereInput
    orderBy?: PaymentOrderByWithRelationInput | PaymentOrderByWithRelationInput[]
    cursor?: PaymentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PaymentScalarFieldEnum | PaymentScalarFieldEnum[]
  }

  /**
   * Order.couponUsages
   */
  export type Order$couponUsagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CouponUsage
     */
    select?: CouponUsageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CouponUsageInclude<ExtArgs> | null
    where?: CouponUsageWhereInput
    orderBy?: CouponUsageOrderByWithRelationInput | CouponUsageOrderByWithRelationInput[]
    cursor?: CouponUsageWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CouponUsageScalarFieldEnum | CouponUsageScalarFieldEnum[]
  }

  /**
   * Order without action
   */
  export type OrderDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
  }


  /**
   * Model OrderItem
   */

  export type AggregateOrderItem = {
    _count: OrderItemCountAggregateOutputType | null
    _avg: OrderItemAvgAggregateOutputType | null
    _sum: OrderItemSumAggregateOutputType | null
    _min: OrderItemMinAggregateOutputType | null
    _max: OrderItemMaxAggregateOutputType | null
  }

  export type OrderItemAvgAggregateOutputType = {
    quantity: number | null
    price: Decimal | null
  }

  export type OrderItemSumAggregateOutputType = {
    quantity: number | null
    price: Decimal | null
  }

  export type OrderItemMinAggregateOutputType = {
    id: string | null
    orderId: string | null
    productId: string | null
    catalogProductId: string | null
    quantity: number | null
    price: Decimal | null
  }

  export type OrderItemMaxAggregateOutputType = {
    id: string | null
    orderId: string | null
    productId: string | null
    catalogProductId: string | null
    quantity: number | null
    price: Decimal | null
  }

  export type OrderItemCountAggregateOutputType = {
    id: number
    orderId: number
    productId: number
    catalogProductId: number
    quantity: number
    price: number
    selectedOptions: number
    _all: number
  }


  export type OrderItemAvgAggregateInputType = {
    quantity?: true
    price?: true
  }

  export type OrderItemSumAggregateInputType = {
    quantity?: true
    price?: true
  }

  export type OrderItemMinAggregateInputType = {
    id?: true
    orderId?: true
    productId?: true
    catalogProductId?: true
    quantity?: true
    price?: true
  }

  export type OrderItemMaxAggregateInputType = {
    id?: true
    orderId?: true
    productId?: true
    catalogProductId?: true
    quantity?: true
    price?: true
  }

  export type OrderItemCountAggregateInputType = {
    id?: true
    orderId?: true
    productId?: true
    catalogProductId?: true
    quantity?: true
    price?: true
    selectedOptions?: true
    _all?: true
  }

  export type OrderItemAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OrderItem to aggregate.
     */
    where?: OrderItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrderItems to fetch.
     */
    orderBy?: OrderItemOrderByWithRelationInput | OrderItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OrderItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrderItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrderItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned OrderItems
    **/
    _count?: true | OrderItemCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: OrderItemAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: OrderItemSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OrderItemMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OrderItemMaxAggregateInputType
  }

  export type GetOrderItemAggregateType<T extends OrderItemAggregateArgs> = {
        [P in keyof T & keyof AggregateOrderItem]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOrderItem[P]>
      : GetScalarType<T[P], AggregateOrderItem[P]>
  }




  export type OrderItemGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrderItemWhereInput
    orderBy?: OrderItemOrderByWithAggregationInput | OrderItemOrderByWithAggregationInput[]
    by: OrderItemScalarFieldEnum[] | OrderItemScalarFieldEnum
    having?: OrderItemScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OrderItemCountAggregateInputType | true
    _avg?: OrderItemAvgAggregateInputType
    _sum?: OrderItemSumAggregateInputType
    _min?: OrderItemMinAggregateInputType
    _max?: OrderItemMaxAggregateInputType
  }

  export type OrderItemGroupByOutputType = {
    id: string
    orderId: string
    productId: string
    catalogProductId: string | null
    quantity: number
    price: Decimal
    selectedOptions: JsonValue | null
    _count: OrderItemCountAggregateOutputType | null
    _avg: OrderItemAvgAggregateOutputType | null
    _sum: OrderItemSumAggregateOutputType | null
    _min: OrderItemMinAggregateOutputType | null
    _max: OrderItemMaxAggregateOutputType | null
  }

  type GetOrderItemGroupByPayload<T extends OrderItemGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OrderItemGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OrderItemGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OrderItemGroupByOutputType[P]>
            : GetScalarType<T[P], OrderItemGroupByOutputType[P]>
        }
      >
    >


  export type OrderItemSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    orderId?: boolean
    productId?: boolean
    catalogProductId?: boolean
    quantity?: boolean
    price?: boolean
    selectedOptions?: boolean
    order?: boolean | OrderDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["orderItem"]>

  export type OrderItemSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    orderId?: boolean
    productId?: boolean
    catalogProductId?: boolean
    quantity?: boolean
    price?: boolean
    selectedOptions?: boolean
    order?: boolean | OrderDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["orderItem"]>

  export type OrderItemSelectScalar = {
    id?: boolean
    orderId?: boolean
    productId?: boolean
    catalogProductId?: boolean
    quantity?: boolean
    price?: boolean
    selectedOptions?: boolean
  }

  export type OrderItemInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    order?: boolean | OrderDefaultArgs<ExtArgs>
  }
  export type OrderItemIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    order?: boolean | OrderDefaultArgs<ExtArgs>
  }

  export type $OrderItemPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "OrderItem"
    objects: {
      order: Prisma.$OrderPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      orderId: string
      productId: string
      catalogProductId: string | null
      quantity: number
      price: Prisma.Decimal
      selectedOptions: Prisma.JsonValue | null
    }, ExtArgs["result"]["orderItem"]>
    composites: {}
  }

  type OrderItemGetPayload<S extends boolean | null | undefined | OrderItemDefaultArgs> = $Result.GetResult<Prisma.$OrderItemPayload, S>

  type OrderItemCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<OrderItemFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: OrderItemCountAggregateInputType | true
    }

  export interface OrderItemDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['OrderItem'], meta: { name: 'OrderItem' } }
    /**
     * Find zero or one OrderItem that matches the filter.
     * @param {OrderItemFindUniqueArgs} args - Arguments to find a OrderItem
     * @example
     * // Get one OrderItem
     * const orderItem = await prisma.orderItem.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OrderItemFindUniqueArgs>(args: SelectSubset<T, OrderItemFindUniqueArgs<ExtArgs>>): Prisma__OrderItemClient<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one OrderItem that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {OrderItemFindUniqueOrThrowArgs} args - Arguments to find a OrderItem
     * @example
     * // Get one OrderItem
     * const orderItem = await prisma.orderItem.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OrderItemFindUniqueOrThrowArgs>(args: SelectSubset<T, OrderItemFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OrderItemClient<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first OrderItem that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderItemFindFirstArgs} args - Arguments to find a OrderItem
     * @example
     * // Get one OrderItem
     * const orderItem = await prisma.orderItem.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OrderItemFindFirstArgs>(args?: SelectSubset<T, OrderItemFindFirstArgs<ExtArgs>>): Prisma__OrderItemClient<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first OrderItem that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderItemFindFirstOrThrowArgs} args - Arguments to find a OrderItem
     * @example
     * // Get one OrderItem
     * const orderItem = await prisma.orderItem.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OrderItemFindFirstOrThrowArgs>(args?: SelectSubset<T, OrderItemFindFirstOrThrowArgs<ExtArgs>>): Prisma__OrderItemClient<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more OrderItems that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderItemFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all OrderItems
     * const orderItems = await prisma.orderItem.findMany()
     * 
     * // Get first 10 OrderItems
     * const orderItems = await prisma.orderItem.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const orderItemWithIdOnly = await prisma.orderItem.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OrderItemFindManyArgs>(args?: SelectSubset<T, OrderItemFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a OrderItem.
     * @param {OrderItemCreateArgs} args - Arguments to create a OrderItem.
     * @example
     * // Create one OrderItem
     * const OrderItem = await prisma.orderItem.create({
     *   data: {
     *     // ... data to create a OrderItem
     *   }
     * })
     * 
     */
    create<T extends OrderItemCreateArgs>(args: SelectSubset<T, OrderItemCreateArgs<ExtArgs>>): Prisma__OrderItemClient<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many OrderItems.
     * @param {OrderItemCreateManyArgs} args - Arguments to create many OrderItems.
     * @example
     * // Create many OrderItems
     * const orderItem = await prisma.orderItem.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OrderItemCreateManyArgs>(args?: SelectSubset<T, OrderItemCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many OrderItems and returns the data saved in the database.
     * @param {OrderItemCreateManyAndReturnArgs} args - Arguments to create many OrderItems.
     * @example
     * // Create many OrderItems
     * const orderItem = await prisma.orderItem.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many OrderItems and only return the `id`
     * const orderItemWithIdOnly = await prisma.orderItem.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OrderItemCreateManyAndReturnArgs>(args?: SelectSubset<T, OrderItemCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a OrderItem.
     * @param {OrderItemDeleteArgs} args - Arguments to delete one OrderItem.
     * @example
     * // Delete one OrderItem
     * const OrderItem = await prisma.orderItem.delete({
     *   where: {
     *     // ... filter to delete one OrderItem
     *   }
     * })
     * 
     */
    delete<T extends OrderItemDeleteArgs>(args: SelectSubset<T, OrderItemDeleteArgs<ExtArgs>>): Prisma__OrderItemClient<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one OrderItem.
     * @param {OrderItemUpdateArgs} args - Arguments to update one OrderItem.
     * @example
     * // Update one OrderItem
     * const orderItem = await prisma.orderItem.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OrderItemUpdateArgs>(args: SelectSubset<T, OrderItemUpdateArgs<ExtArgs>>): Prisma__OrderItemClient<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more OrderItems.
     * @param {OrderItemDeleteManyArgs} args - Arguments to filter OrderItems to delete.
     * @example
     * // Delete a few OrderItems
     * const { count } = await prisma.orderItem.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OrderItemDeleteManyArgs>(args?: SelectSubset<T, OrderItemDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OrderItems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderItemUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many OrderItems
     * const orderItem = await prisma.orderItem.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OrderItemUpdateManyArgs>(args: SelectSubset<T, OrderItemUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one OrderItem.
     * @param {OrderItemUpsertArgs} args - Arguments to update or create a OrderItem.
     * @example
     * // Update or create a OrderItem
     * const orderItem = await prisma.orderItem.upsert({
     *   create: {
     *     // ... data to create a OrderItem
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the OrderItem we want to update
     *   }
     * })
     */
    upsert<T extends OrderItemUpsertArgs>(args: SelectSubset<T, OrderItemUpsertArgs<ExtArgs>>): Prisma__OrderItemClient<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of OrderItems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderItemCountArgs} args - Arguments to filter OrderItems to count.
     * @example
     * // Count the number of OrderItems
     * const count = await prisma.orderItem.count({
     *   where: {
     *     // ... the filter for the OrderItems we want to count
     *   }
     * })
    **/
    count<T extends OrderItemCountArgs>(
      args?: Subset<T, OrderItemCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OrderItemCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a OrderItem.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderItemAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends OrderItemAggregateArgs>(args: Subset<T, OrderItemAggregateArgs>): Prisma.PrismaPromise<GetOrderItemAggregateType<T>>

    /**
     * Group by OrderItem.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderItemGroupByArgs} args - Group by arguments.
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
      T extends OrderItemGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OrderItemGroupByArgs['orderBy'] }
        : { orderBy?: OrderItemGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, OrderItemGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOrderItemGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the OrderItem model
   */
  readonly fields: OrderItemFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for OrderItem.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OrderItemClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    order<T extends OrderDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OrderDefaultArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
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
   * Fields of the OrderItem model
   */ 
  interface OrderItemFieldRefs {
    readonly id: FieldRef<"OrderItem", 'String'>
    readonly orderId: FieldRef<"OrderItem", 'String'>
    readonly productId: FieldRef<"OrderItem", 'String'>
    readonly catalogProductId: FieldRef<"OrderItem", 'String'>
    readonly quantity: FieldRef<"OrderItem", 'Int'>
    readonly price: FieldRef<"OrderItem", 'Decimal'>
    readonly selectedOptions: FieldRef<"OrderItem", 'Json'>
  }
    

  // Custom InputTypes
  /**
   * OrderItem findUnique
   */
  export type OrderItemFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemInclude<ExtArgs> | null
    /**
     * Filter, which OrderItem to fetch.
     */
    where: OrderItemWhereUniqueInput
  }

  /**
   * OrderItem findUniqueOrThrow
   */
  export type OrderItemFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemInclude<ExtArgs> | null
    /**
     * Filter, which OrderItem to fetch.
     */
    where: OrderItemWhereUniqueInput
  }

  /**
   * OrderItem findFirst
   */
  export type OrderItemFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemInclude<ExtArgs> | null
    /**
     * Filter, which OrderItem to fetch.
     */
    where?: OrderItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrderItems to fetch.
     */
    orderBy?: OrderItemOrderByWithRelationInput | OrderItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OrderItems.
     */
    cursor?: OrderItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrderItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrderItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OrderItems.
     */
    distinct?: OrderItemScalarFieldEnum | OrderItemScalarFieldEnum[]
  }

  /**
   * OrderItem findFirstOrThrow
   */
  export type OrderItemFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemInclude<ExtArgs> | null
    /**
     * Filter, which OrderItem to fetch.
     */
    where?: OrderItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrderItems to fetch.
     */
    orderBy?: OrderItemOrderByWithRelationInput | OrderItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OrderItems.
     */
    cursor?: OrderItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrderItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrderItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OrderItems.
     */
    distinct?: OrderItemScalarFieldEnum | OrderItemScalarFieldEnum[]
  }

  /**
   * OrderItem findMany
   */
  export type OrderItemFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemInclude<ExtArgs> | null
    /**
     * Filter, which OrderItems to fetch.
     */
    where?: OrderItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrderItems to fetch.
     */
    orderBy?: OrderItemOrderByWithRelationInput | OrderItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing OrderItems.
     */
    cursor?: OrderItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrderItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrderItems.
     */
    skip?: number
    distinct?: OrderItemScalarFieldEnum | OrderItemScalarFieldEnum[]
  }

  /**
   * OrderItem create
   */
  export type OrderItemCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemInclude<ExtArgs> | null
    /**
     * The data needed to create a OrderItem.
     */
    data: XOR<OrderItemCreateInput, OrderItemUncheckedCreateInput>
  }

  /**
   * OrderItem createMany
   */
  export type OrderItemCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many OrderItems.
     */
    data: OrderItemCreateManyInput | OrderItemCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OrderItem createManyAndReturn
   */
  export type OrderItemCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many OrderItems.
     */
    data: OrderItemCreateManyInput | OrderItemCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * OrderItem update
   */
  export type OrderItemUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemInclude<ExtArgs> | null
    /**
     * The data needed to update a OrderItem.
     */
    data: XOR<OrderItemUpdateInput, OrderItemUncheckedUpdateInput>
    /**
     * Choose, which OrderItem to update.
     */
    where: OrderItemWhereUniqueInput
  }

  /**
   * OrderItem updateMany
   */
  export type OrderItemUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update OrderItems.
     */
    data: XOR<OrderItemUpdateManyMutationInput, OrderItemUncheckedUpdateManyInput>
    /**
     * Filter which OrderItems to update
     */
    where?: OrderItemWhereInput
  }

  /**
   * OrderItem upsert
   */
  export type OrderItemUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemInclude<ExtArgs> | null
    /**
     * The filter to search for the OrderItem to update in case it exists.
     */
    where: OrderItemWhereUniqueInput
    /**
     * In case the OrderItem found by the `where` argument doesn't exist, create a new OrderItem with this data.
     */
    create: XOR<OrderItemCreateInput, OrderItemUncheckedCreateInput>
    /**
     * In case the OrderItem was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OrderItemUpdateInput, OrderItemUncheckedUpdateInput>
  }

  /**
   * OrderItem delete
   */
  export type OrderItemDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemInclude<ExtArgs> | null
    /**
     * Filter which OrderItem to delete.
     */
    where: OrderItemWhereUniqueInput
  }

  /**
   * OrderItem deleteMany
   */
  export type OrderItemDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OrderItems to delete
     */
    where?: OrderItemWhereInput
  }

  /**
   * OrderItem without action
   */
  export type OrderItemDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemInclude<ExtArgs> | null
  }


  /**
   * Model Payment
   */

  export type AggregatePayment = {
    _count: PaymentCountAggregateOutputType | null
    _avg: PaymentAvgAggregateOutputType | null
    _sum: PaymentSumAggregateOutputType | null
    _min: PaymentMinAggregateOutputType | null
    _max: PaymentMaxAggregateOutputType | null
  }

  export type PaymentAvgAggregateOutputType = {
    amount: Decimal | null
  }

  export type PaymentSumAggregateOutputType = {
    amount: Decimal | null
  }

  export type PaymentMinAggregateOutputType = {
    id: string | null
    orderId: string | null
    amount: Decimal | null
    status: $Enums.PaymentStatus | null
    method: $Enums.PaymentMethod | null
    transactionId: string | null
    gatewayOrderId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PaymentMaxAggregateOutputType = {
    id: string | null
    orderId: string | null
    amount: Decimal | null
    status: $Enums.PaymentStatus | null
    method: $Enums.PaymentMethod | null
    transactionId: string | null
    gatewayOrderId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PaymentCountAggregateOutputType = {
    id: number
    orderId: number
    amount: number
    status: number
    method: number
    transactionId: number
    gatewayOrderId: number
    metadata: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type PaymentAvgAggregateInputType = {
    amount?: true
  }

  export type PaymentSumAggregateInputType = {
    amount?: true
  }

  export type PaymentMinAggregateInputType = {
    id?: true
    orderId?: true
    amount?: true
    status?: true
    method?: true
    transactionId?: true
    gatewayOrderId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PaymentMaxAggregateInputType = {
    id?: true
    orderId?: true
    amount?: true
    status?: true
    method?: true
    transactionId?: true
    gatewayOrderId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PaymentCountAggregateInputType = {
    id?: true
    orderId?: true
    amount?: true
    status?: true
    method?: true
    transactionId?: true
    gatewayOrderId?: true
    metadata?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type PaymentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Payment to aggregate.
     */
    where?: PaymentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Payments to fetch.
     */
    orderBy?: PaymentOrderByWithRelationInput | PaymentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PaymentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Payments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Payments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Payments
    **/
    _count?: true | PaymentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PaymentAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PaymentSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PaymentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PaymentMaxAggregateInputType
  }

  export type GetPaymentAggregateType<T extends PaymentAggregateArgs> = {
        [P in keyof T & keyof AggregatePayment]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePayment[P]>
      : GetScalarType<T[P], AggregatePayment[P]>
  }




  export type PaymentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PaymentWhereInput
    orderBy?: PaymentOrderByWithAggregationInput | PaymentOrderByWithAggregationInput[]
    by: PaymentScalarFieldEnum[] | PaymentScalarFieldEnum
    having?: PaymentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PaymentCountAggregateInputType | true
    _avg?: PaymentAvgAggregateInputType
    _sum?: PaymentSumAggregateInputType
    _min?: PaymentMinAggregateInputType
    _max?: PaymentMaxAggregateInputType
  }

  export type PaymentGroupByOutputType = {
    id: string
    orderId: string
    amount: Decimal
    status: $Enums.PaymentStatus
    method: $Enums.PaymentMethod
    transactionId: string | null
    gatewayOrderId: string | null
    metadata: JsonValue | null
    createdAt: Date
    updatedAt: Date
    _count: PaymentCountAggregateOutputType | null
    _avg: PaymentAvgAggregateOutputType | null
    _sum: PaymentSumAggregateOutputType | null
    _min: PaymentMinAggregateOutputType | null
    _max: PaymentMaxAggregateOutputType | null
  }

  type GetPaymentGroupByPayload<T extends PaymentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PaymentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PaymentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PaymentGroupByOutputType[P]>
            : GetScalarType<T[P], PaymentGroupByOutputType[P]>
        }
      >
    >


  export type PaymentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    orderId?: boolean
    amount?: boolean
    status?: boolean
    method?: boolean
    transactionId?: boolean
    gatewayOrderId?: boolean
    metadata?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    order?: boolean | OrderDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["payment"]>

  export type PaymentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    orderId?: boolean
    amount?: boolean
    status?: boolean
    method?: boolean
    transactionId?: boolean
    gatewayOrderId?: boolean
    metadata?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    order?: boolean | OrderDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["payment"]>

  export type PaymentSelectScalar = {
    id?: boolean
    orderId?: boolean
    amount?: boolean
    status?: boolean
    method?: boolean
    transactionId?: boolean
    gatewayOrderId?: boolean
    metadata?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type PaymentInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    order?: boolean | OrderDefaultArgs<ExtArgs>
  }
  export type PaymentIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    order?: boolean | OrderDefaultArgs<ExtArgs>
  }

  export type $PaymentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Payment"
    objects: {
      order: Prisma.$OrderPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      orderId: string
      amount: Prisma.Decimal
      status: $Enums.PaymentStatus
      method: $Enums.PaymentMethod
      transactionId: string | null
      gatewayOrderId: string | null
      metadata: Prisma.JsonValue | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["payment"]>
    composites: {}
  }

  type PaymentGetPayload<S extends boolean | null | undefined | PaymentDefaultArgs> = $Result.GetResult<Prisma.$PaymentPayload, S>

  type PaymentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<PaymentFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: PaymentCountAggregateInputType | true
    }

  export interface PaymentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Payment'], meta: { name: 'Payment' } }
    /**
     * Find zero or one Payment that matches the filter.
     * @param {PaymentFindUniqueArgs} args - Arguments to find a Payment
     * @example
     * // Get one Payment
     * const payment = await prisma.payment.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PaymentFindUniqueArgs>(args: SelectSubset<T, PaymentFindUniqueArgs<ExtArgs>>): Prisma__PaymentClient<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Payment that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {PaymentFindUniqueOrThrowArgs} args - Arguments to find a Payment
     * @example
     * // Get one Payment
     * const payment = await prisma.payment.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PaymentFindUniqueOrThrowArgs>(args: SelectSubset<T, PaymentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PaymentClient<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Payment that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaymentFindFirstArgs} args - Arguments to find a Payment
     * @example
     * // Get one Payment
     * const payment = await prisma.payment.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PaymentFindFirstArgs>(args?: SelectSubset<T, PaymentFindFirstArgs<ExtArgs>>): Prisma__PaymentClient<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Payment that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaymentFindFirstOrThrowArgs} args - Arguments to find a Payment
     * @example
     * // Get one Payment
     * const payment = await prisma.payment.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PaymentFindFirstOrThrowArgs>(args?: SelectSubset<T, PaymentFindFirstOrThrowArgs<ExtArgs>>): Prisma__PaymentClient<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Payments that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaymentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Payments
     * const payments = await prisma.payment.findMany()
     * 
     * // Get first 10 Payments
     * const payments = await prisma.payment.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const paymentWithIdOnly = await prisma.payment.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PaymentFindManyArgs>(args?: SelectSubset<T, PaymentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Payment.
     * @param {PaymentCreateArgs} args - Arguments to create a Payment.
     * @example
     * // Create one Payment
     * const Payment = await prisma.payment.create({
     *   data: {
     *     // ... data to create a Payment
     *   }
     * })
     * 
     */
    create<T extends PaymentCreateArgs>(args: SelectSubset<T, PaymentCreateArgs<ExtArgs>>): Prisma__PaymentClient<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Payments.
     * @param {PaymentCreateManyArgs} args - Arguments to create many Payments.
     * @example
     * // Create many Payments
     * const payment = await prisma.payment.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PaymentCreateManyArgs>(args?: SelectSubset<T, PaymentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Payments and returns the data saved in the database.
     * @param {PaymentCreateManyAndReturnArgs} args - Arguments to create many Payments.
     * @example
     * // Create many Payments
     * const payment = await prisma.payment.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Payments and only return the `id`
     * const paymentWithIdOnly = await prisma.payment.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PaymentCreateManyAndReturnArgs>(args?: SelectSubset<T, PaymentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Payment.
     * @param {PaymentDeleteArgs} args - Arguments to delete one Payment.
     * @example
     * // Delete one Payment
     * const Payment = await prisma.payment.delete({
     *   where: {
     *     // ... filter to delete one Payment
     *   }
     * })
     * 
     */
    delete<T extends PaymentDeleteArgs>(args: SelectSubset<T, PaymentDeleteArgs<ExtArgs>>): Prisma__PaymentClient<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Payment.
     * @param {PaymentUpdateArgs} args - Arguments to update one Payment.
     * @example
     * // Update one Payment
     * const payment = await prisma.payment.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PaymentUpdateArgs>(args: SelectSubset<T, PaymentUpdateArgs<ExtArgs>>): Prisma__PaymentClient<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Payments.
     * @param {PaymentDeleteManyArgs} args - Arguments to filter Payments to delete.
     * @example
     * // Delete a few Payments
     * const { count } = await prisma.payment.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PaymentDeleteManyArgs>(args?: SelectSubset<T, PaymentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Payments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaymentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Payments
     * const payment = await prisma.payment.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PaymentUpdateManyArgs>(args: SelectSubset<T, PaymentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Payment.
     * @param {PaymentUpsertArgs} args - Arguments to update or create a Payment.
     * @example
     * // Update or create a Payment
     * const payment = await prisma.payment.upsert({
     *   create: {
     *     // ... data to create a Payment
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Payment we want to update
     *   }
     * })
     */
    upsert<T extends PaymentUpsertArgs>(args: SelectSubset<T, PaymentUpsertArgs<ExtArgs>>): Prisma__PaymentClient<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Payments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaymentCountArgs} args - Arguments to filter Payments to count.
     * @example
     * // Count the number of Payments
     * const count = await prisma.payment.count({
     *   where: {
     *     // ... the filter for the Payments we want to count
     *   }
     * })
    **/
    count<T extends PaymentCountArgs>(
      args?: Subset<T, PaymentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PaymentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Payment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaymentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends PaymentAggregateArgs>(args: Subset<T, PaymentAggregateArgs>): Prisma.PrismaPromise<GetPaymentAggregateType<T>>

    /**
     * Group by Payment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaymentGroupByArgs} args - Group by arguments.
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
      T extends PaymentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PaymentGroupByArgs['orderBy'] }
        : { orderBy?: PaymentGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, PaymentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPaymentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Payment model
   */
  readonly fields: PaymentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Payment.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PaymentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    order<T extends OrderDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OrderDefaultArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
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
   * Fields of the Payment model
   */ 
  interface PaymentFieldRefs {
    readonly id: FieldRef<"Payment", 'String'>
    readonly orderId: FieldRef<"Payment", 'String'>
    readonly amount: FieldRef<"Payment", 'Decimal'>
    readonly status: FieldRef<"Payment", 'PaymentStatus'>
    readonly method: FieldRef<"Payment", 'PaymentMethod'>
    readonly transactionId: FieldRef<"Payment", 'String'>
    readonly gatewayOrderId: FieldRef<"Payment", 'String'>
    readonly metadata: FieldRef<"Payment", 'Json'>
    readonly createdAt: FieldRef<"Payment", 'DateTime'>
    readonly updatedAt: FieldRef<"Payment", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Payment findUnique
   */
  export type PaymentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentInclude<ExtArgs> | null
    /**
     * Filter, which Payment to fetch.
     */
    where: PaymentWhereUniqueInput
  }

  /**
   * Payment findUniqueOrThrow
   */
  export type PaymentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentInclude<ExtArgs> | null
    /**
     * Filter, which Payment to fetch.
     */
    where: PaymentWhereUniqueInput
  }

  /**
   * Payment findFirst
   */
  export type PaymentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentInclude<ExtArgs> | null
    /**
     * Filter, which Payment to fetch.
     */
    where?: PaymentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Payments to fetch.
     */
    orderBy?: PaymentOrderByWithRelationInput | PaymentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Payments.
     */
    cursor?: PaymentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Payments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Payments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Payments.
     */
    distinct?: PaymentScalarFieldEnum | PaymentScalarFieldEnum[]
  }

  /**
   * Payment findFirstOrThrow
   */
  export type PaymentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentInclude<ExtArgs> | null
    /**
     * Filter, which Payment to fetch.
     */
    where?: PaymentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Payments to fetch.
     */
    orderBy?: PaymentOrderByWithRelationInput | PaymentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Payments.
     */
    cursor?: PaymentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Payments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Payments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Payments.
     */
    distinct?: PaymentScalarFieldEnum | PaymentScalarFieldEnum[]
  }

  /**
   * Payment findMany
   */
  export type PaymentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentInclude<ExtArgs> | null
    /**
     * Filter, which Payments to fetch.
     */
    where?: PaymentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Payments to fetch.
     */
    orderBy?: PaymentOrderByWithRelationInput | PaymentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Payments.
     */
    cursor?: PaymentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Payments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Payments.
     */
    skip?: number
    distinct?: PaymentScalarFieldEnum | PaymentScalarFieldEnum[]
  }

  /**
   * Payment create
   */
  export type PaymentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentInclude<ExtArgs> | null
    /**
     * The data needed to create a Payment.
     */
    data: XOR<PaymentCreateInput, PaymentUncheckedCreateInput>
  }

  /**
   * Payment createMany
   */
  export type PaymentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Payments.
     */
    data: PaymentCreateManyInput | PaymentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Payment createManyAndReturn
   */
  export type PaymentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Payments.
     */
    data: PaymentCreateManyInput | PaymentCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Payment update
   */
  export type PaymentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentInclude<ExtArgs> | null
    /**
     * The data needed to update a Payment.
     */
    data: XOR<PaymentUpdateInput, PaymentUncheckedUpdateInput>
    /**
     * Choose, which Payment to update.
     */
    where: PaymentWhereUniqueInput
  }

  /**
   * Payment updateMany
   */
  export type PaymentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Payments.
     */
    data: XOR<PaymentUpdateManyMutationInput, PaymentUncheckedUpdateManyInput>
    /**
     * Filter which Payments to update
     */
    where?: PaymentWhereInput
  }

  /**
   * Payment upsert
   */
  export type PaymentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentInclude<ExtArgs> | null
    /**
     * The filter to search for the Payment to update in case it exists.
     */
    where: PaymentWhereUniqueInput
    /**
     * In case the Payment found by the `where` argument doesn't exist, create a new Payment with this data.
     */
    create: XOR<PaymentCreateInput, PaymentUncheckedCreateInput>
    /**
     * In case the Payment was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PaymentUpdateInput, PaymentUncheckedUpdateInput>
  }

  /**
   * Payment delete
   */
  export type PaymentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentInclude<ExtArgs> | null
    /**
     * Filter which Payment to delete.
     */
    where: PaymentWhereUniqueInput
  }

  /**
   * Payment deleteMany
   */
  export type PaymentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Payments to delete
     */
    where?: PaymentWhereInput
  }

  /**
   * Payment without action
   */
  export type PaymentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentInclude<ExtArgs> | null
  }


  /**
   * Model CouponUsage
   */

  export type AggregateCouponUsage = {
    _count: CouponUsageCountAggregateOutputType | null
    _min: CouponUsageMinAggregateOutputType | null
    _max: CouponUsageMaxAggregateOutputType | null
  }

  export type CouponUsageMinAggregateOutputType = {
    id: string | null
    couponId: string | null
    userId: string | null
    orderId: string | null
    createdAt: Date | null
  }

  export type CouponUsageMaxAggregateOutputType = {
    id: string | null
    couponId: string | null
    userId: string | null
    orderId: string | null
    createdAt: Date | null
  }

  export type CouponUsageCountAggregateOutputType = {
    id: number
    couponId: number
    userId: number
    orderId: number
    createdAt: number
    _all: number
  }


  export type CouponUsageMinAggregateInputType = {
    id?: true
    couponId?: true
    userId?: true
    orderId?: true
    createdAt?: true
  }

  export type CouponUsageMaxAggregateInputType = {
    id?: true
    couponId?: true
    userId?: true
    orderId?: true
    createdAt?: true
  }

  export type CouponUsageCountAggregateInputType = {
    id?: true
    couponId?: true
    userId?: true
    orderId?: true
    createdAt?: true
    _all?: true
  }

  export type CouponUsageAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CouponUsage to aggregate.
     */
    where?: CouponUsageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CouponUsages to fetch.
     */
    orderBy?: CouponUsageOrderByWithRelationInput | CouponUsageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CouponUsageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CouponUsages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CouponUsages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CouponUsages
    **/
    _count?: true | CouponUsageCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CouponUsageMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CouponUsageMaxAggregateInputType
  }

  export type GetCouponUsageAggregateType<T extends CouponUsageAggregateArgs> = {
        [P in keyof T & keyof AggregateCouponUsage]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCouponUsage[P]>
      : GetScalarType<T[P], AggregateCouponUsage[P]>
  }




  export type CouponUsageGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CouponUsageWhereInput
    orderBy?: CouponUsageOrderByWithAggregationInput | CouponUsageOrderByWithAggregationInput[]
    by: CouponUsageScalarFieldEnum[] | CouponUsageScalarFieldEnum
    having?: CouponUsageScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CouponUsageCountAggregateInputType | true
    _min?: CouponUsageMinAggregateInputType
    _max?: CouponUsageMaxAggregateInputType
  }

  export type CouponUsageGroupByOutputType = {
    id: string
    couponId: string
    userId: string
    orderId: string
    createdAt: Date
    _count: CouponUsageCountAggregateOutputType | null
    _min: CouponUsageMinAggregateOutputType | null
    _max: CouponUsageMaxAggregateOutputType | null
  }

  type GetCouponUsageGroupByPayload<T extends CouponUsageGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CouponUsageGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CouponUsageGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CouponUsageGroupByOutputType[P]>
            : GetScalarType<T[P], CouponUsageGroupByOutputType[P]>
        }
      >
    >


  export type CouponUsageSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    couponId?: boolean
    userId?: boolean
    orderId?: boolean
    createdAt?: boolean
    order?: boolean | OrderDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["couponUsage"]>

  export type CouponUsageSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    couponId?: boolean
    userId?: boolean
    orderId?: boolean
    createdAt?: boolean
    order?: boolean | OrderDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["couponUsage"]>

  export type CouponUsageSelectScalar = {
    id?: boolean
    couponId?: boolean
    userId?: boolean
    orderId?: boolean
    createdAt?: boolean
  }

  export type CouponUsageInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    order?: boolean | OrderDefaultArgs<ExtArgs>
  }
  export type CouponUsageIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    order?: boolean | OrderDefaultArgs<ExtArgs>
  }

  export type $CouponUsagePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CouponUsage"
    objects: {
      order: Prisma.$OrderPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      couponId: string
      userId: string
      orderId: string
      createdAt: Date
    }, ExtArgs["result"]["couponUsage"]>
    composites: {}
  }

  type CouponUsageGetPayload<S extends boolean | null | undefined | CouponUsageDefaultArgs> = $Result.GetResult<Prisma.$CouponUsagePayload, S>

  type CouponUsageCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<CouponUsageFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: CouponUsageCountAggregateInputType | true
    }

  export interface CouponUsageDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CouponUsage'], meta: { name: 'CouponUsage' } }
    /**
     * Find zero or one CouponUsage that matches the filter.
     * @param {CouponUsageFindUniqueArgs} args - Arguments to find a CouponUsage
     * @example
     * // Get one CouponUsage
     * const couponUsage = await prisma.couponUsage.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CouponUsageFindUniqueArgs>(args: SelectSubset<T, CouponUsageFindUniqueArgs<ExtArgs>>): Prisma__CouponUsageClient<$Result.GetResult<Prisma.$CouponUsagePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one CouponUsage that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {CouponUsageFindUniqueOrThrowArgs} args - Arguments to find a CouponUsage
     * @example
     * // Get one CouponUsage
     * const couponUsage = await prisma.couponUsage.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CouponUsageFindUniqueOrThrowArgs>(args: SelectSubset<T, CouponUsageFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CouponUsageClient<$Result.GetResult<Prisma.$CouponUsagePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first CouponUsage that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CouponUsageFindFirstArgs} args - Arguments to find a CouponUsage
     * @example
     * // Get one CouponUsage
     * const couponUsage = await prisma.couponUsage.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CouponUsageFindFirstArgs>(args?: SelectSubset<T, CouponUsageFindFirstArgs<ExtArgs>>): Prisma__CouponUsageClient<$Result.GetResult<Prisma.$CouponUsagePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first CouponUsage that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CouponUsageFindFirstOrThrowArgs} args - Arguments to find a CouponUsage
     * @example
     * // Get one CouponUsage
     * const couponUsage = await prisma.couponUsage.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CouponUsageFindFirstOrThrowArgs>(args?: SelectSubset<T, CouponUsageFindFirstOrThrowArgs<ExtArgs>>): Prisma__CouponUsageClient<$Result.GetResult<Prisma.$CouponUsagePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more CouponUsages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CouponUsageFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CouponUsages
     * const couponUsages = await prisma.couponUsage.findMany()
     * 
     * // Get first 10 CouponUsages
     * const couponUsages = await prisma.couponUsage.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const couponUsageWithIdOnly = await prisma.couponUsage.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CouponUsageFindManyArgs>(args?: SelectSubset<T, CouponUsageFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CouponUsagePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a CouponUsage.
     * @param {CouponUsageCreateArgs} args - Arguments to create a CouponUsage.
     * @example
     * // Create one CouponUsage
     * const CouponUsage = await prisma.couponUsage.create({
     *   data: {
     *     // ... data to create a CouponUsage
     *   }
     * })
     * 
     */
    create<T extends CouponUsageCreateArgs>(args: SelectSubset<T, CouponUsageCreateArgs<ExtArgs>>): Prisma__CouponUsageClient<$Result.GetResult<Prisma.$CouponUsagePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many CouponUsages.
     * @param {CouponUsageCreateManyArgs} args - Arguments to create many CouponUsages.
     * @example
     * // Create many CouponUsages
     * const couponUsage = await prisma.couponUsage.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CouponUsageCreateManyArgs>(args?: SelectSubset<T, CouponUsageCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CouponUsages and returns the data saved in the database.
     * @param {CouponUsageCreateManyAndReturnArgs} args - Arguments to create many CouponUsages.
     * @example
     * // Create many CouponUsages
     * const couponUsage = await prisma.couponUsage.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CouponUsages and only return the `id`
     * const couponUsageWithIdOnly = await prisma.couponUsage.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CouponUsageCreateManyAndReturnArgs>(args?: SelectSubset<T, CouponUsageCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CouponUsagePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a CouponUsage.
     * @param {CouponUsageDeleteArgs} args - Arguments to delete one CouponUsage.
     * @example
     * // Delete one CouponUsage
     * const CouponUsage = await prisma.couponUsage.delete({
     *   where: {
     *     // ... filter to delete one CouponUsage
     *   }
     * })
     * 
     */
    delete<T extends CouponUsageDeleteArgs>(args: SelectSubset<T, CouponUsageDeleteArgs<ExtArgs>>): Prisma__CouponUsageClient<$Result.GetResult<Prisma.$CouponUsagePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one CouponUsage.
     * @param {CouponUsageUpdateArgs} args - Arguments to update one CouponUsage.
     * @example
     * // Update one CouponUsage
     * const couponUsage = await prisma.couponUsage.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CouponUsageUpdateArgs>(args: SelectSubset<T, CouponUsageUpdateArgs<ExtArgs>>): Prisma__CouponUsageClient<$Result.GetResult<Prisma.$CouponUsagePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more CouponUsages.
     * @param {CouponUsageDeleteManyArgs} args - Arguments to filter CouponUsages to delete.
     * @example
     * // Delete a few CouponUsages
     * const { count } = await prisma.couponUsage.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CouponUsageDeleteManyArgs>(args?: SelectSubset<T, CouponUsageDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CouponUsages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CouponUsageUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CouponUsages
     * const couponUsage = await prisma.couponUsage.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CouponUsageUpdateManyArgs>(args: SelectSubset<T, CouponUsageUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one CouponUsage.
     * @param {CouponUsageUpsertArgs} args - Arguments to update or create a CouponUsage.
     * @example
     * // Update or create a CouponUsage
     * const couponUsage = await prisma.couponUsage.upsert({
     *   create: {
     *     // ... data to create a CouponUsage
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CouponUsage we want to update
     *   }
     * })
     */
    upsert<T extends CouponUsageUpsertArgs>(args: SelectSubset<T, CouponUsageUpsertArgs<ExtArgs>>): Prisma__CouponUsageClient<$Result.GetResult<Prisma.$CouponUsagePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of CouponUsages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CouponUsageCountArgs} args - Arguments to filter CouponUsages to count.
     * @example
     * // Count the number of CouponUsages
     * const count = await prisma.couponUsage.count({
     *   where: {
     *     // ... the filter for the CouponUsages we want to count
     *   }
     * })
    **/
    count<T extends CouponUsageCountArgs>(
      args?: Subset<T, CouponUsageCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CouponUsageCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CouponUsage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CouponUsageAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends CouponUsageAggregateArgs>(args: Subset<T, CouponUsageAggregateArgs>): Prisma.PrismaPromise<GetCouponUsageAggregateType<T>>

    /**
     * Group by CouponUsage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CouponUsageGroupByArgs} args - Group by arguments.
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
      T extends CouponUsageGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CouponUsageGroupByArgs['orderBy'] }
        : { orderBy?: CouponUsageGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, CouponUsageGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCouponUsageGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CouponUsage model
   */
  readonly fields: CouponUsageFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CouponUsage.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CouponUsageClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    order<T extends OrderDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OrderDefaultArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
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
   * Fields of the CouponUsage model
   */ 
  interface CouponUsageFieldRefs {
    readonly id: FieldRef<"CouponUsage", 'String'>
    readonly couponId: FieldRef<"CouponUsage", 'String'>
    readonly userId: FieldRef<"CouponUsage", 'String'>
    readonly orderId: FieldRef<"CouponUsage", 'String'>
    readonly createdAt: FieldRef<"CouponUsage", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CouponUsage findUnique
   */
  export type CouponUsageFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CouponUsage
     */
    select?: CouponUsageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CouponUsageInclude<ExtArgs> | null
    /**
     * Filter, which CouponUsage to fetch.
     */
    where: CouponUsageWhereUniqueInput
  }

  /**
   * CouponUsage findUniqueOrThrow
   */
  export type CouponUsageFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CouponUsage
     */
    select?: CouponUsageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CouponUsageInclude<ExtArgs> | null
    /**
     * Filter, which CouponUsage to fetch.
     */
    where: CouponUsageWhereUniqueInput
  }

  /**
   * CouponUsage findFirst
   */
  export type CouponUsageFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CouponUsage
     */
    select?: CouponUsageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CouponUsageInclude<ExtArgs> | null
    /**
     * Filter, which CouponUsage to fetch.
     */
    where?: CouponUsageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CouponUsages to fetch.
     */
    orderBy?: CouponUsageOrderByWithRelationInput | CouponUsageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CouponUsages.
     */
    cursor?: CouponUsageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CouponUsages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CouponUsages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CouponUsages.
     */
    distinct?: CouponUsageScalarFieldEnum | CouponUsageScalarFieldEnum[]
  }

  /**
   * CouponUsage findFirstOrThrow
   */
  export type CouponUsageFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CouponUsage
     */
    select?: CouponUsageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CouponUsageInclude<ExtArgs> | null
    /**
     * Filter, which CouponUsage to fetch.
     */
    where?: CouponUsageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CouponUsages to fetch.
     */
    orderBy?: CouponUsageOrderByWithRelationInput | CouponUsageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CouponUsages.
     */
    cursor?: CouponUsageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CouponUsages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CouponUsages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CouponUsages.
     */
    distinct?: CouponUsageScalarFieldEnum | CouponUsageScalarFieldEnum[]
  }

  /**
   * CouponUsage findMany
   */
  export type CouponUsageFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CouponUsage
     */
    select?: CouponUsageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CouponUsageInclude<ExtArgs> | null
    /**
     * Filter, which CouponUsages to fetch.
     */
    where?: CouponUsageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CouponUsages to fetch.
     */
    orderBy?: CouponUsageOrderByWithRelationInput | CouponUsageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CouponUsages.
     */
    cursor?: CouponUsageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CouponUsages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CouponUsages.
     */
    skip?: number
    distinct?: CouponUsageScalarFieldEnum | CouponUsageScalarFieldEnum[]
  }

  /**
   * CouponUsage create
   */
  export type CouponUsageCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CouponUsage
     */
    select?: CouponUsageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CouponUsageInclude<ExtArgs> | null
    /**
     * The data needed to create a CouponUsage.
     */
    data: XOR<CouponUsageCreateInput, CouponUsageUncheckedCreateInput>
  }

  /**
   * CouponUsage createMany
   */
  export type CouponUsageCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CouponUsages.
     */
    data: CouponUsageCreateManyInput | CouponUsageCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CouponUsage createManyAndReturn
   */
  export type CouponUsageCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CouponUsage
     */
    select?: CouponUsageSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many CouponUsages.
     */
    data: CouponUsageCreateManyInput | CouponUsageCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CouponUsageIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * CouponUsage update
   */
  export type CouponUsageUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CouponUsage
     */
    select?: CouponUsageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CouponUsageInclude<ExtArgs> | null
    /**
     * The data needed to update a CouponUsage.
     */
    data: XOR<CouponUsageUpdateInput, CouponUsageUncheckedUpdateInput>
    /**
     * Choose, which CouponUsage to update.
     */
    where: CouponUsageWhereUniqueInput
  }

  /**
   * CouponUsage updateMany
   */
  export type CouponUsageUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CouponUsages.
     */
    data: XOR<CouponUsageUpdateManyMutationInput, CouponUsageUncheckedUpdateManyInput>
    /**
     * Filter which CouponUsages to update
     */
    where?: CouponUsageWhereInput
  }

  /**
   * CouponUsage upsert
   */
  export type CouponUsageUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CouponUsage
     */
    select?: CouponUsageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CouponUsageInclude<ExtArgs> | null
    /**
     * The filter to search for the CouponUsage to update in case it exists.
     */
    where: CouponUsageWhereUniqueInput
    /**
     * In case the CouponUsage found by the `where` argument doesn't exist, create a new CouponUsage with this data.
     */
    create: XOR<CouponUsageCreateInput, CouponUsageUncheckedCreateInput>
    /**
     * In case the CouponUsage was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CouponUsageUpdateInput, CouponUsageUncheckedUpdateInput>
  }

  /**
   * CouponUsage delete
   */
  export type CouponUsageDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CouponUsage
     */
    select?: CouponUsageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CouponUsageInclude<ExtArgs> | null
    /**
     * Filter which CouponUsage to delete.
     */
    where: CouponUsageWhereUniqueInput
  }

  /**
   * CouponUsage deleteMany
   */
  export type CouponUsageDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CouponUsages to delete
     */
    where?: CouponUsageWhereInput
  }

  /**
   * CouponUsage without action
   */
  export type CouponUsageDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CouponUsage
     */
    select?: CouponUsageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CouponUsageInclude<ExtArgs> | null
  }


  /**
   * Model Notification
   */

  export type AggregateNotification = {
    _count: NotificationCountAggregateOutputType | null
    _min: NotificationMinAggregateOutputType | null
    _max: NotificationMaxAggregateOutputType | null
  }

  export type NotificationMinAggregateOutputType = {
    id: string | null
    userId: string | null
    title: string | null
    message: string | null
    type: string | null
    category: string | null
    isRead: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type NotificationMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    title: string | null
    message: string | null
    type: string | null
    category: string | null
    isRead: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type NotificationCountAggregateOutputType = {
    id: number
    userId: number
    title: number
    message: number
    type: number
    category: number
    isRead: number
    metadata: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type NotificationMinAggregateInputType = {
    id?: true
    userId?: true
    title?: true
    message?: true
    type?: true
    category?: true
    isRead?: true
    createdAt?: true
    updatedAt?: true
  }

  export type NotificationMaxAggregateInputType = {
    id?: true
    userId?: true
    title?: true
    message?: true
    type?: true
    category?: true
    isRead?: true
    createdAt?: true
    updatedAt?: true
  }

  export type NotificationCountAggregateInputType = {
    id?: true
    userId?: true
    title?: true
    message?: true
    type?: true
    category?: true
    isRead?: true
    metadata?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type NotificationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Notification to aggregate.
     */
    where?: NotificationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Notifications to fetch.
     */
    orderBy?: NotificationOrderByWithRelationInput | NotificationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: NotificationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Notifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Notifications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Notifications
    **/
    _count?: true | NotificationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: NotificationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: NotificationMaxAggregateInputType
  }

  export type GetNotificationAggregateType<T extends NotificationAggregateArgs> = {
        [P in keyof T & keyof AggregateNotification]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateNotification[P]>
      : GetScalarType<T[P], AggregateNotification[P]>
  }




  export type NotificationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: NotificationWhereInput
    orderBy?: NotificationOrderByWithAggregationInput | NotificationOrderByWithAggregationInput[]
    by: NotificationScalarFieldEnum[] | NotificationScalarFieldEnum
    having?: NotificationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: NotificationCountAggregateInputType | true
    _min?: NotificationMinAggregateInputType
    _max?: NotificationMaxAggregateInputType
  }

  export type NotificationGroupByOutputType = {
    id: string
    userId: string
    title: string
    message: string
    type: string
    category: string | null
    isRead: boolean
    metadata: JsonValue | null
    createdAt: Date
    updatedAt: Date
    _count: NotificationCountAggregateOutputType | null
    _min: NotificationMinAggregateOutputType | null
    _max: NotificationMaxAggregateOutputType | null
  }

  type GetNotificationGroupByPayload<T extends NotificationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<NotificationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof NotificationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], NotificationGroupByOutputType[P]>
            : GetScalarType<T[P], NotificationGroupByOutputType[P]>
        }
      >
    >


  export type NotificationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    title?: boolean
    message?: boolean
    type?: boolean
    category?: boolean
    isRead?: boolean
    metadata?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["notification"]>

  export type NotificationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    title?: boolean
    message?: boolean
    type?: boolean
    category?: boolean
    isRead?: boolean
    metadata?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["notification"]>

  export type NotificationSelectScalar = {
    id?: boolean
    userId?: boolean
    title?: boolean
    message?: boolean
    type?: boolean
    category?: boolean
    isRead?: boolean
    metadata?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }


  export type $NotificationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Notification"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      title: string
      message: string
      type: string
      category: string | null
      isRead: boolean
      metadata: Prisma.JsonValue | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["notification"]>
    composites: {}
  }

  type NotificationGetPayload<S extends boolean | null | undefined | NotificationDefaultArgs> = $Result.GetResult<Prisma.$NotificationPayload, S>

  type NotificationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<NotificationFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: NotificationCountAggregateInputType | true
    }

  export interface NotificationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Notification'], meta: { name: 'Notification' } }
    /**
     * Find zero or one Notification that matches the filter.
     * @param {NotificationFindUniqueArgs} args - Arguments to find a Notification
     * @example
     * // Get one Notification
     * const notification = await prisma.notification.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends NotificationFindUniqueArgs>(args: SelectSubset<T, NotificationFindUniqueArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Notification that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {NotificationFindUniqueOrThrowArgs} args - Arguments to find a Notification
     * @example
     * // Get one Notification
     * const notification = await prisma.notification.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends NotificationFindUniqueOrThrowArgs>(args: SelectSubset<T, NotificationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Notification that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationFindFirstArgs} args - Arguments to find a Notification
     * @example
     * // Get one Notification
     * const notification = await prisma.notification.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends NotificationFindFirstArgs>(args?: SelectSubset<T, NotificationFindFirstArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Notification that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationFindFirstOrThrowArgs} args - Arguments to find a Notification
     * @example
     * // Get one Notification
     * const notification = await prisma.notification.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends NotificationFindFirstOrThrowArgs>(args?: SelectSubset<T, NotificationFindFirstOrThrowArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Notifications that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Notifications
     * const notifications = await prisma.notification.findMany()
     * 
     * // Get first 10 Notifications
     * const notifications = await prisma.notification.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const notificationWithIdOnly = await prisma.notification.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends NotificationFindManyArgs>(args?: SelectSubset<T, NotificationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Notification.
     * @param {NotificationCreateArgs} args - Arguments to create a Notification.
     * @example
     * // Create one Notification
     * const Notification = await prisma.notification.create({
     *   data: {
     *     // ... data to create a Notification
     *   }
     * })
     * 
     */
    create<T extends NotificationCreateArgs>(args: SelectSubset<T, NotificationCreateArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Notifications.
     * @param {NotificationCreateManyArgs} args - Arguments to create many Notifications.
     * @example
     * // Create many Notifications
     * const notification = await prisma.notification.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends NotificationCreateManyArgs>(args?: SelectSubset<T, NotificationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Notifications and returns the data saved in the database.
     * @param {NotificationCreateManyAndReturnArgs} args - Arguments to create many Notifications.
     * @example
     * // Create many Notifications
     * const notification = await prisma.notification.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Notifications and only return the `id`
     * const notificationWithIdOnly = await prisma.notification.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends NotificationCreateManyAndReturnArgs>(args?: SelectSubset<T, NotificationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Notification.
     * @param {NotificationDeleteArgs} args - Arguments to delete one Notification.
     * @example
     * // Delete one Notification
     * const Notification = await prisma.notification.delete({
     *   where: {
     *     // ... filter to delete one Notification
     *   }
     * })
     * 
     */
    delete<T extends NotificationDeleteArgs>(args: SelectSubset<T, NotificationDeleteArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Notification.
     * @param {NotificationUpdateArgs} args - Arguments to update one Notification.
     * @example
     * // Update one Notification
     * const notification = await prisma.notification.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends NotificationUpdateArgs>(args: SelectSubset<T, NotificationUpdateArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Notifications.
     * @param {NotificationDeleteManyArgs} args - Arguments to filter Notifications to delete.
     * @example
     * // Delete a few Notifications
     * const { count } = await prisma.notification.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends NotificationDeleteManyArgs>(args?: SelectSubset<T, NotificationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Notifications.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Notifications
     * const notification = await prisma.notification.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends NotificationUpdateManyArgs>(args: SelectSubset<T, NotificationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Notification.
     * @param {NotificationUpsertArgs} args - Arguments to update or create a Notification.
     * @example
     * // Update or create a Notification
     * const notification = await prisma.notification.upsert({
     *   create: {
     *     // ... data to create a Notification
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Notification we want to update
     *   }
     * })
     */
    upsert<T extends NotificationUpsertArgs>(args: SelectSubset<T, NotificationUpsertArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Notifications.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationCountArgs} args - Arguments to filter Notifications to count.
     * @example
     * // Count the number of Notifications
     * const count = await prisma.notification.count({
     *   where: {
     *     // ... the filter for the Notifications we want to count
     *   }
     * })
    **/
    count<T extends NotificationCountArgs>(
      args?: Subset<T, NotificationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], NotificationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Notification.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends NotificationAggregateArgs>(args: Subset<T, NotificationAggregateArgs>): Prisma.PrismaPromise<GetNotificationAggregateType<T>>

    /**
     * Group by Notification.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationGroupByArgs} args - Group by arguments.
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
      T extends NotificationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: NotificationGroupByArgs['orderBy'] }
        : { orderBy?: NotificationGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, NotificationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetNotificationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Notification model
   */
  readonly fields: NotificationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Notification.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__NotificationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the Notification model
   */ 
  interface NotificationFieldRefs {
    readonly id: FieldRef<"Notification", 'String'>
    readonly userId: FieldRef<"Notification", 'String'>
    readonly title: FieldRef<"Notification", 'String'>
    readonly message: FieldRef<"Notification", 'String'>
    readonly type: FieldRef<"Notification", 'String'>
    readonly category: FieldRef<"Notification", 'String'>
    readonly isRead: FieldRef<"Notification", 'Boolean'>
    readonly metadata: FieldRef<"Notification", 'Json'>
    readonly createdAt: FieldRef<"Notification", 'DateTime'>
    readonly updatedAt: FieldRef<"Notification", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Notification findUnique
   */
  export type NotificationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Filter, which Notification to fetch.
     */
    where: NotificationWhereUniqueInput
  }

  /**
   * Notification findUniqueOrThrow
   */
  export type NotificationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Filter, which Notification to fetch.
     */
    where: NotificationWhereUniqueInput
  }

  /**
   * Notification findFirst
   */
  export type NotificationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Filter, which Notification to fetch.
     */
    where?: NotificationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Notifications to fetch.
     */
    orderBy?: NotificationOrderByWithRelationInput | NotificationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Notifications.
     */
    cursor?: NotificationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Notifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Notifications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Notifications.
     */
    distinct?: NotificationScalarFieldEnum | NotificationScalarFieldEnum[]
  }

  /**
   * Notification findFirstOrThrow
   */
  export type NotificationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Filter, which Notification to fetch.
     */
    where?: NotificationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Notifications to fetch.
     */
    orderBy?: NotificationOrderByWithRelationInput | NotificationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Notifications.
     */
    cursor?: NotificationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Notifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Notifications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Notifications.
     */
    distinct?: NotificationScalarFieldEnum | NotificationScalarFieldEnum[]
  }

  /**
   * Notification findMany
   */
  export type NotificationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Filter, which Notifications to fetch.
     */
    where?: NotificationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Notifications to fetch.
     */
    orderBy?: NotificationOrderByWithRelationInput | NotificationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Notifications.
     */
    cursor?: NotificationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Notifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Notifications.
     */
    skip?: number
    distinct?: NotificationScalarFieldEnum | NotificationScalarFieldEnum[]
  }

  /**
   * Notification create
   */
  export type NotificationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * The data needed to create a Notification.
     */
    data: XOR<NotificationCreateInput, NotificationUncheckedCreateInput>
  }

  /**
   * Notification createMany
   */
  export type NotificationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Notifications.
     */
    data: NotificationCreateManyInput | NotificationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Notification createManyAndReturn
   */
  export type NotificationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Notifications.
     */
    data: NotificationCreateManyInput | NotificationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Notification update
   */
  export type NotificationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * The data needed to update a Notification.
     */
    data: XOR<NotificationUpdateInput, NotificationUncheckedUpdateInput>
    /**
     * Choose, which Notification to update.
     */
    where: NotificationWhereUniqueInput
  }

  /**
   * Notification updateMany
   */
  export type NotificationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Notifications.
     */
    data: XOR<NotificationUpdateManyMutationInput, NotificationUncheckedUpdateManyInput>
    /**
     * Filter which Notifications to update
     */
    where?: NotificationWhereInput
  }

  /**
   * Notification upsert
   */
  export type NotificationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * The filter to search for the Notification to update in case it exists.
     */
    where: NotificationWhereUniqueInput
    /**
     * In case the Notification found by the `where` argument doesn't exist, create a new Notification with this data.
     */
    create: XOR<NotificationCreateInput, NotificationUncheckedCreateInput>
    /**
     * In case the Notification was found with the provided `where` argument, update it with this data.
     */
    update: XOR<NotificationUpdateInput, NotificationUncheckedUpdateInput>
  }

  /**
   * Notification delete
   */
  export type NotificationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Filter which Notification to delete.
     */
    where: NotificationWhereUniqueInput
  }

  /**
   * Notification deleteMany
   */
  export type NotificationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Notifications to delete
     */
    where?: NotificationWhereInput
  }

  /**
   * Notification without action
   */
  export type NotificationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
  }


  /**
   * Model AuditLog
   */

  export type AggregateAuditLog = {
    _count: AuditLogCountAggregateOutputType | null
    _min: AuditLogMinAggregateOutputType | null
    _max: AuditLogMaxAggregateOutputType | null
  }

  export type AuditLogMinAggregateOutputType = {
    id: string | null
    entityType: $Enums.AuditEntityType | null
    entityId: string | null
    action: string | null
    actorId: string | null
    actorType: $Enums.ActorType | null
    createdAt: Date | null
  }

  export type AuditLogMaxAggregateOutputType = {
    id: string | null
    entityType: $Enums.AuditEntityType | null
    entityId: string | null
    action: string | null
    actorId: string | null
    actorType: $Enums.ActorType | null
    createdAt: Date | null
  }

  export type AuditLogCountAggregateOutputType = {
    id: number
    entityType: number
    entityId: number
    action: number
    actorId: number
    actorType: number
    metadata: number
    createdAt: number
    _all: number
  }


  export type AuditLogMinAggregateInputType = {
    id?: true
    entityType?: true
    entityId?: true
    action?: true
    actorId?: true
    actorType?: true
    createdAt?: true
  }

  export type AuditLogMaxAggregateInputType = {
    id?: true
    entityType?: true
    entityId?: true
    action?: true
    actorId?: true
    actorType?: true
    createdAt?: true
  }

  export type AuditLogCountAggregateInputType = {
    id?: true
    entityType?: true
    entityId?: true
    action?: true
    actorId?: true
    actorType?: true
    metadata?: true
    createdAt?: true
    _all?: true
  }

  export type AuditLogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AuditLog to aggregate.
     */
    where?: AuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AuditLogs
    **/
    _count?: true | AuditLogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AuditLogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AuditLogMaxAggregateInputType
  }

  export type GetAuditLogAggregateType<T extends AuditLogAggregateArgs> = {
        [P in keyof T & keyof AggregateAuditLog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAuditLog[P]>
      : GetScalarType<T[P], AggregateAuditLog[P]>
  }




  export type AuditLogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AuditLogWhereInput
    orderBy?: AuditLogOrderByWithAggregationInput | AuditLogOrderByWithAggregationInput[]
    by: AuditLogScalarFieldEnum[] | AuditLogScalarFieldEnum
    having?: AuditLogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AuditLogCountAggregateInputType | true
    _min?: AuditLogMinAggregateInputType
    _max?: AuditLogMaxAggregateInputType
  }

  export type AuditLogGroupByOutputType = {
    id: string
    entityType: $Enums.AuditEntityType
    entityId: string
    action: string
    actorId: string | null
    actorType: $Enums.ActorType | null
    metadata: JsonValue | null
    createdAt: Date
    _count: AuditLogCountAggregateOutputType | null
    _min: AuditLogMinAggregateOutputType | null
    _max: AuditLogMaxAggregateOutputType | null
  }

  type GetAuditLogGroupByPayload<T extends AuditLogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AuditLogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AuditLogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AuditLogGroupByOutputType[P]>
            : GetScalarType<T[P], AuditLogGroupByOutputType[P]>
        }
      >
    >


  export type AuditLogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    entityType?: boolean
    entityId?: boolean
    action?: boolean
    actorId?: boolean
    actorType?: boolean
    metadata?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["auditLog"]>

  export type AuditLogSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    entityType?: boolean
    entityId?: boolean
    action?: boolean
    actorId?: boolean
    actorType?: boolean
    metadata?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["auditLog"]>

  export type AuditLogSelectScalar = {
    id?: boolean
    entityType?: boolean
    entityId?: boolean
    action?: boolean
    actorId?: boolean
    actorType?: boolean
    metadata?: boolean
    createdAt?: boolean
  }


  export type $AuditLogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AuditLog"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      entityType: $Enums.AuditEntityType
      entityId: string
      action: string
      actorId: string | null
      actorType: $Enums.ActorType | null
      metadata: Prisma.JsonValue | null
      createdAt: Date
    }, ExtArgs["result"]["auditLog"]>
    composites: {}
  }

  type AuditLogGetPayload<S extends boolean | null | undefined | AuditLogDefaultArgs> = $Result.GetResult<Prisma.$AuditLogPayload, S>

  type AuditLogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<AuditLogFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: AuditLogCountAggregateInputType | true
    }

  export interface AuditLogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AuditLog'], meta: { name: 'AuditLog' } }
    /**
     * Find zero or one AuditLog that matches the filter.
     * @param {AuditLogFindUniqueArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AuditLogFindUniqueArgs>(args: SelectSubset<T, AuditLogFindUniqueArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one AuditLog that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {AuditLogFindUniqueOrThrowArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AuditLogFindUniqueOrThrowArgs>(args: SelectSubset<T, AuditLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first AuditLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogFindFirstArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AuditLogFindFirstArgs>(args?: SelectSubset<T, AuditLogFindFirstArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first AuditLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogFindFirstOrThrowArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AuditLogFindFirstOrThrowArgs>(args?: SelectSubset<T, AuditLogFindFirstOrThrowArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more AuditLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AuditLogs
     * const auditLogs = await prisma.auditLog.findMany()
     * 
     * // Get first 10 AuditLogs
     * const auditLogs = await prisma.auditLog.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const auditLogWithIdOnly = await prisma.auditLog.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AuditLogFindManyArgs>(args?: SelectSubset<T, AuditLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a AuditLog.
     * @param {AuditLogCreateArgs} args - Arguments to create a AuditLog.
     * @example
     * // Create one AuditLog
     * const AuditLog = await prisma.auditLog.create({
     *   data: {
     *     // ... data to create a AuditLog
     *   }
     * })
     * 
     */
    create<T extends AuditLogCreateArgs>(args: SelectSubset<T, AuditLogCreateArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many AuditLogs.
     * @param {AuditLogCreateManyArgs} args - Arguments to create many AuditLogs.
     * @example
     * // Create many AuditLogs
     * const auditLog = await prisma.auditLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AuditLogCreateManyArgs>(args?: SelectSubset<T, AuditLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AuditLogs and returns the data saved in the database.
     * @param {AuditLogCreateManyAndReturnArgs} args - Arguments to create many AuditLogs.
     * @example
     * // Create many AuditLogs
     * const auditLog = await prisma.auditLog.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AuditLogs and only return the `id`
     * const auditLogWithIdOnly = await prisma.auditLog.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AuditLogCreateManyAndReturnArgs>(args?: SelectSubset<T, AuditLogCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a AuditLog.
     * @param {AuditLogDeleteArgs} args - Arguments to delete one AuditLog.
     * @example
     * // Delete one AuditLog
     * const AuditLog = await prisma.auditLog.delete({
     *   where: {
     *     // ... filter to delete one AuditLog
     *   }
     * })
     * 
     */
    delete<T extends AuditLogDeleteArgs>(args: SelectSubset<T, AuditLogDeleteArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one AuditLog.
     * @param {AuditLogUpdateArgs} args - Arguments to update one AuditLog.
     * @example
     * // Update one AuditLog
     * const auditLog = await prisma.auditLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AuditLogUpdateArgs>(args: SelectSubset<T, AuditLogUpdateArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more AuditLogs.
     * @param {AuditLogDeleteManyArgs} args - Arguments to filter AuditLogs to delete.
     * @example
     * // Delete a few AuditLogs
     * const { count } = await prisma.auditLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AuditLogDeleteManyArgs>(args?: SelectSubset<T, AuditLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AuditLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AuditLogs
     * const auditLog = await prisma.auditLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AuditLogUpdateManyArgs>(args: SelectSubset<T, AuditLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one AuditLog.
     * @param {AuditLogUpsertArgs} args - Arguments to update or create a AuditLog.
     * @example
     * // Update or create a AuditLog
     * const auditLog = await prisma.auditLog.upsert({
     *   create: {
     *     // ... data to create a AuditLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AuditLog we want to update
     *   }
     * })
     */
    upsert<T extends AuditLogUpsertArgs>(args: SelectSubset<T, AuditLogUpsertArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of AuditLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogCountArgs} args - Arguments to filter AuditLogs to count.
     * @example
     * // Count the number of AuditLogs
     * const count = await prisma.auditLog.count({
     *   where: {
     *     // ... the filter for the AuditLogs we want to count
     *   }
     * })
    **/
    count<T extends AuditLogCountArgs>(
      args?: Subset<T, AuditLogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AuditLogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AuditLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends AuditLogAggregateArgs>(args: Subset<T, AuditLogAggregateArgs>): Prisma.PrismaPromise<GetAuditLogAggregateType<T>>

    /**
     * Group by AuditLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogGroupByArgs} args - Group by arguments.
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
      T extends AuditLogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AuditLogGroupByArgs['orderBy'] }
        : { orderBy?: AuditLogGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, AuditLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAuditLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AuditLog model
   */
  readonly fields: AuditLogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AuditLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AuditLogClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the AuditLog model
   */ 
  interface AuditLogFieldRefs {
    readonly id: FieldRef<"AuditLog", 'String'>
    readonly entityType: FieldRef<"AuditLog", 'AuditEntityType'>
    readonly entityId: FieldRef<"AuditLog", 'String'>
    readonly action: FieldRef<"AuditLog", 'String'>
    readonly actorId: FieldRef<"AuditLog", 'String'>
    readonly actorType: FieldRef<"AuditLog", 'ActorType'>
    readonly metadata: FieldRef<"AuditLog", 'Json'>
    readonly createdAt: FieldRef<"AuditLog", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AuditLog findUnique
   */
  export type AuditLogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Filter, which AuditLog to fetch.
     */
    where: AuditLogWhereUniqueInput
  }

  /**
   * AuditLog findUniqueOrThrow
   */
  export type AuditLogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Filter, which AuditLog to fetch.
     */
    where: AuditLogWhereUniqueInput
  }

  /**
   * AuditLog findFirst
   */
  export type AuditLogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Filter, which AuditLog to fetch.
     */
    where?: AuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AuditLogs.
     */
    cursor?: AuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AuditLogs.
     */
    distinct?: AuditLogScalarFieldEnum | AuditLogScalarFieldEnum[]
  }

  /**
   * AuditLog findFirstOrThrow
   */
  export type AuditLogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Filter, which AuditLog to fetch.
     */
    where?: AuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AuditLogs.
     */
    cursor?: AuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AuditLogs.
     */
    distinct?: AuditLogScalarFieldEnum | AuditLogScalarFieldEnum[]
  }

  /**
   * AuditLog findMany
   */
  export type AuditLogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Filter, which AuditLogs to fetch.
     */
    where?: AuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AuditLogs.
     */
    cursor?: AuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditLogs.
     */
    skip?: number
    distinct?: AuditLogScalarFieldEnum | AuditLogScalarFieldEnum[]
  }

  /**
   * AuditLog create
   */
  export type AuditLogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * The data needed to create a AuditLog.
     */
    data: XOR<AuditLogCreateInput, AuditLogUncheckedCreateInput>
  }

  /**
   * AuditLog createMany
   */
  export type AuditLogCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AuditLogs.
     */
    data: AuditLogCreateManyInput | AuditLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AuditLog createManyAndReturn
   */
  export type AuditLogCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many AuditLogs.
     */
    data: AuditLogCreateManyInput | AuditLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AuditLog update
   */
  export type AuditLogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * The data needed to update a AuditLog.
     */
    data: XOR<AuditLogUpdateInput, AuditLogUncheckedUpdateInput>
    /**
     * Choose, which AuditLog to update.
     */
    where: AuditLogWhereUniqueInput
  }

  /**
   * AuditLog updateMany
   */
  export type AuditLogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AuditLogs.
     */
    data: XOR<AuditLogUpdateManyMutationInput, AuditLogUncheckedUpdateManyInput>
    /**
     * Filter which AuditLogs to update
     */
    where?: AuditLogWhereInput
  }

  /**
   * AuditLog upsert
   */
  export type AuditLogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * The filter to search for the AuditLog to update in case it exists.
     */
    where: AuditLogWhereUniqueInput
    /**
     * In case the AuditLog found by the `where` argument doesn't exist, create a new AuditLog with this data.
     */
    create: XOR<AuditLogCreateInput, AuditLogUncheckedCreateInput>
    /**
     * In case the AuditLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AuditLogUpdateInput, AuditLogUncheckedUpdateInput>
  }

  /**
   * AuditLog delete
   */
  export type AuditLogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Filter which AuditLog to delete.
     */
    where: AuditLogWhereUniqueInput
  }

  /**
   * AuditLog deleteMany
   */
  export type AuditLogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AuditLogs to delete
     */
    where?: AuditLogWhereInput
  }

  /**
   * AuditLog without action
   */
  export type AuditLogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
  }


  /**
   * Model WebhookEvent
   */

  export type AggregateWebhookEvent = {
    _count: WebhookEventCountAggregateOutputType | null
    _min: WebhookEventMinAggregateOutputType | null
    _max: WebhookEventMaxAggregateOutputType | null
  }

  export type WebhookEventMinAggregateOutputType = {
    id: string | null
    provider: string | null
    eventId: string | null
    eventType: string | null
    receivedAt: Date | null
    processedAt: Date | null
  }

  export type WebhookEventMaxAggregateOutputType = {
    id: string | null
    provider: string | null
    eventId: string | null
    eventType: string | null
    receivedAt: Date | null
    processedAt: Date | null
  }

  export type WebhookEventCountAggregateOutputType = {
    id: number
    provider: number
    eventId: number
    eventType: number
    payload: number
    receivedAt: number
    processedAt: number
    _all: number
  }


  export type WebhookEventMinAggregateInputType = {
    id?: true
    provider?: true
    eventId?: true
    eventType?: true
    receivedAt?: true
    processedAt?: true
  }

  export type WebhookEventMaxAggregateInputType = {
    id?: true
    provider?: true
    eventId?: true
    eventType?: true
    receivedAt?: true
    processedAt?: true
  }

  export type WebhookEventCountAggregateInputType = {
    id?: true
    provider?: true
    eventId?: true
    eventType?: true
    payload?: true
    receivedAt?: true
    processedAt?: true
    _all?: true
  }

  export type WebhookEventAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WebhookEvent to aggregate.
     */
    where?: WebhookEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WebhookEvents to fetch.
     */
    orderBy?: WebhookEventOrderByWithRelationInput | WebhookEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: WebhookEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WebhookEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WebhookEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned WebhookEvents
    **/
    _count?: true | WebhookEventCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: WebhookEventMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: WebhookEventMaxAggregateInputType
  }

  export type GetWebhookEventAggregateType<T extends WebhookEventAggregateArgs> = {
        [P in keyof T & keyof AggregateWebhookEvent]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateWebhookEvent[P]>
      : GetScalarType<T[P], AggregateWebhookEvent[P]>
  }




  export type WebhookEventGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WebhookEventWhereInput
    orderBy?: WebhookEventOrderByWithAggregationInput | WebhookEventOrderByWithAggregationInput[]
    by: WebhookEventScalarFieldEnum[] | WebhookEventScalarFieldEnum
    having?: WebhookEventScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: WebhookEventCountAggregateInputType | true
    _min?: WebhookEventMinAggregateInputType
    _max?: WebhookEventMaxAggregateInputType
  }

  export type WebhookEventGroupByOutputType = {
    id: string
    provider: string
    eventId: string
    eventType: string
    payload: JsonValue
    receivedAt: Date
    processedAt: Date | null
    _count: WebhookEventCountAggregateOutputType | null
    _min: WebhookEventMinAggregateOutputType | null
    _max: WebhookEventMaxAggregateOutputType | null
  }

  type GetWebhookEventGroupByPayload<T extends WebhookEventGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<WebhookEventGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof WebhookEventGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], WebhookEventGroupByOutputType[P]>
            : GetScalarType<T[P], WebhookEventGroupByOutputType[P]>
        }
      >
    >


  export type WebhookEventSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    provider?: boolean
    eventId?: boolean
    eventType?: boolean
    payload?: boolean
    receivedAt?: boolean
    processedAt?: boolean
  }, ExtArgs["result"]["webhookEvent"]>

  export type WebhookEventSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    provider?: boolean
    eventId?: boolean
    eventType?: boolean
    payload?: boolean
    receivedAt?: boolean
    processedAt?: boolean
  }, ExtArgs["result"]["webhookEvent"]>

  export type WebhookEventSelectScalar = {
    id?: boolean
    provider?: boolean
    eventId?: boolean
    eventType?: boolean
    payload?: boolean
    receivedAt?: boolean
    processedAt?: boolean
  }


  export type $WebhookEventPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "WebhookEvent"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      provider: string
      eventId: string
      eventType: string
      payload: Prisma.JsonValue
      receivedAt: Date
      processedAt: Date | null
    }, ExtArgs["result"]["webhookEvent"]>
    composites: {}
  }

  type WebhookEventGetPayload<S extends boolean | null | undefined | WebhookEventDefaultArgs> = $Result.GetResult<Prisma.$WebhookEventPayload, S>

  type WebhookEventCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<WebhookEventFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: WebhookEventCountAggregateInputType | true
    }

  export interface WebhookEventDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['WebhookEvent'], meta: { name: 'WebhookEvent' } }
    /**
     * Find zero or one WebhookEvent that matches the filter.
     * @param {WebhookEventFindUniqueArgs} args - Arguments to find a WebhookEvent
     * @example
     * // Get one WebhookEvent
     * const webhookEvent = await prisma.webhookEvent.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends WebhookEventFindUniqueArgs>(args: SelectSubset<T, WebhookEventFindUniqueArgs<ExtArgs>>): Prisma__WebhookEventClient<$Result.GetResult<Prisma.$WebhookEventPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one WebhookEvent that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {WebhookEventFindUniqueOrThrowArgs} args - Arguments to find a WebhookEvent
     * @example
     * // Get one WebhookEvent
     * const webhookEvent = await prisma.webhookEvent.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends WebhookEventFindUniqueOrThrowArgs>(args: SelectSubset<T, WebhookEventFindUniqueOrThrowArgs<ExtArgs>>): Prisma__WebhookEventClient<$Result.GetResult<Prisma.$WebhookEventPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first WebhookEvent that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WebhookEventFindFirstArgs} args - Arguments to find a WebhookEvent
     * @example
     * // Get one WebhookEvent
     * const webhookEvent = await prisma.webhookEvent.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends WebhookEventFindFirstArgs>(args?: SelectSubset<T, WebhookEventFindFirstArgs<ExtArgs>>): Prisma__WebhookEventClient<$Result.GetResult<Prisma.$WebhookEventPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first WebhookEvent that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WebhookEventFindFirstOrThrowArgs} args - Arguments to find a WebhookEvent
     * @example
     * // Get one WebhookEvent
     * const webhookEvent = await prisma.webhookEvent.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends WebhookEventFindFirstOrThrowArgs>(args?: SelectSubset<T, WebhookEventFindFirstOrThrowArgs<ExtArgs>>): Prisma__WebhookEventClient<$Result.GetResult<Prisma.$WebhookEventPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more WebhookEvents that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WebhookEventFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all WebhookEvents
     * const webhookEvents = await prisma.webhookEvent.findMany()
     * 
     * // Get first 10 WebhookEvents
     * const webhookEvents = await prisma.webhookEvent.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const webhookEventWithIdOnly = await prisma.webhookEvent.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends WebhookEventFindManyArgs>(args?: SelectSubset<T, WebhookEventFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WebhookEventPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a WebhookEvent.
     * @param {WebhookEventCreateArgs} args - Arguments to create a WebhookEvent.
     * @example
     * // Create one WebhookEvent
     * const WebhookEvent = await prisma.webhookEvent.create({
     *   data: {
     *     // ... data to create a WebhookEvent
     *   }
     * })
     * 
     */
    create<T extends WebhookEventCreateArgs>(args: SelectSubset<T, WebhookEventCreateArgs<ExtArgs>>): Prisma__WebhookEventClient<$Result.GetResult<Prisma.$WebhookEventPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many WebhookEvents.
     * @param {WebhookEventCreateManyArgs} args - Arguments to create many WebhookEvents.
     * @example
     * // Create many WebhookEvents
     * const webhookEvent = await prisma.webhookEvent.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends WebhookEventCreateManyArgs>(args?: SelectSubset<T, WebhookEventCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many WebhookEvents and returns the data saved in the database.
     * @param {WebhookEventCreateManyAndReturnArgs} args - Arguments to create many WebhookEvents.
     * @example
     * // Create many WebhookEvents
     * const webhookEvent = await prisma.webhookEvent.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many WebhookEvents and only return the `id`
     * const webhookEventWithIdOnly = await prisma.webhookEvent.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends WebhookEventCreateManyAndReturnArgs>(args?: SelectSubset<T, WebhookEventCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WebhookEventPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a WebhookEvent.
     * @param {WebhookEventDeleteArgs} args - Arguments to delete one WebhookEvent.
     * @example
     * // Delete one WebhookEvent
     * const WebhookEvent = await prisma.webhookEvent.delete({
     *   where: {
     *     // ... filter to delete one WebhookEvent
     *   }
     * })
     * 
     */
    delete<T extends WebhookEventDeleteArgs>(args: SelectSubset<T, WebhookEventDeleteArgs<ExtArgs>>): Prisma__WebhookEventClient<$Result.GetResult<Prisma.$WebhookEventPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one WebhookEvent.
     * @param {WebhookEventUpdateArgs} args - Arguments to update one WebhookEvent.
     * @example
     * // Update one WebhookEvent
     * const webhookEvent = await prisma.webhookEvent.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends WebhookEventUpdateArgs>(args: SelectSubset<T, WebhookEventUpdateArgs<ExtArgs>>): Prisma__WebhookEventClient<$Result.GetResult<Prisma.$WebhookEventPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more WebhookEvents.
     * @param {WebhookEventDeleteManyArgs} args - Arguments to filter WebhookEvents to delete.
     * @example
     * // Delete a few WebhookEvents
     * const { count } = await prisma.webhookEvent.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends WebhookEventDeleteManyArgs>(args?: SelectSubset<T, WebhookEventDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WebhookEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WebhookEventUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many WebhookEvents
     * const webhookEvent = await prisma.webhookEvent.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends WebhookEventUpdateManyArgs>(args: SelectSubset<T, WebhookEventUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one WebhookEvent.
     * @param {WebhookEventUpsertArgs} args - Arguments to update or create a WebhookEvent.
     * @example
     * // Update or create a WebhookEvent
     * const webhookEvent = await prisma.webhookEvent.upsert({
     *   create: {
     *     // ... data to create a WebhookEvent
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the WebhookEvent we want to update
     *   }
     * })
     */
    upsert<T extends WebhookEventUpsertArgs>(args: SelectSubset<T, WebhookEventUpsertArgs<ExtArgs>>): Prisma__WebhookEventClient<$Result.GetResult<Prisma.$WebhookEventPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of WebhookEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WebhookEventCountArgs} args - Arguments to filter WebhookEvents to count.
     * @example
     * // Count the number of WebhookEvents
     * const count = await prisma.webhookEvent.count({
     *   where: {
     *     // ... the filter for the WebhookEvents we want to count
     *   }
     * })
    **/
    count<T extends WebhookEventCountArgs>(
      args?: Subset<T, WebhookEventCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], WebhookEventCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a WebhookEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WebhookEventAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends WebhookEventAggregateArgs>(args: Subset<T, WebhookEventAggregateArgs>): Prisma.PrismaPromise<GetWebhookEventAggregateType<T>>

    /**
     * Group by WebhookEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WebhookEventGroupByArgs} args - Group by arguments.
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
      T extends WebhookEventGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: WebhookEventGroupByArgs['orderBy'] }
        : { orderBy?: WebhookEventGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, WebhookEventGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetWebhookEventGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the WebhookEvent model
   */
  readonly fields: WebhookEventFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for WebhookEvent.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__WebhookEventClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the WebhookEvent model
   */ 
  interface WebhookEventFieldRefs {
    readonly id: FieldRef<"WebhookEvent", 'String'>
    readonly provider: FieldRef<"WebhookEvent", 'String'>
    readonly eventId: FieldRef<"WebhookEvent", 'String'>
    readonly eventType: FieldRef<"WebhookEvent", 'String'>
    readonly payload: FieldRef<"WebhookEvent", 'Json'>
    readonly receivedAt: FieldRef<"WebhookEvent", 'DateTime'>
    readonly processedAt: FieldRef<"WebhookEvent", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * WebhookEvent findUnique
   */
  export type WebhookEventFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WebhookEvent
     */
    select?: WebhookEventSelect<ExtArgs> | null
    /**
     * Filter, which WebhookEvent to fetch.
     */
    where: WebhookEventWhereUniqueInput
  }

  /**
   * WebhookEvent findUniqueOrThrow
   */
  export type WebhookEventFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WebhookEvent
     */
    select?: WebhookEventSelect<ExtArgs> | null
    /**
     * Filter, which WebhookEvent to fetch.
     */
    where: WebhookEventWhereUniqueInput
  }

  /**
   * WebhookEvent findFirst
   */
  export type WebhookEventFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WebhookEvent
     */
    select?: WebhookEventSelect<ExtArgs> | null
    /**
     * Filter, which WebhookEvent to fetch.
     */
    where?: WebhookEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WebhookEvents to fetch.
     */
    orderBy?: WebhookEventOrderByWithRelationInput | WebhookEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WebhookEvents.
     */
    cursor?: WebhookEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WebhookEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WebhookEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WebhookEvents.
     */
    distinct?: WebhookEventScalarFieldEnum | WebhookEventScalarFieldEnum[]
  }

  /**
   * WebhookEvent findFirstOrThrow
   */
  export type WebhookEventFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WebhookEvent
     */
    select?: WebhookEventSelect<ExtArgs> | null
    /**
     * Filter, which WebhookEvent to fetch.
     */
    where?: WebhookEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WebhookEvents to fetch.
     */
    orderBy?: WebhookEventOrderByWithRelationInput | WebhookEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WebhookEvents.
     */
    cursor?: WebhookEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WebhookEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WebhookEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WebhookEvents.
     */
    distinct?: WebhookEventScalarFieldEnum | WebhookEventScalarFieldEnum[]
  }

  /**
   * WebhookEvent findMany
   */
  export type WebhookEventFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WebhookEvent
     */
    select?: WebhookEventSelect<ExtArgs> | null
    /**
     * Filter, which WebhookEvents to fetch.
     */
    where?: WebhookEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WebhookEvents to fetch.
     */
    orderBy?: WebhookEventOrderByWithRelationInput | WebhookEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing WebhookEvents.
     */
    cursor?: WebhookEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WebhookEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WebhookEvents.
     */
    skip?: number
    distinct?: WebhookEventScalarFieldEnum | WebhookEventScalarFieldEnum[]
  }

  /**
   * WebhookEvent create
   */
  export type WebhookEventCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WebhookEvent
     */
    select?: WebhookEventSelect<ExtArgs> | null
    /**
     * The data needed to create a WebhookEvent.
     */
    data: XOR<WebhookEventCreateInput, WebhookEventUncheckedCreateInput>
  }

  /**
   * WebhookEvent createMany
   */
  export type WebhookEventCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many WebhookEvents.
     */
    data: WebhookEventCreateManyInput | WebhookEventCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * WebhookEvent createManyAndReturn
   */
  export type WebhookEventCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WebhookEvent
     */
    select?: WebhookEventSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many WebhookEvents.
     */
    data: WebhookEventCreateManyInput | WebhookEventCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * WebhookEvent update
   */
  export type WebhookEventUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WebhookEvent
     */
    select?: WebhookEventSelect<ExtArgs> | null
    /**
     * The data needed to update a WebhookEvent.
     */
    data: XOR<WebhookEventUpdateInput, WebhookEventUncheckedUpdateInput>
    /**
     * Choose, which WebhookEvent to update.
     */
    where: WebhookEventWhereUniqueInput
  }

  /**
   * WebhookEvent updateMany
   */
  export type WebhookEventUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update WebhookEvents.
     */
    data: XOR<WebhookEventUpdateManyMutationInput, WebhookEventUncheckedUpdateManyInput>
    /**
     * Filter which WebhookEvents to update
     */
    where?: WebhookEventWhereInput
  }

  /**
   * WebhookEvent upsert
   */
  export type WebhookEventUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WebhookEvent
     */
    select?: WebhookEventSelect<ExtArgs> | null
    /**
     * The filter to search for the WebhookEvent to update in case it exists.
     */
    where: WebhookEventWhereUniqueInput
    /**
     * In case the WebhookEvent found by the `where` argument doesn't exist, create a new WebhookEvent with this data.
     */
    create: XOR<WebhookEventCreateInput, WebhookEventUncheckedCreateInput>
    /**
     * In case the WebhookEvent was found with the provided `where` argument, update it with this data.
     */
    update: XOR<WebhookEventUpdateInput, WebhookEventUncheckedUpdateInput>
  }

  /**
   * WebhookEvent delete
   */
  export type WebhookEventDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WebhookEvent
     */
    select?: WebhookEventSelect<ExtArgs> | null
    /**
     * Filter which WebhookEvent to delete.
     */
    where: WebhookEventWhereUniqueInput
  }

  /**
   * WebhookEvent deleteMany
   */
  export type WebhookEventDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WebhookEvents to delete
     */
    where?: WebhookEventWhereInput
  }

  /**
   * WebhookEvent without action
   */
  export type WebhookEventDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WebhookEvent
     */
    select?: WebhookEventSelect<ExtArgs> | null
  }


  /**
   * Model OutboxEvent
   */

  export type AggregateOutboxEvent = {
    _count: OutboxEventCountAggregateOutputType | null
    _avg: OutboxEventAvgAggregateOutputType | null
    _sum: OutboxEventSumAggregateOutputType | null
    _min: OutboxEventMinAggregateOutputType | null
    _max: OutboxEventMaxAggregateOutputType | null
  }

  export type OutboxEventAvgAggregateOutputType = {
    attempts: number | null
  }

  export type OutboxEventSumAggregateOutputType = {
    attempts: number | null
  }

  export type OutboxEventMinAggregateOutputType = {
    id: string | null
    aggregate: string | null
    aggregateId: string | null
    eventType: string | null
    queue: string | null
    status: $Enums.OutboxStatus | null
    attempts: number | null
    lastError: string | null
    createdAt: Date | null
    publishedAt: Date | null
    lockedAt: Date | null
    lockedBy: string | null
  }

  export type OutboxEventMaxAggregateOutputType = {
    id: string | null
    aggregate: string | null
    aggregateId: string | null
    eventType: string | null
    queue: string | null
    status: $Enums.OutboxStatus | null
    attempts: number | null
    lastError: string | null
    createdAt: Date | null
    publishedAt: Date | null
    lockedAt: Date | null
    lockedBy: string | null
  }

  export type OutboxEventCountAggregateOutputType = {
    id: number
    aggregate: number
    aggregateId: number
    eventType: number
    queue: number
    payload: number
    status: number
    attempts: number
    lastError: number
    createdAt: number
    publishedAt: number
    lockedAt: number
    lockedBy: number
    _all: number
  }


  export type OutboxEventAvgAggregateInputType = {
    attempts?: true
  }

  export type OutboxEventSumAggregateInputType = {
    attempts?: true
  }

  export type OutboxEventMinAggregateInputType = {
    id?: true
    aggregate?: true
    aggregateId?: true
    eventType?: true
    queue?: true
    status?: true
    attempts?: true
    lastError?: true
    createdAt?: true
    publishedAt?: true
    lockedAt?: true
    lockedBy?: true
  }

  export type OutboxEventMaxAggregateInputType = {
    id?: true
    aggregate?: true
    aggregateId?: true
    eventType?: true
    queue?: true
    status?: true
    attempts?: true
    lastError?: true
    createdAt?: true
    publishedAt?: true
    lockedAt?: true
    lockedBy?: true
  }

  export type OutboxEventCountAggregateInputType = {
    id?: true
    aggregate?: true
    aggregateId?: true
    eventType?: true
    queue?: true
    payload?: true
    status?: true
    attempts?: true
    lastError?: true
    createdAt?: true
    publishedAt?: true
    lockedAt?: true
    lockedBy?: true
    _all?: true
  }

  export type OutboxEventAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OutboxEvent to aggregate.
     */
    where?: OutboxEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OutboxEvents to fetch.
     */
    orderBy?: OutboxEventOrderByWithRelationInput | OutboxEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OutboxEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OutboxEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OutboxEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned OutboxEvents
    **/
    _count?: true | OutboxEventCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: OutboxEventAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: OutboxEventSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OutboxEventMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OutboxEventMaxAggregateInputType
  }

  export type GetOutboxEventAggregateType<T extends OutboxEventAggregateArgs> = {
        [P in keyof T & keyof AggregateOutboxEvent]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOutboxEvent[P]>
      : GetScalarType<T[P], AggregateOutboxEvent[P]>
  }




  export type OutboxEventGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OutboxEventWhereInput
    orderBy?: OutboxEventOrderByWithAggregationInput | OutboxEventOrderByWithAggregationInput[]
    by: OutboxEventScalarFieldEnum[] | OutboxEventScalarFieldEnum
    having?: OutboxEventScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OutboxEventCountAggregateInputType | true
    _avg?: OutboxEventAvgAggregateInputType
    _sum?: OutboxEventSumAggregateInputType
    _min?: OutboxEventMinAggregateInputType
    _max?: OutboxEventMaxAggregateInputType
  }

  export type OutboxEventGroupByOutputType = {
    id: string
    aggregate: string
    aggregateId: string
    eventType: string
    queue: string
    payload: JsonValue
    status: $Enums.OutboxStatus
    attempts: number
    lastError: string | null
    createdAt: Date
    publishedAt: Date | null
    lockedAt: Date | null
    lockedBy: string | null
    _count: OutboxEventCountAggregateOutputType | null
    _avg: OutboxEventAvgAggregateOutputType | null
    _sum: OutboxEventSumAggregateOutputType | null
    _min: OutboxEventMinAggregateOutputType | null
    _max: OutboxEventMaxAggregateOutputType | null
  }

  type GetOutboxEventGroupByPayload<T extends OutboxEventGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OutboxEventGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OutboxEventGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OutboxEventGroupByOutputType[P]>
            : GetScalarType<T[P], OutboxEventGroupByOutputType[P]>
        }
      >
    >


  export type OutboxEventSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    aggregate?: boolean
    aggregateId?: boolean
    eventType?: boolean
    queue?: boolean
    payload?: boolean
    status?: boolean
    attempts?: boolean
    lastError?: boolean
    createdAt?: boolean
    publishedAt?: boolean
    lockedAt?: boolean
    lockedBy?: boolean
  }, ExtArgs["result"]["outboxEvent"]>

  export type OutboxEventSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    aggregate?: boolean
    aggregateId?: boolean
    eventType?: boolean
    queue?: boolean
    payload?: boolean
    status?: boolean
    attempts?: boolean
    lastError?: boolean
    createdAt?: boolean
    publishedAt?: boolean
    lockedAt?: boolean
    lockedBy?: boolean
  }, ExtArgs["result"]["outboxEvent"]>

  export type OutboxEventSelectScalar = {
    id?: boolean
    aggregate?: boolean
    aggregateId?: boolean
    eventType?: boolean
    queue?: boolean
    payload?: boolean
    status?: boolean
    attempts?: boolean
    lastError?: boolean
    createdAt?: boolean
    publishedAt?: boolean
    lockedAt?: boolean
    lockedBy?: boolean
  }


  export type $OutboxEventPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "OutboxEvent"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      aggregate: string
      aggregateId: string
      eventType: string
      queue: string
      payload: Prisma.JsonValue
      status: $Enums.OutboxStatus
      attempts: number
      lastError: string | null
      createdAt: Date
      publishedAt: Date | null
      lockedAt: Date | null
      lockedBy: string | null
    }, ExtArgs["result"]["outboxEvent"]>
    composites: {}
  }

  type OutboxEventGetPayload<S extends boolean | null | undefined | OutboxEventDefaultArgs> = $Result.GetResult<Prisma.$OutboxEventPayload, S>

  type OutboxEventCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<OutboxEventFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: OutboxEventCountAggregateInputType | true
    }

  export interface OutboxEventDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['OutboxEvent'], meta: { name: 'OutboxEvent' } }
    /**
     * Find zero or one OutboxEvent that matches the filter.
     * @param {OutboxEventFindUniqueArgs} args - Arguments to find a OutboxEvent
     * @example
     * // Get one OutboxEvent
     * const outboxEvent = await prisma.outboxEvent.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OutboxEventFindUniqueArgs>(args: SelectSubset<T, OutboxEventFindUniqueArgs<ExtArgs>>): Prisma__OutboxEventClient<$Result.GetResult<Prisma.$OutboxEventPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one OutboxEvent that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {OutboxEventFindUniqueOrThrowArgs} args - Arguments to find a OutboxEvent
     * @example
     * // Get one OutboxEvent
     * const outboxEvent = await prisma.outboxEvent.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OutboxEventFindUniqueOrThrowArgs>(args: SelectSubset<T, OutboxEventFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OutboxEventClient<$Result.GetResult<Prisma.$OutboxEventPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first OutboxEvent that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutboxEventFindFirstArgs} args - Arguments to find a OutboxEvent
     * @example
     * // Get one OutboxEvent
     * const outboxEvent = await prisma.outboxEvent.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OutboxEventFindFirstArgs>(args?: SelectSubset<T, OutboxEventFindFirstArgs<ExtArgs>>): Prisma__OutboxEventClient<$Result.GetResult<Prisma.$OutboxEventPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first OutboxEvent that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutboxEventFindFirstOrThrowArgs} args - Arguments to find a OutboxEvent
     * @example
     * // Get one OutboxEvent
     * const outboxEvent = await prisma.outboxEvent.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OutboxEventFindFirstOrThrowArgs>(args?: SelectSubset<T, OutboxEventFindFirstOrThrowArgs<ExtArgs>>): Prisma__OutboxEventClient<$Result.GetResult<Prisma.$OutboxEventPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more OutboxEvents that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutboxEventFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all OutboxEvents
     * const outboxEvents = await prisma.outboxEvent.findMany()
     * 
     * // Get first 10 OutboxEvents
     * const outboxEvents = await prisma.outboxEvent.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const outboxEventWithIdOnly = await prisma.outboxEvent.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OutboxEventFindManyArgs>(args?: SelectSubset<T, OutboxEventFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OutboxEventPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a OutboxEvent.
     * @param {OutboxEventCreateArgs} args - Arguments to create a OutboxEvent.
     * @example
     * // Create one OutboxEvent
     * const OutboxEvent = await prisma.outboxEvent.create({
     *   data: {
     *     // ... data to create a OutboxEvent
     *   }
     * })
     * 
     */
    create<T extends OutboxEventCreateArgs>(args: SelectSubset<T, OutboxEventCreateArgs<ExtArgs>>): Prisma__OutboxEventClient<$Result.GetResult<Prisma.$OutboxEventPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many OutboxEvents.
     * @param {OutboxEventCreateManyArgs} args - Arguments to create many OutboxEvents.
     * @example
     * // Create many OutboxEvents
     * const outboxEvent = await prisma.outboxEvent.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OutboxEventCreateManyArgs>(args?: SelectSubset<T, OutboxEventCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many OutboxEvents and returns the data saved in the database.
     * @param {OutboxEventCreateManyAndReturnArgs} args - Arguments to create many OutboxEvents.
     * @example
     * // Create many OutboxEvents
     * const outboxEvent = await prisma.outboxEvent.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many OutboxEvents and only return the `id`
     * const outboxEventWithIdOnly = await prisma.outboxEvent.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OutboxEventCreateManyAndReturnArgs>(args?: SelectSubset<T, OutboxEventCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OutboxEventPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a OutboxEvent.
     * @param {OutboxEventDeleteArgs} args - Arguments to delete one OutboxEvent.
     * @example
     * // Delete one OutboxEvent
     * const OutboxEvent = await prisma.outboxEvent.delete({
     *   where: {
     *     // ... filter to delete one OutboxEvent
     *   }
     * })
     * 
     */
    delete<T extends OutboxEventDeleteArgs>(args: SelectSubset<T, OutboxEventDeleteArgs<ExtArgs>>): Prisma__OutboxEventClient<$Result.GetResult<Prisma.$OutboxEventPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one OutboxEvent.
     * @param {OutboxEventUpdateArgs} args - Arguments to update one OutboxEvent.
     * @example
     * // Update one OutboxEvent
     * const outboxEvent = await prisma.outboxEvent.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OutboxEventUpdateArgs>(args: SelectSubset<T, OutboxEventUpdateArgs<ExtArgs>>): Prisma__OutboxEventClient<$Result.GetResult<Prisma.$OutboxEventPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more OutboxEvents.
     * @param {OutboxEventDeleteManyArgs} args - Arguments to filter OutboxEvents to delete.
     * @example
     * // Delete a few OutboxEvents
     * const { count } = await prisma.outboxEvent.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OutboxEventDeleteManyArgs>(args?: SelectSubset<T, OutboxEventDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OutboxEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutboxEventUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many OutboxEvents
     * const outboxEvent = await prisma.outboxEvent.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OutboxEventUpdateManyArgs>(args: SelectSubset<T, OutboxEventUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one OutboxEvent.
     * @param {OutboxEventUpsertArgs} args - Arguments to update or create a OutboxEvent.
     * @example
     * // Update or create a OutboxEvent
     * const outboxEvent = await prisma.outboxEvent.upsert({
     *   create: {
     *     // ... data to create a OutboxEvent
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the OutboxEvent we want to update
     *   }
     * })
     */
    upsert<T extends OutboxEventUpsertArgs>(args: SelectSubset<T, OutboxEventUpsertArgs<ExtArgs>>): Prisma__OutboxEventClient<$Result.GetResult<Prisma.$OutboxEventPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of OutboxEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutboxEventCountArgs} args - Arguments to filter OutboxEvents to count.
     * @example
     * // Count the number of OutboxEvents
     * const count = await prisma.outboxEvent.count({
     *   where: {
     *     // ... the filter for the OutboxEvents we want to count
     *   }
     * })
    **/
    count<T extends OutboxEventCountArgs>(
      args?: Subset<T, OutboxEventCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OutboxEventCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a OutboxEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutboxEventAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends OutboxEventAggregateArgs>(args: Subset<T, OutboxEventAggregateArgs>): Prisma.PrismaPromise<GetOutboxEventAggregateType<T>>

    /**
     * Group by OutboxEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutboxEventGroupByArgs} args - Group by arguments.
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
      T extends OutboxEventGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OutboxEventGroupByArgs['orderBy'] }
        : { orderBy?: OutboxEventGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, OutboxEventGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOutboxEventGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the OutboxEvent model
   */
  readonly fields: OutboxEventFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for OutboxEvent.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OutboxEventClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the OutboxEvent model
   */ 
  interface OutboxEventFieldRefs {
    readonly id: FieldRef<"OutboxEvent", 'String'>
    readonly aggregate: FieldRef<"OutboxEvent", 'String'>
    readonly aggregateId: FieldRef<"OutboxEvent", 'String'>
    readonly eventType: FieldRef<"OutboxEvent", 'String'>
    readonly queue: FieldRef<"OutboxEvent", 'String'>
    readonly payload: FieldRef<"OutboxEvent", 'Json'>
    readonly status: FieldRef<"OutboxEvent", 'OutboxStatus'>
    readonly attempts: FieldRef<"OutboxEvent", 'Int'>
    readonly lastError: FieldRef<"OutboxEvent", 'String'>
    readonly createdAt: FieldRef<"OutboxEvent", 'DateTime'>
    readonly publishedAt: FieldRef<"OutboxEvent", 'DateTime'>
    readonly lockedAt: FieldRef<"OutboxEvent", 'DateTime'>
    readonly lockedBy: FieldRef<"OutboxEvent", 'String'>
  }
    

  // Custom InputTypes
  /**
   * OutboxEvent findUnique
   */
  export type OutboxEventFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutboxEvent
     */
    select?: OutboxEventSelect<ExtArgs> | null
    /**
     * Filter, which OutboxEvent to fetch.
     */
    where: OutboxEventWhereUniqueInput
  }

  /**
   * OutboxEvent findUniqueOrThrow
   */
  export type OutboxEventFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutboxEvent
     */
    select?: OutboxEventSelect<ExtArgs> | null
    /**
     * Filter, which OutboxEvent to fetch.
     */
    where: OutboxEventWhereUniqueInput
  }

  /**
   * OutboxEvent findFirst
   */
  export type OutboxEventFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutboxEvent
     */
    select?: OutboxEventSelect<ExtArgs> | null
    /**
     * Filter, which OutboxEvent to fetch.
     */
    where?: OutboxEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OutboxEvents to fetch.
     */
    orderBy?: OutboxEventOrderByWithRelationInput | OutboxEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OutboxEvents.
     */
    cursor?: OutboxEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OutboxEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OutboxEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OutboxEvents.
     */
    distinct?: OutboxEventScalarFieldEnum | OutboxEventScalarFieldEnum[]
  }

  /**
   * OutboxEvent findFirstOrThrow
   */
  export type OutboxEventFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutboxEvent
     */
    select?: OutboxEventSelect<ExtArgs> | null
    /**
     * Filter, which OutboxEvent to fetch.
     */
    where?: OutboxEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OutboxEvents to fetch.
     */
    orderBy?: OutboxEventOrderByWithRelationInput | OutboxEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OutboxEvents.
     */
    cursor?: OutboxEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OutboxEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OutboxEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OutboxEvents.
     */
    distinct?: OutboxEventScalarFieldEnum | OutboxEventScalarFieldEnum[]
  }

  /**
   * OutboxEvent findMany
   */
  export type OutboxEventFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutboxEvent
     */
    select?: OutboxEventSelect<ExtArgs> | null
    /**
     * Filter, which OutboxEvents to fetch.
     */
    where?: OutboxEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OutboxEvents to fetch.
     */
    orderBy?: OutboxEventOrderByWithRelationInput | OutboxEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing OutboxEvents.
     */
    cursor?: OutboxEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OutboxEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OutboxEvents.
     */
    skip?: number
    distinct?: OutboxEventScalarFieldEnum | OutboxEventScalarFieldEnum[]
  }

  /**
   * OutboxEvent create
   */
  export type OutboxEventCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutboxEvent
     */
    select?: OutboxEventSelect<ExtArgs> | null
    /**
     * The data needed to create a OutboxEvent.
     */
    data: XOR<OutboxEventCreateInput, OutboxEventUncheckedCreateInput>
  }

  /**
   * OutboxEvent createMany
   */
  export type OutboxEventCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many OutboxEvents.
     */
    data: OutboxEventCreateManyInput | OutboxEventCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OutboxEvent createManyAndReturn
   */
  export type OutboxEventCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutboxEvent
     */
    select?: OutboxEventSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many OutboxEvents.
     */
    data: OutboxEventCreateManyInput | OutboxEventCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OutboxEvent update
   */
  export type OutboxEventUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutboxEvent
     */
    select?: OutboxEventSelect<ExtArgs> | null
    /**
     * The data needed to update a OutboxEvent.
     */
    data: XOR<OutboxEventUpdateInput, OutboxEventUncheckedUpdateInput>
    /**
     * Choose, which OutboxEvent to update.
     */
    where: OutboxEventWhereUniqueInput
  }

  /**
   * OutboxEvent updateMany
   */
  export type OutboxEventUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update OutboxEvents.
     */
    data: XOR<OutboxEventUpdateManyMutationInput, OutboxEventUncheckedUpdateManyInput>
    /**
     * Filter which OutboxEvents to update
     */
    where?: OutboxEventWhereInput
  }

  /**
   * OutboxEvent upsert
   */
  export type OutboxEventUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutboxEvent
     */
    select?: OutboxEventSelect<ExtArgs> | null
    /**
     * The filter to search for the OutboxEvent to update in case it exists.
     */
    where: OutboxEventWhereUniqueInput
    /**
     * In case the OutboxEvent found by the `where` argument doesn't exist, create a new OutboxEvent with this data.
     */
    create: XOR<OutboxEventCreateInput, OutboxEventUncheckedCreateInput>
    /**
     * In case the OutboxEvent was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OutboxEventUpdateInput, OutboxEventUncheckedUpdateInput>
  }

  /**
   * OutboxEvent delete
   */
  export type OutboxEventDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutboxEvent
     */
    select?: OutboxEventSelect<ExtArgs> | null
    /**
     * Filter which OutboxEvent to delete.
     */
    where: OutboxEventWhereUniqueInput
  }

  /**
   * OutboxEvent deleteMany
   */
  export type OutboxEventDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OutboxEvents to delete
     */
    where?: OutboxEventWhereInput
  }

  /**
   * OutboxEvent without action
   */
  export type OutboxEventDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutboxEvent
     */
    select?: OutboxEventSelect<ExtArgs> | null
  }


  /**
   * Model StockReservation
   */

  export type AggregateStockReservation = {
    _count: StockReservationCountAggregateOutputType | null
    _min: StockReservationMinAggregateOutputType | null
    _max: StockReservationMaxAggregateOutputType | null
  }

  export type StockReservationMinAggregateOutputType = {
    id: string | null
    orderId: string | null
    userId: string | null
    status: $Enums.StockReservationStatus | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type StockReservationMaxAggregateOutputType = {
    id: string | null
    orderId: string | null
    userId: string | null
    status: $Enums.StockReservationStatus | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type StockReservationCountAggregateOutputType = {
    id: number
    orderId: number
    userId: number
    items: number
    status: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type StockReservationMinAggregateInputType = {
    id?: true
    orderId?: true
    userId?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type StockReservationMaxAggregateInputType = {
    id?: true
    orderId?: true
    userId?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type StockReservationCountAggregateInputType = {
    id?: true
    orderId?: true
    userId?: true
    items?: true
    status?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type StockReservationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which StockReservation to aggregate.
     */
    where?: StockReservationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of StockReservations to fetch.
     */
    orderBy?: StockReservationOrderByWithRelationInput | StockReservationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: StockReservationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` StockReservations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` StockReservations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned StockReservations
    **/
    _count?: true | StockReservationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: StockReservationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: StockReservationMaxAggregateInputType
  }

  export type GetStockReservationAggregateType<T extends StockReservationAggregateArgs> = {
        [P in keyof T & keyof AggregateStockReservation]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateStockReservation[P]>
      : GetScalarType<T[P], AggregateStockReservation[P]>
  }




  export type StockReservationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: StockReservationWhereInput
    orderBy?: StockReservationOrderByWithAggregationInput | StockReservationOrderByWithAggregationInput[]
    by: StockReservationScalarFieldEnum[] | StockReservationScalarFieldEnum
    having?: StockReservationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: StockReservationCountAggregateInputType | true
    _min?: StockReservationMinAggregateInputType
    _max?: StockReservationMaxAggregateInputType
  }

  export type StockReservationGroupByOutputType = {
    id: string
    orderId: string | null
    userId: string
    items: JsonValue
    status: $Enums.StockReservationStatus
    createdAt: Date
    updatedAt: Date
    _count: StockReservationCountAggregateOutputType | null
    _min: StockReservationMinAggregateOutputType | null
    _max: StockReservationMaxAggregateOutputType | null
  }

  type GetStockReservationGroupByPayload<T extends StockReservationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<StockReservationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof StockReservationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], StockReservationGroupByOutputType[P]>
            : GetScalarType<T[P], StockReservationGroupByOutputType[P]>
        }
      >
    >


  export type StockReservationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    orderId?: boolean
    userId?: boolean
    items?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["stockReservation"]>

  export type StockReservationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    orderId?: boolean
    userId?: boolean
    items?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["stockReservation"]>

  export type StockReservationSelectScalar = {
    id?: boolean
    orderId?: boolean
    userId?: boolean
    items?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }


  export type $StockReservationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "StockReservation"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      orderId: string | null
      userId: string
      items: Prisma.JsonValue
      status: $Enums.StockReservationStatus
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["stockReservation"]>
    composites: {}
  }

  type StockReservationGetPayload<S extends boolean | null | undefined | StockReservationDefaultArgs> = $Result.GetResult<Prisma.$StockReservationPayload, S>

  type StockReservationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<StockReservationFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: StockReservationCountAggregateInputType | true
    }

  export interface StockReservationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['StockReservation'], meta: { name: 'StockReservation' } }
    /**
     * Find zero or one StockReservation that matches the filter.
     * @param {StockReservationFindUniqueArgs} args - Arguments to find a StockReservation
     * @example
     * // Get one StockReservation
     * const stockReservation = await prisma.stockReservation.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends StockReservationFindUniqueArgs>(args: SelectSubset<T, StockReservationFindUniqueArgs<ExtArgs>>): Prisma__StockReservationClient<$Result.GetResult<Prisma.$StockReservationPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one StockReservation that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {StockReservationFindUniqueOrThrowArgs} args - Arguments to find a StockReservation
     * @example
     * // Get one StockReservation
     * const stockReservation = await prisma.stockReservation.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends StockReservationFindUniqueOrThrowArgs>(args: SelectSubset<T, StockReservationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__StockReservationClient<$Result.GetResult<Prisma.$StockReservationPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first StockReservation that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StockReservationFindFirstArgs} args - Arguments to find a StockReservation
     * @example
     * // Get one StockReservation
     * const stockReservation = await prisma.stockReservation.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends StockReservationFindFirstArgs>(args?: SelectSubset<T, StockReservationFindFirstArgs<ExtArgs>>): Prisma__StockReservationClient<$Result.GetResult<Prisma.$StockReservationPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first StockReservation that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StockReservationFindFirstOrThrowArgs} args - Arguments to find a StockReservation
     * @example
     * // Get one StockReservation
     * const stockReservation = await prisma.stockReservation.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends StockReservationFindFirstOrThrowArgs>(args?: SelectSubset<T, StockReservationFindFirstOrThrowArgs<ExtArgs>>): Prisma__StockReservationClient<$Result.GetResult<Prisma.$StockReservationPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more StockReservations that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StockReservationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all StockReservations
     * const stockReservations = await prisma.stockReservation.findMany()
     * 
     * // Get first 10 StockReservations
     * const stockReservations = await prisma.stockReservation.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const stockReservationWithIdOnly = await prisma.stockReservation.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends StockReservationFindManyArgs>(args?: SelectSubset<T, StockReservationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StockReservationPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a StockReservation.
     * @param {StockReservationCreateArgs} args - Arguments to create a StockReservation.
     * @example
     * // Create one StockReservation
     * const StockReservation = await prisma.stockReservation.create({
     *   data: {
     *     // ... data to create a StockReservation
     *   }
     * })
     * 
     */
    create<T extends StockReservationCreateArgs>(args: SelectSubset<T, StockReservationCreateArgs<ExtArgs>>): Prisma__StockReservationClient<$Result.GetResult<Prisma.$StockReservationPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many StockReservations.
     * @param {StockReservationCreateManyArgs} args - Arguments to create many StockReservations.
     * @example
     * // Create many StockReservations
     * const stockReservation = await prisma.stockReservation.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends StockReservationCreateManyArgs>(args?: SelectSubset<T, StockReservationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many StockReservations and returns the data saved in the database.
     * @param {StockReservationCreateManyAndReturnArgs} args - Arguments to create many StockReservations.
     * @example
     * // Create many StockReservations
     * const stockReservation = await prisma.stockReservation.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many StockReservations and only return the `id`
     * const stockReservationWithIdOnly = await prisma.stockReservation.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends StockReservationCreateManyAndReturnArgs>(args?: SelectSubset<T, StockReservationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StockReservationPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a StockReservation.
     * @param {StockReservationDeleteArgs} args - Arguments to delete one StockReservation.
     * @example
     * // Delete one StockReservation
     * const StockReservation = await prisma.stockReservation.delete({
     *   where: {
     *     // ... filter to delete one StockReservation
     *   }
     * })
     * 
     */
    delete<T extends StockReservationDeleteArgs>(args: SelectSubset<T, StockReservationDeleteArgs<ExtArgs>>): Prisma__StockReservationClient<$Result.GetResult<Prisma.$StockReservationPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one StockReservation.
     * @param {StockReservationUpdateArgs} args - Arguments to update one StockReservation.
     * @example
     * // Update one StockReservation
     * const stockReservation = await prisma.stockReservation.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends StockReservationUpdateArgs>(args: SelectSubset<T, StockReservationUpdateArgs<ExtArgs>>): Prisma__StockReservationClient<$Result.GetResult<Prisma.$StockReservationPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more StockReservations.
     * @param {StockReservationDeleteManyArgs} args - Arguments to filter StockReservations to delete.
     * @example
     * // Delete a few StockReservations
     * const { count } = await prisma.stockReservation.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends StockReservationDeleteManyArgs>(args?: SelectSubset<T, StockReservationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more StockReservations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StockReservationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many StockReservations
     * const stockReservation = await prisma.stockReservation.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends StockReservationUpdateManyArgs>(args: SelectSubset<T, StockReservationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one StockReservation.
     * @param {StockReservationUpsertArgs} args - Arguments to update or create a StockReservation.
     * @example
     * // Update or create a StockReservation
     * const stockReservation = await prisma.stockReservation.upsert({
     *   create: {
     *     // ... data to create a StockReservation
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the StockReservation we want to update
     *   }
     * })
     */
    upsert<T extends StockReservationUpsertArgs>(args: SelectSubset<T, StockReservationUpsertArgs<ExtArgs>>): Prisma__StockReservationClient<$Result.GetResult<Prisma.$StockReservationPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of StockReservations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StockReservationCountArgs} args - Arguments to filter StockReservations to count.
     * @example
     * // Count the number of StockReservations
     * const count = await prisma.stockReservation.count({
     *   where: {
     *     // ... the filter for the StockReservations we want to count
     *   }
     * })
    **/
    count<T extends StockReservationCountArgs>(
      args?: Subset<T, StockReservationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], StockReservationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a StockReservation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StockReservationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends StockReservationAggregateArgs>(args: Subset<T, StockReservationAggregateArgs>): Prisma.PrismaPromise<GetStockReservationAggregateType<T>>

    /**
     * Group by StockReservation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StockReservationGroupByArgs} args - Group by arguments.
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
      T extends StockReservationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: StockReservationGroupByArgs['orderBy'] }
        : { orderBy?: StockReservationGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, StockReservationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetStockReservationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the StockReservation model
   */
  readonly fields: StockReservationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for StockReservation.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__StockReservationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the StockReservation model
   */ 
  interface StockReservationFieldRefs {
    readonly id: FieldRef<"StockReservation", 'String'>
    readonly orderId: FieldRef<"StockReservation", 'String'>
    readonly userId: FieldRef<"StockReservation", 'String'>
    readonly items: FieldRef<"StockReservation", 'Json'>
    readonly status: FieldRef<"StockReservation", 'StockReservationStatus'>
    readonly createdAt: FieldRef<"StockReservation", 'DateTime'>
    readonly updatedAt: FieldRef<"StockReservation", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * StockReservation findUnique
   */
  export type StockReservationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StockReservation
     */
    select?: StockReservationSelect<ExtArgs> | null
    /**
     * Filter, which StockReservation to fetch.
     */
    where: StockReservationWhereUniqueInput
  }

  /**
   * StockReservation findUniqueOrThrow
   */
  export type StockReservationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StockReservation
     */
    select?: StockReservationSelect<ExtArgs> | null
    /**
     * Filter, which StockReservation to fetch.
     */
    where: StockReservationWhereUniqueInput
  }

  /**
   * StockReservation findFirst
   */
  export type StockReservationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StockReservation
     */
    select?: StockReservationSelect<ExtArgs> | null
    /**
     * Filter, which StockReservation to fetch.
     */
    where?: StockReservationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of StockReservations to fetch.
     */
    orderBy?: StockReservationOrderByWithRelationInput | StockReservationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for StockReservations.
     */
    cursor?: StockReservationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` StockReservations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` StockReservations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of StockReservations.
     */
    distinct?: StockReservationScalarFieldEnum | StockReservationScalarFieldEnum[]
  }

  /**
   * StockReservation findFirstOrThrow
   */
  export type StockReservationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StockReservation
     */
    select?: StockReservationSelect<ExtArgs> | null
    /**
     * Filter, which StockReservation to fetch.
     */
    where?: StockReservationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of StockReservations to fetch.
     */
    orderBy?: StockReservationOrderByWithRelationInput | StockReservationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for StockReservations.
     */
    cursor?: StockReservationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` StockReservations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` StockReservations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of StockReservations.
     */
    distinct?: StockReservationScalarFieldEnum | StockReservationScalarFieldEnum[]
  }

  /**
   * StockReservation findMany
   */
  export type StockReservationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StockReservation
     */
    select?: StockReservationSelect<ExtArgs> | null
    /**
     * Filter, which StockReservations to fetch.
     */
    where?: StockReservationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of StockReservations to fetch.
     */
    orderBy?: StockReservationOrderByWithRelationInput | StockReservationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing StockReservations.
     */
    cursor?: StockReservationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` StockReservations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` StockReservations.
     */
    skip?: number
    distinct?: StockReservationScalarFieldEnum | StockReservationScalarFieldEnum[]
  }

  /**
   * StockReservation create
   */
  export type StockReservationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StockReservation
     */
    select?: StockReservationSelect<ExtArgs> | null
    /**
     * The data needed to create a StockReservation.
     */
    data: XOR<StockReservationCreateInput, StockReservationUncheckedCreateInput>
  }

  /**
   * StockReservation createMany
   */
  export type StockReservationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many StockReservations.
     */
    data: StockReservationCreateManyInput | StockReservationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * StockReservation createManyAndReturn
   */
  export type StockReservationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StockReservation
     */
    select?: StockReservationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many StockReservations.
     */
    data: StockReservationCreateManyInput | StockReservationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * StockReservation update
   */
  export type StockReservationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StockReservation
     */
    select?: StockReservationSelect<ExtArgs> | null
    /**
     * The data needed to update a StockReservation.
     */
    data: XOR<StockReservationUpdateInput, StockReservationUncheckedUpdateInput>
    /**
     * Choose, which StockReservation to update.
     */
    where: StockReservationWhereUniqueInput
  }

  /**
   * StockReservation updateMany
   */
  export type StockReservationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update StockReservations.
     */
    data: XOR<StockReservationUpdateManyMutationInput, StockReservationUncheckedUpdateManyInput>
    /**
     * Filter which StockReservations to update
     */
    where?: StockReservationWhereInput
  }

  /**
   * StockReservation upsert
   */
  export type StockReservationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StockReservation
     */
    select?: StockReservationSelect<ExtArgs> | null
    /**
     * The filter to search for the StockReservation to update in case it exists.
     */
    where: StockReservationWhereUniqueInput
    /**
     * In case the StockReservation found by the `where` argument doesn't exist, create a new StockReservation with this data.
     */
    create: XOR<StockReservationCreateInput, StockReservationUncheckedCreateInput>
    /**
     * In case the StockReservation was found with the provided `where` argument, update it with this data.
     */
    update: XOR<StockReservationUpdateInput, StockReservationUncheckedUpdateInput>
  }

  /**
   * StockReservation delete
   */
  export type StockReservationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StockReservation
     */
    select?: StockReservationSelect<ExtArgs> | null
    /**
     * Filter which StockReservation to delete.
     */
    where: StockReservationWhereUniqueInput
  }

  /**
   * StockReservation deleteMany
   */
  export type StockReservationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which StockReservations to delete
     */
    where?: StockReservationWhereInput
  }

  /**
   * StockReservation without action
   */
  export type StockReservationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StockReservation
     */
    select?: StockReservationSelect<ExtArgs> | null
  }


  /**
   * Model ProductCoPurchase
   */

  export type AggregateProductCoPurchase = {
    _count: ProductCoPurchaseCountAggregateOutputType | null
    _avg: ProductCoPurchaseAvgAggregateOutputType | null
    _sum: ProductCoPurchaseSumAggregateOutputType | null
    _min: ProductCoPurchaseMinAggregateOutputType | null
    _max: ProductCoPurchaseMaxAggregateOutputType | null
  }

  export type ProductCoPurchaseAvgAggregateOutputType = {
    orderCount: number | null
  }

  export type ProductCoPurchaseSumAggregateOutputType = {
    orderCount: number | null
  }

  export type ProductCoPurchaseMinAggregateOutputType = {
    catalogA: string | null
    catalogB: string | null
    orderCount: number | null
    updatedAt: Date | null
  }

  export type ProductCoPurchaseMaxAggregateOutputType = {
    catalogA: string | null
    catalogB: string | null
    orderCount: number | null
    updatedAt: Date | null
  }

  export type ProductCoPurchaseCountAggregateOutputType = {
    catalogA: number
    catalogB: number
    orderCount: number
    updatedAt: number
    _all: number
  }


  export type ProductCoPurchaseAvgAggregateInputType = {
    orderCount?: true
  }

  export type ProductCoPurchaseSumAggregateInputType = {
    orderCount?: true
  }

  export type ProductCoPurchaseMinAggregateInputType = {
    catalogA?: true
    catalogB?: true
    orderCount?: true
    updatedAt?: true
  }

  export type ProductCoPurchaseMaxAggregateInputType = {
    catalogA?: true
    catalogB?: true
    orderCount?: true
    updatedAt?: true
  }

  export type ProductCoPurchaseCountAggregateInputType = {
    catalogA?: true
    catalogB?: true
    orderCount?: true
    updatedAt?: true
    _all?: true
  }

  export type ProductCoPurchaseAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProductCoPurchase to aggregate.
     */
    where?: ProductCoPurchaseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProductCoPurchases to fetch.
     */
    orderBy?: ProductCoPurchaseOrderByWithRelationInput | ProductCoPurchaseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProductCoPurchaseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProductCoPurchases from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProductCoPurchases.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ProductCoPurchases
    **/
    _count?: true | ProductCoPurchaseCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ProductCoPurchaseAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ProductCoPurchaseSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProductCoPurchaseMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProductCoPurchaseMaxAggregateInputType
  }

  export type GetProductCoPurchaseAggregateType<T extends ProductCoPurchaseAggregateArgs> = {
        [P in keyof T & keyof AggregateProductCoPurchase]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProductCoPurchase[P]>
      : GetScalarType<T[P], AggregateProductCoPurchase[P]>
  }




  export type ProductCoPurchaseGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProductCoPurchaseWhereInput
    orderBy?: ProductCoPurchaseOrderByWithAggregationInput | ProductCoPurchaseOrderByWithAggregationInput[]
    by: ProductCoPurchaseScalarFieldEnum[] | ProductCoPurchaseScalarFieldEnum
    having?: ProductCoPurchaseScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProductCoPurchaseCountAggregateInputType | true
    _avg?: ProductCoPurchaseAvgAggregateInputType
    _sum?: ProductCoPurchaseSumAggregateInputType
    _min?: ProductCoPurchaseMinAggregateInputType
    _max?: ProductCoPurchaseMaxAggregateInputType
  }

  export type ProductCoPurchaseGroupByOutputType = {
    catalogA: string
    catalogB: string
    orderCount: number
    updatedAt: Date
    _count: ProductCoPurchaseCountAggregateOutputType | null
    _avg: ProductCoPurchaseAvgAggregateOutputType | null
    _sum: ProductCoPurchaseSumAggregateOutputType | null
    _min: ProductCoPurchaseMinAggregateOutputType | null
    _max: ProductCoPurchaseMaxAggregateOutputType | null
  }

  type GetProductCoPurchaseGroupByPayload<T extends ProductCoPurchaseGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProductCoPurchaseGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProductCoPurchaseGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProductCoPurchaseGroupByOutputType[P]>
            : GetScalarType<T[P], ProductCoPurchaseGroupByOutputType[P]>
        }
      >
    >


  export type ProductCoPurchaseSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    catalogA?: boolean
    catalogB?: boolean
    orderCount?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["productCoPurchase"]>

  export type ProductCoPurchaseSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    catalogA?: boolean
    catalogB?: boolean
    orderCount?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["productCoPurchase"]>

  export type ProductCoPurchaseSelectScalar = {
    catalogA?: boolean
    catalogB?: boolean
    orderCount?: boolean
    updatedAt?: boolean
  }


  export type $ProductCoPurchasePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ProductCoPurchase"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      catalogA: string
      catalogB: string
      orderCount: number
      updatedAt: Date
    }, ExtArgs["result"]["productCoPurchase"]>
    composites: {}
  }

  type ProductCoPurchaseGetPayload<S extends boolean | null | undefined | ProductCoPurchaseDefaultArgs> = $Result.GetResult<Prisma.$ProductCoPurchasePayload, S>

  type ProductCoPurchaseCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ProductCoPurchaseFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ProductCoPurchaseCountAggregateInputType | true
    }

  export interface ProductCoPurchaseDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ProductCoPurchase'], meta: { name: 'ProductCoPurchase' } }
    /**
     * Find zero or one ProductCoPurchase that matches the filter.
     * @param {ProductCoPurchaseFindUniqueArgs} args - Arguments to find a ProductCoPurchase
     * @example
     * // Get one ProductCoPurchase
     * const productCoPurchase = await prisma.productCoPurchase.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProductCoPurchaseFindUniqueArgs>(args: SelectSubset<T, ProductCoPurchaseFindUniqueArgs<ExtArgs>>): Prisma__ProductCoPurchaseClient<$Result.GetResult<Prisma.$ProductCoPurchasePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ProductCoPurchase that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ProductCoPurchaseFindUniqueOrThrowArgs} args - Arguments to find a ProductCoPurchase
     * @example
     * // Get one ProductCoPurchase
     * const productCoPurchase = await prisma.productCoPurchase.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProductCoPurchaseFindUniqueOrThrowArgs>(args: SelectSubset<T, ProductCoPurchaseFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProductCoPurchaseClient<$Result.GetResult<Prisma.$ProductCoPurchasePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ProductCoPurchase that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductCoPurchaseFindFirstArgs} args - Arguments to find a ProductCoPurchase
     * @example
     * // Get one ProductCoPurchase
     * const productCoPurchase = await prisma.productCoPurchase.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProductCoPurchaseFindFirstArgs>(args?: SelectSubset<T, ProductCoPurchaseFindFirstArgs<ExtArgs>>): Prisma__ProductCoPurchaseClient<$Result.GetResult<Prisma.$ProductCoPurchasePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ProductCoPurchase that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductCoPurchaseFindFirstOrThrowArgs} args - Arguments to find a ProductCoPurchase
     * @example
     * // Get one ProductCoPurchase
     * const productCoPurchase = await prisma.productCoPurchase.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProductCoPurchaseFindFirstOrThrowArgs>(args?: SelectSubset<T, ProductCoPurchaseFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProductCoPurchaseClient<$Result.GetResult<Prisma.$ProductCoPurchasePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ProductCoPurchases that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductCoPurchaseFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ProductCoPurchases
     * const productCoPurchases = await prisma.productCoPurchase.findMany()
     * 
     * // Get first 10 ProductCoPurchases
     * const productCoPurchases = await prisma.productCoPurchase.findMany({ take: 10 })
     * 
     * // Only select the `catalogA`
     * const productCoPurchaseWithCatalogAOnly = await prisma.productCoPurchase.findMany({ select: { catalogA: true } })
     * 
     */
    findMany<T extends ProductCoPurchaseFindManyArgs>(args?: SelectSubset<T, ProductCoPurchaseFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductCoPurchasePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ProductCoPurchase.
     * @param {ProductCoPurchaseCreateArgs} args - Arguments to create a ProductCoPurchase.
     * @example
     * // Create one ProductCoPurchase
     * const ProductCoPurchase = await prisma.productCoPurchase.create({
     *   data: {
     *     // ... data to create a ProductCoPurchase
     *   }
     * })
     * 
     */
    create<T extends ProductCoPurchaseCreateArgs>(args: SelectSubset<T, ProductCoPurchaseCreateArgs<ExtArgs>>): Prisma__ProductCoPurchaseClient<$Result.GetResult<Prisma.$ProductCoPurchasePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ProductCoPurchases.
     * @param {ProductCoPurchaseCreateManyArgs} args - Arguments to create many ProductCoPurchases.
     * @example
     * // Create many ProductCoPurchases
     * const productCoPurchase = await prisma.productCoPurchase.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProductCoPurchaseCreateManyArgs>(args?: SelectSubset<T, ProductCoPurchaseCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ProductCoPurchases and returns the data saved in the database.
     * @param {ProductCoPurchaseCreateManyAndReturnArgs} args - Arguments to create many ProductCoPurchases.
     * @example
     * // Create many ProductCoPurchases
     * const productCoPurchase = await prisma.productCoPurchase.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ProductCoPurchases and only return the `catalogA`
     * const productCoPurchaseWithCatalogAOnly = await prisma.productCoPurchase.createManyAndReturn({ 
     *   select: { catalogA: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProductCoPurchaseCreateManyAndReturnArgs>(args?: SelectSubset<T, ProductCoPurchaseCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductCoPurchasePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ProductCoPurchase.
     * @param {ProductCoPurchaseDeleteArgs} args - Arguments to delete one ProductCoPurchase.
     * @example
     * // Delete one ProductCoPurchase
     * const ProductCoPurchase = await prisma.productCoPurchase.delete({
     *   where: {
     *     // ... filter to delete one ProductCoPurchase
     *   }
     * })
     * 
     */
    delete<T extends ProductCoPurchaseDeleteArgs>(args: SelectSubset<T, ProductCoPurchaseDeleteArgs<ExtArgs>>): Prisma__ProductCoPurchaseClient<$Result.GetResult<Prisma.$ProductCoPurchasePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ProductCoPurchase.
     * @param {ProductCoPurchaseUpdateArgs} args - Arguments to update one ProductCoPurchase.
     * @example
     * // Update one ProductCoPurchase
     * const productCoPurchase = await prisma.productCoPurchase.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProductCoPurchaseUpdateArgs>(args: SelectSubset<T, ProductCoPurchaseUpdateArgs<ExtArgs>>): Prisma__ProductCoPurchaseClient<$Result.GetResult<Prisma.$ProductCoPurchasePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ProductCoPurchases.
     * @param {ProductCoPurchaseDeleteManyArgs} args - Arguments to filter ProductCoPurchases to delete.
     * @example
     * // Delete a few ProductCoPurchases
     * const { count } = await prisma.productCoPurchase.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProductCoPurchaseDeleteManyArgs>(args?: SelectSubset<T, ProductCoPurchaseDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ProductCoPurchases.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductCoPurchaseUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ProductCoPurchases
     * const productCoPurchase = await prisma.productCoPurchase.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProductCoPurchaseUpdateManyArgs>(args: SelectSubset<T, ProductCoPurchaseUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ProductCoPurchase.
     * @param {ProductCoPurchaseUpsertArgs} args - Arguments to update or create a ProductCoPurchase.
     * @example
     * // Update or create a ProductCoPurchase
     * const productCoPurchase = await prisma.productCoPurchase.upsert({
     *   create: {
     *     // ... data to create a ProductCoPurchase
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ProductCoPurchase we want to update
     *   }
     * })
     */
    upsert<T extends ProductCoPurchaseUpsertArgs>(args: SelectSubset<T, ProductCoPurchaseUpsertArgs<ExtArgs>>): Prisma__ProductCoPurchaseClient<$Result.GetResult<Prisma.$ProductCoPurchasePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ProductCoPurchases.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductCoPurchaseCountArgs} args - Arguments to filter ProductCoPurchases to count.
     * @example
     * // Count the number of ProductCoPurchases
     * const count = await prisma.productCoPurchase.count({
     *   where: {
     *     // ... the filter for the ProductCoPurchases we want to count
     *   }
     * })
    **/
    count<T extends ProductCoPurchaseCountArgs>(
      args?: Subset<T, ProductCoPurchaseCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProductCoPurchaseCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ProductCoPurchase.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductCoPurchaseAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ProductCoPurchaseAggregateArgs>(args: Subset<T, ProductCoPurchaseAggregateArgs>): Prisma.PrismaPromise<GetProductCoPurchaseAggregateType<T>>

    /**
     * Group by ProductCoPurchase.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductCoPurchaseGroupByArgs} args - Group by arguments.
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
      T extends ProductCoPurchaseGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProductCoPurchaseGroupByArgs['orderBy'] }
        : { orderBy?: ProductCoPurchaseGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ProductCoPurchaseGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProductCoPurchaseGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ProductCoPurchase model
   */
  readonly fields: ProductCoPurchaseFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ProductCoPurchase.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProductCoPurchaseClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the ProductCoPurchase model
   */ 
  interface ProductCoPurchaseFieldRefs {
    readonly catalogA: FieldRef<"ProductCoPurchase", 'String'>
    readonly catalogB: FieldRef<"ProductCoPurchase", 'String'>
    readonly orderCount: FieldRef<"ProductCoPurchase", 'Int'>
    readonly updatedAt: FieldRef<"ProductCoPurchase", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ProductCoPurchase findUnique
   */
  export type ProductCoPurchaseFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductCoPurchase
     */
    select?: ProductCoPurchaseSelect<ExtArgs> | null
    /**
     * Filter, which ProductCoPurchase to fetch.
     */
    where: ProductCoPurchaseWhereUniqueInput
  }

  /**
   * ProductCoPurchase findUniqueOrThrow
   */
  export type ProductCoPurchaseFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductCoPurchase
     */
    select?: ProductCoPurchaseSelect<ExtArgs> | null
    /**
     * Filter, which ProductCoPurchase to fetch.
     */
    where: ProductCoPurchaseWhereUniqueInput
  }

  /**
   * ProductCoPurchase findFirst
   */
  export type ProductCoPurchaseFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductCoPurchase
     */
    select?: ProductCoPurchaseSelect<ExtArgs> | null
    /**
     * Filter, which ProductCoPurchase to fetch.
     */
    where?: ProductCoPurchaseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProductCoPurchases to fetch.
     */
    orderBy?: ProductCoPurchaseOrderByWithRelationInput | ProductCoPurchaseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProductCoPurchases.
     */
    cursor?: ProductCoPurchaseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProductCoPurchases from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProductCoPurchases.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProductCoPurchases.
     */
    distinct?: ProductCoPurchaseScalarFieldEnum | ProductCoPurchaseScalarFieldEnum[]
  }

  /**
   * ProductCoPurchase findFirstOrThrow
   */
  export type ProductCoPurchaseFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductCoPurchase
     */
    select?: ProductCoPurchaseSelect<ExtArgs> | null
    /**
     * Filter, which ProductCoPurchase to fetch.
     */
    where?: ProductCoPurchaseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProductCoPurchases to fetch.
     */
    orderBy?: ProductCoPurchaseOrderByWithRelationInput | ProductCoPurchaseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProductCoPurchases.
     */
    cursor?: ProductCoPurchaseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProductCoPurchases from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProductCoPurchases.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProductCoPurchases.
     */
    distinct?: ProductCoPurchaseScalarFieldEnum | ProductCoPurchaseScalarFieldEnum[]
  }

  /**
   * ProductCoPurchase findMany
   */
  export type ProductCoPurchaseFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductCoPurchase
     */
    select?: ProductCoPurchaseSelect<ExtArgs> | null
    /**
     * Filter, which ProductCoPurchases to fetch.
     */
    where?: ProductCoPurchaseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProductCoPurchases to fetch.
     */
    orderBy?: ProductCoPurchaseOrderByWithRelationInput | ProductCoPurchaseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ProductCoPurchases.
     */
    cursor?: ProductCoPurchaseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProductCoPurchases from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProductCoPurchases.
     */
    skip?: number
    distinct?: ProductCoPurchaseScalarFieldEnum | ProductCoPurchaseScalarFieldEnum[]
  }

  /**
   * ProductCoPurchase create
   */
  export type ProductCoPurchaseCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductCoPurchase
     */
    select?: ProductCoPurchaseSelect<ExtArgs> | null
    /**
     * The data needed to create a ProductCoPurchase.
     */
    data: XOR<ProductCoPurchaseCreateInput, ProductCoPurchaseUncheckedCreateInput>
  }

  /**
   * ProductCoPurchase createMany
   */
  export type ProductCoPurchaseCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ProductCoPurchases.
     */
    data: ProductCoPurchaseCreateManyInput | ProductCoPurchaseCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ProductCoPurchase createManyAndReturn
   */
  export type ProductCoPurchaseCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductCoPurchase
     */
    select?: ProductCoPurchaseSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ProductCoPurchases.
     */
    data: ProductCoPurchaseCreateManyInput | ProductCoPurchaseCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ProductCoPurchase update
   */
  export type ProductCoPurchaseUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductCoPurchase
     */
    select?: ProductCoPurchaseSelect<ExtArgs> | null
    /**
     * The data needed to update a ProductCoPurchase.
     */
    data: XOR<ProductCoPurchaseUpdateInput, ProductCoPurchaseUncheckedUpdateInput>
    /**
     * Choose, which ProductCoPurchase to update.
     */
    where: ProductCoPurchaseWhereUniqueInput
  }

  /**
   * ProductCoPurchase updateMany
   */
  export type ProductCoPurchaseUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ProductCoPurchases.
     */
    data: XOR<ProductCoPurchaseUpdateManyMutationInput, ProductCoPurchaseUncheckedUpdateManyInput>
    /**
     * Filter which ProductCoPurchases to update
     */
    where?: ProductCoPurchaseWhereInput
  }

  /**
   * ProductCoPurchase upsert
   */
  export type ProductCoPurchaseUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductCoPurchase
     */
    select?: ProductCoPurchaseSelect<ExtArgs> | null
    /**
     * The filter to search for the ProductCoPurchase to update in case it exists.
     */
    where: ProductCoPurchaseWhereUniqueInput
    /**
     * In case the ProductCoPurchase found by the `where` argument doesn't exist, create a new ProductCoPurchase with this data.
     */
    create: XOR<ProductCoPurchaseCreateInput, ProductCoPurchaseUncheckedCreateInput>
    /**
     * In case the ProductCoPurchase was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProductCoPurchaseUpdateInput, ProductCoPurchaseUncheckedUpdateInput>
  }

  /**
   * ProductCoPurchase delete
   */
  export type ProductCoPurchaseDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductCoPurchase
     */
    select?: ProductCoPurchaseSelect<ExtArgs> | null
    /**
     * Filter which ProductCoPurchase to delete.
     */
    where: ProductCoPurchaseWhereUniqueInput
  }

  /**
   * ProductCoPurchase deleteMany
   */
  export type ProductCoPurchaseDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProductCoPurchases to delete
     */
    where?: ProductCoPurchaseWhereInput
  }

  /**
   * ProductCoPurchase without action
   */
  export type ProductCoPurchaseDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductCoPurchase
     */
    select?: ProductCoPurchaseSelect<ExtArgs> | null
  }


  /**
   * Model ProductOrderStat
   */

  export type AggregateProductOrderStat = {
    _count: ProductOrderStatCountAggregateOutputType | null
    _avg: ProductOrderStatAvgAggregateOutputType | null
    _sum: ProductOrderStatSumAggregateOutputType | null
    _min: ProductOrderStatMinAggregateOutputType | null
    _max: ProductOrderStatMaxAggregateOutputType | null
  }

  export type ProductOrderStatAvgAggregateOutputType = {
    orderCount: number | null
  }

  export type ProductOrderStatSumAggregateOutputType = {
    orderCount: number | null
  }

  export type ProductOrderStatMinAggregateOutputType = {
    catalogProductId: string | null
    orderCount: number | null
    updatedAt: Date | null
  }

  export type ProductOrderStatMaxAggregateOutputType = {
    catalogProductId: string | null
    orderCount: number | null
    updatedAt: Date | null
  }

  export type ProductOrderStatCountAggregateOutputType = {
    catalogProductId: number
    orderCount: number
    updatedAt: number
    _all: number
  }


  export type ProductOrderStatAvgAggregateInputType = {
    orderCount?: true
  }

  export type ProductOrderStatSumAggregateInputType = {
    orderCount?: true
  }

  export type ProductOrderStatMinAggregateInputType = {
    catalogProductId?: true
    orderCount?: true
    updatedAt?: true
  }

  export type ProductOrderStatMaxAggregateInputType = {
    catalogProductId?: true
    orderCount?: true
    updatedAt?: true
  }

  export type ProductOrderStatCountAggregateInputType = {
    catalogProductId?: true
    orderCount?: true
    updatedAt?: true
    _all?: true
  }

  export type ProductOrderStatAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProductOrderStat to aggregate.
     */
    where?: ProductOrderStatWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProductOrderStats to fetch.
     */
    orderBy?: ProductOrderStatOrderByWithRelationInput | ProductOrderStatOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProductOrderStatWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProductOrderStats from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProductOrderStats.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ProductOrderStats
    **/
    _count?: true | ProductOrderStatCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ProductOrderStatAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ProductOrderStatSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProductOrderStatMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProductOrderStatMaxAggregateInputType
  }

  export type GetProductOrderStatAggregateType<T extends ProductOrderStatAggregateArgs> = {
        [P in keyof T & keyof AggregateProductOrderStat]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProductOrderStat[P]>
      : GetScalarType<T[P], AggregateProductOrderStat[P]>
  }




  export type ProductOrderStatGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProductOrderStatWhereInput
    orderBy?: ProductOrderStatOrderByWithAggregationInput | ProductOrderStatOrderByWithAggregationInput[]
    by: ProductOrderStatScalarFieldEnum[] | ProductOrderStatScalarFieldEnum
    having?: ProductOrderStatScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProductOrderStatCountAggregateInputType | true
    _avg?: ProductOrderStatAvgAggregateInputType
    _sum?: ProductOrderStatSumAggregateInputType
    _min?: ProductOrderStatMinAggregateInputType
    _max?: ProductOrderStatMaxAggregateInputType
  }

  export type ProductOrderStatGroupByOutputType = {
    catalogProductId: string
    orderCount: number
    updatedAt: Date
    _count: ProductOrderStatCountAggregateOutputType | null
    _avg: ProductOrderStatAvgAggregateOutputType | null
    _sum: ProductOrderStatSumAggregateOutputType | null
    _min: ProductOrderStatMinAggregateOutputType | null
    _max: ProductOrderStatMaxAggregateOutputType | null
  }

  type GetProductOrderStatGroupByPayload<T extends ProductOrderStatGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProductOrderStatGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProductOrderStatGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProductOrderStatGroupByOutputType[P]>
            : GetScalarType<T[P], ProductOrderStatGroupByOutputType[P]>
        }
      >
    >


  export type ProductOrderStatSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    catalogProductId?: boolean
    orderCount?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["productOrderStat"]>

  export type ProductOrderStatSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    catalogProductId?: boolean
    orderCount?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["productOrderStat"]>

  export type ProductOrderStatSelectScalar = {
    catalogProductId?: boolean
    orderCount?: boolean
    updatedAt?: boolean
  }


  export type $ProductOrderStatPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ProductOrderStat"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      catalogProductId: string
      orderCount: number
      updatedAt: Date
    }, ExtArgs["result"]["productOrderStat"]>
    composites: {}
  }

  type ProductOrderStatGetPayload<S extends boolean | null | undefined | ProductOrderStatDefaultArgs> = $Result.GetResult<Prisma.$ProductOrderStatPayload, S>

  type ProductOrderStatCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ProductOrderStatFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ProductOrderStatCountAggregateInputType | true
    }

  export interface ProductOrderStatDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ProductOrderStat'], meta: { name: 'ProductOrderStat' } }
    /**
     * Find zero or one ProductOrderStat that matches the filter.
     * @param {ProductOrderStatFindUniqueArgs} args - Arguments to find a ProductOrderStat
     * @example
     * // Get one ProductOrderStat
     * const productOrderStat = await prisma.productOrderStat.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProductOrderStatFindUniqueArgs>(args: SelectSubset<T, ProductOrderStatFindUniqueArgs<ExtArgs>>): Prisma__ProductOrderStatClient<$Result.GetResult<Prisma.$ProductOrderStatPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ProductOrderStat that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ProductOrderStatFindUniqueOrThrowArgs} args - Arguments to find a ProductOrderStat
     * @example
     * // Get one ProductOrderStat
     * const productOrderStat = await prisma.productOrderStat.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProductOrderStatFindUniqueOrThrowArgs>(args: SelectSubset<T, ProductOrderStatFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProductOrderStatClient<$Result.GetResult<Prisma.$ProductOrderStatPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ProductOrderStat that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductOrderStatFindFirstArgs} args - Arguments to find a ProductOrderStat
     * @example
     * // Get one ProductOrderStat
     * const productOrderStat = await prisma.productOrderStat.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProductOrderStatFindFirstArgs>(args?: SelectSubset<T, ProductOrderStatFindFirstArgs<ExtArgs>>): Prisma__ProductOrderStatClient<$Result.GetResult<Prisma.$ProductOrderStatPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ProductOrderStat that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductOrderStatFindFirstOrThrowArgs} args - Arguments to find a ProductOrderStat
     * @example
     * // Get one ProductOrderStat
     * const productOrderStat = await prisma.productOrderStat.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProductOrderStatFindFirstOrThrowArgs>(args?: SelectSubset<T, ProductOrderStatFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProductOrderStatClient<$Result.GetResult<Prisma.$ProductOrderStatPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ProductOrderStats that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductOrderStatFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ProductOrderStats
     * const productOrderStats = await prisma.productOrderStat.findMany()
     * 
     * // Get first 10 ProductOrderStats
     * const productOrderStats = await prisma.productOrderStat.findMany({ take: 10 })
     * 
     * // Only select the `catalogProductId`
     * const productOrderStatWithCatalogProductIdOnly = await prisma.productOrderStat.findMany({ select: { catalogProductId: true } })
     * 
     */
    findMany<T extends ProductOrderStatFindManyArgs>(args?: SelectSubset<T, ProductOrderStatFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductOrderStatPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ProductOrderStat.
     * @param {ProductOrderStatCreateArgs} args - Arguments to create a ProductOrderStat.
     * @example
     * // Create one ProductOrderStat
     * const ProductOrderStat = await prisma.productOrderStat.create({
     *   data: {
     *     // ... data to create a ProductOrderStat
     *   }
     * })
     * 
     */
    create<T extends ProductOrderStatCreateArgs>(args: SelectSubset<T, ProductOrderStatCreateArgs<ExtArgs>>): Prisma__ProductOrderStatClient<$Result.GetResult<Prisma.$ProductOrderStatPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ProductOrderStats.
     * @param {ProductOrderStatCreateManyArgs} args - Arguments to create many ProductOrderStats.
     * @example
     * // Create many ProductOrderStats
     * const productOrderStat = await prisma.productOrderStat.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProductOrderStatCreateManyArgs>(args?: SelectSubset<T, ProductOrderStatCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ProductOrderStats and returns the data saved in the database.
     * @param {ProductOrderStatCreateManyAndReturnArgs} args - Arguments to create many ProductOrderStats.
     * @example
     * // Create many ProductOrderStats
     * const productOrderStat = await prisma.productOrderStat.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ProductOrderStats and only return the `catalogProductId`
     * const productOrderStatWithCatalogProductIdOnly = await prisma.productOrderStat.createManyAndReturn({ 
     *   select: { catalogProductId: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProductOrderStatCreateManyAndReturnArgs>(args?: SelectSubset<T, ProductOrderStatCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductOrderStatPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ProductOrderStat.
     * @param {ProductOrderStatDeleteArgs} args - Arguments to delete one ProductOrderStat.
     * @example
     * // Delete one ProductOrderStat
     * const ProductOrderStat = await prisma.productOrderStat.delete({
     *   where: {
     *     // ... filter to delete one ProductOrderStat
     *   }
     * })
     * 
     */
    delete<T extends ProductOrderStatDeleteArgs>(args: SelectSubset<T, ProductOrderStatDeleteArgs<ExtArgs>>): Prisma__ProductOrderStatClient<$Result.GetResult<Prisma.$ProductOrderStatPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ProductOrderStat.
     * @param {ProductOrderStatUpdateArgs} args - Arguments to update one ProductOrderStat.
     * @example
     * // Update one ProductOrderStat
     * const productOrderStat = await prisma.productOrderStat.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProductOrderStatUpdateArgs>(args: SelectSubset<T, ProductOrderStatUpdateArgs<ExtArgs>>): Prisma__ProductOrderStatClient<$Result.GetResult<Prisma.$ProductOrderStatPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ProductOrderStats.
     * @param {ProductOrderStatDeleteManyArgs} args - Arguments to filter ProductOrderStats to delete.
     * @example
     * // Delete a few ProductOrderStats
     * const { count } = await prisma.productOrderStat.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProductOrderStatDeleteManyArgs>(args?: SelectSubset<T, ProductOrderStatDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ProductOrderStats.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductOrderStatUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ProductOrderStats
     * const productOrderStat = await prisma.productOrderStat.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProductOrderStatUpdateManyArgs>(args: SelectSubset<T, ProductOrderStatUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ProductOrderStat.
     * @param {ProductOrderStatUpsertArgs} args - Arguments to update or create a ProductOrderStat.
     * @example
     * // Update or create a ProductOrderStat
     * const productOrderStat = await prisma.productOrderStat.upsert({
     *   create: {
     *     // ... data to create a ProductOrderStat
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ProductOrderStat we want to update
     *   }
     * })
     */
    upsert<T extends ProductOrderStatUpsertArgs>(args: SelectSubset<T, ProductOrderStatUpsertArgs<ExtArgs>>): Prisma__ProductOrderStatClient<$Result.GetResult<Prisma.$ProductOrderStatPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ProductOrderStats.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductOrderStatCountArgs} args - Arguments to filter ProductOrderStats to count.
     * @example
     * // Count the number of ProductOrderStats
     * const count = await prisma.productOrderStat.count({
     *   where: {
     *     // ... the filter for the ProductOrderStats we want to count
     *   }
     * })
    **/
    count<T extends ProductOrderStatCountArgs>(
      args?: Subset<T, ProductOrderStatCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProductOrderStatCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ProductOrderStat.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductOrderStatAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ProductOrderStatAggregateArgs>(args: Subset<T, ProductOrderStatAggregateArgs>): Prisma.PrismaPromise<GetProductOrderStatAggregateType<T>>

    /**
     * Group by ProductOrderStat.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductOrderStatGroupByArgs} args - Group by arguments.
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
      T extends ProductOrderStatGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProductOrderStatGroupByArgs['orderBy'] }
        : { orderBy?: ProductOrderStatGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ProductOrderStatGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProductOrderStatGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ProductOrderStat model
   */
  readonly fields: ProductOrderStatFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ProductOrderStat.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProductOrderStatClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the ProductOrderStat model
   */ 
  interface ProductOrderStatFieldRefs {
    readonly catalogProductId: FieldRef<"ProductOrderStat", 'String'>
    readonly orderCount: FieldRef<"ProductOrderStat", 'Int'>
    readonly updatedAt: FieldRef<"ProductOrderStat", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ProductOrderStat findUnique
   */
  export type ProductOrderStatFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductOrderStat
     */
    select?: ProductOrderStatSelect<ExtArgs> | null
    /**
     * Filter, which ProductOrderStat to fetch.
     */
    where: ProductOrderStatWhereUniqueInput
  }

  /**
   * ProductOrderStat findUniqueOrThrow
   */
  export type ProductOrderStatFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductOrderStat
     */
    select?: ProductOrderStatSelect<ExtArgs> | null
    /**
     * Filter, which ProductOrderStat to fetch.
     */
    where: ProductOrderStatWhereUniqueInput
  }

  /**
   * ProductOrderStat findFirst
   */
  export type ProductOrderStatFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductOrderStat
     */
    select?: ProductOrderStatSelect<ExtArgs> | null
    /**
     * Filter, which ProductOrderStat to fetch.
     */
    where?: ProductOrderStatWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProductOrderStats to fetch.
     */
    orderBy?: ProductOrderStatOrderByWithRelationInput | ProductOrderStatOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProductOrderStats.
     */
    cursor?: ProductOrderStatWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProductOrderStats from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProductOrderStats.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProductOrderStats.
     */
    distinct?: ProductOrderStatScalarFieldEnum | ProductOrderStatScalarFieldEnum[]
  }

  /**
   * ProductOrderStat findFirstOrThrow
   */
  export type ProductOrderStatFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductOrderStat
     */
    select?: ProductOrderStatSelect<ExtArgs> | null
    /**
     * Filter, which ProductOrderStat to fetch.
     */
    where?: ProductOrderStatWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProductOrderStats to fetch.
     */
    orderBy?: ProductOrderStatOrderByWithRelationInput | ProductOrderStatOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProductOrderStats.
     */
    cursor?: ProductOrderStatWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProductOrderStats from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProductOrderStats.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProductOrderStats.
     */
    distinct?: ProductOrderStatScalarFieldEnum | ProductOrderStatScalarFieldEnum[]
  }

  /**
   * ProductOrderStat findMany
   */
  export type ProductOrderStatFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductOrderStat
     */
    select?: ProductOrderStatSelect<ExtArgs> | null
    /**
     * Filter, which ProductOrderStats to fetch.
     */
    where?: ProductOrderStatWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProductOrderStats to fetch.
     */
    orderBy?: ProductOrderStatOrderByWithRelationInput | ProductOrderStatOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ProductOrderStats.
     */
    cursor?: ProductOrderStatWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProductOrderStats from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProductOrderStats.
     */
    skip?: number
    distinct?: ProductOrderStatScalarFieldEnum | ProductOrderStatScalarFieldEnum[]
  }

  /**
   * ProductOrderStat create
   */
  export type ProductOrderStatCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductOrderStat
     */
    select?: ProductOrderStatSelect<ExtArgs> | null
    /**
     * The data needed to create a ProductOrderStat.
     */
    data: XOR<ProductOrderStatCreateInput, ProductOrderStatUncheckedCreateInput>
  }

  /**
   * ProductOrderStat createMany
   */
  export type ProductOrderStatCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ProductOrderStats.
     */
    data: ProductOrderStatCreateManyInput | ProductOrderStatCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ProductOrderStat createManyAndReturn
   */
  export type ProductOrderStatCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductOrderStat
     */
    select?: ProductOrderStatSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ProductOrderStats.
     */
    data: ProductOrderStatCreateManyInput | ProductOrderStatCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ProductOrderStat update
   */
  export type ProductOrderStatUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductOrderStat
     */
    select?: ProductOrderStatSelect<ExtArgs> | null
    /**
     * The data needed to update a ProductOrderStat.
     */
    data: XOR<ProductOrderStatUpdateInput, ProductOrderStatUncheckedUpdateInput>
    /**
     * Choose, which ProductOrderStat to update.
     */
    where: ProductOrderStatWhereUniqueInput
  }

  /**
   * ProductOrderStat updateMany
   */
  export type ProductOrderStatUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ProductOrderStats.
     */
    data: XOR<ProductOrderStatUpdateManyMutationInput, ProductOrderStatUncheckedUpdateManyInput>
    /**
     * Filter which ProductOrderStats to update
     */
    where?: ProductOrderStatWhereInput
  }

  /**
   * ProductOrderStat upsert
   */
  export type ProductOrderStatUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductOrderStat
     */
    select?: ProductOrderStatSelect<ExtArgs> | null
    /**
     * The filter to search for the ProductOrderStat to update in case it exists.
     */
    where: ProductOrderStatWhereUniqueInput
    /**
     * In case the ProductOrderStat found by the `where` argument doesn't exist, create a new ProductOrderStat with this data.
     */
    create: XOR<ProductOrderStatCreateInput, ProductOrderStatUncheckedCreateInput>
    /**
     * In case the ProductOrderStat was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProductOrderStatUpdateInput, ProductOrderStatUncheckedUpdateInput>
  }

  /**
   * ProductOrderStat delete
   */
  export type ProductOrderStatDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductOrderStat
     */
    select?: ProductOrderStatSelect<ExtArgs> | null
    /**
     * Filter which ProductOrderStat to delete.
     */
    where: ProductOrderStatWhereUniqueInput
  }

  /**
   * ProductOrderStat deleteMany
   */
  export type ProductOrderStatDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProductOrderStats to delete
     */
    where?: ProductOrderStatWhereInput
  }

  /**
   * ProductOrderStat without action
   */
  export type ProductOrderStatDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductOrderStat
     */
    select?: ProductOrderStatSelect<ExtArgs> | null
  }


  /**
   * Model CoPurchaseState
   */

  export type AggregateCoPurchaseState = {
    _count: CoPurchaseStateCountAggregateOutputType | null
    _avg: CoPurchaseStateAvgAggregateOutputType | null
    _sum: CoPurchaseStateSumAggregateOutputType | null
    _min: CoPurchaseStateMinAggregateOutputType | null
    _max: CoPurchaseStateMaxAggregateOutputType | null
  }

  export type CoPurchaseStateAvgAggregateOutputType = {
    totalOrders: number | null
  }

  export type CoPurchaseStateSumAggregateOutputType = {
    totalOrders: number | null
  }

  export type CoPurchaseStateMinAggregateOutputType = {
    id: string | null
    lastDeliveredAt: Date | null
    totalOrders: number | null
    updatedAt: Date | null
  }

  export type CoPurchaseStateMaxAggregateOutputType = {
    id: string | null
    lastDeliveredAt: Date | null
    totalOrders: number | null
    updatedAt: Date | null
  }

  export type CoPurchaseStateCountAggregateOutputType = {
    id: number
    lastDeliveredAt: number
    totalOrders: number
    updatedAt: number
    _all: number
  }


  export type CoPurchaseStateAvgAggregateInputType = {
    totalOrders?: true
  }

  export type CoPurchaseStateSumAggregateInputType = {
    totalOrders?: true
  }

  export type CoPurchaseStateMinAggregateInputType = {
    id?: true
    lastDeliveredAt?: true
    totalOrders?: true
    updatedAt?: true
  }

  export type CoPurchaseStateMaxAggregateInputType = {
    id?: true
    lastDeliveredAt?: true
    totalOrders?: true
    updatedAt?: true
  }

  export type CoPurchaseStateCountAggregateInputType = {
    id?: true
    lastDeliveredAt?: true
    totalOrders?: true
    updatedAt?: true
    _all?: true
  }

  export type CoPurchaseStateAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CoPurchaseState to aggregate.
     */
    where?: CoPurchaseStateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CoPurchaseStates to fetch.
     */
    orderBy?: CoPurchaseStateOrderByWithRelationInput | CoPurchaseStateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CoPurchaseStateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CoPurchaseStates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CoPurchaseStates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CoPurchaseStates
    **/
    _count?: true | CoPurchaseStateCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CoPurchaseStateAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CoPurchaseStateSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CoPurchaseStateMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CoPurchaseStateMaxAggregateInputType
  }

  export type GetCoPurchaseStateAggregateType<T extends CoPurchaseStateAggregateArgs> = {
        [P in keyof T & keyof AggregateCoPurchaseState]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCoPurchaseState[P]>
      : GetScalarType<T[P], AggregateCoPurchaseState[P]>
  }




  export type CoPurchaseStateGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CoPurchaseStateWhereInput
    orderBy?: CoPurchaseStateOrderByWithAggregationInput | CoPurchaseStateOrderByWithAggregationInput[]
    by: CoPurchaseStateScalarFieldEnum[] | CoPurchaseStateScalarFieldEnum
    having?: CoPurchaseStateScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CoPurchaseStateCountAggregateInputType | true
    _avg?: CoPurchaseStateAvgAggregateInputType
    _sum?: CoPurchaseStateSumAggregateInputType
    _min?: CoPurchaseStateMinAggregateInputType
    _max?: CoPurchaseStateMaxAggregateInputType
  }

  export type CoPurchaseStateGroupByOutputType = {
    id: string
    lastDeliveredAt: Date | null
    totalOrders: number
    updatedAt: Date
    _count: CoPurchaseStateCountAggregateOutputType | null
    _avg: CoPurchaseStateAvgAggregateOutputType | null
    _sum: CoPurchaseStateSumAggregateOutputType | null
    _min: CoPurchaseStateMinAggregateOutputType | null
    _max: CoPurchaseStateMaxAggregateOutputType | null
  }

  type GetCoPurchaseStateGroupByPayload<T extends CoPurchaseStateGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CoPurchaseStateGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CoPurchaseStateGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CoPurchaseStateGroupByOutputType[P]>
            : GetScalarType<T[P], CoPurchaseStateGroupByOutputType[P]>
        }
      >
    >


  export type CoPurchaseStateSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    lastDeliveredAt?: boolean
    totalOrders?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["coPurchaseState"]>

  export type CoPurchaseStateSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    lastDeliveredAt?: boolean
    totalOrders?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["coPurchaseState"]>

  export type CoPurchaseStateSelectScalar = {
    id?: boolean
    lastDeliveredAt?: boolean
    totalOrders?: boolean
    updatedAt?: boolean
  }


  export type $CoPurchaseStatePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CoPurchaseState"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      lastDeliveredAt: Date | null
      totalOrders: number
      updatedAt: Date
    }, ExtArgs["result"]["coPurchaseState"]>
    composites: {}
  }

  type CoPurchaseStateGetPayload<S extends boolean | null | undefined | CoPurchaseStateDefaultArgs> = $Result.GetResult<Prisma.$CoPurchaseStatePayload, S>

  type CoPurchaseStateCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<CoPurchaseStateFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: CoPurchaseStateCountAggregateInputType | true
    }

  export interface CoPurchaseStateDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CoPurchaseState'], meta: { name: 'CoPurchaseState' } }
    /**
     * Find zero or one CoPurchaseState that matches the filter.
     * @param {CoPurchaseStateFindUniqueArgs} args - Arguments to find a CoPurchaseState
     * @example
     * // Get one CoPurchaseState
     * const coPurchaseState = await prisma.coPurchaseState.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CoPurchaseStateFindUniqueArgs>(args: SelectSubset<T, CoPurchaseStateFindUniqueArgs<ExtArgs>>): Prisma__CoPurchaseStateClient<$Result.GetResult<Prisma.$CoPurchaseStatePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one CoPurchaseState that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {CoPurchaseStateFindUniqueOrThrowArgs} args - Arguments to find a CoPurchaseState
     * @example
     * // Get one CoPurchaseState
     * const coPurchaseState = await prisma.coPurchaseState.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CoPurchaseStateFindUniqueOrThrowArgs>(args: SelectSubset<T, CoPurchaseStateFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CoPurchaseStateClient<$Result.GetResult<Prisma.$CoPurchaseStatePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first CoPurchaseState that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CoPurchaseStateFindFirstArgs} args - Arguments to find a CoPurchaseState
     * @example
     * // Get one CoPurchaseState
     * const coPurchaseState = await prisma.coPurchaseState.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CoPurchaseStateFindFirstArgs>(args?: SelectSubset<T, CoPurchaseStateFindFirstArgs<ExtArgs>>): Prisma__CoPurchaseStateClient<$Result.GetResult<Prisma.$CoPurchaseStatePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first CoPurchaseState that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CoPurchaseStateFindFirstOrThrowArgs} args - Arguments to find a CoPurchaseState
     * @example
     * // Get one CoPurchaseState
     * const coPurchaseState = await prisma.coPurchaseState.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CoPurchaseStateFindFirstOrThrowArgs>(args?: SelectSubset<T, CoPurchaseStateFindFirstOrThrowArgs<ExtArgs>>): Prisma__CoPurchaseStateClient<$Result.GetResult<Prisma.$CoPurchaseStatePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more CoPurchaseStates that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CoPurchaseStateFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CoPurchaseStates
     * const coPurchaseStates = await prisma.coPurchaseState.findMany()
     * 
     * // Get first 10 CoPurchaseStates
     * const coPurchaseStates = await prisma.coPurchaseState.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const coPurchaseStateWithIdOnly = await prisma.coPurchaseState.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CoPurchaseStateFindManyArgs>(args?: SelectSubset<T, CoPurchaseStateFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CoPurchaseStatePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a CoPurchaseState.
     * @param {CoPurchaseStateCreateArgs} args - Arguments to create a CoPurchaseState.
     * @example
     * // Create one CoPurchaseState
     * const CoPurchaseState = await prisma.coPurchaseState.create({
     *   data: {
     *     // ... data to create a CoPurchaseState
     *   }
     * })
     * 
     */
    create<T extends CoPurchaseStateCreateArgs>(args: SelectSubset<T, CoPurchaseStateCreateArgs<ExtArgs>>): Prisma__CoPurchaseStateClient<$Result.GetResult<Prisma.$CoPurchaseStatePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many CoPurchaseStates.
     * @param {CoPurchaseStateCreateManyArgs} args - Arguments to create many CoPurchaseStates.
     * @example
     * // Create many CoPurchaseStates
     * const coPurchaseState = await prisma.coPurchaseState.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CoPurchaseStateCreateManyArgs>(args?: SelectSubset<T, CoPurchaseStateCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CoPurchaseStates and returns the data saved in the database.
     * @param {CoPurchaseStateCreateManyAndReturnArgs} args - Arguments to create many CoPurchaseStates.
     * @example
     * // Create many CoPurchaseStates
     * const coPurchaseState = await prisma.coPurchaseState.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CoPurchaseStates and only return the `id`
     * const coPurchaseStateWithIdOnly = await prisma.coPurchaseState.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CoPurchaseStateCreateManyAndReturnArgs>(args?: SelectSubset<T, CoPurchaseStateCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CoPurchaseStatePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a CoPurchaseState.
     * @param {CoPurchaseStateDeleteArgs} args - Arguments to delete one CoPurchaseState.
     * @example
     * // Delete one CoPurchaseState
     * const CoPurchaseState = await prisma.coPurchaseState.delete({
     *   where: {
     *     // ... filter to delete one CoPurchaseState
     *   }
     * })
     * 
     */
    delete<T extends CoPurchaseStateDeleteArgs>(args: SelectSubset<T, CoPurchaseStateDeleteArgs<ExtArgs>>): Prisma__CoPurchaseStateClient<$Result.GetResult<Prisma.$CoPurchaseStatePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one CoPurchaseState.
     * @param {CoPurchaseStateUpdateArgs} args - Arguments to update one CoPurchaseState.
     * @example
     * // Update one CoPurchaseState
     * const coPurchaseState = await prisma.coPurchaseState.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CoPurchaseStateUpdateArgs>(args: SelectSubset<T, CoPurchaseStateUpdateArgs<ExtArgs>>): Prisma__CoPurchaseStateClient<$Result.GetResult<Prisma.$CoPurchaseStatePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more CoPurchaseStates.
     * @param {CoPurchaseStateDeleteManyArgs} args - Arguments to filter CoPurchaseStates to delete.
     * @example
     * // Delete a few CoPurchaseStates
     * const { count } = await prisma.coPurchaseState.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CoPurchaseStateDeleteManyArgs>(args?: SelectSubset<T, CoPurchaseStateDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CoPurchaseStates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CoPurchaseStateUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CoPurchaseStates
     * const coPurchaseState = await prisma.coPurchaseState.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CoPurchaseStateUpdateManyArgs>(args: SelectSubset<T, CoPurchaseStateUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one CoPurchaseState.
     * @param {CoPurchaseStateUpsertArgs} args - Arguments to update or create a CoPurchaseState.
     * @example
     * // Update or create a CoPurchaseState
     * const coPurchaseState = await prisma.coPurchaseState.upsert({
     *   create: {
     *     // ... data to create a CoPurchaseState
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CoPurchaseState we want to update
     *   }
     * })
     */
    upsert<T extends CoPurchaseStateUpsertArgs>(args: SelectSubset<T, CoPurchaseStateUpsertArgs<ExtArgs>>): Prisma__CoPurchaseStateClient<$Result.GetResult<Prisma.$CoPurchaseStatePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of CoPurchaseStates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CoPurchaseStateCountArgs} args - Arguments to filter CoPurchaseStates to count.
     * @example
     * // Count the number of CoPurchaseStates
     * const count = await prisma.coPurchaseState.count({
     *   where: {
     *     // ... the filter for the CoPurchaseStates we want to count
     *   }
     * })
    **/
    count<T extends CoPurchaseStateCountArgs>(
      args?: Subset<T, CoPurchaseStateCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CoPurchaseStateCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CoPurchaseState.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CoPurchaseStateAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends CoPurchaseStateAggregateArgs>(args: Subset<T, CoPurchaseStateAggregateArgs>): Prisma.PrismaPromise<GetCoPurchaseStateAggregateType<T>>

    /**
     * Group by CoPurchaseState.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CoPurchaseStateGroupByArgs} args - Group by arguments.
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
      T extends CoPurchaseStateGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CoPurchaseStateGroupByArgs['orderBy'] }
        : { orderBy?: CoPurchaseStateGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, CoPurchaseStateGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCoPurchaseStateGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CoPurchaseState model
   */
  readonly fields: CoPurchaseStateFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CoPurchaseState.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CoPurchaseStateClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the CoPurchaseState model
   */ 
  interface CoPurchaseStateFieldRefs {
    readonly id: FieldRef<"CoPurchaseState", 'String'>
    readonly lastDeliveredAt: FieldRef<"CoPurchaseState", 'DateTime'>
    readonly totalOrders: FieldRef<"CoPurchaseState", 'Int'>
    readonly updatedAt: FieldRef<"CoPurchaseState", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CoPurchaseState findUnique
   */
  export type CoPurchaseStateFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CoPurchaseState
     */
    select?: CoPurchaseStateSelect<ExtArgs> | null
    /**
     * Filter, which CoPurchaseState to fetch.
     */
    where: CoPurchaseStateWhereUniqueInput
  }

  /**
   * CoPurchaseState findUniqueOrThrow
   */
  export type CoPurchaseStateFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CoPurchaseState
     */
    select?: CoPurchaseStateSelect<ExtArgs> | null
    /**
     * Filter, which CoPurchaseState to fetch.
     */
    where: CoPurchaseStateWhereUniqueInput
  }

  /**
   * CoPurchaseState findFirst
   */
  export type CoPurchaseStateFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CoPurchaseState
     */
    select?: CoPurchaseStateSelect<ExtArgs> | null
    /**
     * Filter, which CoPurchaseState to fetch.
     */
    where?: CoPurchaseStateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CoPurchaseStates to fetch.
     */
    orderBy?: CoPurchaseStateOrderByWithRelationInput | CoPurchaseStateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CoPurchaseStates.
     */
    cursor?: CoPurchaseStateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CoPurchaseStates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CoPurchaseStates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CoPurchaseStates.
     */
    distinct?: CoPurchaseStateScalarFieldEnum | CoPurchaseStateScalarFieldEnum[]
  }

  /**
   * CoPurchaseState findFirstOrThrow
   */
  export type CoPurchaseStateFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CoPurchaseState
     */
    select?: CoPurchaseStateSelect<ExtArgs> | null
    /**
     * Filter, which CoPurchaseState to fetch.
     */
    where?: CoPurchaseStateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CoPurchaseStates to fetch.
     */
    orderBy?: CoPurchaseStateOrderByWithRelationInput | CoPurchaseStateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CoPurchaseStates.
     */
    cursor?: CoPurchaseStateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CoPurchaseStates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CoPurchaseStates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CoPurchaseStates.
     */
    distinct?: CoPurchaseStateScalarFieldEnum | CoPurchaseStateScalarFieldEnum[]
  }

  /**
   * CoPurchaseState findMany
   */
  export type CoPurchaseStateFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CoPurchaseState
     */
    select?: CoPurchaseStateSelect<ExtArgs> | null
    /**
     * Filter, which CoPurchaseStates to fetch.
     */
    where?: CoPurchaseStateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CoPurchaseStates to fetch.
     */
    orderBy?: CoPurchaseStateOrderByWithRelationInput | CoPurchaseStateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CoPurchaseStates.
     */
    cursor?: CoPurchaseStateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CoPurchaseStates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CoPurchaseStates.
     */
    skip?: number
    distinct?: CoPurchaseStateScalarFieldEnum | CoPurchaseStateScalarFieldEnum[]
  }

  /**
   * CoPurchaseState create
   */
  export type CoPurchaseStateCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CoPurchaseState
     */
    select?: CoPurchaseStateSelect<ExtArgs> | null
    /**
     * The data needed to create a CoPurchaseState.
     */
    data: XOR<CoPurchaseStateCreateInput, CoPurchaseStateUncheckedCreateInput>
  }

  /**
   * CoPurchaseState createMany
   */
  export type CoPurchaseStateCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CoPurchaseStates.
     */
    data: CoPurchaseStateCreateManyInput | CoPurchaseStateCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CoPurchaseState createManyAndReturn
   */
  export type CoPurchaseStateCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CoPurchaseState
     */
    select?: CoPurchaseStateSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many CoPurchaseStates.
     */
    data: CoPurchaseStateCreateManyInput | CoPurchaseStateCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CoPurchaseState update
   */
  export type CoPurchaseStateUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CoPurchaseState
     */
    select?: CoPurchaseStateSelect<ExtArgs> | null
    /**
     * The data needed to update a CoPurchaseState.
     */
    data: XOR<CoPurchaseStateUpdateInput, CoPurchaseStateUncheckedUpdateInput>
    /**
     * Choose, which CoPurchaseState to update.
     */
    where: CoPurchaseStateWhereUniqueInput
  }

  /**
   * CoPurchaseState updateMany
   */
  export type CoPurchaseStateUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CoPurchaseStates.
     */
    data: XOR<CoPurchaseStateUpdateManyMutationInput, CoPurchaseStateUncheckedUpdateManyInput>
    /**
     * Filter which CoPurchaseStates to update
     */
    where?: CoPurchaseStateWhereInput
  }

  /**
   * CoPurchaseState upsert
   */
  export type CoPurchaseStateUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CoPurchaseState
     */
    select?: CoPurchaseStateSelect<ExtArgs> | null
    /**
     * The filter to search for the CoPurchaseState to update in case it exists.
     */
    where: CoPurchaseStateWhereUniqueInput
    /**
     * In case the CoPurchaseState found by the `where` argument doesn't exist, create a new CoPurchaseState with this data.
     */
    create: XOR<CoPurchaseStateCreateInput, CoPurchaseStateUncheckedCreateInput>
    /**
     * In case the CoPurchaseState was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CoPurchaseStateUpdateInput, CoPurchaseStateUncheckedUpdateInput>
  }

  /**
   * CoPurchaseState delete
   */
  export type CoPurchaseStateDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CoPurchaseState
     */
    select?: CoPurchaseStateSelect<ExtArgs> | null
    /**
     * Filter which CoPurchaseState to delete.
     */
    where: CoPurchaseStateWhereUniqueInput
  }

  /**
   * CoPurchaseState deleteMany
   */
  export type CoPurchaseStateDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CoPurchaseStates to delete
     */
    where?: CoPurchaseStateWhereInput
  }

  /**
   * CoPurchaseState without action
   */
  export type CoPurchaseStateDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CoPurchaseState
     */
    select?: CoPurchaseStateSelect<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const OrderScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    storeId: 'storeId',
    totalAmount: 'totalAmount',
    discountAmount: 'discountAmount',
    couponCode: 'couponCode',
    deliverySlot: 'deliverySlot',
    deliveryName: 'deliveryName',
    deliveryPhone: 'deliveryPhone',
    deliveryAddress: 'deliveryAddress',
    deliveryCity: 'deliveryCity',
    deliveryPincode: 'deliveryPincode',
    deliveryLandmark: 'deliveryLandmark',
    deliveryInstructions: 'deliveryInstructions',
    deliveryLatitude: 'deliveryLatitude',
    deliveryLongitude: 'deliveryLongitude',
    deliveryCharge: 'deliveryCharge',
    billDetails: 'billDetails',
    status: 'status',
    paymentStatus: 'paymentStatus',
    paymentMethod: 'paymentMethod',
    paymentRef: 'paymentRef',
    riderId: 'riderId',
    riderStatus: 'riderStatus',
    assignedAt: 'assignedAt',
    assignedBy: 'assignedBy',
    pickupStartedAt: 'pickupStartedAt',
    deliveredAt: 'deliveredAt',
    preparationPhotos: 'preparationPhotos',
    deliveryProofPhotoUrl: 'deliveryProofPhotoUrl',
    deliveryProofPhotoPublicId: 'deliveryProofPhotoPublicId',
    deliveryProofUploadedAt: 'deliveryProofUploadedAt',
    rejectionReason: 'rejectionReason',
    cancellationReason: 'cancellationReason',
    cancelledBy: 'cancelledBy',
    cancelledAt: 'cancelledAt',
    refundStatus: 'refundStatus',
    refundFailureReason: 'refundFailureReason',
    refundFailedAt: 'refundFailedAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type OrderScalarFieldEnum = (typeof OrderScalarFieldEnum)[keyof typeof OrderScalarFieldEnum]


  export const OrderItemScalarFieldEnum: {
    id: 'id',
    orderId: 'orderId',
    productId: 'productId',
    catalogProductId: 'catalogProductId',
    quantity: 'quantity',
    price: 'price',
    selectedOptions: 'selectedOptions'
  };

  export type OrderItemScalarFieldEnum = (typeof OrderItemScalarFieldEnum)[keyof typeof OrderItemScalarFieldEnum]


  export const PaymentScalarFieldEnum: {
    id: 'id',
    orderId: 'orderId',
    amount: 'amount',
    status: 'status',
    method: 'method',
    transactionId: 'transactionId',
    gatewayOrderId: 'gatewayOrderId',
    metadata: 'metadata',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type PaymentScalarFieldEnum = (typeof PaymentScalarFieldEnum)[keyof typeof PaymentScalarFieldEnum]


  export const CouponUsageScalarFieldEnum: {
    id: 'id',
    couponId: 'couponId',
    userId: 'userId',
    orderId: 'orderId',
    createdAt: 'createdAt'
  };

  export type CouponUsageScalarFieldEnum = (typeof CouponUsageScalarFieldEnum)[keyof typeof CouponUsageScalarFieldEnum]


  export const NotificationScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    title: 'title',
    message: 'message',
    type: 'type',
    category: 'category',
    isRead: 'isRead',
    metadata: 'metadata',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type NotificationScalarFieldEnum = (typeof NotificationScalarFieldEnum)[keyof typeof NotificationScalarFieldEnum]


  export const AuditLogScalarFieldEnum: {
    id: 'id',
    entityType: 'entityType',
    entityId: 'entityId',
    action: 'action',
    actorId: 'actorId',
    actorType: 'actorType',
    metadata: 'metadata',
    createdAt: 'createdAt'
  };

  export type AuditLogScalarFieldEnum = (typeof AuditLogScalarFieldEnum)[keyof typeof AuditLogScalarFieldEnum]


  export const WebhookEventScalarFieldEnum: {
    id: 'id',
    provider: 'provider',
    eventId: 'eventId',
    eventType: 'eventType',
    payload: 'payload',
    receivedAt: 'receivedAt',
    processedAt: 'processedAt'
  };

  export type WebhookEventScalarFieldEnum = (typeof WebhookEventScalarFieldEnum)[keyof typeof WebhookEventScalarFieldEnum]


  export const OutboxEventScalarFieldEnum: {
    id: 'id',
    aggregate: 'aggregate',
    aggregateId: 'aggregateId',
    eventType: 'eventType',
    queue: 'queue',
    payload: 'payload',
    status: 'status',
    attempts: 'attempts',
    lastError: 'lastError',
    createdAt: 'createdAt',
    publishedAt: 'publishedAt',
    lockedAt: 'lockedAt',
    lockedBy: 'lockedBy'
  };

  export type OutboxEventScalarFieldEnum = (typeof OutboxEventScalarFieldEnum)[keyof typeof OutboxEventScalarFieldEnum]


  export const StockReservationScalarFieldEnum: {
    id: 'id',
    orderId: 'orderId',
    userId: 'userId',
    items: 'items',
    status: 'status',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type StockReservationScalarFieldEnum = (typeof StockReservationScalarFieldEnum)[keyof typeof StockReservationScalarFieldEnum]


  export const ProductCoPurchaseScalarFieldEnum: {
    catalogA: 'catalogA',
    catalogB: 'catalogB',
    orderCount: 'orderCount',
    updatedAt: 'updatedAt'
  };

  export type ProductCoPurchaseScalarFieldEnum = (typeof ProductCoPurchaseScalarFieldEnum)[keyof typeof ProductCoPurchaseScalarFieldEnum]


  export const ProductOrderStatScalarFieldEnum: {
    catalogProductId: 'catalogProductId',
    orderCount: 'orderCount',
    updatedAt: 'updatedAt'
  };

  export type ProductOrderStatScalarFieldEnum = (typeof ProductOrderStatScalarFieldEnum)[keyof typeof ProductOrderStatScalarFieldEnum]


  export const CoPurchaseStateScalarFieldEnum: {
    id: 'id',
    lastDeliveredAt: 'lastDeliveredAt',
    totalOrders: 'totalOrders',
    updatedAt: 'updatedAt'
  };

  export type CoPurchaseStateScalarFieldEnum = (typeof CoPurchaseStateScalarFieldEnum)[keyof typeof CoPurchaseStateScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


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
   * Reference to a field of type 'Decimal'
   */
  export type DecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal'>
    


  /**
   * Reference to a field of type 'Decimal[]'
   */
  export type ListDecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'OrderStatus'
   */
  export type EnumOrderStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OrderStatus'>
    


  /**
   * Reference to a field of type 'OrderStatus[]'
   */
  export type ListEnumOrderStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OrderStatus[]'>
    


  /**
   * Reference to a field of type 'PaymentStatus'
   */
  export type EnumPaymentStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PaymentStatus'>
    


  /**
   * Reference to a field of type 'PaymentStatus[]'
   */
  export type ListEnumPaymentStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PaymentStatus[]'>
    


  /**
   * Reference to a field of type 'PaymentMethod'
   */
  export type EnumPaymentMethodFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PaymentMethod'>
    


  /**
   * Reference to a field of type 'PaymentMethod[]'
   */
  export type ListEnumPaymentMethodFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PaymentMethod[]'>
    


  /**
   * Reference to a field of type 'OrderRiderStatus'
   */
  export type EnumOrderRiderStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OrderRiderStatus'>
    


  /**
   * Reference to a field of type 'OrderRiderStatus[]'
   */
  export type ListEnumOrderRiderStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OrderRiderStatus[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'CancelledBy'
   */
  export type EnumCancelledByFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CancelledBy'>
    


  /**
   * Reference to a field of type 'CancelledBy[]'
   */
  export type ListEnumCancelledByFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CancelledBy[]'>
    


  /**
   * Reference to a field of type 'RefundStatus'
   */
  export type EnumRefundStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RefundStatus'>
    


  /**
   * Reference to a field of type 'RefundStatus[]'
   */
  export type ListEnumRefundStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RefundStatus[]'>
    


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
   * Reference to a field of type 'AuditEntityType'
   */
  export type EnumAuditEntityTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AuditEntityType'>
    


  /**
   * Reference to a field of type 'AuditEntityType[]'
   */
  export type ListEnumAuditEntityTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AuditEntityType[]'>
    


  /**
   * Reference to a field of type 'ActorType'
   */
  export type EnumActorTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ActorType'>
    


  /**
   * Reference to a field of type 'ActorType[]'
   */
  export type ListEnumActorTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ActorType[]'>
    


  /**
   * Reference to a field of type 'OutboxStatus'
   */
  export type EnumOutboxStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OutboxStatus'>
    


  /**
   * Reference to a field of type 'OutboxStatus[]'
   */
  export type ListEnumOutboxStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OutboxStatus[]'>
    


  /**
   * Reference to a field of type 'StockReservationStatus'
   */
  export type EnumStockReservationStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'StockReservationStatus'>
    


  /**
   * Reference to a field of type 'StockReservationStatus[]'
   */
  export type ListEnumStockReservationStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'StockReservationStatus[]'>
    


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


  export type OrderWhereInput = {
    AND?: OrderWhereInput | OrderWhereInput[]
    OR?: OrderWhereInput[]
    NOT?: OrderWhereInput | OrderWhereInput[]
    id?: StringFilter<"Order"> | string
    userId?: StringFilter<"Order"> | string
    storeId?: StringFilter<"Order"> | string
    totalAmount?: DecimalFilter<"Order"> | Decimal | DecimalJsLike | number | string
    discountAmount?: DecimalFilter<"Order"> | Decimal | DecimalJsLike | number | string
    couponCode?: StringNullableFilter<"Order"> | string | null
    deliverySlot?: StringNullableFilter<"Order"> | string | null
    deliveryName?: StringNullableFilter<"Order"> | string | null
    deliveryPhone?: StringNullableFilter<"Order"> | string | null
    deliveryAddress?: StringNullableFilter<"Order"> | string | null
    deliveryCity?: StringNullableFilter<"Order"> | string | null
    deliveryPincode?: StringNullableFilter<"Order"> | string | null
    deliveryLandmark?: StringNullableFilter<"Order"> | string | null
    deliveryInstructions?: StringNullableFilter<"Order"> | string | null
    deliveryLatitude?: DecimalNullableFilter<"Order"> | Decimal | DecimalJsLike | number | string | null
    deliveryLongitude?: DecimalNullableFilter<"Order"> | Decimal | DecimalJsLike | number | string | null
    deliveryCharge?: DecimalFilter<"Order"> | Decimal | DecimalJsLike | number | string
    billDetails?: JsonNullableFilter<"Order">
    status?: EnumOrderStatusFilter<"Order"> | $Enums.OrderStatus
    paymentStatus?: EnumPaymentStatusFilter<"Order"> | $Enums.PaymentStatus
    paymentMethod?: EnumPaymentMethodNullableFilter<"Order"> | $Enums.PaymentMethod | null
    paymentRef?: StringNullableFilter<"Order"> | string | null
    riderId?: StringNullableFilter<"Order"> | string | null
    riderStatus?: EnumOrderRiderStatusNullableFilter<"Order"> | $Enums.OrderRiderStatus | null
    assignedAt?: DateTimeNullableFilter<"Order"> | Date | string | null
    assignedBy?: StringNullableFilter<"Order"> | string | null
    pickupStartedAt?: DateTimeNullableFilter<"Order"> | Date | string | null
    deliveredAt?: DateTimeNullableFilter<"Order"> | Date | string | null
    preparationPhotos?: JsonNullableFilter<"Order">
    deliveryProofPhotoUrl?: StringNullableFilter<"Order"> | string | null
    deliveryProofPhotoPublicId?: StringNullableFilter<"Order"> | string | null
    deliveryProofUploadedAt?: DateTimeNullableFilter<"Order"> | Date | string | null
    rejectionReason?: StringNullableFilter<"Order"> | string | null
    cancellationReason?: StringNullableFilter<"Order"> | string | null
    cancelledBy?: EnumCancelledByNullableFilter<"Order"> | $Enums.CancelledBy | null
    cancelledAt?: DateTimeNullableFilter<"Order"> | Date | string | null
    refundStatus?: EnumRefundStatusFilter<"Order"> | $Enums.RefundStatus
    refundFailureReason?: StringNullableFilter<"Order"> | string | null
    refundFailedAt?: DateTimeNullableFilter<"Order"> | Date | string | null
    createdAt?: DateTimeFilter<"Order"> | Date | string
    updatedAt?: DateTimeFilter<"Order"> | Date | string
    orderItems?: OrderItemListRelationFilter
    payments?: PaymentListRelationFilter
    couponUsages?: CouponUsageListRelationFilter
  }

  export type OrderOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    storeId?: SortOrder
    totalAmount?: SortOrder
    discountAmount?: SortOrder
    couponCode?: SortOrderInput | SortOrder
    deliverySlot?: SortOrderInput | SortOrder
    deliveryName?: SortOrderInput | SortOrder
    deliveryPhone?: SortOrderInput | SortOrder
    deliveryAddress?: SortOrderInput | SortOrder
    deliveryCity?: SortOrderInput | SortOrder
    deliveryPincode?: SortOrderInput | SortOrder
    deliveryLandmark?: SortOrderInput | SortOrder
    deliveryInstructions?: SortOrderInput | SortOrder
    deliveryLatitude?: SortOrderInput | SortOrder
    deliveryLongitude?: SortOrderInput | SortOrder
    deliveryCharge?: SortOrder
    billDetails?: SortOrderInput | SortOrder
    status?: SortOrder
    paymentStatus?: SortOrder
    paymentMethod?: SortOrderInput | SortOrder
    paymentRef?: SortOrderInput | SortOrder
    riderId?: SortOrderInput | SortOrder
    riderStatus?: SortOrderInput | SortOrder
    assignedAt?: SortOrderInput | SortOrder
    assignedBy?: SortOrderInput | SortOrder
    pickupStartedAt?: SortOrderInput | SortOrder
    deliveredAt?: SortOrderInput | SortOrder
    preparationPhotos?: SortOrderInput | SortOrder
    deliveryProofPhotoUrl?: SortOrderInput | SortOrder
    deliveryProofPhotoPublicId?: SortOrderInput | SortOrder
    deliveryProofUploadedAt?: SortOrderInput | SortOrder
    rejectionReason?: SortOrderInput | SortOrder
    cancellationReason?: SortOrderInput | SortOrder
    cancelledBy?: SortOrderInput | SortOrder
    cancelledAt?: SortOrderInput | SortOrder
    refundStatus?: SortOrder
    refundFailureReason?: SortOrderInput | SortOrder
    refundFailedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    orderItems?: OrderItemOrderByRelationAggregateInput
    payments?: PaymentOrderByRelationAggregateInput
    couponUsages?: CouponUsageOrderByRelationAggregateInput
  }

  export type OrderWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: OrderWhereInput | OrderWhereInput[]
    OR?: OrderWhereInput[]
    NOT?: OrderWhereInput | OrderWhereInput[]
    userId?: StringFilter<"Order"> | string
    storeId?: StringFilter<"Order"> | string
    totalAmount?: DecimalFilter<"Order"> | Decimal | DecimalJsLike | number | string
    discountAmount?: DecimalFilter<"Order"> | Decimal | DecimalJsLike | number | string
    couponCode?: StringNullableFilter<"Order"> | string | null
    deliverySlot?: StringNullableFilter<"Order"> | string | null
    deliveryName?: StringNullableFilter<"Order"> | string | null
    deliveryPhone?: StringNullableFilter<"Order"> | string | null
    deliveryAddress?: StringNullableFilter<"Order"> | string | null
    deliveryCity?: StringNullableFilter<"Order"> | string | null
    deliveryPincode?: StringNullableFilter<"Order"> | string | null
    deliveryLandmark?: StringNullableFilter<"Order"> | string | null
    deliveryInstructions?: StringNullableFilter<"Order"> | string | null
    deliveryLatitude?: DecimalNullableFilter<"Order"> | Decimal | DecimalJsLike | number | string | null
    deliveryLongitude?: DecimalNullableFilter<"Order"> | Decimal | DecimalJsLike | number | string | null
    deliveryCharge?: DecimalFilter<"Order"> | Decimal | DecimalJsLike | number | string
    billDetails?: JsonNullableFilter<"Order">
    status?: EnumOrderStatusFilter<"Order"> | $Enums.OrderStatus
    paymentStatus?: EnumPaymentStatusFilter<"Order"> | $Enums.PaymentStatus
    paymentMethod?: EnumPaymentMethodNullableFilter<"Order"> | $Enums.PaymentMethod | null
    paymentRef?: StringNullableFilter<"Order"> | string | null
    riderId?: StringNullableFilter<"Order"> | string | null
    riderStatus?: EnumOrderRiderStatusNullableFilter<"Order"> | $Enums.OrderRiderStatus | null
    assignedAt?: DateTimeNullableFilter<"Order"> | Date | string | null
    assignedBy?: StringNullableFilter<"Order"> | string | null
    pickupStartedAt?: DateTimeNullableFilter<"Order"> | Date | string | null
    deliveredAt?: DateTimeNullableFilter<"Order"> | Date | string | null
    preparationPhotos?: JsonNullableFilter<"Order">
    deliveryProofPhotoUrl?: StringNullableFilter<"Order"> | string | null
    deliveryProofPhotoPublicId?: StringNullableFilter<"Order"> | string | null
    deliveryProofUploadedAt?: DateTimeNullableFilter<"Order"> | Date | string | null
    rejectionReason?: StringNullableFilter<"Order"> | string | null
    cancellationReason?: StringNullableFilter<"Order"> | string | null
    cancelledBy?: EnumCancelledByNullableFilter<"Order"> | $Enums.CancelledBy | null
    cancelledAt?: DateTimeNullableFilter<"Order"> | Date | string | null
    refundStatus?: EnumRefundStatusFilter<"Order"> | $Enums.RefundStatus
    refundFailureReason?: StringNullableFilter<"Order"> | string | null
    refundFailedAt?: DateTimeNullableFilter<"Order"> | Date | string | null
    createdAt?: DateTimeFilter<"Order"> | Date | string
    updatedAt?: DateTimeFilter<"Order"> | Date | string
    orderItems?: OrderItemListRelationFilter
    payments?: PaymentListRelationFilter
    couponUsages?: CouponUsageListRelationFilter
  }, "id">

  export type OrderOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    storeId?: SortOrder
    totalAmount?: SortOrder
    discountAmount?: SortOrder
    couponCode?: SortOrderInput | SortOrder
    deliverySlot?: SortOrderInput | SortOrder
    deliveryName?: SortOrderInput | SortOrder
    deliveryPhone?: SortOrderInput | SortOrder
    deliveryAddress?: SortOrderInput | SortOrder
    deliveryCity?: SortOrderInput | SortOrder
    deliveryPincode?: SortOrderInput | SortOrder
    deliveryLandmark?: SortOrderInput | SortOrder
    deliveryInstructions?: SortOrderInput | SortOrder
    deliveryLatitude?: SortOrderInput | SortOrder
    deliveryLongitude?: SortOrderInput | SortOrder
    deliveryCharge?: SortOrder
    billDetails?: SortOrderInput | SortOrder
    status?: SortOrder
    paymentStatus?: SortOrder
    paymentMethod?: SortOrderInput | SortOrder
    paymentRef?: SortOrderInput | SortOrder
    riderId?: SortOrderInput | SortOrder
    riderStatus?: SortOrderInput | SortOrder
    assignedAt?: SortOrderInput | SortOrder
    assignedBy?: SortOrderInput | SortOrder
    pickupStartedAt?: SortOrderInput | SortOrder
    deliveredAt?: SortOrderInput | SortOrder
    preparationPhotos?: SortOrderInput | SortOrder
    deliveryProofPhotoUrl?: SortOrderInput | SortOrder
    deliveryProofPhotoPublicId?: SortOrderInput | SortOrder
    deliveryProofUploadedAt?: SortOrderInput | SortOrder
    rejectionReason?: SortOrderInput | SortOrder
    cancellationReason?: SortOrderInput | SortOrder
    cancelledBy?: SortOrderInput | SortOrder
    cancelledAt?: SortOrderInput | SortOrder
    refundStatus?: SortOrder
    refundFailureReason?: SortOrderInput | SortOrder
    refundFailedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: OrderCountOrderByAggregateInput
    _avg?: OrderAvgOrderByAggregateInput
    _max?: OrderMaxOrderByAggregateInput
    _min?: OrderMinOrderByAggregateInput
    _sum?: OrderSumOrderByAggregateInput
  }

  export type OrderScalarWhereWithAggregatesInput = {
    AND?: OrderScalarWhereWithAggregatesInput | OrderScalarWhereWithAggregatesInput[]
    OR?: OrderScalarWhereWithAggregatesInput[]
    NOT?: OrderScalarWhereWithAggregatesInput | OrderScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Order"> | string
    userId?: StringWithAggregatesFilter<"Order"> | string
    storeId?: StringWithAggregatesFilter<"Order"> | string
    totalAmount?: DecimalWithAggregatesFilter<"Order"> | Decimal | DecimalJsLike | number | string
    discountAmount?: DecimalWithAggregatesFilter<"Order"> | Decimal | DecimalJsLike | number | string
    couponCode?: StringNullableWithAggregatesFilter<"Order"> | string | null
    deliverySlot?: StringNullableWithAggregatesFilter<"Order"> | string | null
    deliveryName?: StringNullableWithAggregatesFilter<"Order"> | string | null
    deliveryPhone?: StringNullableWithAggregatesFilter<"Order"> | string | null
    deliveryAddress?: StringNullableWithAggregatesFilter<"Order"> | string | null
    deliveryCity?: StringNullableWithAggregatesFilter<"Order"> | string | null
    deliveryPincode?: StringNullableWithAggregatesFilter<"Order"> | string | null
    deliveryLandmark?: StringNullableWithAggregatesFilter<"Order"> | string | null
    deliveryInstructions?: StringNullableWithAggregatesFilter<"Order"> | string | null
    deliveryLatitude?: DecimalNullableWithAggregatesFilter<"Order"> | Decimal | DecimalJsLike | number | string | null
    deliveryLongitude?: DecimalNullableWithAggregatesFilter<"Order"> | Decimal | DecimalJsLike | number | string | null
    deliveryCharge?: DecimalWithAggregatesFilter<"Order"> | Decimal | DecimalJsLike | number | string
    billDetails?: JsonNullableWithAggregatesFilter<"Order">
    status?: EnumOrderStatusWithAggregatesFilter<"Order"> | $Enums.OrderStatus
    paymentStatus?: EnumPaymentStatusWithAggregatesFilter<"Order"> | $Enums.PaymentStatus
    paymentMethod?: EnumPaymentMethodNullableWithAggregatesFilter<"Order"> | $Enums.PaymentMethod | null
    paymentRef?: StringNullableWithAggregatesFilter<"Order"> | string | null
    riderId?: StringNullableWithAggregatesFilter<"Order"> | string | null
    riderStatus?: EnumOrderRiderStatusNullableWithAggregatesFilter<"Order"> | $Enums.OrderRiderStatus | null
    assignedAt?: DateTimeNullableWithAggregatesFilter<"Order"> | Date | string | null
    assignedBy?: StringNullableWithAggregatesFilter<"Order"> | string | null
    pickupStartedAt?: DateTimeNullableWithAggregatesFilter<"Order"> | Date | string | null
    deliveredAt?: DateTimeNullableWithAggregatesFilter<"Order"> | Date | string | null
    preparationPhotos?: JsonNullableWithAggregatesFilter<"Order">
    deliveryProofPhotoUrl?: StringNullableWithAggregatesFilter<"Order"> | string | null
    deliveryProofPhotoPublicId?: StringNullableWithAggregatesFilter<"Order"> | string | null
    deliveryProofUploadedAt?: DateTimeNullableWithAggregatesFilter<"Order"> | Date | string | null
    rejectionReason?: StringNullableWithAggregatesFilter<"Order"> | string | null
    cancellationReason?: StringNullableWithAggregatesFilter<"Order"> | string | null
    cancelledBy?: EnumCancelledByNullableWithAggregatesFilter<"Order"> | $Enums.CancelledBy | null
    cancelledAt?: DateTimeNullableWithAggregatesFilter<"Order"> | Date | string | null
    refundStatus?: EnumRefundStatusWithAggregatesFilter<"Order"> | $Enums.RefundStatus
    refundFailureReason?: StringNullableWithAggregatesFilter<"Order"> | string | null
    refundFailedAt?: DateTimeNullableWithAggregatesFilter<"Order"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Order"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Order"> | Date | string
  }

  export type OrderItemWhereInput = {
    AND?: OrderItemWhereInput | OrderItemWhereInput[]
    OR?: OrderItemWhereInput[]
    NOT?: OrderItemWhereInput | OrderItemWhereInput[]
    id?: StringFilter<"OrderItem"> | string
    orderId?: StringFilter<"OrderItem"> | string
    productId?: StringFilter<"OrderItem"> | string
    catalogProductId?: StringNullableFilter<"OrderItem"> | string | null
    quantity?: IntFilter<"OrderItem"> | number
    price?: DecimalFilter<"OrderItem"> | Decimal | DecimalJsLike | number | string
    selectedOptions?: JsonNullableFilter<"OrderItem">
    order?: XOR<OrderRelationFilter, OrderWhereInput>
  }

  export type OrderItemOrderByWithRelationInput = {
    id?: SortOrder
    orderId?: SortOrder
    productId?: SortOrder
    catalogProductId?: SortOrderInput | SortOrder
    quantity?: SortOrder
    price?: SortOrder
    selectedOptions?: SortOrderInput | SortOrder
    order?: OrderOrderByWithRelationInput
  }

  export type OrderItemWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: OrderItemWhereInput | OrderItemWhereInput[]
    OR?: OrderItemWhereInput[]
    NOT?: OrderItemWhereInput | OrderItemWhereInput[]
    orderId?: StringFilter<"OrderItem"> | string
    productId?: StringFilter<"OrderItem"> | string
    catalogProductId?: StringNullableFilter<"OrderItem"> | string | null
    quantity?: IntFilter<"OrderItem"> | number
    price?: DecimalFilter<"OrderItem"> | Decimal | DecimalJsLike | number | string
    selectedOptions?: JsonNullableFilter<"OrderItem">
    order?: XOR<OrderRelationFilter, OrderWhereInput>
  }, "id">

  export type OrderItemOrderByWithAggregationInput = {
    id?: SortOrder
    orderId?: SortOrder
    productId?: SortOrder
    catalogProductId?: SortOrderInput | SortOrder
    quantity?: SortOrder
    price?: SortOrder
    selectedOptions?: SortOrderInput | SortOrder
    _count?: OrderItemCountOrderByAggregateInput
    _avg?: OrderItemAvgOrderByAggregateInput
    _max?: OrderItemMaxOrderByAggregateInput
    _min?: OrderItemMinOrderByAggregateInput
    _sum?: OrderItemSumOrderByAggregateInput
  }

  export type OrderItemScalarWhereWithAggregatesInput = {
    AND?: OrderItemScalarWhereWithAggregatesInput | OrderItemScalarWhereWithAggregatesInput[]
    OR?: OrderItemScalarWhereWithAggregatesInput[]
    NOT?: OrderItemScalarWhereWithAggregatesInput | OrderItemScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"OrderItem"> | string
    orderId?: StringWithAggregatesFilter<"OrderItem"> | string
    productId?: StringWithAggregatesFilter<"OrderItem"> | string
    catalogProductId?: StringNullableWithAggregatesFilter<"OrderItem"> | string | null
    quantity?: IntWithAggregatesFilter<"OrderItem"> | number
    price?: DecimalWithAggregatesFilter<"OrderItem"> | Decimal | DecimalJsLike | number | string
    selectedOptions?: JsonNullableWithAggregatesFilter<"OrderItem">
  }

  export type PaymentWhereInput = {
    AND?: PaymentWhereInput | PaymentWhereInput[]
    OR?: PaymentWhereInput[]
    NOT?: PaymentWhereInput | PaymentWhereInput[]
    id?: StringFilter<"Payment"> | string
    orderId?: StringFilter<"Payment"> | string
    amount?: DecimalFilter<"Payment"> | Decimal | DecimalJsLike | number | string
    status?: EnumPaymentStatusFilter<"Payment"> | $Enums.PaymentStatus
    method?: EnumPaymentMethodFilter<"Payment"> | $Enums.PaymentMethod
    transactionId?: StringNullableFilter<"Payment"> | string | null
    gatewayOrderId?: StringNullableFilter<"Payment"> | string | null
    metadata?: JsonNullableFilter<"Payment">
    createdAt?: DateTimeFilter<"Payment"> | Date | string
    updatedAt?: DateTimeFilter<"Payment"> | Date | string
    order?: XOR<OrderRelationFilter, OrderWhereInput>
  }

  export type PaymentOrderByWithRelationInput = {
    id?: SortOrder
    orderId?: SortOrder
    amount?: SortOrder
    status?: SortOrder
    method?: SortOrder
    transactionId?: SortOrderInput | SortOrder
    gatewayOrderId?: SortOrderInput | SortOrder
    metadata?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    order?: OrderOrderByWithRelationInput
  }

  export type PaymentWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    transactionId?: string
    gatewayOrderId?: string
    AND?: PaymentWhereInput | PaymentWhereInput[]
    OR?: PaymentWhereInput[]
    NOT?: PaymentWhereInput | PaymentWhereInput[]
    orderId?: StringFilter<"Payment"> | string
    amount?: DecimalFilter<"Payment"> | Decimal | DecimalJsLike | number | string
    status?: EnumPaymentStatusFilter<"Payment"> | $Enums.PaymentStatus
    method?: EnumPaymentMethodFilter<"Payment"> | $Enums.PaymentMethod
    metadata?: JsonNullableFilter<"Payment">
    createdAt?: DateTimeFilter<"Payment"> | Date | string
    updatedAt?: DateTimeFilter<"Payment"> | Date | string
    order?: XOR<OrderRelationFilter, OrderWhereInput>
  }, "id" | "transactionId" | "gatewayOrderId">

  export type PaymentOrderByWithAggregationInput = {
    id?: SortOrder
    orderId?: SortOrder
    amount?: SortOrder
    status?: SortOrder
    method?: SortOrder
    transactionId?: SortOrderInput | SortOrder
    gatewayOrderId?: SortOrderInput | SortOrder
    metadata?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: PaymentCountOrderByAggregateInput
    _avg?: PaymentAvgOrderByAggregateInput
    _max?: PaymentMaxOrderByAggregateInput
    _min?: PaymentMinOrderByAggregateInput
    _sum?: PaymentSumOrderByAggregateInput
  }

  export type PaymentScalarWhereWithAggregatesInput = {
    AND?: PaymentScalarWhereWithAggregatesInput | PaymentScalarWhereWithAggregatesInput[]
    OR?: PaymentScalarWhereWithAggregatesInput[]
    NOT?: PaymentScalarWhereWithAggregatesInput | PaymentScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Payment"> | string
    orderId?: StringWithAggregatesFilter<"Payment"> | string
    amount?: DecimalWithAggregatesFilter<"Payment"> | Decimal | DecimalJsLike | number | string
    status?: EnumPaymentStatusWithAggregatesFilter<"Payment"> | $Enums.PaymentStatus
    method?: EnumPaymentMethodWithAggregatesFilter<"Payment"> | $Enums.PaymentMethod
    transactionId?: StringNullableWithAggregatesFilter<"Payment"> | string | null
    gatewayOrderId?: StringNullableWithAggregatesFilter<"Payment"> | string | null
    metadata?: JsonNullableWithAggregatesFilter<"Payment">
    createdAt?: DateTimeWithAggregatesFilter<"Payment"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Payment"> | Date | string
  }

  export type CouponUsageWhereInput = {
    AND?: CouponUsageWhereInput | CouponUsageWhereInput[]
    OR?: CouponUsageWhereInput[]
    NOT?: CouponUsageWhereInput | CouponUsageWhereInput[]
    id?: StringFilter<"CouponUsage"> | string
    couponId?: StringFilter<"CouponUsage"> | string
    userId?: StringFilter<"CouponUsage"> | string
    orderId?: StringFilter<"CouponUsage"> | string
    createdAt?: DateTimeFilter<"CouponUsage"> | Date | string
    order?: XOR<OrderRelationFilter, OrderWhereInput>
  }

  export type CouponUsageOrderByWithRelationInput = {
    id?: SortOrder
    couponId?: SortOrder
    userId?: SortOrder
    orderId?: SortOrder
    createdAt?: SortOrder
    order?: OrderOrderByWithRelationInput
  }

  export type CouponUsageWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CouponUsageWhereInput | CouponUsageWhereInput[]
    OR?: CouponUsageWhereInput[]
    NOT?: CouponUsageWhereInput | CouponUsageWhereInput[]
    couponId?: StringFilter<"CouponUsage"> | string
    userId?: StringFilter<"CouponUsage"> | string
    orderId?: StringFilter<"CouponUsage"> | string
    createdAt?: DateTimeFilter<"CouponUsage"> | Date | string
    order?: XOR<OrderRelationFilter, OrderWhereInput>
  }, "id">

  export type CouponUsageOrderByWithAggregationInput = {
    id?: SortOrder
    couponId?: SortOrder
    userId?: SortOrder
    orderId?: SortOrder
    createdAt?: SortOrder
    _count?: CouponUsageCountOrderByAggregateInput
    _max?: CouponUsageMaxOrderByAggregateInput
    _min?: CouponUsageMinOrderByAggregateInput
  }

  export type CouponUsageScalarWhereWithAggregatesInput = {
    AND?: CouponUsageScalarWhereWithAggregatesInput | CouponUsageScalarWhereWithAggregatesInput[]
    OR?: CouponUsageScalarWhereWithAggregatesInput[]
    NOT?: CouponUsageScalarWhereWithAggregatesInput | CouponUsageScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"CouponUsage"> | string
    couponId?: StringWithAggregatesFilter<"CouponUsage"> | string
    userId?: StringWithAggregatesFilter<"CouponUsage"> | string
    orderId?: StringWithAggregatesFilter<"CouponUsage"> | string
    createdAt?: DateTimeWithAggregatesFilter<"CouponUsage"> | Date | string
  }

  export type NotificationWhereInput = {
    AND?: NotificationWhereInput | NotificationWhereInput[]
    OR?: NotificationWhereInput[]
    NOT?: NotificationWhereInput | NotificationWhereInput[]
    id?: StringFilter<"Notification"> | string
    userId?: StringFilter<"Notification"> | string
    title?: StringFilter<"Notification"> | string
    message?: StringFilter<"Notification"> | string
    type?: StringFilter<"Notification"> | string
    category?: StringNullableFilter<"Notification"> | string | null
    isRead?: BoolFilter<"Notification"> | boolean
    metadata?: JsonNullableFilter<"Notification">
    createdAt?: DateTimeFilter<"Notification"> | Date | string
    updatedAt?: DateTimeFilter<"Notification"> | Date | string
  }

  export type NotificationOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    title?: SortOrder
    message?: SortOrder
    type?: SortOrder
    category?: SortOrderInput | SortOrder
    isRead?: SortOrder
    metadata?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type NotificationWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: NotificationWhereInput | NotificationWhereInput[]
    OR?: NotificationWhereInput[]
    NOT?: NotificationWhereInput | NotificationWhereInput[]
    userId?: StringFilter<"Notification"> | string
    title?: StringFilter<"Notification"> | string
    message?: StringFilter<"Notification"> | string
    type?: StringFilter<"Notification"> | string
    category?: StringNullableFilter<"Notification"> | string | null
    isRead?: BoolFilter<"Notification"> | boolean
    metadata?: JsonNullableFilter<"Notification">
    createdAt?: DateTimeFilter<"Notification"> | Date | string
    updatedAt?: DateTimeFilter<"Notification"> | Date | string
  }, "id">

  export type NotificationOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    title?: SortOrder
    message?: SortOrder
    type?: SortOrder
    category?: SortOrderInput | SortOrder
    isRead?: SortOrder
    metadata?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: NotificationCountOrderByAggregateInput
    _max?: NotificationMaxOrderByAggregateInput
    _min?: NotificationMinOrderByAggregateInput
  }

  export type NotificationScalarWhereWithAggregatesInput = {
    AND?: NotificationScalarWhereWithAggregatesInput | NotificationScalarWhereWithAggregatesInput[]
    OR?: NotificationScalarWhereWithAggregatesInput[]
    NOT?: NotificationScalarWhereWithAggregatesInput | NotificationScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Notification"> | string
    userId?: StringWithAggregatesFilter<"Notification"> | string
    title?: StringWithAggregatesFilter<"Notification"> | string
    message?: StringWithAggregatesFilter<"Notification"> | string
    type?: StringWithAggregatesFilter<"Notification"> | string
    category?: StringNullableWithAggregatesFilter<"Notification"> | string | null
    isRead?: BoolWithAggregatesFilter<"Notification"> | boolean
    metadata?: JsonNullableWithAggregatesFilter<"Notification">
    createdAt?: DateTimeWithAggregatesFilter<"Notification"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Notification"> | Date | string
  }

  export type AuditLogWhereInput = {
    AND?: AuditLogWhereInput | AuditLogWhereInput[]
    OR?: AuditLogWhereInput[]
    NOT?: AuditLogWhereInput | AuditLogWhereInput[]
    id?: StringFilter<"AuditLog"> | string
    entityType?: EnumAuditEntityTypeFilter<"AuditLog"> | $Enums.AuditEntityType
    entityId?: StringFilter<"AuditLog"> | string
    action?: StringFilter<"AuditLog"> | string
    actorId?: StringNullableFilter<"AuditLog"> | string | null
    actorType?: EnumActorTypeNullableFilter<"AuditLog"> | $Enums.ActorType | null
    metadata?: JsonNullableFilter<"AuditLog">
    createdAt?: DateTimeFilter<"AuditLog"> | Date | string
  }

  export type AuditLogOrderByWithRelationInput = {
    id?: SortOrder
    entityType?: SortOrder
    entityId?: SortOrder
    action?: SortOrder
    actorId?: SortOrderInput | SortOrder
    actorType?: SortOrderInput | SortOrder
    metadata?: SortOrderInput | SortOrder
    createdAt?: SortOrder
  }

  export type AuditLogWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AuditLogWhereInput | AuditLogWhereInput[]
    OR?: AuditLogWhereInput[]
    NOT?: AuditLogWhereInput | AuditLogWhereInput[]
    entityType?: EnumAuditEntityTypeFilter<"AuditLog"> | $Enums.AuditEntityType
    entityId?: StringFilter<"AuditLog"> | string
    action?: StringFilter<"AuditLog"> | string
    actorId?: StringNullableFilter<"AuditLog"> | string | null
    actorType?: EnumActorTypeNullableFilter<"AuditLog"> | $Enums.ActorType | null
    metadata?: JsonNullableFilter<"AuditLog">
    createdAt?: DateTimeFilter<"AuditLog"> | Date | string
  }, "id">

  export type AuditLogOrderByWithAggregationInput = {
    id?: SortOrder
    entityType?: SortOrder
    entityId?: SortOrder
    action?: SortOrder
    actorId?: SortOrderInput | SortOrder
    actorType?: SortOrderInput | SortOrder
    metadata?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: AuditLogCountOrderByAggregateInput
    _max?: AuditLogMaxOrderByAggregateInput
    _min?: AuditLogMinOrderByAggregateInput
  }

  export type AuditLogScalarWhereWithAggregatesInput = {
    AND?: AuditLogScalarWhereWithAggregatesInput | AuditLogScalarWhereWithAggregatesInput[]
    OR?: AuditLogScalarWhereWithAggregatesInput[]
    NOT?: AuditLogScalarWhereWithAggregatesInput | AuditLogScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AuditLog"> | string
    entityType?: EnumAuditEntityTypeWithAggregatesFilter<"AuditLog"> | $Enums.AuditEntityType
    entityId?: StringWithAggregatesFilter<"AuditLog"> | string
    action?: StringWithAggregatesFilter<"AuditLog"> | string
    actorId?: StringNullableWithAggregatesFilter<"AuditLog"> | string | null
    actorType?: EnumActorTypeNullableWithAggregatesFilter<"AuditLog"> | $Enums.ActorType | null
    metadata?: JsonNullableWithAggregatesFilter<"AuditLog">
    createdAt?: DateTimeWithAggregatesFilter<"AuditLog"> | Date | string
  }

  export type WebhookEventWhereInput = {
    AND?: WebhookEventWhereInput | WebhookEventWhereInput[]
    OR?: WebhookEventWhereInput[]
    NOT?: WebhookEventWhereInput | WebhookEventWhereInput[]
    id?: StringFilter<"WebhookEvent"> | string
    provider?: StringFilter<"WebhookEvent"> | string
    eventId?: StringFilter<"WebhookEvent"> | string
    eventType?: StringFilter<"WebhookEvent"> | string
    payload?: JsonFilter<"WebhookEvent">
    receivedAt?: DateTimeFilter<"WebhookEvent"> | Date | string
    processedAt?: DateTimeNullableFilter<"WebhookEvent"> | Date | string | null
  }

  export type WebhookEventOrderByWithRelationInput = {
    id?: SortOrder
    provider?: SortOrder
    eventId?: SortOrder
    eventType?: SortOrder
    payload?: SortOrder
    receivedAt?: SortOrder
    processedAt?: SortOrderInput | SortOrder
  }

  export type WebhookEventWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    provider_eventId?: WebhookEventProviderEventIdCompoundUniqueInput
    AND?: WebhookEventWhereInput | WebhookEventWhereInput[]
    OR?: WebhookEventWhereInput[]
    NOT?: WebhookEventWhereInput | WebhookEventWhereInput[]
    provider?: StringFilter<"WebhookEvent"> | string
    eventId?: StringFilter<"WebhookEvent"> | string
    eventType?: StringFilter<"WebhookEvent"> | string
    payload?: JsonFilter<"WebhookEvent">
    receivedAt?: DateTimeFilter<"WebhookEvent"> | Date | string
    processedAt?: DateTimeNullableFilter<"WebhookEvent"> | Date | string | null
  }, "id" | "provider_eventId">

  export type WebhookEventOrderByWithAggregationInput = {
    id?: SortOrder
    provider?: SortOrder
    eventId?: SortOrder
    eventType?: SortOrder
    payload?: SortOrder
    receivedAt?: SortOrder
    processedAt?: SortOrderInput | SortOrder
    _count?: WebhookEventCountOrderByAggregateInput
    _max?: WebhookEventMaxOrderByAggregateInput
    _min?: WebhookEventMinOrderByAggregateInput
  }

  export type WebhookEventScalarWhereWithAggregatesInput = {
    AND?: WebhookEventScalarWhereWithAggregatesInput | WebhookEventScalarWhereWithAggregatesInput[]
    OR?: WebhookEventScalarWhereWithAggregatesInput[]
    NOT?: WebhookEventScalarWhereWithAggregatesInput | WebhookEventScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"WebhookEvent"> | string
    provider?: StringWithAggregatesFilter<"WebhookEvent"> | string
    eventId?: StringWithAggregatesFilter<"WebhookEvent"> | string
    eventType?: StringWithAggregatesFilter<"WebhookEvent"> | string
    payload?: JsonWithAggregatesFilter<"WebhookEvent">
    receivedAt?: DateTimeWithAggregatesFilter<"WebhookEvent"> | Date | string
    processedAt?: DateTimeNullableWithAggregatesFilter<"WebhookEvent"> | Date | string | null
  }

  export type OutboxEventWhereInput = {
    AND?: OutboxEventWhereInput | OutboxEventWhereInput[]
    OR?: OutboxEventWhereInput[]
    NOT?: OutboxEventWhereInput | OutboxEventWhereInput[]
    id?: StringFilter<"OutboxEvent"> | string
    aggregate?: StringFilter<"OutboxEvent"> | string
    aggregateId?: StringFilter<"OutboxEvent"> | string
    eventType?: StringFilter<"OutboxEvent"> | string
    queue?: StringFilter<"OutboxEvent"> | string
    payload?: JsonFilter<"OutboxEvent">
    status?: EnumOutboxStatusFilter<"OutboxEvent"> | $Enums.OutboxStatus
    attempts?: IntFilter<"OutboxEvent"> | number
    lastError?: StringNullableFilter<"OutboxEvent"> | string | null
    createdAt?: DateTimeFilter<"OutboxEvent"> | Date | string
    publishedAt?: DateTimeNullableFilter<"OutboxEvent"> | Date | string | null
    lockedAt?: DateTimeNullableFilter<"OutboxEvent"> | Date | string | null
    lockedBy?: StringNullableFilter<"OutboxEvent"> | string | null
  }

  export type OutboxEventOrderByWithRelationInput = {
    id?: SortOrder
    aggregate?: SortOrder
    aggregateId?: SortOrder
    eventType?: SortOrder
    queue?: SortOrder
    payload?: SortOrder
    status?: SortOrder
    attempts?: SortOrder
    lastError?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    publishedAt?: SortOrderInput | SortOrder
    lockedAt?: SortOrderInput | SortOrder
    lockedBy?: SortOrderInput | SortOrder
  }

  export type OutboxEventWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: OutboxEventWhereInput | OutboxEventWhereInput[]
    OR?: OutboxEventWhereInput[]
    NOT?: OutboxEventWhereInput | OutboxEventWhereInput[]
    aggregate?: StringFilter<"OutboxEvent"> | string
    aggregateId?: StringFilter<"OutboxEvent"> | string
    eventType?: StringFilter<"OutboxEvent"> | string
    queue?: StringFilter<"OutboxEvent"> | string
    payload?: JsonFilter<"OutboxEvent">
    status?: EnumOutboxStatusFilter<"OutboxEvent"> | $Enums.OutboxStatus
    attempts?: IntFilter<"OutboxEvent"> | number
    lastError?: StringNullableFilter<"OutboxEvent"> | string | null
    createdAt?: DateTimeFilter<"OutboxEvent"> | Date | string
    publishedAt?: DateTimeNullableFilter<"OutboxEvent"> | Date | string | null
    lockedAt?: DateTimeNullableFilter<"OutboxEvent"> | Date | string | null
    lockedBy?: StringNullableFilter<"OutboxEvent"> | string | null
  }, "id">

  export type OutboxEventOrderByWithAggregationInput = {
    id?: SortOrder
    aggregate?: SortOrder
    aggregateId?: SortOrder
    eventType?: SortOrder
    queue?: SortOrder
    payload?: SortOrder
    status?: SortOrder
    attempts?: SortOrder
    lastError?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    publishedAt?: SortOrderInput | SortOrder
    lockedAt?: SortOrderInput | SortOrder
    lockedBy?: SortOrderInput | SortOrder
    _count?: OutboxEventCountOrderByAggregateInput
    _avg?: OutboxEventAvgOrderByAggregateInput
    _max?: OutboxEventMaxOrderByAggregateInput
    _min?: OutboxEventMinOrderByAggregateInput
    _sum?: OutboxEventSumOrderByAggregateInput
  }

  export type OutboxEventScalarWhereWithAggregatesInput = {
    AND?: OutboxEventScalarWhereWithAggregatesInput | OutboxEventScalarWhereWithAggregatesInput[]
    OR?: OutboxEventScalarWhereWithAggregatesInput[]
    NOT?: OutboxEventScalarWhereWithAggregatesInput | OutboxEventScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"OutboxEvent"> | string
    aggregate?: StringWithAggregatesFilter<"OutboxEvent"> | string
    aggregateId?: StringWithAggregatesFilter<"OutboxEvent"> | string
    eventType?: StringWithAggregatesFilter<"OutboxEvent"> | string
    queue?: StringWithAggregatesFilter<"OutboxEvent"> | string
    payload?: JsonWithAggregatesFilter<"OutboxEvent">
    status?: EnumOutboxStatusWithAggregatesFilter<"OutboxEvent"> | $Enums.OutboxStatus
    attempts?: IntWithAggregatesFilter<"OutboxEvent"> | number
    lastError?: StringNullableWithAggregatesFilter<"OutboxEvent"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"OutboxEvent"> | Date | string
    publishedAt?: DateTimeNullableWithAggregatesFilter<"OutboxEvent"> | Date | string | null
    lockedAt?: DateTimeNullableWithAggregatesFilter<"OutboxEvent"> | Date | string | null
    lockedBy?: StringNullableWithAggregatesFilter<"OutboxEvent"> | string | null
  }

  export type StockReservationWhereInput = {
    AND?: StockReservationWhereInput | StockReservationWhereInput[]
    OR?: StockReservationWhereInput[]
    NOT?: StockReservationWhereInput | StockReservationWhereInput[]
    id?: StringFilter<"StockReservation"> | string
    orderId?: StringNullableFilter<"StockReservation"> | string | null
    userId?: StringFilter<"StockReservation"> | string
    items?: JsonFilter<"StockReservation">
    status?: EnumStockReservationStatusFilter<"StockReservation"> | $Enums.StockReservationStatus
    createdAt?: DateTimeFilter<"StockReservation"> | Date | string
    updatedAt?: DateTimeFilter<"StockReservation"> | Date | string
  }

  export type StockReservationOrderByWithRelationInput = {
    id?: SortOrder
    orderId?: SortOrderInput | SortOrder
    userId?: SortOrder
    items?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StockReservationWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: StockReservationWhereInput | StockReservationWhereInput[]
    OR?: StockReservationWhereInput[]
    NOT?: StockReservationWhereInput | StockReservationWhereInput[]
    orderId?: StringNullableFilter<"StockReservation"> | string | null
    userId?: StringFilter<"StockReservation"> | string
    items?: JsonFilter<"StockReservation">
    status?: EnumStockReservationStatusFilter<"StockReservation"> | $Enums.StockReservationStatus
    createdAt?: DateTimeFilter<"StockReservation"> | Date | string
    updatedAt?: DateTimeFilter<"StockReservation"> | Date | string
  }, "id">

  export type StockReservationOrderByWithAggregationInput = {
    id?: SortOrder
    orderId?: SortOrderInput | SortOrder
    userId?: SortOrder
    items?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: StockReservationCountOrderByAggregateInput
    _max?: StockReservationMaxOrderByAggregateInput
    _min?: StockReservationMinOrderByAggregateInput
  }

  export type StockReservationScalarWhereWithAggregatesInput = {
    AND?: StockReservationScalarWhereWithAggregatesInput | StockReservationScalarWhereWithAggregatesInput[]
    OR?: StockReservationScalarWhereWithAggregatesInput[]
    NOT?: StockReservationScalarWhereWithAggregatesInput | StockReservationScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"StockReservation"> | string
    orderId?: StringNullableWithAggregatesFilter<"StockReservation"> | string | null
    userId?: StringWithAggregatesFilter<"StockReservation"> | string
    items?: JsonWithAggregatesFilter<"StockReservation">
    status?: EnumStockReservationStatusWithAggregatesFilter<"StockReservation"> | $Enums.StockReservationStatus
    createdAt?: DateTimeWithAggregatesFilter<"StockReservation"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"StockReservation"> | Date | string
  }

  export type ProductCoPurchaseWhereInput = {
    AND?: ProductCoPurchaseWhereInput | ProductCoPurchaseWhereInput[]
    OR?: ProductCoPurchaseWhereInput[]
    NOT?: ProductCoPurchaseWhereInput | ProductCoPurchaseWhereInput[]
    catalogA?: StringFilter<"ProductCoPurchase"> | string
    catalogB?: StringFilter<"ProductCoPurchase"> | string
    orderCount?: IntFilter<"ProductCoPurchase"> | number
    updatedAt?: DateTimeFilter<"ProductCoPurchase"> | Date | string
  }

  export type ProductCoPurchaseOrderByWithRelationInput = {
    catalogA?: SortOrder
    catalogB?: SortOrder
    orderCount?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProductCoPurchaseWhereUniqueInput = Prisma.AtLeast<{
    catalogA_catalogB?: ProductCoPurchaseCatalogACatalogBCompoundUniqueInput
    AND?: ProductCoPurchaseWhereInput | ProductCoPurchaseWhereInput[]
    OR?: ProductCoPurchaseWhereInput[]
    NOT?: ProductCoPurchaseWhereInput | ProductCoPurchaseWhereInput[]
    catalogA?: StringFilter<"ProductCoPurchase"> | string
    catalogB?: StringFilter<"ProductCoPurchase"> | string
    orderCount?: IntFilter<"ProductCoPurchase"> | number
    updatedAt?: DateTimeFilter<"ProductCoPurchase"> | Date | string
  }, "catalogA_catalogB">

  export type ProductCoPurchaseOrderByWithAggregationInput = {
    catalogA?: SortOrder
    catalogB?: SortOrder
    orderCount?: SortOrder
    updatedAt?: SortOrder
    _count?: ProductCoPurchaseCountOrderByAggregateInput
    _avg?: ProductCoPurchaseAvgOrderByAggregateInput
    _max?: ProductCoPurchaseMaxOrderByAggregateInput
    _min?: ProductCoPurchaseMinOrderByAggregateInput
    _sum?: ProductCoPurchaseSumOrderByAggregateInput
  }

  export type ProductCoPurchaseScalarWhereWithAggregatesInput = {
    AND?: ProductCoPurchaseScalarWhereWithAggregatesInput | ProductCoPurchaseScalarWhereWithAggregatesInput[]
    OR?: ProductCoPurchaseScalarWhereWithAggregatesInput[]
    NOT?: ProductCoPurchaseScalarWhereWithAggregatesInput | ProductCoPurchaseScalarWhereWithAggregatesInput[]
    catalogA?: StringWithAggregatesFilter<"ProductCoPurchase"> | string
    catalogB?: StringWithAggregatesFilter<"ProductCoPurchase"> | string
    orderCount?: IntWithAggregatesFilter<"ProductCoPurchase"> | number
    updatedAt?: DateTimeWithAggregatesFilter<"ProductCoPurchase"> | Date | string
  }

  export type ProductOrderStatWhereInput = {
    AND?: ProductOrderStatWhereInput | ProductOrderStatWhereInput[]
    OR?: ProductOrderStatWhereInput[]
    NOT?: ProductOrderStatWhereInput | ProductOrderStatWhereInput[]
    catalogProductId?: StringFilter<"ProductOrderStat"> | string
    orderCount?: IntFilter<"ProductOrderStat"> | number
    updatedAt?: DateTimeFilter<"ProductOrderStat"> | Date | string
  }

  export type ProductOrderStatOrderByWithRelationInput = {
    catalogProductId?: SortOrder
    orderCount?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProductOrderStatWhereUniqueInput = Prisma.AtLeast<{
    catalogProductId?: string
    AND?: ProductOrderStatWhereInput | ProductOrderStatWhereInput[]
    OR?: ProductOrderStatWhereInput[]
    NOT?: ProductOrderStatWhereInput | ProductOrderStatWhereInput[]
    orderCount?: IntFilter<"ProductOrderStat"> | number
    updatedAt?: DateTimeFilter<"ProductOrderStat"> | Date | string
  }, "catalogProductId">

  export type ProductOrderStatOrderByWithAggregationInput = {
    catalogProductId?: SortOrder
    orderCount?: SortOrder
    updatedAt?: SortOrder
    _count?: ProductOrderStatCountOrderByAggregateInput
    _avg?: ProductOrderStatAvgOrderByAggregateInput
    _max?: ProductOrderStatMaxOrderByAggregateInput
    _min?: ProductOrderStatMinOrderByAggregateInput
    _sum?: ProductOrderStatSumOrderByAggregateInput
  }

  export type ProductOrderStatScalarWhereWithAggregatesInput = {
    AND?: ProductOrderStatScalarWhereWithAggregatesInput | ProductOrderStatScalarWhereWithAggregatesInput[]
    OR?: ProductOrderStatScalarWhereWithAggregatesInput[]
    NOT?: ProductOrderStatScalarWhereWithAggregatesInput | ProductOrderStatScalarWhereWithAggregatesInput[]
    catalogProductId?: StringWithAggregatesFilter<"ProductOrderStat"> | string
    orderCount?: IntWithAggregatesFilter<"ProductOrderStat"> | number
    updatedAt?: DateTimeWithAggregatesFilter<"ProductOrderStat"> | Date | string
  }

  export type CoPurchaseStateWhereInput = {
    AND?: CoPurchaseStateWhereInput | CoPurchaseStateWhereInput[]
    OR?: CoPurchaseStateWhereInput[]
    NOT?: CoPurchaseStateWhereInput | CoPurchaseStateWhereInput[]
    id?: StringFilter<"CoPurchaseState"> | string
    lastDeliveredAt?: DateTimeNullableFilter<"CoPurchaseState"> | Date | string | null
    totalOrders?: IntFilter<"CoPurchaseState"> | number
    updatedAt?: DateTimeFilter<"CoPurchaseState"> | Date | string
  }

  export type CoPurchaseStateOrderByWithRelationInput = {
    id?: SortOrder
    lastDeliveredAt?: SortOrderInput | SortOrder
    totalOrders?: SortOrder
    updatedAt?: SortOrder
  }

  export type CoPurchaseStateWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CoPurchaseStateWhereInput | CoPurchaseStateWhereInput[]
    OR?: CoPurchaseStateWhereInput[]
    NOT?: CoPurchaseStateWhereInput | CoPurchaseStateWhereInput[]
    lastDeliveredAt?: DateTimeNullableFilter<"CoPurchaseState"> | Date | string | null
    totalOrders?: IntFilter<"CoPurchaseState"> | number
    updatedAt?: DateTimeFilter<"CoPurchaseState"> | Date | string
  }, "id">

  export type CoPurchaseStateOrderByWithAggregationInput = {
    id?: SortOrder
    lastDeliveredAt?: SortOrderInput | SortOrder
    totalOrders?: SortOrder
    updatedAt?: SortOrder
    _count?: CoPurchaseStateCountOrderByAggregateInput
    _avg?: CoPurchaseStateAvgOrderByAggregateInput
    _max?: CoPurchaseStateMaxOrderByAggregateInput
    _min?: CoPurchaseStateMinOrderByAggregateInput
    _sum?: CoPurchaseStateSumOrderByAggregateInput
  }

  export type CoPurchaseStateScalarWhereWithAggregatesInput = {
    AND?: CoPurchaseStateScalarWhereWithAggregatesInput | CoPurchaseStateScalarWhereWithAggregatesInput[]
    OR?: CoPurchaseStateScalarWhereWithAggregatesInput[]
    NOT?: CoPurchaseStateScalarWhereWithAggregatesInput | CoPurchaseStateScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"CoPurchaseState"> | string
    lastDeliveredAt?: DateTimeNullableWithAggregatesFilter<"CoPurchaseState"> | Date | string | null
    totalOrders?: IntWithAggregatesFilter<"CoPurchaseState"> | number
    updatedAt?: DateTimeWithAggregatesFilter<"CoPurchaseState"> | Date | string
  }

  export type OrderCreateInput = {
    id?: string
    userId: string
    storeId: string
    totalAmount: Decimal | DecimalJsLike | number | string
    discountAmount?: Decimal | DecimalJsLike | number | string
    couponCode?: string | null
    deliverySlot?: string | null
    deliveryName?: string | null
    deliveryPhone?: string | null
    deliveryAddress?: string | null
    deliveryCity?: string | null
    deliveryPincode?: string | null
    deliveryLandmark?: string | null
    deliveryInstructions?: string | null
    deliveryLatitude?: Decimal | DecimalJsLike | number | string | null
    deliveryLongitude?: Decimal | DecimalJsLike | number | string | null
    deliveryCharge?: Decimal | DecimalJsLike | number | string
    billDetails?: NullableJsonNullValueInput | InputJsonValue
    status?: $Enums.OrderStatus
    paymentStatus?: $Enums.PaymentStatus
    paymentMethod?: $Enums.PaymentMethod | null
    paymentRef?: string | null
    riderId?: string | null
    riderStatus?: $Enums.OrderRiderStatus | null
    assignedAt?: Date | string | null
    assignedBy?: string | null
    pickupStartedAt?: Date | string | null
    deliveredAt?: Date | string | null
    preparationPhotos?: NullableJsonNullValueInput | InputJsonValue
    deliveryProofPhotoUrl?: string | null
    deliveryProofPhotoPublicId?: string | null
    deliveryProofUploadedAt?: Date | string | null
    rejectionReason?: string | null
    cancellationReason?: string | null
    cancelledBy?: $Enums.CancelledBy | null
    cancelledAt?: Date | string | null
    refundStatus?: $Enums.RefundStatus
    refundFailureReason?: string | null
    refundFailedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    orderItems?: OrderItemCreateNestedManyWithoutOrderInput
    payments?: PaymentCreateNestedManyWithoutOrderInput
    couponUsages?: CouponUsageCreateNestedManyWithoutOrderInput
  }

  export type OrderUncheckedCreateInput = {
    id?: string
    userId: string
    storeId: string
    totalAmount: Decimal | DecimalJsLike | number | string
    discountAmount?: Decimal | DecimalJsLike | number | string
    couponCode?: string | null
    deliverySlot?: string | null
    deliveryName?: string | null
    deliveryPhone?: string | null
    deliveryAddress?: string | null
    deliveryCity?: string | null
    deliveryPincode?: string | null
    deliveryLandmark?: string | null
    deliveryInstructions?: string | null
    deliveryLatitude?: Decimal | DecimalJsLike | number | string | null
    deliveryLongitude?: Decimal | DecimalJsLike | number | string | null
    deliveryCharge?: Decimal | DecimalJsLike | number | string
    billDetails?: NullableJsonNullValueInput | InputJsonValue
    status?: $Enums.OrderStatus
    paymentStatus?: $Enums.PaymentStatus
    paymentMethod?: $Enums.PaymentMethod | null
    paymentRef?: string | null
    riderId?: string | null
    riderStatus?: $Enums.OrderRiderStatus | null
    assignedAt?: Date | string | null
    assignedBy?: string | null
    pickupStartedAt?: Date | string | null
    deliveredAt?: Date | string | null
    preparationPhotos?: NullableJsonNullValueInput | InputJsonValue
    deliveryProofPhotoUrl?: string | null
    deliveryProofPhotoPublicId?: string | null
    deliveryProofUploadedAt?: Date | string | null
    rejectionReason?: string | null
    cancellationReason?: string | null
    cancelledBy?: $Enums.CancelledBy | null
    cancelledAt?: Date | string | null
    refundStatus?: $Enums.RefundStatus
    refundFailureReason?: string | null
    refundFailedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    orderItems?: OrderItemUncheckedCreateNestedManyWithoutOrderInput
    payments?: PaymentUncheckedCreateNestedManyWithoutOrderInput
    couponUsages?: CouponUsageUncheckedCreateNestedManyWithoutOrderInput
  }

  export type OrderUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    storeId?: StringFieldUpdateOperationsInput | string
    totalAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    discountAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    couponCode?: NullableStringFieldUpdateOperationsInput | string | null
    deliverySlot?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryName?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryPhone?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryAddress?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryCity?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryPincode?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryLandmark?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryInstructions?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryLatitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    deliveryLongitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    deliveryCharge?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    billDetails?: NullableJsonNullValueInput | InputJsonValue
    status?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    paymentStatus?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    paymentMethod?: NullableEnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod | null
    paymentRef?: NullableStringFieldUpdateOperationsInput | string | null
    riderId?: NullableStringFieldUpdateOperationsInput | string | null
    riderStatus?: NullableEnumOrderRiderStatusFieldUpdateOperationsInput | $Enums.OrderRiderStatus | null
    assignedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    assignedBy?: NullableStringFieldUpdateOperationsInput | string | null
    pickupStartedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deliveredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    preparationPhotos?: NullableJsonNullValueInput | InputJsonValue
    deliveryProofPhotoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryProofPhotoPublicId?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryProofUploadedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    cancellationReason?: NullableStringFieldUpdateOperationsInput | string | null
    cancelledBy?: NullableEnumCancelledByFieldUpdateOperationsInput | $Enums.CancelledBy | null
    cancelledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    refundStatus?: EnumRefundStatusFieldUpdateOperationsInput | $Enums.RefundStatus
    refundFailureReason?: NullableStringFieldUpdateOperationsInput | string | null
    refundFailedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orderItems?: OrderItemUpdateManyWithoutOrderNestedInput
    payments?: PaymentUpdateManyWithoutOrderNestedInput
    couponUsages?: CouponUsageUpdateManyWithoutOrderNestedInput
  }

  export type OrderUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    storeId?: StringFieldUpdateOperationsInput | string
    totalAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    discountAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    couponCode?: NullableStringFieldUpdateOperationsInput | string | null
    deliverySlot?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryName?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryPhone?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryAddress?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryCity?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryPincode?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryLandmark?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryInstructions?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryLatitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    deliveryLongitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    deliveryCharge?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    billDetails?: NullableJsonNullValueInput | InputJsonValue
    status?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    paymentStatus?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    paymentMethod?: NullableEnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod | null
    paymentRef?: NullableStringFieldUpdateOperationsInput | string | null
    riderId?: NullableStringFieldUpdateOperationsInput | string | null
    riderStatus?: NullableEnumOrderRiderStatusFieldUpdateOperationsInput | $Enums.OrderRiderStatus | null
    assignedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    assignedBy?: NullableStringFieldUpdateOperationsInput | string | null
    pickupStartedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deliveredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    preparationPhotos?: NullableJsonNullValueInput | InputJsonValue
    deliveryProofPhotoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryProofPhotoPublicId?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryProofUploadedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    cancellationReason?: NullableStringFieldUpdateOperationsInput | string | null
    cancelledBy?: NullableEnumCancelledByFieldUpdateOperationsInput | $Enums.CancelledBy | null
    cancelledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    refundStatus?: EnumRefundStatusFieldUpdateOperationsInput | $Enums.RefundStatus
    refundFailureReason?: NullableStringFieldUpdateOperationsInput | string | null
    refundFailedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orderItems?: OrderItemUncheckedUpdateManyWithoutOrderNestedInput
    payments?: PaymentUncheckedUpdateManyWithoutOrderNestedInput
    couponUsages?: CouponUsageUncheckedUpdateManyWithoutOrderNestedInput
  }

  export type OrderCreateManyInput = {
    id?: string
    userId: string
    storeId: string
    totalAmount: Decimal | DecimalJsLike | number | string
    discountAmount?: Decimal | DecimalJsLike | number | string
    couponCode?: string | null
    deliverySlot?: string | null
    deliveryName?: string | null
    deliveryPhone?: string | null
    deliveryAddress?: string | null
    deliveryCity?: string | null
    deliveryPincode?: string | null
    deliveryLandmark?: string | null
    deliveryInstructions?: string | null
    deliveryLatitude?: Decimal | DecimalJsLike | number | string | null
    deliveryLongitude?: Decimal | DecimalJsLike | number | string | null
    deliveryCharge?: Decimal | DecimalJsLike | number | string
    billDetails?: NullableJsonNullValueInput | InputJsonValue
    status?: $Enums.OrderStatus
    paymentStatus?: $Enums.PaymentStatus
    paymentMethod?: $Enums.PaymentMethod | null
    paymentRef?: string | null
    riderId?: string | null
    riderStatus?: $Enums.OrderRiderStatus | null
    assignedAt?: Date | string | null
    assignedBy?: string | null
    pickupStartedAt?: Date | string | null
    deliveredAt?: Date | string | null
    preparationPhotos?: NullableJsonNullValueInput | InputJsonValue
    deliveryProofPhotoUrl?: string | null
    deliveryProofPhotoPublicId?: string | null
    deliveryProofUploadedAt?: Date | string | null
    rejectionReason?: string | null
    cancellationReason?: string | null
    cancelledBy?: $Enums.CancelledBy | null
    cancelledAt?: Date | string | null
    refundStatus?: $Enums.RefundStatus
    refundFailureReason?: string | null
    refundFailedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OrderUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    storeId?: StringFieldUpdateOperationsInput | string
    totalAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    discountAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    couponCode?: NullableStringFieldUpdateOperationsInput | string | null
    deliverySlot?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryName?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryPhone?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryAddress?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryCity?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryPincode?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryLandmark?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryInstructions?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryLatitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    deliveryLongitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    deliveryCharge?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    billDetails?: NullableJsonNullValueInput | InputJsonValue
    status?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    paymentStatus?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    paymentMethod?: NullableEnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod | null
    paymentRef?: NullableStringFieldUpdateOperationsInput | string | null
    riderId?: NullableStringFieldUpdateOperationsInput | string | null
    riderStatus?: NullableEnumOrderRiderStatusFieldUpdateOperationsInput | $Enums.OrderRiderStatus | null
    assignedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    assignedBy?: NullableStringFieldUpdateOperationsInput | string | null
    pickupStartedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deliveredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    preparationPhotos?: NullableJsonNullValueInput | InputJsonValue
    deliveryProofPhotoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryProofPhotoPublicId?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryProofUploadedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    cancellationReason?: NullableStringFieldUpdateOperationsInput | string | null
    cancelledBy?: NullableEnumCancelledByFieldUpdateOperationsInput | $Enums.CancelledBy | null
    cancelledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    refundStatus?: EnumRefundStatusFieldUpdateOperationsInput | $Enums.RefundStatus
    refundFailureReason?: NullableStringFieldUpdateOperationsInput | string | null
    refundFailedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrderUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    storeId?: StringFieldUpdateOperationsInput | string
    totalAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    discountAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    couponCode?: NullableStringFieldUpdateOperationsInput | string | null
    deliverySlot?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryName?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryPhone?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryAddress?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryCity?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryPincode?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryLandmark?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryInstructions?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryLatitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    deliveryLongitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    deliveryCharge?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    billDetails?: NullableJsonNullValueInput | InputJsonValue
    status?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    paymentStatus?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    paymentMethod?: NullableEnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod | null
    paymentRef?: NullableStringFieldUpdateOperationsInput | string | null
    riderId?: NullableStringFieldUpdateOperationsInput | string | null
    riderStatus?: NullableEnumOrderRiderStatusFieldUpdateOperationsInput | $Enums.OrderRiderStatus | null
    assignedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    assignedBy?: NullableStringFieldUpdateOperationsInput | string | null
    pickupStartedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deliveredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    preparationPhotos?: NullableJsonNullValueInput | InputJsonValue
    deliveryProofPhotoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryProofPhotoPublicId?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryProofUploadedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    cancellationReason?: NullableStringFieldUpdateOperationsInput | string | null
    cancelledBy?: NullableEnumCancelledByFieldUpdateOperationsInput | $Enums.CancelledBy | null
    cancelledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    refundStatus?: EnumRefundStatusFieldUpdateOperationsInput | $Enums.RefundStatus
    refundFailureReason?: NullableStringFieldUpdateOperationsInput | string | null
    refundFailedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrderItemCreateInput = {
    id?: string
    productId: string
    catalogProductId?: string | null
    quantity: number
    price: Decimal | DecimalJsLike | number | string
    selectedOptions?: NullableJsonNullValueInput | InputJsonValue
    order: OrderCreateNestedOneWithoutOrderItemsInput
  }

  export type OrderItemUncheckedCreateInput = {
    id?: string
    orderId: string
    productId: string
    catalogProductId?: string | null
    quantity: number
    price: Decimal | DecimalJsLike | number | string
    selectedOptions?: NullableJsonNullValueInput | InputJsonValue
  }

  export type OrderItemUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    catalogProductId?: NullableStringFieldUpdateOperationsInput | string | null
    quantity?: IntFieldUpdateOperationsInput | number
    price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    selectedOptions?: NullableJsonNullValueInput | InputJsonValue
    order?: OrderUpdateOneRequiredWithoutOrderItemsNestedInput
  }

  export type OrderItemUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    catalogProductId?: NullableStringFieldUpdateOperationsInput | string | null
    quantity?: IntFieldUpdateOperationsInput | number
    price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    selectedOptions?: NullableJsonNullValueInput | InputJsonValue
  }

  export type OrderItemCreateManyInput = {
    id?: string
    orderId: string
    productId: string
    catalogProductId?: string | null
    quantity: number
    price: Decimal | DecimalJsLike | number | string
    selectedOptions?: NullableJsonNullValueInput | InputJsonValue
  }

  export type OrderItemUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    catalogProductId?: NullableStringFieldUpdateOperationsInput | string | null
    quantity?: IntFieldUpdateOperationsInput | number
    price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    selectedOptions?: NullableJsonNullValueInput | InputJsonValue
  }

  export type OrderItemUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    catalogProductId?: NullableStringFieldUpdateOperationsInput | string | null
    quantity?: IntFieldUpdateOperationsInput | number
    price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    selectedOptions?: NullableJsonNullValueInput | InputJsonValue
  }

  export type PaymentCreateInput = {
    id?: string
    amount: Decimal | DecimalJsLike | number | string
    status?: $Enums.PaymentStatus
    method: $Enums.PaymentMethod
    transactionId?: string | null
    gatewayOrderId?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    order: OrderCreateNestedOneWithoutPaymentsInput
  }

  export type PaymentUncheckedCreateInput = {
    id?: string
    orderId: string
    amount: Decimal | DecimalJsLike | number | string
    status?: $Enums.PaymentStatus
    method: $Enums.PaymentMethod
    transactionId?: string | null
    gatewayOrderId?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PaymentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    method?: EnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod
    transactionId?: NullableStringFieldUpdateOperationsInput | string | null
    gatewayOrderId?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    order?: OrderUpdateOneRequiredWithoutPaymentsNestedInput
  }

  export type PaymentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    method?: EnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod
    transactionId?: NullableStringFieldUpdateOperationsInput | string | null
    gatewayOrderId?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PaymentCreateManyInput = {
    id?: string
    orderId: string
    amount: Decimal | DecimalJsLike | number | string
    status?: $Enums.PaymentStatus
    method: $Enums.PaymentMethod
    transactionId?: string | null
    gatewayOrderId?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PaymentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    method?: EnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod
    transactionId?: NullableStringFieldUpdateOperationsInput | string | null
    gatewayOrderId?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PaymentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    method?: EnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod
    transactionId?: NullableStringFieldUpdateOperationsInput | string | null
    gatewayOrderId?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CouponUsageCreateInput = {
    id?: string
    couponId: string
    userId: string
    createdAt?: Date | string
    order: OrderCreateNestedOneWithoutCouponUsagesInput
  }

  export type CouponUsageUncheckedCreateInput = {
    id?: string
    couponId: string
    userId: string
    orderId: string
    createdAt?: Date | string
  }

  export type CouponUsageUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    couponId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    order?: OrderUpdateOneRequiredWithoutCouponUsagesNestedInput
  }

  export type CouponUsageUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    couponId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CouponUsageCreateManyInput = {
    id?: string
    couponId: string
    userId: string
    orderId: string
    createdAt?: Date | string
  }

  export type CouponUsageUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    couponId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CouponUsageUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    couponId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NotificationCreateInput = {
    id?: string
    userId: string
    title: string
    message: string
    type?: string
    category?: string | null
    isRead?: boolean
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type NotificationUncheckedCreateInput = {
    id?: string
    userId: string
    title: string
    message: string
    type?: string
    category?: string | null
    isRead?: boolean
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type NotificationUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    category?: NullableStringFieldUpdateOperationsInput | string | null
    isRead?: BoolFieldUpdateOperationsInput | boolean
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NotificationUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    category?: NullableStringFieldUpdateOperationsInput | string | null
    isRead?: BoolFieldUpdateOperationsInput | boolean
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NotificationCreateManyInput = {
    id?: string
    userId: string
    title: string
    message: string
    type?: string
    category?: string | null
    isRead?: boolean
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type NotificationUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    category?: NullableStringFieldUpdateOperationsInput | string | null
    isRead?: BoolFieldUpdateOperationsInput | boolean
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NotificationUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    category?: NullableStringFieldUpdateOperationsInput | string | null
    isRead?: BoolFieldUpdateOperationsInput | boolean
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditLogCreateInput = {
    id?: string
    entityType: $Enums.AuditEntityType
    entityId: string
    action: string
    actorId?: string | null
    actorType?: $Enums.ActorType | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type AuditLogUncheckedCreateInput = {
    id?: string
    entityType: $Enums.AuditEntityType
    entityId: string
    action: string
    actorId?: string | null
    actorType?: $Enums.ActorType | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type AuditLogUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    entityType?: EnumAuditEntityTypeFieldUpdateOperationsInput | $Enums.AuditEntityType
    entityId?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    actorId?: NullableStringFieldUpdateOperationsInput | string | null
    actorType?: NullableEnumActorTypeFieldUpdateOperationsInput | $Enums.ActorType | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditLogUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    entityType?: EnumAuditEntityTypeFieldUpdateOperationsInput | $Enums.AuditEntityType
    entityId?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    actorId?: NullableStringFieldUpdateOperationsInput | string | null
    actorType?: NullableEnumActorTypeFieldUpdateOperationsInput | $Enums.ActorType | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditLogCreateManyInput = {
    id?: string
    entityType: $Enums.AuditEntityType
    entityId: string
    action: string
    actorId?: string | null
    actorType?: $Enums.ActorType | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type AuditLogUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    entityType?: EnumAuditEntityTypeFieldUpdateOperationsInput | $Enums.AuditEntityType
    entityId?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    actorId?: NullableStringFieldUpdateOperationsInput | string | null
    actorType?: NullableEnumActorTypeFieldUpdateOperationsInput | $Enums.ActorType | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditLogUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    entityType?: EnumAuditEntityTypeFieldUpdateOperationsInput | $Enums.AuditEntityType
    entityId?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    actorId?: NullableStringFieldUpdateOperationsInput | string | null
    actorType?: NullableEnumActorTypeFieldUpdateOperationsInput | $Enums.ActorType | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WebhookEventCreateInput = {
    id?: string
    provider: string
    eventId: string
    eventType: string
    payload: JsonNullValueInput | InputJsonValue
    receivedAt?: Date | string
    processedAt?: Date | string | null
  }

  export type WebhookEventUncheckedCreateInput = {
    id?: string
    provider: string
    eventId: string
    eventType: string
    payload: JsonNullValueInput | InputJsonValue
    receivedAt?: Date | string
    processedAt?: Date | string | null
  }

  export type WebhookEventUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    eventId?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    payload?: JsonNullValueInput | InputJsonValue
    receivedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type WebhookEventUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    eventId?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    payload?: JsonNullValueInput | InputJsonValue
    receivedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type WebhookEventCreateManyInput = {
    id?: string
    provider: string
    eventId: string
    eventType: string
    payload: JsonNullValueInput | InputJsonValue
    receivedAt?: Date | string
    processedAt?: Date | string | null
  }

  export type WebhookEventUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    eventId?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    payload?: JsonNullValueInput | InputJsonValue
    receivedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type WebhookEventUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    eventId?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    payload?: JsonNullValueInput | InputJsonValue
    receivedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type OutboxEventCreateInput = {
    id?: string
    aggregate: string
    aggregateId: string
    eventType: string
    queue: string
    payload: JsonNullValueInput | InputJsonValue
    status?: $Enums.OutboxStatus
    attempts?: number
    lastError?: string | null
    createdAt?: Date | string
    publishedAt?: Date | string | null
    lockedAt?: Date | string | null
    lockedBy?: string | null
  }

  export type OutboxEventUncheckedCreateInput = {
    id?: string
    aggregate: string
    aggregateId: string
    eventType: string
    queue: string
    payload: JsonNullValueInput | InputJsonValue
    status?: $Enums.OutboxStatus
    attempts?: number
    lastError?: string | null
    createdAt?: Date | string
    publishedAt?: Date | string | null
    lockedAt?: Date | string | null
    lockedBy?: string | null
  }

  export type OutboxEventUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    aggregate?: StringFieldUpdateOperationsInput | string
    aggregateId?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    queue?: StringFieldUpdateOperationsInput | string
    payload?: JsonNullValueInput | InputJsonValue
    status?: EnumOutboxStatusFieldUpdateOperationsInput | $Enums.OutboxStatus
    attempts?: IntFieldUpdateOperationsInput | number
    lastError?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lockedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lockedBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type OutboxEventUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    aggregate?: StringFieldUpdateOperationsInput | string
    aggregateId?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    queue?: StringFieldUpdateOperationsInput | string
    payload?: JsonNullValueInput | InputJsonValue
    status?: EnumOutboxStatusFieldUpdateOperationsInput | $Enums.OutboxStatus
    attempts?: IntFieldUpdateOperationsInput | number
    lastError?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lockedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lockedBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type OutboxEventCreateManyInput = {
    id?: string
    aggregate: string
    aggregateId: string
    eventType: string
    queue: string
    payload: JsonNullValueInput | InputJsonValue
    status?: $Enums.OutboxStatus
    attempts?: number
    lastError?: string | null
    createdAt?: Date | string
    publishedAt?: Date | string | null
    lockedAt?: Date | string | null
    lockedBy?: string | null
  }

  export type OutboxEventUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    aggregate?: StringFieldUpdateOperationsInput | string
    aggregateId?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    queue?: StringFieldUpdateOperationsInput | string
    payload?: JsonNullValueInput | InputJsonValue
    status?: EnumOutboxStatusFieldUpdateOperationsInput | $Enums.OutboxStatus
    attempts?: IntFieldUpdateOperationsInput | number
    lastError?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lockedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lockedBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type OutboxEventUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    aggregate?: StringFieldUpdateOperationsInput | string
    aggregateId?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    queue?: StringFieldUpdateOperationsInput | string
    payload?: JsonNullValueInput | InputJsonValue
    status?: EnumOutboxStatusFieldUpdateOperationsInput | $Enums.OutboxStatus
    attempts?: IntFieldUpdateOperationsInput | number
    lastError?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lockedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lockedBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type StockReservationCreateInput = {
    id?: string
    orderId?: string | null
    userId: string
    items: JsonNullValueInput | InputJsonValue
    status?: $Enums.StockReservationStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type StockReservationUncheckedCreateInput = {
    id?: string
    orderId?: string | null
    userId: string
    items: JsonNullValueInput | InputJsonValue
    status?: $Enums.StockReservationStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type StockReservationUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderId?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: StringFieldUpdateOperationsInput | string
    items?: JsonNullValueInput | InputJsonValue
    status?: EnumStockReservationStatusFieldUpdateOperationsInput | $Enums.StockReservationStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StockReservationUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderId?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: StringFieldUpdateOperationsInput | string
    items?: JsonNullValueInput | InputJsonValue
    status?: EnumStockReservationStatusFieldUpdateOperationsInput | $Enums.StockReservationStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StockReservationCreateManyInput = {
    id?: string
    orderId?: string | null
    userId: string
    items: JsonNullValueInput | InputJsonValue
    status?: $Enums.StockReservationStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type StockReservationUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderId?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: StringFieldUpdateOperationsInput | string
    items?: JsonNullValueInput | InputJsonValue
    status?: EnumStockReservationStatusFieldUpdateOperationsInput | $Enums.StockReservationStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StockReservationUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderId?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: StringFieldUpdateOperationsInput | string
    items?: JsonNullValueInput | InputJsonValue
    status?: EnumStockReservationStatusFieldUpdateOperationsInput | $Enums.StockReservationStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductCoPurchaseCreateInput = {
    catalogA: string
    catalogB: string
    orderCount?: number
    updatedAt?: Date | string
  }

  export type ProductCoPurchaseUncheckedCreateInput = {
    catalogA: string
    catalogB: string
    orderCount?: number
    updatedAt?: Date | string
  }

  export type ProductCoPurchaseUpdateInput = {
    catalogA?: StringFieldUpdateOperationsInput | string
    catalogB?: StringFieldUpdateOperationsInput | string
    orderCount?: IntFieldUpdateOperationsInput | number
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductCoPurchaseUncheckedUpdateInput = {
    catalogA?: StringFieldUpdateOperationsInput | string
    catalogB?: StringFieldUpdateOperationsInput | string
    orderCount?: IntFieldUpdateOperationsInput | number
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductCoPurchaseCreateManyInput = {
    catalogA: string
    catalogB: string
    orderCount?: number
    updatedAt?: Date | string
  }

  export type ProductCoPurchaseUpdateManyMutationInput = {
    catalogA?: StringFieldUpdateOperationsInput | string
    catalogB?: StringFieldUpdateOperationsInput | string
    orderCount?: IntFieldUpdateOperationsInput | number
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductCoPurchaseUncheckedUpdateManyInput = {
    catalogA?: StringFieldUpdateOperationsInput | string
    catalogB?: StringFieldUpdateOperationsInput | string
    orderCount?: IntFieldUpdateOperationsInput | number
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductOrderStatCreateInput = {
    catalogProductId: string
    orderCount?: number
    updatedAt?: Date | string
  }

  export type ProductOrderStatUncheckedCreateInput = {
    catalogProductId: string
    orderCount?: number
    updatedAt?: Date | string
  }

  export type ProductOrderStatUpdateInput = {
    catalogProductId?: StringFieldUpdateOperationsInput | string
    orderCount?: IntFieldUpdateOperationsInput | number
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductOrderStatUncheckedUpdateInput = {
    catalogProductId?: StringFieldUpdateOperationsInput | string
    orderCount?: IntFieldUpdateOperationsInput | number
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductOrderStatCreateManyInput = {
    catalogProductId: string
    orderCount?: number
    updatedAt?: Date | string
  }

  export type ProductOrderStatUpdateManyMutationInput = {
    catalogProductId?: StringFieldUpdateOperationsInput | string
    orderCount?: IntFieldUpdateOperationsInput | number
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductOrderStatUncheckedUpdateManyInput = {
    catalogProductId?: StringFieldUpdateOperationsInput | string
    orderCount?: IntFieldUpdateOperationsInput | number
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CoPurchaseStateCreateInput = {
    id?: string
    lastDeliveredAt?: Date | string | null
    totalOrders?: number
    updatedAt?: Date | string
  }

  export type CoPurchaseStateUncheckedCreateInput = {
    id?: string
    lastDeliveredAt?: Date | string | null
    totalOrders?: number
    updatedAt?: Date | string
  }

  export type CoPurchaseStateUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    lastDeliveredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalOrders?: IntFieldUpdateOperationsInput | number
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CoPurchaseStateUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    lastDeliveredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalOrders?: IntFieldUpdateOperationsInput | number
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CoPurchaseStateCreateManyInput = {
    id?: string
    lastDeliveredAt?: Date | string | null
    totalOrders?: number
    updatedAt?: Date | string
  }

  export type CoPurchaseStateUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    lastDeliveredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalOrders?: IntFieldUpdateOperationsInput | number
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CoPurchaseStateUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    lastDeliveredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalOrders?: IntFieldUpdateOperationsInput | number
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

  export type DecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
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
  }

  export type DecimalNullableFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
  }
  export type JsonNullableFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type EnumOrderStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.OrderStatus | EnumOrderStatusFieldRefInput<$PrismaModel>
    in?: $Enums.OrderStatus[] | ListEnumOrderStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.OrderStatus[] | ListEnumOrderStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumOrderStatusFilter<$PrismaModel> | $Enums.OrderStatus
  }

  export type EnumPaymentStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.PaymentStatus | EnumPaymentStatusFieldRefInput<$PrismaModel>
    in?: $Enums.PaymentStatus[] | ListEnumPaymentStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.PaymentStatus[] | ListEnumPaymentStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumPaymentStatusFilter<$PrismaModel> | $Enums.PaymentStatus
  }

  export type EnumPaymentMethodNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.PaymentMethod | EnumPaymentMethodFieldRefInput<$PrismaModel> | null
    in?: $Enums.PaymentMethod[] | ListEnumPaymentMethodFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.PaymentMethod[] | ListEnumPaymentMethodFieldRefInput<$PrismaModel> | null
    not?: NestedEnumPaymentMethodNullableFilter<$PrismaModel> | $Enums.PaymentMethod | null
  }

  export type EnumOrderRiderStatusNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.OrderRiderStatus | EnumOrderRiderStatusFieldRefInput<$PrismaModel> | null
    in?: $Enums.OrderRiderStatus[] | ListEnumOrderRiderStatusFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.OrderRiderStatus[] | ListEnumOrderRiderStatusFieldRefInput<$PrismaModel> | null
    not?: NestedEnumOrderRiderStatusNullableFilter<$PrismaModel> | $Enums.OrderRiderStatus | null
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
  }

  export type EnumCancelledByNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.CancelledBy | EnumCancelledByFieldRefInput<$PrismaModel> | null
    in?: $Enums.CancelledBy[] | ListEnumCancelledByFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.CancelledBy[] | ListEnumCancelledByFieldRefInput<$PrismaModel> | null
    not?: NestedEnumCancelledByNullableFilter<$PrismaModel> | $Enums.CancelledBy | null
  }

  export type EnumRefundStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.RefundStatus | EnumRefundStatusFieldRefInput<$PrismaModel>
    in?: $Enums.RefundStatus[] | ListEnumRefundStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.RefundStatus[] | ListEnumRefundStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumRefundStatusFilter<$PrismaModel> | $Enums.RefundStatus
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

  export type OrderItemListRelationFilter = {
    every?: OrderItemWhereInput
    some?: OrderItemWhereInput
    none?: OrderItemWhereInput
  }

  export type PaymentListRelationFilter = {
    every?: PaymentWhereInput
    some?: PaymentWhereInput
    none?: PaymentWhereInput
  }

  export type CouponUsageListRelationFilter = {
    every?: CouponUsageWhereInput
    some?: CouponUsageWhereInput
    none?: CouponUsageWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type OrderItemOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PaymentOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CouponUsageOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type OrderCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    storeId?: SortOrder
    totalAmount?: SortOrder
    discountAmount?: SortOrder
    couponCode?: SortOrder
    deliverySlot?: SortOrder
    deliveryName?: SortOrder
    deliveryPhone?: SortOrder
    deliveryAddress?: SortOrder
    deliveryCity?: SortOrder
    deliveryPincode?: SortOrder
    deliveryLandmark?: SortOrder
    deliveryInstructions?: SortOrder
    deliveryLatitude?: SortOrder
    deliveryLongitude?: SortOrder
    deliveryCharge?: SortOrder
    billDetails?: SortOrder
    status?: SortOrder
    paymentStatus?: SortOrder
    paymentMethod?: SortOrder
    paymentRef?: SortOrder
    riderId?: SortOrder
    riderStatus?: SortOrder
    assignedAt?: SortOrder
    assignedBy?: SortOrder
    pickupStartedAt?: SortOrder
    deliveredAt?: SortOrder
    preparationPhotos?: SortOrder
    deliveryProofPhotoUrl?: SortOrder
    deliveryProofPhotoPublicId?: SortOrder
    deliveryProofUploadedAt?: SortOrder
    rejectionReason?: SortOrder
    cancellationReason?: SortOrder
    cancelledBy?: SortOrder
    cancelledAt?: SortOrder
    refundStatus?: SortOrder
    refundFailureReason?: SortOrder
    refundFailedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OrderAvgOrderByAggregateInput = {
    totalAmount?: SortOrder
    discountAmount?: SortOrder
    deliveryLatitude?: SortOrder
    deliveryLongitude?: SortOrder
    deliveryCharge?: SortOrder
  }

  export type OrderMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    storeId?: SortOrder
    totalAmount?: SortOrder
    discountAmount?: SortOrder
    couponCode?: SortOrder
    deliverySlot?: SortOrder
    deliveryName?: SortOrder
    deliveryPhone?: SortOrder
    deliveryAddress?: SortOrder
    deliveryCity?: SortOrder
    deliveryPincode?: SortOrder
    deliveryLandmark?: SortOrder
    deliveryInstructions?: SortOrder
    deliveryLatitude?: SortOrder
    deliveryLongitude?: SortOrder
    deliveryCharge?: SortOrder
    status?: SortOrder
    paymentStatus?: SortOrder
    paymentMethod?: SortOrder
    paymentRef?: SortOrder
    riderId?: SortOrder
    riderStatus?: SortOrder
    assignedAt?: SortOrder
    assignedBy?: SortOrder
    pickupStartedAt?: SortOrder
    deliveredAt?: SortOrder
    deliveryProofPhotoUrl?: SortOrder
    deliveryProofPhotoPublicId?: SortOrder
    deliveryProofUploadedAt?: SortOrder
    rejectionReason?: SortOrder
    cancellationReason?: SortOrder
    cancelledBy?: SortOrder
    cancelledAt?: SortOrder
    refundStatus?: SortOrder
    refundFailureReason?: SortOrder
    refundFailedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OrderMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    storeId?: SortOrder
    totalAmount?: SortOrder
    discountAmount?: SortOrder
    couponCode?: SortOrder
    deliverySlot?: SortOrder
    deliveryName?: SortOrder
    deliveryPhone?: SortOrder
    deliveryAddress?: SortOrder
    deliveryCity?: SortOrder
    deliveryPincode?: SortOrder
    deliveryLandmark?: SortOrder
    deliveryInstructions?: SortOrder
    deliveryLatitude?: SortOrder
    deliveryLongitude?: SortOrder
    deliveryCharge?: SortOrder
    status?: SortOrder
    paymentStatus?: SortOrder
    paymentMethod?: SortOrder
    paymentRef?: SortOrder
    riderId?: SortOrder
    riderStatus?: SortOrder
    assignedAt?: SortOrder
    assignedBy?: SortOrder
    pickupStartedAt?: SortOrder
    deliveredAt?: SortOrder
    deliveryProofPhotoUrl?: SortOrder
    deliveryProofPhotoPublicId?: SortOrder
    deliveryProofUploadedAt?: SortOrder
    rejectionReason?: SortOrder
    cancellationReason?: SortOrder
    cancelledBy?: SortOrder
    cancelledAt?: SortOrder
    refundStatus?: SortOrder
    refundFailureReason?: SortOrder
    refundFailedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OrderSumOrderByAggregateInput = {
    totalAmount?: SortOrder
    discountAmount?: SortOrder
    deliveryLatitude?: SortOrder
    deliveryLongitude?: SortOrder
    deliveryCharge?: SortOrder
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

  export type DecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
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
  }

  export type DecimalNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedDecimalNullableFilter<$PrismaModel>
    _sum?: NestedDecimalNullableFilter<$PrismaModel>
    _min?: NestedDecimalNullableFilter<$PrismaModel>
    _max?: NestedDecimalNullableFilter<$PrismaModel>
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type EnumOrderStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OrderStatus | EnumOrderStatusFieldRefInput<$PrismaModel>
    in?: $Enums.OrderStatus[] | ListEnumOrderStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.OrderStatus[] | ListEnumOrderStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumOrderStatusWithAggregatesFilter<$PrismaModel> | $Enums.OrderStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumOrderStatusFilter<$PrismaModel>
    _max?: NestedEnumOrderStatusFilter<$PrismaModel>
  }

  export type EnumPaymentStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PaymentStatus | EnumPaymentStatusFieldRefInput<$PrismaModel>
    in?: $Enums.PaymentStatus[] | ListEnumPaymentStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.PaymentStatus[] | ListEnumPaymentStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumPaymentStatusWithAggregatesFilter<$PrismaModel> | $Enums.PaymentStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPaymentStatusFilter<$PrismaModel>
    _max?: NestedEnumPaymentStatusFilter<$PrismaModel>
  }

  export type EnumPaymentMethodNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PaymentMethod | EnumPaymentMethodFieldRefInput<$PrismaModel> | null
    in?: $Enums.PaymentMethod[] | ListEnumPaymentMethodFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.PaymentMethod[] | ListEnumPaymentMethodFieldRefInput<$PrismaModel> | null
    not?: NestedEnumPaymentMethodNullableWithAggregatesFilter<$PrismaModel> | $Enums.PaymentMethod | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumPaymentMethodNullableFilter<$PrismaModel>
    _max?: NestedEnumPaymentMethodNullableFilter<$PrismaModel>
  }

  export type EnumOrderRiderStatusNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OrderRiderStatus | EnumOrderRiderStatusFieldRefInput<$PrismaModel> | null
    in?: $Enums.OrderRiderStatus[] | ListEnumOrderRiderStatusFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.OrderRiderStatus[] | ListEnumOrderRiderStatusFieldRefInput<$PrismaModel> | null
    not?: NestedEnumOrderRiderStatusNullableWithAggregatesFilter<$PrismaModel> | $Enums.OrderRiderStatus | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumOrderRiderStatusNullableFilter<$PrismaModel>
    _max?: NestedEnumOrderRiderStatusNullableFilter<$PrismaModel>
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
  }

  export type EnumCancelledByNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CancelledBy | EnumCancelledByFieldRefInput<$PrismaModel> | null
    in?: $Enums.CancelledBy[] | ListEnumCancelledByFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.CancelledBy[] | ListEnumCancelledByFieldRefInput<$PrismaModel> | null
    not?: NestedEnumCancelledByNullableWithAggregatesFilter<$PrismaModel> | $Enums.CancelledBy | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumCancelledByNullableFilter<$PrismaModel>
    _max?: NestedEnumCancelledByNullableFilter<$PrismaModel>
  }

  export type EnumRefundStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RefundStatus | EnumRefundStatusFieldRefInput<$PrismaModel>
    in?: $Enums.RefundStatus[] | ListEnumRefundStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.RefundStatus[] | ListEnumRefundStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumRefundStatusWithAggregatesFilter<$PrismaModel> | $Enums.RefundStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRefundStatusFilter<$PrismaModel>
    _max?: NestedEnumRefundStatusFilter<$PrismaModel>
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

  export type OrderRelationFilter = {
    is?: OrderWhereInput
    isNot?: OrderWhereInput
  }

  export type OrderItemCountOrderByAggregateInput = {
    id?: SortOrder
    orderId?: SortOrder
    productId?: SortOrder
    catalogProductId?: SortOrder
    quantity?: SortOrder
    price?: SortOrder
    selectedOptions?: SortOrder
  }

  export type OrderItemAvgOrderByAggregateInput = {
    quantity?: SortOrder
    price?: SortOrder
  }

  export type OrderItemMaxOrderByAggregateInput = {
    id?: SortOrder
    orderId?: SortOrder
    productId?: SortOrder
    catalogProductId?: SortOrder
    quantity?: SortOrder
    price?: SortOrder
  }

  export type OrderItemMinOrderByAggregateInput = {
    id?: SortOrder
    orderId?: SortOrder
    productId?: SortOrder
    catalogProductId?: SortOrder
    quantity?: SortOrder
    price?: SortOrder
  }

  export type OrderItemSumOrderByAggregateInput = {
    quantity?: SortOrder
    price?: SortOrder
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

  export type EnumPaymentMethodFilter<$PrismaModel = never> = {
    equals?: $Enums.PaymentMethod | EnumPaymentMethodFieldRefInput<$PrismaModel>
    in?: $Enums.PaymentMethod[] | ListEnumPaymentMethodFieldRefInput<$PrismaModel>
    notIn?: $Enums.PaymentMethod[] | ListEnumPaymentMethodFieldRefInput<$PrismaModel>
    not?: NestedEnumPaymentMethodFilter<$PrismaModel> | $Enums.PaymentMethod
  }

  export type PaymentCountOrderByAggregateInput = {
    id?: SortOrder
    orderId?: SortOrder
    amount?: SortOrder
    status?: SortOrder
    method?: SortOrder
    transactionId?: SortOrder
    gatewayOrderId?: SortOrder
    metadata?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PaymentAvgOrderByAggregateInput = {
    amount?: SortOrder
  }

  export type PaymentMaxOrderByAggregateInput = {
    id?: SortOrder
    orderId?: SortOrder
    amount?: SortOrder
    status?: SortOrder
    method?: SortOrder
    transactionId?: SortOrder
    gatewayOrderId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PaymentMinOrderByAggregateInput = {
    id?: SortOrder
    orderId?: SortOrder
    amount?: SortOrder
    status?: SortOrder
    method?: SortOrder
    transactionId?: SortOrder
    gatewayOrderId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PaymentSumOrderByAggregateInput = {
    amount?: SortOrder
  }

  export type EnumPaymentMethodWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PaymentMethod | EnumPaymentMethodFieldRefInput<$PrismaModel>
    in?: $Enums.PaymentMethod[] | ListEnumPaymentMethodFieldRefInput<$PrismaModel>
    notIn?: $Enums.PaymentMethod[] | ListEnumPaymentMethodFieldRefInput<$PrismaModel>
    not?: NestedEnumPaymentMethodWithAggregatesFilter<$PrismaModel> | $Enums.PaymentMethod
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPaymentMethodFilter<$PrismaModel>
    _max?: NestedEnumPaymentMethodFilter<$PrismaModel>
  }

  export type CouponUsageCountOrderByAggregateInput = {
    id?: SortOrder
    couponId?: SortOrder
    userId?: SortOrder
    orderId?: SortOrder
    createdAt?: SortOrder
  }

  export type CouponUsageMaxOrderByAggregateInput = {
    id?: SortOrder
    couponId?: SortOrder
    userId?: SortOrder
    orderId?: SortOrder
    createdAt?: SortOrder
  }

  export type CouponUsageMinOrderByAggregateInput = {
    id?: SortOrder
    couponId?: SortOrder
    userId?: SortOrder
    orderId?: SortOrder
    createdAt?: SortOrder
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NotificationCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    title?: SortOrder
    message?: SortOrder
    type?: SortOrder
    category?: SortOrder
    isRead?: SortOrder
    metadata?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type NotificationMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    title?: SortOrder
    message?: SortOrder
    type?: SortOrder
    category?: SortOrder
    isRead?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type NotificationMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    title?: SortOrder
    message?: SortOrder
    type?: SortOrder
    category?: SortOrder
    isRead?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type EnumAuditEntityTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.AuditEntityType | EnumAuditEntityTypeFieldRefInput<$PrismaModel>
    in?: $Enums.AuditEntityType[] | ListEnumAuditEntityTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.AuditEntityType[] | ListEnumAuditEntityTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumAuditEntityTypeFilter<$PrismaModel> | $Enums.AuditEntityType
  }

  export type EnumActorTypeNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.ActorType | EnumActorTypeFieldRefInput<$PrismaModel> | null
    in?: $Enums.ActorType[] | ListEnumActorTypeFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.ActorType[] | ListEnumActorTypeFieldRefInput<$PrismaModel> | null
    not?: NestedEnumActorTypeNullableFilter<$PrismaModel> | $Enums.ActorType | null
  }

  export type AuditLogCountOrderByAggregateInput = {
    id?: SortOrder
    entityType?: SortOrder
    entityId?: SortOrder
    action?: SortOrder
    actorId?: SortOrder
    actorType?: SortOrder
    metadata?: SortOrder
    createdAt?: SortOrder
  }

  export type AuditLogMaxOrderByAggregateInput = {
    id?: SortOrder
    entityType?: SortOrder
    entityId?: SortOrder
    action?: SortOrder
    actorId?: SortOrder
    actorType?: SortOrder
    createdAt?: SortOrder
  }

  export type AuditLogMinOrderByAggregateInput = {
    id?: SortOrder
    entityType?: SortOrder
    entityId?: SortOrder
    action?: SortOrder
    actorId?: SortOrder
    actorType?: SortOrder
    createdAt?: SortOrder
  }

  export type EnumAuditEntityTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AuditEntityType | EnumAuditEntityTypeFieldRefInput<$PrismaModel>
    in?: $Enums.AuditEntityType[] | ListEnumAuditEntityTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.AuditEntityType[] | ListEnumAuditEntityTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumAuditEntityTypeWithAggregatesFilter<$PrismaModel> | $Enums.AuditEntityType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAuditEntityTypeFilter<$PrismaModel>
    _max?: NestedEnumAuditEntityTypeFilter<$PrismaModel>
  }

  export type EnumActorTypeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ActorType | EnumActorTypeFieldRefInput<$PrismaModel> | null
    in?: $Enums.ActorType[] | ListEnumActorTypeFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.ActorType[] | ListEnumActorTypeFieldRefInput<$PrismaModel> | null
    not?: NestedEnumActorTypeNullableWithAggregatesFilter<$PrismaModel> | $Enums.ActorType | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumActorTypeNullableFilter<$PrismaModel>
    _max?: NestedEnumActorTypeNullableFilter<$PrismaModel>
  }
  export type JsonFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type WebhookEventProviderEventIdCompoundUniqueInput = {
    provider: string
    eventId: string
  }

  export type WebhookEventCountOrderByAggregateInput = {
    id?: SortOrder
    provider?: SortOrder
    eventId?: SortOrder
    eventType?: SortOrder
    payload?: SortOrder
    receivedAt?: SortOrder
    processedAt?: SortOrder
  }

  export type WebhookEventMaxOrderByAggregateInput = {
    id?: SortOrder
    provider?: SortOrder
    eventId?: SortOrder
    eventType?: SortOrder
    receivedAt?: SortOrder
    processedAt?: SortOrder
  }

  export type WebhookEventMinOrderByAggregateInput = {
    id?: SortOrder
    provider?: SortOrder
    eventId?: SortOrder
    eventType?: SortOrder
    receivedAt?: SortOrder
    processedAt?: SortOrder
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type EnumOutboxStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.OutboxStatus | EnumOutboxStatusFieldRefInput<$PrismaModel>
    in?: $Enums.OutboxStatus[] | ListEnumOutboxStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.OutboxStatus[] | ListEnumOutboxStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumOutboxStatusFilter<$PrismaModel> | $Enums.OutboxStatus
  }

  export type OutboxEventCountOrderByAggregateInput = {
    id?: SortOrder
    aggregate?: SortOrder
    aggregateId?: SortOrder
    eventType?: SortOrder
    queue?: SortOrder
    payload?: SortOrder
    status?: SortOrder
    attempts?: SortOrder
    lastError?: SortOrder
    createdAt?: SortOrder
    publishedAt?: SortOrder
    lockedAt?: SortOrder
    lockedBy?: SortOrder
  }

  export type OutboxEventAvgOrderByAggregateInput = {
    attempts?: SortOrder
  }

  export type OutboxEventMaxOrderByAggregateInput = {
    id?: SortOrder
    aggregate?: SortOrder
    aggregateId?: SortOrder
    eventType?: SortOrder
    queue?: SortOrder
    status?: SortOrder
    attempts?: SortOrder
    lastError?: SortOrder
    createdAt?: SortOrder
    publishedAt?: SortOrder
    lockedAt?: SortOrder
    lockedBy?: SortOrder
  }

  export type OutboxEventMinOrderByAggregateInput = {
    id?: SortOrder
    aggregate?: SortOrder
    aggregateId?: SortOrder
    eventType?: SortOrder
    queue?: SortOrder
    status?: SortOrder
    attempts?: SortOrder
    lastError?: SortOrder
    createdAt?: SortOrder
    publishedAt?: SortOrder
    lockedAt?: SortOrder
    lockedBy?: SortOrder
  }

  export type OutboxEventSumOrderByAggregateInput = {
    attempts?: SortOrder
  }

  export type EnumOutboxStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OutboxStatus | EnumOutboxStatusFieldRefInput<$PrismaModel>
    in?: $Enums.OutboxStatus[] | ListEnumOutboxStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.OutboxStatus[] | ListEnumOutboxStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumOutboxStatusWithAggregatesFilter<$PrismaModel> | $Enums.OutboxStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumOutboxStatusFilter<$PrismaModel>
    _max?: NestedEnumOutboxStatusFilter<$PrismaModel>
  }

  export type EnumStockReservationStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.StockReservationStatus | EnumStockReservationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.StockReservationStatus[] | ListEnumStockReservationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.StockReservationStatus[] | ListEnumStockReservationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumStockReservationStatusFilter<$PrismaModel> | $Enums.StockReservationStatus
  }

  export type StockReservationCountOrderByAggregateInput = {
    id?: SortOrder
    orderId?: SortOrder
    userId?: SortOrder
    items?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StockReservationMaxOrderByAggregateInput = {
    id?: SortOrder
    orderId?: SortOrder
    userId?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StockReservationMinOrderByAggregateInput = {
    id?: SortOrder
    orderId?: SortOrder
    userId?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumStockReservationStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.StockReservationStatus | EnumStockReservationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.StockReservationStatus[] | ListEnumStockReservationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.StockReservationStatus[] | ListEnumStockReservationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumStockReservationStatusWithAggregatesFilter<$PrismaModel> | $Enums.StockReservationStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumStockReservationStatusFilter<$PrismaModel>
    _max?: NestedEnumStockReservationStatusFilter<$PrismaModel>
  }

  export type ProductCoPurchaseCatalogACatalogBCompoundUniqueInput = {
    catalogA: string
    catalogB: string
  }

  export type ProductCoPurchaseCountOrderByAggregateInput = {
    catalogA?: SortOrder
    catalogB?: SortOrder
    orderCount?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProductCoPurchaseAvgOrderByAggregateInput = {
    orderCount?: SortOrder
  }

  export type ProductCoPurchaseMaxOrderByAggregateInput = {
    catalogA?: SortOrder
    catalogB?: SortOrder
    orderCount?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProductCoPurchaseMinOrderByAggregateInput = {
    catalogA?: SortOrder
    catalogB?: SortOrder
    orderCount?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProductCoPurchaseSumOrderByAggregateInput = {
    orderCount?: SortOrder
  }

  export type ProductOrderStatCountOrderByAggregateInput = {
    catalogProductId?: SortOrder
    orderCount?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProductOrderStatAvgOrderByAggregateInput = {
    orderCount?: SortOrder
  }

  export type ProductOrderStatMaxOrderByAggregateInput = {
    catalogProductId?: SortOrder
    orderCount?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProductOrderStatMinOrderByAggregateInput = {
    catalogProductId?: SortOrder
    orderCount?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProductOrderStatSumOrderByAggregateInput = {
    orderCount?: SortOrder
  }

  export type CoPurchaseStateCountOrderByAggregateInput = {
    id?: SortOrder
    lastDeliveredAt?: SortOrder
    totalOrders?: SortOrder
    updatedAt?: SortOrder
  }

  export type CoPurchaseStateAvgOrderByAggregateInput = {
    totalOrders?: SortOrder
  }

  export type CoPurchaseStateMaxOrderByAggregateInput = {
    id?: SortOrder
    lastDeliveredAt?: SortOrder
    totalOrders?: SortOrder
    updatedAt?: SortOrder
  }

  export type CoPurchaseStateMinOrderByAggregateInput = {
    id?: SortOrder
    lastDeliveredAt?: SortOrder
    totalOrders?: SortOrder
    updatedAt?: SortOrder
  }

  export type CoPurchaseStateSumOrderByAggregateInput = {
    totalOrders?: SortOrder
  }

  export type OrderItemCreateNestedManyWithoutOrderInput = {
    create?: XOR<OrderItemCreateWithoutOrderInput, OrderItemUncheckedCreateWithoutOrderInput> | OrderItemCreateWithoutOrderInput[] | OrderItemUncheckedCreateWithoutOrderInput[]
    connectOrCreate?: OrderItemCreateOrConnectWithoutOrderInput | OrderItemCreateOrConnectWithoutOrderInput[]
    createMany?: OrderItemCreateManyOrderInputEnvelope
    connect?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
  }

  export type PaymentCreateNestedManyWithoutOrderInput = {
    create?: XOR<PaymentCreateWithoutOrderInput, PaymentUncheckedCreateWithoutOrderInput> | PaymentCreateWithoutOrderInput[] | PaymentUncheckedCreateWithoutOrderInput[]
    connectOrCreate?: PaymentCreateOrConnectWithoutOrderInput | PaymentCreateOrConnectWithoutOrderInput[]
    createMany?: PaymentCreateManyOrderInputEnvelope
    connect?: PaymentWhereUniqueInput | PaymentWhereUniqueInput[]
  }

  export type CouponUsageCreateNestedManyWithoutOrderInput = {
    create?: XOR<CouponUsageCreateWithoutOrderInput, CouponUsageUncheckedCreateWithoutOrderInput> | CouponUsageCreateWithoutOrderInput[] | CouponUsageUncheckedCreateWithoutOrderInput[]
    connectOrCreate?: CouponUsageCreateOrConnectWithoutOrderInput | CouponUsageCreateOrConnectWithoutOrderInput[]
    createMany?: CouponUsageCreateManyOrderInputEnvelope
    connect?: CouponUsageWhereUniqueInput | CouponUsageWhereUniqueInput[]
  }

  export type OrderItemUncheckedCreateNestedManyWithoutOrderInput = {
    create?: XOR<OrderItemCreateWithoutOrderInput, OrderItemUncheckedCreateWithoutOrderInput> | OrderItemCreateWithoutOrderInput[] | OrderItemUncheckedCreateWithoutOrderInput[]
    connectOrCreate?: OrderItemCreateOrConnectWithoutOrderInput | OrderItemCreateOrConnectWithoutOrderInput[]
    createMany?: OrderItemCreateManyOrderInputEnvelope
    connect?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
  }

  export type PaymentUncheckedCreateNestedManyWithoutOrderInput = {
    create?: XOR<PaymentCreateWithoutOrderInput, PaymentUncheckedCreateWithoutOrderInput> | PaymentCreateWithoutOrderInput[] | PaymentUncheckedCreateWithoutOrderInput[]
    connectOrCreate?: PaymentCreateOrConnectWithoutOrderInput | PaymentCreateOrConnectWithoutOrderInput[]
    createMany?: PaymentCreateManyOrderInputEnvelope
    connect?: PaymentWhereUniqueInput | PaymentWhereUniqueInput[]
  }

  export type CouponUsageUncheckedCreateNestedManyWithoutOrderInput = {
    create?: XOR<CouponUsageCreateWithoutOrderInput, CouponUsageUncheckedCreateWithoutOrderInput> | CouponUsageCreateWithoutOrderInput[] | CouponUsageUncheckedCreateWithoutOrderInput[]
    connectOrCreate?: CouponUsageCreateOrConnectWithoutOrderInput | CouponUsageCreateOrConnectWithoutOrderInput[]
    createMany?: CouponUsageCreateManyOrderInputEnvelope
    connect?: CouponUsageWhereUniqueInput | CouponUsageWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NullableDecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string | null
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type EnumOrderStatusFieldUpdateOperationsInput = {
    set?: $Enums.OrderStatus
  }

  export type EnumPaymentStatusFieldUpdateOperationsInput = {
    set?: $Enums.PaymentStatus
  }

  export type NullableEnumPaymentMethodFieldUpdateOperationsInput = {
    set?: $Enums.PaymentMethod | null
  }

  export type NullableEnumOrderRiderStatusFieldUpdateOperationsInput = {
    set?: $Enums.OrderRiderStatus | null
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type NullableEnumCancelledByFieldUpdateOperationsInput = {
    set?: $Enums.CancelledBy | null
  }

  export type EnumRefundStatusFieldUpdateOperationsInput = {
    set?: $Enums.RefundStatus
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type OrderItemUpdateManyWithoutOrderNestedInput = {
    create?: XOR<OrderItemCreateWithoutOrderInput, OrderItemUncheckedCreateWithoutOrderInput> | OrderItemCreateWithoutOrderInput[] | OrderItemUncheckedCreateWithoutOrderInput[]
    connectOrCreate?: OrderItemCreateOrConnectWithoutOrderInput | OrderItemCreateOrConnectWithoutOrderInput[]
    upsert?: OrderItemUpsertWithWhereUniqueWithoutOrderInput | OrderItemUpsertWithWhereUniqueWithoutOrderInput[]
    createMany?: OrderItemCreateManyOrderInputEnvelope
    set?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    disconnect?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    delete?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    connect?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    update?: OrderItemUpdateWithWhereUniqueWithoutOrderInput | OrderItemUpdateWithWhereUniqueWithoutOrderInput[]
    updateMany?: OrderItemUpdateManyWithWhereWithoutOrderInput | OrderItemUpdateManyWithWhereWithoutOrderInput[]
    deleteMany?: OrderItemScalarWhereInput | OrderItemScalarWhereInput[]
  }

  export type PaymentUpdateManyWithoutOrderNestedInput = {
    create?: XOR<PaymentCreateWithoutOrderInput, PaymentUncheckedCreateWithoutOrderInput> | PaymentCreateWithoutOrderInput[] | PaymentUncheckedCreateWithoutOrderInput[]
    connectOrCreate?: PaymentCreateOrConnectWithoutOrderInput | PaymentCreateOrConnectWithoutOrderInput[]
    upsert?: PaymentUpsertWithWhereUniqueWithoutOrderInput | PaymentUpsertWithWhereUniqueWithoutOrderInput[]
    createMany?: PaymentCreateManyOrderInputEnvelope
    set?: PaymentWhereUniqueInput | PaymentWhereUniqueInput[]
    disconnect?: PaymentWhereUniqueInput | PaymentWhereUniqueInput[]
    delete?: PaymentWhereUniqueInput | PaymentWhereUniqueInput[]
    connect?: PaymentWhereUniqueInput | PaymentWhereUniqueInput[]
    update?: PaymentUpdateWithWhereUniqueWithoutOrderInput | PaymentUpdateWithWhereUniqueWithoutOrderInput[]
    updateMany?: PaymentUpdateManyWithWhereWithoutOrderInput | PaymentUpdateManyWithWhereWithoutOrderInput[]
    deleteMany?: PaymentScalarWhereInput | PaymentScalarWhereInput[]
  }

  export type CouponUsageUpdateManyWithoutOrderNestedInput = {
    create?: XOR<CouponUsageCreateWithoutOrderInput, CouponUsageUncheckedCreateWithoutOrderInput> | CouponUsageCreateWithoutOrderInput[] | CouponUsageUncheckedCreateWithoutOrderInput[]
    connectOrCreate?: CouponUsageCreateOrConnectWithoutOrderInput | CouponUsageCreateOrConnectWithoutOrderInput[]
    upsert?: CouponUsageUpsertWithWhereUniqueWithoutOrderInput | CouponUsageUpsertWithWhereUniqueWithoutOrderInput[]
    createMany?: CouponUsageCreateManyOrderInputEnvelope
    set?: CouponUsageWhereUniqueInput | CouponUsageWhereUniqueInput[]
    disconnect?: CouponUsageWhereUniqueInput | CouponUsageWhereUniqueInput[]
    delete?: CouponUsageWhereUniqueInput | CouponUsageWhereUniqueInput[]
    connect?: CouponUsageWhereUniqueInput | CouponUsageWhereUniqueInput[]
    update?: CouponUsageUpdateWithWhereUniqueWithoutOrderInput | CouponUsageUpdateWithWhereUniqueWithoutOrderInput[]
    updateMany?: CouponUsageUpdateManyWithWhereWithoutOrderInput | CouponUsageUpdateManyWithWhereWithoutOrderInput[]
    deleteMany?: CouponUsageScalarWhereInput | CouponUsageScalarWhereInput[]
  }

  export type OrderItemUncheckedUpdateManyWithoutOrderNestedInput = {
    create?: XOR<OrderItemCreateWithoutOrderInput, OrderItemUncheckedCreateWithoutOrderInput> | OrderItemCreateWithoutOrderInput[] | OrderItemUncheckedCreateWithoutOrderInput[]
    connectOrCreate?: OrderItemCreateOrConnectWithoutOrderInput | OrderItemCreateOrConnectWithoutOrderInput[]
    upsert?: OrderItemUpsertWithWhereUniqueWithoutOrderInput | OrderItemUpsertWithWhereUniqueWithoutOrderInput[]
    createMany?: OrderItemCreateManyOrderInputEnvelope
    set?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    disconnect?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    delete?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    connect?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    update?: OrderItemUpdateWithWhereUniqueWithoutOrderInput | OrderItemUpdateWithWhereUniqueWithoutOrderInput[]
    updateMany?: OrderItemUpdateManyWithWhereWithoutOrderInput | OrderItemUpdateManyWithWhereWithoutOrderInput[]
    deleteMany?: OrderItemScalarWhereInput | OrderItemScalarWhereInput[]
  }

  export type PaymentUncheckedUpdateManyWithoutOrderNestedInput = {
    create?: XOR<PaymentCreateWithoutOrderInput, PaymentUncheckedCreateWithoutOrderInput> | PaymentCreateWithoutOrderInput[] | PaymentUncheckedCreateWithoutOrderInput[]
    connectOrCreate?: PaymentCreateOrConnectWithoutOrderInput | PaymentCreateOrConnectWithoutOrderInput[]
    upsert?: PaymentUpsertWithWhereUniqueWithoutOrderInput | PaymentUpsertWithWhereUniqueWithoutOrderInput[]
    createMany?: PaymentCreateManyOrderInputEnvelope
    set?: PaymentWhereUniqueInput | PaymentWhereUniqueInput[]
    disconnect?: PaymentWhereUniqueInput | PaymentWhereUniqueInput[]
    delete?: PaymentWhereUniqueInput | PaymentWhereUniqueInput[]
    connect?: PaymentWhereUniqueInput | PaymentWhereUniqueInput[]
    update?: PaymentUpdateWithWhereUniqueWithoutOrderInput | PaymentUpdateWithWhereUniqueWithoutOrderInput[]
    updateMany?: PaymentUpdateManyWithWhereWithoutOrderInput | PaymentUpdateManyWithWhereWithoutOrderInput[]
    deleteMany?: PaymentScalarWhereInput | PaymentScalarWhereInput[]
  }

  export type CouponUsageUncheckedUpdateManyWithoutOrderNestedInput = {
    create?: XOR<CouponUsageCreateWithoutOrderInput, CouponUsageUncheckedCreateWithoutOrderInput> | CouponUsageCreateWithoutOrderInput[] | CouponUsageUncheckedCreateWithoutOrderInput[]
    connectOrCreate?: CouponUsageCreateOrConnectWithoutOrderInput | CouponUsageCreateOrConnectWithoutOrderInput[]
    upsert?: CouponUsageUpsertWithWhereUniqueWithoutOrderInput | CouponUsageUpsertWithWhereUniqueWithoutOrderInput[]
    createMany?: CouponUsageCreateManyOrderInputEnvelope
    set?: CouponUsageWhereUniqueInput | CouponUsageWhereUniqueInput[]
    disconnect?: CouponUsageWhereUniqueInput | CouponUsageWhereUniqueInput[]
    delete?: CouponUsageWhereUniqueInput | CouponUsageWhereUniqueInput[]
    connect?: CouponUsageWhereUniqueInput | CouponUsageWhereUniqueInput[]
    update?: CouponUsageUpdateWithWhereUniqueWithoutOrderInput | CouponUsageUpdateWithWhereUniqueWithoutOrderInput[]
    updateMany?: CouponUsageUpdateManyWithWhereWithoutOrderInput | CouponUsageUpdateManyWithWhereWithoutOrderInput[]
    deleteMany?: CouponUsageScalarWhereInput | CouponUsageScalarWhereInput[]
  }

  export type OrderCreateNestedOneWithoutOrderItemsInput = {
    create?: XOR<OrderCreateWithoutOrderItemsInput, OrderUncheckedCreateWithoutOrderItemsInput>
    connectOrCreate?: OrderCreateOrConnectWithoutOrderItemsInput
    connect?: OrderWhereUniqueInput
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type OrderUpdateOneRequiredWithoutOrderItemsNestedInput = {
    create?: XOR<OrderCreateWithoutOrderItemsInput, OrderUncheckedCreateWithoutOrderItemsInput>
    connectOrCreate?: OrderCreateOrConnectWithoutOrderItemsInput
    upsert?: OrderUpsertWithoutOrderItemsInput
    connect?: OrderWhereUniqueInput
    update?: XOR<XOR<OrderUpdateToOneWithWhereWithoutOrderItemsInput, OrderUpdateWithoutOrderItemsInput>, OrderUncheckedUpdateWithoutOrderItemsInput>
  }

  export type OrderCreateNestedOneWithoutPaymentsInput = {
    create?: XOR<OrderCreateWithoutPaymentsInput, OrderUncheckedCreateWithoutPaymentsInput>
    connectOrCreate?: OrderCreateOrConnectWithoutPaymentsInput
    connect?: OrderWhereUniqueInput
  }

  export type EnumPaymentMethodFieldUpdateOperationsInput = {
    set?: $Enums.PaymentMethod
  }

  export type OrderUpdateOneRequiredWithoutPaymentsNestedInput = {
    create?: XOR<OrderCreateWithoutPaymentsInput, OrderUncheckedCreateWithoutPaymentsInput>
    connectOrCreate?: OrderCreateOrConnectWithoutPaymentsInput
    upsert?: OrderUpsertWithoutPaymentsInput
    connect?: OrderWhereUniqueInput
    update?: XOR<XOR<OrderUpdateToOneWithWhereWithoutPaymentsInput, OrderUpdateWithoutPaymentsInput>, OrderUncheckedUpdateWithoutPaymentsInput>
  }

  export type OrderCreateNestedOneWithoutCouponUsagesInput = {
    create?: XOR<OrderCreateWithoutCouponUsagesInput, OrderUncheckedCreateWithoutCouponUsagesInput>
    connectOrCreate?: OrderCreateOrConnectWithoutCouponUsagesInput
    connect?: OrderWhereUniqueInput
  }

  export type OrderUpdateOneRequiredWithoutCouponUsagesNestedInput = {
    create?: XOR<OrderCreateWithoutCouponUsagesInput, OrderUncheckedCreateWithoutCouponUsagesInput>
    connectOrCreate?: OrderCreateOrConnectWithoutCouponUsagesInput
    upsert?: OrderUpsertWithoutCouponUsagesInput
    connect?: OrderWhereUniqueInput
    update?: XOR<XOR<OrderUpdateToOneWithWhereWithoutCouponUsagesInput, OrderUpdateWithoutCouponUsagesInput>, OrderUncheckedUpdateWithoutCouponUsagesInput>
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type EnumAuditEntityTypeFieldUpdateOperationsInput = {
    set?: $Enums.AuditEntityType
  }

  export type NullableEnumActorTypeFieldUpdateOperationsInput = {
    set?: $Enums.ActorType | null
  }

  export type EnumOutboxStatusFieldUpdateOperationsInput = {
    set?: $Enums.OutboxStatus
  }

  export type EnumStockReservationStatusFieldUpdateOperationsInput = {
    set?: $Enums.StockReservationStatus
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

  export type NestedDecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
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
  }

  export type NestedDecimalNullableFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
  }

  export type NestedEnumOrderStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.OrderStatus | EnumOrderStatusFieldRefInput<$PrismaModel>
    in?: $Enums.OrderStatus[] | ListEnumOrderStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.OrderStatus[] | ListEnumOrderStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumOrderStatusFilter<$PrismaModel> | $Enums.OrderStatus
  }

  export type NestedEnumPaymentStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.PaymentStatus | EnumPaymentStatusFieldRefInput<$PrismaModel>
    in?: $Enums.PaymentStatus[] | ListEnumPaymentStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.PaymentStatus[] | ListEnumPaymentStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumPaymentStatusFilter<$PrismaModel> | $Enums.PaymentStatus
  }

  export type NestedEnumPaymentMethodNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.PaymentMethod | EnumPaymentMethodFieldRefInput<$PrismaModel> | null
    in?: $Enums.PaymentMethod[] | ListEnumPaymentMethodFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.PaymentMethod[] | ListEnumPaymentMethodFieldRefInput<$PrismaModel> | null
    not?: NestedEnumPaymentMethodNullableFilter<$PrismaModel> | $Enums.PaymentMethod | null
  }

  export type NestedEnumOrderRiderStatusNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.OrderRiderStatus | EnumOrderRiderStatusFieldRefInput<$PrismaModel> | null
    in?: $Enums.OrderRiderStatus[] | ListEnumOrderRiderStatusFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.OrderRiderStatus[] | ListEnumOrderRiderStatusFieldRefInput<$PrismaModel> | null
    not?: NestedEnumOrderRiderStatusNullableFilter<$PrismaModel> | $Enums.OrderRiderStatus | null
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
  }

  export type NestedEnumCancelledByNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.CancelledBy | EnumCancelledByFieldRefInput<$PrismaModel> | null
    in?: $Enums.CancelledBy[] | ListEnumCancelledByFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.CancelledBy[] | ListEnumCancelledByFieldRefInput<$PrismaModel> | null
    not?: NestedEnumCancelledByNullableFilter<$PrismaModel> | $Enums.CancelledBy | null
  }

  export type NestedEnumRefundStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.RefundStatus | EnumRefundStatusFieldRefInput<$PrismaModel>
    in?: $Enums.RefundStatus[] | ListEnumRefundStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.RefundStatus[] | ListEnumRefundStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumRefundStatusFilter<$PrismaModel> | $Enums.RefundStatus
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

  export type NestedDecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
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
  }

  export type NestedDecimalNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedDecimalNullableFilter<$PrismaModel>
    _sum?: NestedDecimalNullableFilter<$PrismaModel>
    _min?: NestedDecimalNullableFilter<$PrismaModel>
    _max?: NestedDecimalNullableFilter<$PrismaModel>
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedEnumOrderStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OrderStatus | EnumOrderStatusFieldRefInput<$PrismaModel>
    in?: $Enums.OrderStatus[] | ListEnumOrderStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.OrderStatus[] | ListEnumOrderStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumOrderStatusWithAggregatesFilter<$PrismaModel> | $Enums.OrderStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumOrderStatusFilter<$PrismaModel>
    _max?: NestedEnumOrderStatusFilter<$PrismaModel>
  }

  export type NestedEnumPaymentStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PaymentStatus | EnumPaymentStatusFieldRefInput<$PrismaModel>
    in?: $Enums.PaymentStatus[] | ListEnumPaymentStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.PaymentStatus[] | ListEnumPaymentStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumPaymentStatusWithAggregatesFilter<$PrismaModel> | $Enums.PaymentStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPaymentStatusFilter<$PrismaModel>
    _max?: NestedEnumPaymentStatusFilter<$PrismaModel>
  }

  export type NestedEnumPaymentMethodNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PaymentMethod | EnumPaymentMethodFieldRefInput<$PrismaModel> | null
    in?: $Enums.PaymentMethod[] | ListEnumPaymentMethodFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.PaymentMethod[] | ListEnumPaymentMethodFieldRefInput<$PrismaModel> | null
    not?: NestedEnumPaymentMethodNullableWithAggregatesFilter<$PrismaModel> | $Enums.PaymentMethod | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumPaymentMethodNullableFilter<$PrismaModel>
    _max?: NestedEnumPaymentMethodNullableFilter<$PrismaModel>
  }

  export type NestedEnumOrderRiderStatusNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OrderRiderStatus | EnumOrderRiderStatusFieldRefInput<$PrismaModel> | null
    in?: $Enums.OrderRiderStatus[] | ListEnumOrderRiderStatusFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.OrderRiderStatus[] | ListEnumOrderRiderStatusFieldRefInput<$PrismaModel> | null
    not?: NestedEnumOrderRiderStatusNullableWithAggregatesFilter<$PrismaModel> | $Enums.OrderRiderStatus | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumOrderRiderStatusNullableFilter<$PrismaModel>
    _max?: NestedEnumOrderRiderStatusNullableFilter<$PrismaModel>
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
  }

  export type NestedEnumCancelledByNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CancelledBy | EnumCancelledByFieldRefInput<$PrismaModel> | null
    in?: $Enums.CancelledBy[] | ListEnumCancelledByFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.CancelledBy[] | ListEnumCancelledByFieldRefInput<$PrismaModel> | null
    not?: NestedEnumCancelledByNullableWithAggregatesFilter<$PrismaModel> | $Enums.CancelledBy | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumCancelledByNullableFilter<$PrismaModel>
    _max?: NestedEnumCancelledByNullableFilter<$PrismaModel>
  }

  export type NestedEnumRefundStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RefundStatus | EnumRefundStatusFieldRefInput<$PrismaModel>
    in?: $Enums.RefundStatus[] | ListEnumRefundStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.RefundStatus[] | ListEnumRefundStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumRefundStatusWithAggregatesFilter<$PrismaModel> | $Enums.RefundStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRefundStatusFilter<$PrismaModel>
    _max?: NestedEnumRefundStatusFilter<$PrismaModel>
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

  export type NestedEnumPaymentMethodFilter<$PrismaModel = never> = {
    equals?: $Enums.PaymentMethod | EnumPaymentMethodFieldRefInput<$PrismaModel>
    in?: $Enums.PaymentMethod[] | ListEnumPaymentMethodFieldRefInput<$PrismaModel>
    notIn?: $Enums.PaymentMethod[] | ListEnumPaymentMethodFieldRefInput<$PrismaModel>
    not?: NestedEnumPaymentMethodFilter<$PrismaModel> | $Enums.PaymentMethod
  }

  export type NestedEnumPaymentMethodWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PaymentMethod | EnumPaymentMethodFieldRefInput<$PrismaModel>
    in?: $Enums.PaymentMethod[] | ListEnumPaymentMethodFieldRefInput<$PrismaModel>
    notIn?: $Enums.PaymentMethod[] | ListEnumPaymentMethodFieldRefInput<$PrismaModel>
    not?: NestedEnumPaymentMethodWithAggregatesFilter<$PrismaModel> | $Enums.PaymentMethod
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPaymentMethodFilter<$PrismaModel>
    _max?: NestedEnumPaymentMethodFilter<$PrismaModel>
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedEnumAuditEntityTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.AuditEntityType | EnumAuditEntityTypeFieldRefInput<$PrismaModel>
    in?: $Enums.AuditEntityType[] | ListEnumAuditEntityTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.AuditEntityType[] | ListEnumAuditEntityTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumAuditEntityTypeFilter<$PrismaModel> | $Enums.AuditEntityType
  }

  export type NestedEnumActorTypeNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.ActorType | EnumActorTypeFieldRefInput<$PrismaModel> | null
    in?: $Enums.ActorType[] | ListEnumActorTypeFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.ActorType[] | ListEnumActorTypeFieldRefInput<$PrismaModel> | null
    not?: NestedEnumActorTypeNullableFilter<$PrismaModel> | $Enums.ActorType | null
  }

  export type NestedEnumAuditEntityTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AuditEntityType | EnumAuditEntityTypeFieldRefInput<$PrismaModel>
    in?: $Enums.AuditEntityType[] | ListEnumAuditEntityTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.AuditEntityType[] | ListEnumAuditEntityTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumAuditEntityTypeWithAggregatesFilter<$PrismaModel> | $Enums.AuditEntityType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAuditEntityTypeFilter<$PrismaModel>
    _max?: NestedEnumAuditEntityTypeFilter<$PrismaModel>
  }

  export type NestedEnumActorTypeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ActorType | EnumActorTypeFieldRefInput<$PrismaModel> | null
    in?: $Enums.ActorType[] | ListEnumActorTypeFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.ActorType[] | ListEnumActorTypeFieldRefInput<$PrismaModel> | null
    not?: NestedEnumActorTypeNullableWithAggregatesFilter<$PrismaModel> | $Enums.ActorType | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumActorTypeNullableFilter<$PrismaModel>
    _max?: NestedEnumActorTypeNullableFilter<$PrismaModel>
  }
  export type NestedJsonFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedEnumOutboxStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.OutboxStatus | EnumOutboxStatusFieldRefInput<$PrismaModel>
    in?: $Enums.OutboxStatus[] | ListEnumOutboxStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.OutboxStatus[] | ListEnumOutboxStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumOutboxStatusFilter<$PrismaModel> | $Enums.OutboxStatus
  }

  export type NestedEnumOutboxStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OutboxStatus | EnumOutboxStatusFieldRefInput<$PrismaModel>
    in?: $Enums.OutboxStatus[] | ListEnumOutboxStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.OutboxStatus[] | ListEnumOutboxStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumOutboxStatusWithAggregatesFilter<$PrismaModel> | $Enums.OutboxStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumOutboxStatusFilter<$PrismaModel>
    _max?: NestedEnumOutboxStatusFilter<$PrismaModel>
  }

  export type NestedEnumStockReservationStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.StockReservationStatus | EnumStockReservationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.StockReservationStatus[] | ListEnumStockReservationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.StockReservationStatus[] | ListEnumStockReservationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumStockReservationStatusFilter<$PrismaModel> | $Enums.StockReservationStatus
  }

  export type NestedEnumStockReservationStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.StockReservationStatus | EnumStockReservationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.StockReservationStatus[] | ListEnumStockReservationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.StockReservationStatus[] | ListEnumStockReservationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumStockReservationStatusWithAggregatesFilter<$PrismaModel> | $Enums.StockReservationStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumStockReservationStatusFilter<$PrismaModel>
    _max?: NestedEnumStockReservationStatusFilter<$PrismaModel>
  }

  export type OrderItemCreateWithoutOrderInput = {
    id?: string
    productId: string
    catalogProductId?: string | null
    quantity: number
    price: Decimal | DecimalJsLike | number | string
    selectedOptions?: NullableJsonNullValueInput | InputJsonValue
  }

  export type OrderItemUncheckedCreateWithoutOrderInput = {
    id?: string
    productId: string
    catalogProductId?: string | null
    quantity: number
    price: Decimal | DecimalJsLike | number | string
    selectedOptions?: NullableJsonNullValueInput | InputJsonValue
  }

  export type OrderItemCreateOrConnectWithoutOrderInput = {
    where: OrderItemWhereUniqueInput
    create: XOR<OrderItemCreateWithoutOrderInput, OrderItemUncheckedCreateWithoutOrderInput>
  }

  export type OrderItemCreateManyOrderInputEnvelope = {
    data: OrderItemCreateManyOrderInput | OrderItemCreateManyOrderInput[]
    skipDuplicates?: boolean
  }

  export type PaymentCreateWithoutOrderInput = {
    id?: string
    amount: Decimal | DecimalJsLike | number | string
    status?: $Enums.PaymentStatus
    method: $Enums.PaymentMethod
    transactionId?: string | null
    gatewayOrderId?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PaymentUncheckedCreateWithoutOrderInput = {
    id?: string
    amount: Decimal | DecimalJsLike | number | string
    status?: $Enums.PaymentStatus
    method: $Enums.PaymentMethod
    transactionId?: string | null
    gatewayOrderId?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PaymentCreateOrConnectWithoutOrderInput = {
    where: PaymentWhereUniqueInput
    create: XOR<PaymentCreateWithoutOrderInput, PaymentUncheckedCreateWithoutOrderInput>
  }

  export type PaymentCreateManyOrderInputEnvelope = {
    data: PaymentCreateManyOrderInput | PaymentCreateManyOrderInput[]
    skipDuplicates?: boolean
  }

  export type CouponUsageCreateWithoutOrderInput = {
    id?: string
    couponId: string
    userId: string
    createdAt?: Date | string
  }

  export type CouponUsageUncheckedCreateWithoutOrderInput = {
    id?: string
    couponId: string
    userId: string
    createdAt?: Date | string
  }

  export type CouponUsageCreateOrConnectWithoutOrderInput = {
    where: CouponUsageWhereUniqueInput
    create: XOR<CouponUsageCreateWithoutOrderInput, CouponUsageUncheckedCreateWithoutOrderInput>
  }

  export type CouponUsageCreateManyOrderInputEnvelope = {
    data: CouponUsageCreateManyOrderInput | CouponUsageCreateManyOrderInput[]
    skipDuplicates?: boolean
  }

  export type OrderItemUpsertWithWhereUniqueWithoutOrderInput = {
    where: OrderItemWhereUniqueInput
    update: XOR<OrderItemUpdateWithoutOrderInput, OrderItemUncheckedUpdateWithoutOrderInput>
    create: XOR<OrderItemCreateWithoutOrderInput, OrderItemUncheckedCreateWithoutOrderInput>
  }

  export type OrderItemUpdateWithWhereUniqueWithoutOrderInput = {
    where: OrderItemWhereUniqueInput
    data: XOR<OrderItemUpdateWithoutOrderInput, OrderItemUncheckedUpdateWithoutOrderInput>
  }

  export type OrderItemUpdateManyWithWhereWithoutOrderInput = {
    where: OrderItemScalarWhereInput
    data: XOR<OrderItemUpdateManyMutationInput, OrderItemUncheckedUpdateManyWithoutOrderInput>
  }

  export type OrderItemScalarWhereInput = {
    AND?: OrderItemScalarWhereInput | OrderItemScalarWhereInput[]
    OR?: OrderItemScalarWhereInput[]
    NOT?: OrderItemScalarWhereInput | OrderItemScalarWhereInput[]
    id?: StringFilter<"OrderItem"> | string
    orderId?: StringFilter<"OrderItem"> | string
    productId?: StringFilter<"OrderItem"> | string
    catalogProductId?: StringNullableFilter<"OrderItem"> | string | null
    quantity?: IntFilter<"OrderItem"> | number
    price?: DecimalFilter<"OrderItem"> | Decimal | DecimalJsLike | number | string
    selectedOptions?: JsonNullableFilter<"OrderItem">
  }

  export type PaymentUpsertWithWhereUniqueWithoutOrderInput = {
    where: PaymentWhereUniqueInput
    update: XOR<PaymentUpdateWithoutOrderInput, PaymentUncheckedUpdateWithoutOrderInput>
    create: XOR<PaymentCreateWithoutOrderInput, PaymentUncheckedCreateWithoutOrderInput>
  }

  export type PaymentUpdateWithWhereUniqueWithoutOrderInput = {
    where: PaymentWhereUniqueInput
    data: XOR<PaymentUpdateWithoutOrderInput, PaymentUncheckedUpdateWithoutOrderInput>
  }

  export type PaymentUpdateManyWithWhereWithoutOrderInput = {
    where: PaymentScalarWhereInput
    data: XOR<PaymentUpdateManyMutationInput, PaymentUncheckedUpdateManyWithoutOrderInput>
  }

  export type PaymentScalarWhereInput = {
    AND?: PaymentScalarWhereInput | PaymentScalarWhereInput[]
    OR?: PaymentScalarWhereInput[]
    NOT?: PaymentScalarWhereInput | PaymentScalarWhereInput[]
    id?: StringFilter<"Payment"> | string
    orderId?: StringFilter<"Payment"> | string
    amount?: DecimalFilter<"Payment"> | Decimal | DecimalJsLike | number | string
    status?: EnumPaymentStatusFilter<"Payment"> | $Enums.PaymentStatus
    method?: EnumPaymentMethodFilter<"Payment"> | $Enums.PaymentMethod
    transactionId?: StringNullableFilter<"Payment"> | string | null
    gatewayOrderId?: StringNullableFilter<"Payment"> | string | null
    metadata?: JsonNullableFilter<"Payment">
    createdAt?: DateTimeFilter<"Payment"> | Date | string
    updatedAt?: DateTimeFilter<"Payment"> | Date | string
  }

  export type CouponUsageUpsertWithWhereUniqueWithoutOrderInput = {
    where: CouponUsageWhereUniqueInput
    update: XOR<CouponUsageUpdateWithoutOrderInput, CouponUsageUncheckedUpdateWithoutOrderInput>
    create: XOR<CouponUsageCreateWithoutOrderInput, CouponUsageUncheckedCreateWithoutOrderInput>
  }

  export type CouponUsageUpdateWithWhereUniqueWithoutOrderInput = {
    where: CouponUsageWhereUniqueInput
    data: XOR<CouponUsageUpdateWithoutOrderInput, CouponUsageUncheckedUpdateWithoutOrderInput>
  }

  export type CouponUsageUpdateManyWithWhereWithoutOrderInput = {
    where: CouponUsageScalarWhereInput
    data: XOR<CouponUsageUpdateManyMutationInput, CouponUsageUncheckedUpdateManyWithoutOrderInput>
  }

  export type CouponUsageScalarWhereInput = {
    AND?: CouponUsageScalarWhereInput | CouponUsageScalarWhereInput[]
    OR?: CouponUsageScalarWhereInput[]
    NOT?: CouponUsageScalarWhereInput | CouponUsageScalarWhereInput[]
    id?: StringFilter<"CouponUsage"> | string
    couponId?: StringFilter<"CouponUsage"> | string
    userId?: StringFilter<"CouponUsage"> | string
    orderId?: StringFilter<"CouponUsage"> | string
    createdAt?: DateTimeFilter<"CouponUsage"> | Date | string
  }

  export type OrderCreateWithoutOrderItemsInput = {
    id?: string
    userId: string
    storeId: string
    totalAmount: Decimal | DecimalJsLike | number | string
    discountAmount?: Decimal | DecimalJsLike | number | string
    couponCode?: string | null
    deliverySlot?: string | null
    deliveryName?: string | null
    deliveryPhone?: string | null
    deliveryAddress?: string | null
    deliveryCity?: string | null
    deliveryPincode?: string | null
    deliveryLandmark?: string | null
    deliveryInstructions?: string | null
    deliveryLatitude?: Decimal | DecimalJsLike | number | string | null
    deliveryLongitude?: Decimal | DecimalJsLike | number | string | null
    deliveryCharge?: Decimal | DecimalJsLike | number | string
    billDetails?: NullableJsonNullValueInput | InputJsonValue
    status?: $Enums.OrderStatus
    paymentStatus?: $Enums.PaymentStatus
    paymentMethod?: $Enums.PaymentMethod | null
    paymentRef?: string | null
    riderId?: string | null
    riderStatus?: $Enums.OrderRiderStatus | null
    assignedAt?: Date | string | null
    assignedBy?: string | null
    pickupStartedAt?: Date | string | null
    deliveredAt?: Date | string | null
    preparationPhotos?: NullableJsonNullValueInput | InputJsonValue
    deliveryProofPhotoUrl?: string | null
    deliveryProofPhotoPublicId?: string | null
    deliveryProofUploadedAt?: Date | string | null
    rejectionReason?: string | null
    cancellationReason?: string | null
    cancelledBy?: $Enums.CancelledBy | null
    cancelledAt?: Date | string | null
    refundStatus?: $Enums.RefundStatus
    refundFailureReason?: string | null
    refundFailedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    payments?: PaymentCreateNestedManyWithoutOrderInput
    couponUsages?: CouponUsageCreateNestedManyWithoutOrderInput
  }

  export type OrderUncheckedCreateWithoutOrderItemsInput = {
    id?: string
    userId: string
    storeId: string
    totalAmount: Decimal | DecimalJsLike | number | string
    discountAmount?: Decimal | DecimalJsLike | number | string
    couponCode?: string | null
    deliverySlot?: string | null
    deliveryName?: string | null
    deliveryPhone?: string | null
    deliveryAddress?: string | null
    deliveryCity?: string | null
    deliveryPincode?: string | null
    deliveryLandmark?: string | null
    deliveryInstructions?: string | null
    deliveryLatitude?: Decimal | DecimalJsLike | number | string | null
    deliveryLongitude?: Decimal | DecimalJsLike | number | string | null
    deliveryCharge?: Decimal | DecimalJsLike | number | string
    billDetails?: NullableJsonNullValueInput | InputJsonValue
    status?: $Enums.OrderStatus
    paymentStatus?: $Enums.PaymentStatus
    paymentMethod?: $Enums.PaymentMethod | null
    paymentRef?: string | null
    riderId?: string | null
    riderStatus?: $Enums.OrderRiderStatus | null
    assignedAt?: Date | string | null
    assignedBy?: string | null
    pickupStartedAt?: Date | string | null
    deliveredAt?: Date | string | null
    preparationPhotos?: NullableJsonNullValueInput | InputJsonValue
    deliveryProofPhotoUrl?: string | null
    deliveryProofPhotoPublicId?: string | null
    deliveryProofUploadedAt?: Date | string | null
    rejectionReason?: string | null
    cancellationReason?: string | null
    cancelledBy?: $Enums.CancelledBy | null
    cancelledAt?: Date | string | null
    refundStatus?: $Enums.RefundStatus
    refundFailureReason?: string | null
    refundFailedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    payments?: PaymentUncheckedCreateNestedManyWithoutOrderInput
    couponUsages?: CouponUsageUncheckedCreateNestedManyWithoutOrderInput
  }

  export type OrderCreateOrConnectWithoutOrderItemsInput = {
    where: OrderWhereUniqueInput
    create: XOR<OrderCreateWithoutOrderItemsInput, OrderUncheckedCreateWithoutOrderItemsInput>
  }

  export type OrderUpsertWithoutOrderItemsInput = {
    update: XOR<OrderUpdateWithoutOrderItemsInput, OrderUncheckedUpdateWithoutOrderItemsInput>
    create: XOR<OrderCreateWithoutOrderItemsInput, OrderUncheckedCreateWithoutOrderItemsInput>
    where?: OrderWhereInput
  }

  export type OrderUpdateToOneWithWhereWithoutOrderItemsInput = {
    where?: OrderWhereInput
    data: XOR<OrderUpdateWithoutOrderItemsInput, OrderUncheckedUpdateWithoutOrderItemsInput>
  }

  export type OrderUpdateWithoutOrderItemsInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    storeId?: StringFieldUpdateOperationsInput | string
    totalAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    discountAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    couponCode?: NullableStringFieldUpdateOperationsInput | string | null
    deliverySlot?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryName?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryPhone?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryAddress?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryCity?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryPincode?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryLandmark?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryInstructions?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryLatitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    deliveryLongitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    deliveryCharge?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    billDetails?: NullableJsonNullValueInput | InputJsonValue
    status?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    paymentStatus?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    paymentMethod?: NullableEnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod | null
    paymentRef?: NullableStringFieldUpdateOperationsInput | string | null
    riderId?: NullableStringFieldUpdateOperationsInput | string | null
    riderStatus?: NullableEnumOrderRiderStatusFieldUpdateOperationsInput | $Enums.OrderRiderStatus | null
    assignedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    assignedBy?: NullableStringFieldUpdateOperationsInput | string | null
    pickupStartedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deliveredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    preparationPhotos?: NullableJsonNullValueInput | InputJsonValue
    deliveryProofPhotoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryProofPhotoPublicId?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryProofUploadedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    cancellationReason?: NullableStringFieldUpdateOperationsInput | string | null
    cancelledBy?: NullableEnumCancelledByFieldUpdateOperationsInput | $Enums.CancelledBy | null
    cancelledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    refundStatus?: EnumRefundStatusFieldUpdateOperationsInput | $Enums.RefundStatus
    refundFailureReason?: NullableStringFieldUpdateOperationsInput | string | null
    refundFailedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    payments?: PaymentUpdateManyWithoutOrderNestedInput
    couponUsages?: CouponUsageUpdateManyWithoutOrderNestedInput
  }

  export type OrderUncheckedUpdateWithoutOrderItemsInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    storeId?: StringFieldUpdateOperationsInput | string
    totalAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    discountAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    couponCode?: NullableStringFieldUpdateOperationsInput | string | null
    deliverySlot?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryName?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryPhone?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryAddress?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryCity?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryPincode?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryLandmark?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryInstructions?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryLatitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    deliveryLongitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    deliveryCharge?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    billDetails?: NullableJsonNullValueInput | InputJsonValue
    status?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    paymentStatus?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    paymentMethod?: NullableEnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod | null
    paymentRef?: NullableStringFieldUpdateOperationsInput | string | null
    riderId?: NullableStringFieldUpdateOperationsInput | string | null
    riderStatus?: NullableEnumOrderRiderStatusFieldUpdateOperationsInput | $Enums.OrderRiderStatus | null
    assignedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    assignedBy?: NullableStringFieldUpdateOperationsInput | string | null
    pickupStartedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deliveredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    preparationPhotos?: NullableJsonNullValueInput | InputJsonValue
    deliveryProofPhotoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryProofPhotoPublicId?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryProofUploadedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    cancellationReason?: NullableStringFieldUpdateOperationsInput | string | null
    cancelledBy?: NullableEnumCancelledByFieldUpdateOperationsInput | $Enums.CancelledBy | null
    cancelledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    refundStatus?: EnumRefundStatusFieldUpdateOperationsInput | $Enums.RefundStatus
    refundFailureReason?: NullableStringFieldUpdateOperationsInput | string | null
    refundFailedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    payments?: PaymentUncheckedUpdateManyWithoutOrderNestedInput
    couponUsages?: CouponUsageUncheckedUpdateManyWithoutOrderNestedInput
  }

  export type OrderCreateWithoutPaymentsInput = {
    id?: string
    userId: string
    storeId: string
    totalAmount: Decimal | DecimalJsLike | number | string
    discountAmount?: Decimal | DecimalJsLike | number | string
    couponCode?: string | null
    deliverySlot?: string | null
    deliveryName?: string | null
    deliveryPhone?: string | null
    deliveryAddress?: string | null
    deliveryCity?: string | null
    deliveryPincode?: string | null
    deliveryLandmark?: string | null
    deliveryInstructions?: string | null
    deliveryLatitude?: Decimal | DecimalJsLike | number | string | null
    deliveryLongitude?: Decimal | DecimalJsLike | number | string | null
    deliveryCharge?: Decimal | DecimalJsLike | number | string
    billDetails?: NullableJsonNullValueInput | InputJsonValue
    status?: $Enums.OrderStatus
    paymentStatus?: $Enums.PaymentStatus
    paymentMethod?: $Enums.PaymentMethod | null
    paymentRef?: string | null
    riderId?: string | null
    riderStatus?: $Enums.OrderRiderStatus | null
    assignedAt?: Date | string | null
    assignedBy?: string | null
    pickupStartedAt?: Date | string | null
    deliveredAt?: Date | string | null
    preparationPhotos?: NullableJsonNullValueInput | InputJsonValue
    deliveryProofPhotoUrl?: string | null
    deliveryProofPhotoPublicId?: string | null
    deliveryProofUploadedAt?: Date | string | null
    rejectionReason?: string | null
    cancellationReason?: string | null
    cancelledBy?: $Enums.CancelledBy | null
    cancelledAt?: Date | string | null
    refundStatus?: $Enums.RefundStatus
    refundFailureReason?: string | null
    refundFailedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    orderItems?: OrderItemCreateNestedManyWithoutOrderInput
    couponUsages?: CouponUsageCreateNestedManyWithoutOrderInput
  }

  export type OrderUncheckedCreateWithoutPaymentsInput = {
    id?: string
    userId: string
    storeId: string
    totalAmount: Decimal | DecimalJsLike | number | string
    discountAmount?: Decimal | DecimalJsLike | number | string
    couponCode?: string | null
    deliverySlot?: string | null
    deliveryName?: string | null
    deliveryPhone?: string | null
    deliveryAddress?: string | null
    deliveryCity?: string | null
    deliveryPincode?: string | null
    deliveryLandmark?: string | null
    deliveryInstructions?: string | null
    deliveryLatitude?: Decimal | DecimalJsLike | number | string | null
    deliveryLongitude?: Decimal | DecimalJsLike | number | string | null
    deliveryCharge?: Decimal | DecimalJsLike | number | string
    billDetails?: NullableJsonNullValueInput | InputJsonValue
    status?: $Enums.OrderStatus
    paymentStatus?: $Enums.PaymentStatus
    paymentMethod?: $Enums.PaymentMethod | null
    paymentRef?: string | null
    riderId?: string | null
    riderStatus?: $Enums.OrderRiderStatus | null
    assignedAt?: Date | string | null
    assignedBy?: string | null
    pickupStartedAt?: Date | string | null
    deliveredAt?: Date | string | null
    preparationPhotos?: NullableJsonNullValueInput | InputJsonValue
    deliveryProofPhotoUrl?: string | null
    deliveryProofPhotoPublicId?: string | null
    deliveryProofUploadedAt?: Date | string | null
    rejectionReason?: string | null
    cancellationReason?: string | null
    cancelledBy?: $Enums.CancelledBy | null
    cancelledAt?: Date | string | null
    refundStatus?: $Enums.RefundStatus
    refundFailureReason?: string | null
    refundFailedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    orderItems?: OrderItemUncheckedCreateNestedManyWithoutOrderInput
    couponUsages?: CouponUsageUncheckedCreateNestedManyWithoutOrderInput
  }

  export type OrderCreateOrConnectWithoutPaymentsInput = {
    where: OrderWhereUniqueInput
    create: XOR<OrderCreateWithoutPaymentsInput, OrderUncheckedCreateWithoutPaymentsInput>
  }

  export type OrderUpsertWithoutPaymentsInput = {
    update: XOR<OrderUpdateWithoutPaymentsInput, OrderUncheckedUpdateWithoutPaymentsInput>
    create: XOR<OrderCreateWithoutPaymentsInput, OrderUncheckedCreateWithoutPaymentsInput>
    where?: OrderWhereInput
  }

  export type OrderUpdateToOneWithWhereWithoutPaymentsInput = {
    where?: OrderWhereInput
    data: XOR<OrderUpdateWithoutPaymentsInput, OrderUncheckedUpdateWithoutPaymentsInput>
  }

  export type OrderUpdateWithoutPaymentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    storeId?: StringFieldUpdateOperationsInput | string
    totalAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    discountAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    couponCode?: NullableStringFieldUpdateOperationsInput | string | null
    deliverySlot?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryName?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryPhone?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryAddress?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryCity?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryPincode?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryLandmark?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryInstructions?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryLatitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    deliveryLongitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    deliveryCharge?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    billDetails?: NullableJsonNullValueInput | InputJsonValue
    status?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    paymentStatus?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    paymentMethod?: NullableEnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod | null
    paymentRef?: NullableStringFieldUpdateOperationsInput | string | null
    riderId?: NullableStringFieldUpdateOperationsInput | string | null
    riderStatus?: NullableEnumOrderRiderStatusFieldUpdateOperationsInput | $Enums.OrderRiderStatus | null
    assignedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    assignedBy?: NullableStringFieldUpdateOperationsInput | string | null
    pickupStartedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deliveredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    preparationPhotos?: NullableJsonNullValueInput | InputJsonValue
    deliveryProofPhotoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryProofPhotoPublicId?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryProofUploadedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    cancellationReason?: NullableStringFieldUpdateOperationsInput | string | null
    cancelledBy?: NullableEnumCancelledByFieldUpdateOperationsInput | $Enums.CancelledBy | null
    cancelledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    refundStatus?: EnumRefundStatusFieldUpdateOperationsInput | $Enums.RefundStatus
    refundFailureReason?: NullableStringFieldUpdateOperationsInput | string | null
    refundFailedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orderItems?: OrderItemUpdateManyWithoutOrderNestedInput
    couponUsages?: CouponUsageUpdateManyWithoutOrderNestedInput
  }

  export type OrderUncheckedUpdateWithoutPaymentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    storeId?: StringFieldUpdateOperationsInput | string
    totalAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    discountAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    couponCode?: NullableStringFieldUpdateOperationsInput | string | null
    deliverySlot?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryName?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryPhone?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryAddress?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryCity?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryPincode?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryLandmark?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryInstructions?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryLatitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    deliveryLongitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    deliveryCharge?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    billDetails?: NullableJsonNullValueInput | InputJsonValue
    status?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    paymentStatus?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    paymentMethod?: NullableEnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod | null
    paymentRef?: NullableStringFieldUpdateOperationsInput | string | null
    riderId?: NullableStringFieldUpdateOperationsInput | string | null
    riderStatus?: NullableEnumOrderRiderStatusFieldUpdateOperationsInput | $Enums.OrderRiderStatus | null
    assignedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    assignedBy?: NullableStringFieldUpdateOperationsInput | string | null
    pickupStartedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deliveredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    preparationPhotos?: NullableJsonNullValueInput | InputJsonValue
    deliveryProofPhotoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryProofPhotoPublicId?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryProofUploadedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    cancellationReason?: NullableStringFieldUpdateOperationsInput | string | null
    cancelledBy?: NullableEnumCancelledByFieldUpdateOperationsInput | $Enums.CancelledBy | null
    cancelledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    refundStatus?: EnumRefundStatusFieldUpdateOperationsInput | $Enums.RefundStatus
    refundFailureReason?: NullableStringFieldUpdateOperationsInput | string | null
    refundFailedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orderItems?: OrderItemUncheckedUpdateManyWithoutOrderNestedInput
    couponUsages?: CouponUsageUncheckedUpdateManyWithoutOrderNestedInput
  }

  export type OrderCreateWithoutCouponUsagesInput = {
    id?: string
    userId: string
    storeId: string
    totalAmount: Decimal | DecimalJsLike | number | string
    discountAmount?: Decimal | DecimalJsLike | number | string
    couponCode?: string | null
    deliverySlot?: string | null
    deliveryName?: string | null
    deliveryPhone?: string | null
    deliveryAddress?: string | null
    deliveryCity?: string | null
    deliveryPincode?: string | null
    deliveryLandmark?: string | null
    deliveryInstructions?: string | null
    deliveryLatitude?: Decimal | DecimalJsLike | number | string | null
    deliveryLongitude?: Decimal | DecimalJsLike | number | string | null
    deliveryCharge?: Decimal | DecimalJsLike | number | string
    billDetails?: NullableJsonNullValueInput | InputJsonValue
    status?: $Enums.OrderStatus
    paymentStatus?: $Enums.PaymentStatus
    paymentMethod?: $Enums.PaymentMethod | null
    paymentRef?: string | null
    riderId?: string | null
    riderStatus?: $Enums.OrderRiderStatus | null
    assignedAt?: Date | string | null
    assignedBy?: string | null
    pickupStartedAt?: Date | string | null
    deliveredAt?: Date | string | null
    preparationPhotos?: NullableJsonNullValueInput | InputJsonValue
    deliveryProofPhotoUrl?: string | null
    deliveryProofPhotoPublicId?: string | null
    deliveryProofUploadedAt?: Date | string | null
    rejectionReason?: string | null
    cancellationReason?: string | null
    cancelledBy?: $Enums.CancelledBy | null
    cancelledAt?: Date | string | null
    refundStatus?: $Enums.RefundStatus
    refundFailureReason?: string | null
    refundFailedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    orderItems?: OrderItemCreateNestedManyWithoutOrderInput
    payments?: PaymentCreateNestedManyWithoutOrderInput
  }

  export type OrderUncheckedCreateWithoutCouponUsagesInput = {
    id?: string
    userId: string
    storeId: string
    totalAmount: Decimal | DecimalJsLike | number | string
    discountAmount?: Decimal | DecimalJsLike | number | string
    couponCode?: string | null
    deliverySlot?: string | null
    deliveryName?: string | null
    deliveryPhone?: string | null
    deliveryAddress?: string | null
    deliveryCity?: string | null
    deliveryPincode?: string | null
    deliveryLandmark?: string | null
    deliveryInstructions?: string | null
    deliveryLatitude?: Decimal | DecimalJsLike | number | string | null
    deliveryLongitude?: Decimal | DecimalJsLike | number | string | null
    deliveryCharge?: Decimal | DecimalJsLike | number | string
    billDetails?: NullableJsonNullValueInput | InputJsonValue
    status?: $Enums.OrderStatus
    paymentStatus?: $Enums.PaymentStatus
    paymentMethod?: $Enums.PaymentMethod | null
    paymentRef?: string | null
    riderId?: string | null
    riderStatus?: $Enums.OrderRiderStatus | null
    assignedAt?: Date | string | null
    assignedBy?: string | null
    pickupStartedAt?: Date | string | null
    deliveredAt?: Date | string | null
    preparationPhotos?: NullableJsonNullValueInput | InputJsonValue
    deliveryProofPhotoUrl?: string | null
    deliveryProofPhotoPublicId?: string | null
    deliveryProofUploadedAt?: Date | string | null
    rejectionReason?: string | null
    cancellationReason?: string | null
    cancelledBy?: $Enums.CancelledBy | null
    cancelledAt?: Date | string | null
    refundStatus?: $Enums.RefundStatus
    refundFailureReason?: string | null
    refundFailedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    orderItems?: OrderItemUncheckedCreateNestedManyWithoutOrderInput
    payments?: PaymentUncheckedCreateNestedManyWithoutOrderInput
  }

  export type OrderCreateOrConnectWithoutCouponUsagesInput = {
    where: OrderWhereUniqueInput
    create: XOR<OrderCreateWithoutCouponUsagesInput, OrderUncheckedCreateWithoutCouponUsagesInput>
  }

  export type OrderUpsertWithoutCouponUsagesInput = {
    update: XOR<OrderUpdateWithoutCouponUsagesInput, OrderUncheckedUpdateWithoutCouponUsagesInput>
    create: XOR<OrderCreateWithoutCouponUsagesInput, OrderUncheckedCreateWithoutCouponUsagesInput>
    where?: OrderWhereInput
  }

  export type OrderUpdateToOneWithWhereWithoutCouponUsagesInput = {
    where?: OrderWhereInput
    data: XOR<OrderUpdateWithoutCouponUsagesInput, OrderUncheckedUpdateWithoutCouponUsagesInput>
  }

  export type OrderUpdateWithoutCouponUsagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    storeId?: StringFieldUpdateOperationsInput | string
    totalAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    discountAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    couponCode?: NullableStringFieldUpdateOperationsInput | string | null
    deliverySlot?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryName?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryPhone?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryAddress?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryCity?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryPincode?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryLandmark?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryInstructions?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryLatitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    deliveryLongitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    deliveryCharge?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    billDetails?: NullableJsonNullValueInput | InputJsonValue
    status?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    paymentStatus?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    paymentMethod?: NullableEnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod | null
    paymentRef?: NullableStringFieldUpdateOperationsInput | string | null
    riderId?: NullableStringFieldUpdateOperationsInput | string | null
    riderStatus?: NullableEnumOrderRiderStatusFieldUpdateOperationsInput | $Enums.OrderRiderStatus | null
    assignedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    assignedBy?: NullableStringFieldUpdateOperationsInput | string | null
    pickupStartedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deliveredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    preparationPhotos?: NullableJsonNullValueInput | InputJsonValue
    deliveryProofPhotoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryProofPhotoPublicId?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryProofUploadedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    cancellationReason?: NullableStringFieldUpdateOperationsInput | string | null
    cancelledBy?: NullableEnumCancelledByFieldUpdateOperationsInput | $Enums.CancelledBy | null
    cancelledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    refundStatus?: EnumRefundStatusFieldUpdateOperationsInput | $Enums.RefundStatus
    refundFailureReason?: NullableStringFieldUpdateOperationsInput | string | null
    refundFailedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orderItems?: OrderItemUpdateManyWithoutOrderNestedInput
    payments?: PaymentUpdateManyWithoutOrderNestedInput
  }

  export type OrderUncheckedUpdateWithoutCouponUsagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    storeId?: StringFieldUpdateOperationsInput | string
    totalAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    discountAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    couponCode?: NullableStringFieldUpdateOperationsInput | string | null
    deliverySlot?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryName?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryPhone?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryAddress?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryCity?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryPincode?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryLandmark?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryInstructions?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryLatitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    deliveryLongitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    deliveryCharge?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    billDetails?: NullableJsonNullValueInput | InputJsonValue
    status?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    paymentStatus?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    paymentMethod?: NullableEnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod | null
    paymentRef?: NullableStringFieldUpdateOperationsInput | string | null
    riderId?: NullableStringFieldUpdateOperationsInput | string | null
    riderStatus?: NullableEnumOrderRiderStatusFieldUpdateOperationsInput | $Enums.OrderRiderStatus | null
    assignedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    assignedBy?: NullableStringFieldUpdateOperationsInput | string | null
    pickupStartedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deliveredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    preparationPhotos?: NullableJsonNullValueInput | InputJsonValue
    deliveryProofPhotoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryProofPhotoPublicId?: NullableStringFieldUpdateOperationsInput | string | null
    deliveryProofUploadedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    cancellationReason?: NullableStringFieldUpdateOperationsInput | string | null
    cancelledBy?: NullableEnumCancelledByFieldUpdateOperationsInput | $Enums.CancelledBy | null
    cancelledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    refundStatus?: EnumRefundStatusFieldUpdateOperationsInput | $Enums.RefundStatus
    refundFailureReason?: NullableStringFieldUpdateOperationsInput | string | null
    refundFailedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orderItems?: OrderItemUncheckedUpdateManyWithoutOrderNestedInput
    payments?: PaymentUncheckedUpdateManyWithoutOrderNestedInput
  }

  export type OrderItemCreateManyOrderInput = {
    id?: string
    productId: string
    catalogProductId?: string | null
    quantity: number
    price: Decimal | DecimalJsLike | number | string
    selectedOptions?: NullableJsonNullValueInput | InputJsonValue
  }

  export type PaymentCreateManyOrderInput = {
    id?: string
    amount: Decimal | DecimalJsLike | number | string
    status?: $Enums.PaymentStatus
    method: $Enums.PaymentMethod
    transactionId?: string | null
    gatewayOrderId?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CouponUsageCreateManyOrderInput = {
    id?: string
    couponId: string
    userId: string
    createdAt?: Date | string
  }

  export type OrderItemUpdateWithoutOrderInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    catalogProductId?: NullableStringFieldUpdateOperationsInput | string | null
    quantity?: IntFieldUpdateOperationsInput | number
    price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    selectedOptions?: NullableJsonNullValueInput | InputJsonValue
  }

  export type OrderItemUncheckedUpdateWithoutOrderInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    catalogProductId?: NullableStringFieldUpdateOperationsInput | string | null
    quantity?: IntFieldUpdateOperationsInput | number
    price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    selectedOptions?: NullableJsonNullValueInput | InputJsonValue
  }

  export type OrderItemUncheckedUpdateManyWithoutOrderInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    catalogProductId?: NullableStringFieldUpdateOperationsInput | string | null
    quantity?: IntFieldUpdateOperationsInput | number
    price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    selectedOptions?: NullableJsonNullValueInput | InputJsonValue
  }

  export type PaymentUpdateWithoutOrderInput = {
    id?: StringFieldUpdateOperationsInput | string
    amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    method?: EnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod
    transactionId?: NullableStringFieldUpdateOperationsInput | string | null
    gatewayOrderId?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PaymentUncheckedUpdateWithoutOrderInput = {
    id?: StringFieldUpdateOperationsInput | string
    amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    method?: EnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod
    transactionId?: NullableStringFieldUpdateOperationsInput | string | null
    gatewayOrderId?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PaymentUncheckedUpdateManyWithoutOrderInput = {
    id?: StringFieldUpdateOperationsInput | string
    amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    method?: EnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod
    transactionId?: NullableStringFieldUpdateOperationsInput | string | null
    gatewayOrderId?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CouponUsageUpdateWithoutOrderInput = {
    id?: StringFieldUpdateOperationsInput | string
    couponId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CouponUsageUncheckedUpdateWithoutOrderInput = {
    id?: StringFieldUpdateOperationsInput | string
    couponId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CouponUsageUncheckedUpdateManyWithoutOrderInput = {
    id?: StringFieldUpdateOperationsInput | string
    couponId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use OrderCountOutputTypeDefaultArgs instead
     */
    export type OrderCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = OrderCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use OrderDefaultArgs instead
     */
    export type OrderArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = OrderDefaultArgs<ExtArgs>
    /**
     * @deprecated Use OrderItemDefaultArgs instead
     */
    export type OrderItemArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = OrderItemDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PaymentDefaultArgs instead
     */
    export type PaymentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PaymentDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CouponUsageDefaultArgs instead
     */
    export type CouponUsageArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CouponUsageDefaultArgs<ExtArgs>
    /**
     * @deprecated Use NotificationDefaultArgs instead
     */
    export type NotificationArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = NotificationDefaultArgs<ExtArgs>
    /**
     * @deprecated Use AuditLogDefaultArgs instead
     */
    export type AuditLogArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = AuditLogDefaultArgs<ExtArgs>
    /**
     * @deprecated Use WebhookEventDefaultArgs instead
     */
    export type WebhookEventArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = WebhookEventDefaultArgs<ExtArgs>
    /**
     * @deprecated Use OutboxEventDefaultArgs instead
     */
    export type OutboxEventArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = OutboxEventDefaultArgs<ExtArgs>
    /**
     * @deprecated Use StockReservationDefaultArgs instead
     */
    export type StockReservationArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = StockReservationDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ProductCoPurchaseDefaultArgs instead
     */
    export type ProductCoPurchaseArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ProductCoPurchaseDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ProductOrderStatDefaultArgs instead
     */
    export type ProductOrderStatArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ProductOrderStatDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CoPurchaseStateDefaultArgs instead
     */
    export type CoPurchaseStateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CoPurchaseStateDefaultArgs<ExtArgs>

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