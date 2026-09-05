
Object.defineProperty(exports, "__esModule", { value: true });

const {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
  NotFoundError,
  getPrismaClient,
  sqltag,
  empty,
  join,
  raw,
  skip,
  Decimal,
  Debug,
  objectEnumValues,
  makeStrictEnum,
  Extensions,
  warnOnce,
  defineDmmfProperty,
  Public,
  getRuntime
} = require('./runtime/library.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = PrismaClientKnownRequestError;
Prisma.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError
Prisma.PrismaClientRustPanicError = PrismaClientRustPanicError
Prisma.PrismaClientInitializationError = PrismaClientInitializationError
Prisma.PrismaClientValidationError = PrismaClientValidationError
Prisma.NotFoundError = NotFoundError
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = sqltag
Prisma.empty = empty
Prisma.join = join
Prisma.raw = raw
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = Extensions.getExtensionContext
Prisma.defineExtension = Extensions.defineExtension

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}




  const path = require('path')

/**
 * Enums
 */
exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.OrderScalarFieldEnum = {
  id: 'id',
  orderNumber: 'orderNumber',
  invoiceNumber: 'invoiceNumber',
  invoicedAt: 'invoicedAt',
  userId: 'userId',
  storeId: 'storeId',
  totalAmount: 'totalAmount',
  discountAmount: 'discountAmount',
  couponCode: 'couponCode',
  deliverySlot: 'deliverySlot',
  deliveryDate: 'deliveryDate',
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
  deliveryDistanceKm: 'deliveryDistanceKm',
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

exports.Prisma.InvoiceSequenceScalarFieldEnum = {
  locationCode: 'locationCode',
  financialYear: 'financialYear',
  lastSeq: 'lastSeq',
  updatedAt: 'updatedAt'
};

exports.Prisma.DeliverySlotBookingScalarFieldEnum = {
  storeId: 'storeId',
  deliveryDate: 'deliveryDate',
  slotKey: 'slotKey',
  booked: 'booked',
  capacity: 'capacity',
  updatedAt: 'updatedAt'
};

exports.Prisma.OrderNumberSequenceScalarFieldEnum = {
  locationCode: 'locationCode',
  dateKey: 'dateKey',
  lastSeq: 'lastSeq',
  updatedAt: 'updatedAt'
};

exports.Prisma.OrderItemScalarFieldEnum = {
  id: 'id',
  orderId: 'orderId',
  productId: 'productId',
  catalogProductId: 'catalogProductId',
  quantity: 'quantity',
  price: 'price',
  selectedOptions: 'selectedOptions'
};

exports.Prisma.PaymentScalarFieldEnum = {
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

exports.Prisma.CouponUsageScalarFieldEnum = {
  id: 'id',
  couponId: 'couponId',
  userId: 'userId',
  orderId: 'orderId',
  createdAt: 'createdAt'
};

exports.Prisma.NotificationScalarFieldEnum = {
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

exports.Prisma.AuditLogScalarFieldEnum = {
  id: 'id',
  entityType: 'entityType',
  entityId: 'entityId',
  action: 'action',
  actorId: 'actorId',
  actorType: 'actorType',
  metadata: 'metadata',
  createdAt: 'createdAt'
};

exports.Prisma.WebhookEventScalarFieldEnum = {
  id: 'id',
  provider: 'provider',
  eventId: 'eventId',
  eventType: 'eventType',
  payload: 'payload',
  receivedAt: 'receivedAt',
  processedAt: 'processedAt'
};

exports.Prisma.OutboxEventScalarFieldEnum = {
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

exports.Prisma.StockReservationScalarFieldEnum = {
  id: 'id',
  orderId: 'orderId',
  userId: 'userId',
  items: 'items',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CodCollectionScalarFieldEnum = {
  id: 'id',
  orderId: 'orderId',
  riderId: 'riderId',
  storeId: 'storeId',
  amount: 'amount',
  collectedAt: 'collectedAt',
  settlementId: 'settlementId',
  createdAt: 'createdAt'
};

exports.Prisma.CodSettlementScalarFieldEnum = {
  id: 'id',
  riderId: 'riderId',
  storeId: 'storeId',
  amount: 'amount',
  orderCount: 'orderCount',
  settledBy: 'settledBy',
  notes: 'notes',
  createdAt: 'createdAt'
};

exports.Prisma.StaffAttendanceScalarFieldEnum = {
  id: 'id',
  staffId: 'staffId',
  storeId: 'storeId',
  checkInAt: 'checkInAt',
  checkOutAt: 'checkOutAt',
  selfieUrl: 'selfieUrl',
  selfiePublicId: 'selfiePublicId',
  latitude: 'latitude',
  longitude: 'longitude',
  distanceMeters: 'distanceMeters',
  isWithinGeofence: 'isWithinGeofence',
  createdAt: 'createdAt'
};

exports.Prisma.ProductCoPurchaseScalarFieldEnum = {
  catalogA: 'catalogA',
  catalogB: 'catalogB',
  orderCount: 'orderCount',
  updatedAt: 'updatedAt'
};

exports.Prisma.ProductOrderStatScalarFieldEnum = {
  catalogProductId: 'catalogProductId',
  orderCount: 'orderCount',
  updatedAt: 'updatedAt'
};

exports.Prisma.CoPurchaseStateScalarFieldEnum = {
  id: 'id',
  lastDeliveredAt: 'lastDeliveredAt',
  totalOrders: 'totalOrders',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.OrderStatus = exports.$Enums.OrderStatus = {
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

exports.PaymentStatus = exports.$Enums.PaymentStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  NOT_PAID: 'NOT_PAID',
  REFUND_PENDING: 'REFUND_PENDING',
  REFUNDED: 'REFUNDED'
};

exports.PaymentMethod = exports.$Enums.PaymentMethod = {
  COD: 'COD',
  RAZORPAY: 'RAZORPAY',
  ONLINE: 'ONLINE'
};

exports.OrderRiderStatus = exports.$Enums.OrderRiderStatus = {
  ASSIGNED: 'ASSIGNED',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED'
};

exports.CancelledBy = exports.$Enums.CancelledBy = {
  CUSTOMER: 'CUSTOMER',
  SELLER: 'SELLER',
  STAFF: 'STAFF',
  SYSTEM: 'SYSTEM'
};

exports.RefundStatus = exports.$Enums.RefundStatus = {
  NONE: 'NONE',
  REQUESTED: 'REQUESTED',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED'
};

exports.AuditEntityType = exports.$Enums.AuditEntityType = {
  ORDER: 'ORDER',
  PAYMENT: 'PAYMENT',
  COUPON: 'COUPON',
  STOCK: 'STOCK',
  REFUND: 'REFUND',
  REFERRAL: 'REFERRAL',
  COD: 'COD'
};

exports.ActorType = exports.$Enums.ActorType = {
  USER: 'USER',
  SELLER: 'SELLER',
  ADMIN: 'ADMIN',
  SYSTEM: 'SYSTEM'
};

exports.OutboxStatus = exports.$Enums.OutboxStatus = {
  PENDING: 'PENDING',
  PUBLISHED: 'PUBLISHED',
  FAILED: 'FAILED'
};

exports.StockReservationStatus = exports.$Enums.StockReservationStatus = {
  HELD: 'HELD',
  CONSUMED: 'CONSUMED',
  RELEASED: 'RELEASED'
};

exports.Prisma.ModelName = {
  Order: 'Order',
  InvoiceSequence: 'InvoiceSequence',
  DeliverySlotBooking: 'DeliverySlotBooking',
  OrderNumberSequence: 'OrderNumberSequence',
  OrderItem: 'OrderItem',
  Payment: 'Payment',
  CouponUsage: 'CouponUsage',
  Notification: 'Notification',
  AuditLog: 'AuditLog',
  WebhookEvent: 'WebhookEvent',
  OutboxEvent: 'OutboxEvent',
  StockReservation: 'StockReservation',
  CodCollection: 'CodCollection',
  CodSettlement: 'CodSettlement',
  StaffAttendance: 'StaffAttendance',
  ProductCoPurchase: 'ProductCoPurchase',
  ProductOrderStat: 'ProductOrderStat',
  CoPurchaseState: 'CoPurchaseState'
};
/**
 * Create the Client
 */
const config = {
  "generator": {
    "name": "client",
    "provider": {
      "fromEnvVar": null,
      "value": "prisma-client-js"
    },
    "output": {
      "value": "/Users/vibhu/Coding/fishStudio/packages/db-postgres/prisma/generated-client",
      "fromEnvVar": null
    },
    "config": {
      "engineType": "library"
    },
    "binaryTargets": [
      {
        "fromEnvVar": null,
        "value": "darwin-arm64",
        "native": true
      },
      {
        "fromEnvVar": null,
        "value": "debian-openssl-3.0.x"
      },
      {
        "fromEnvVar": null,
        "value": "linux-musl-arm64-openssl-1.1.x"
      },
      {
        "fromEnvVar": null,
        "value": "linux-musl-arm64-openssl-3.0.x"
      },
      {
        "fromEnvVar": null,
        "value": "linux-musl-openssl-3.0.x"
      },
      {
        "fromEnvVar": null,
        "value": "linux-arm64-openssl-3.0.x"
      }
    ],
    "previewFeatures": [],
    "sourceFilePath": "/Users/vibhu/Coding/fishStudio/packages/db-postgres/prisma/schema.prisma",
    "isCustomOutput": true
  },
  "relativeEnvPaths": {
    "rootEnvPath": null,
    "schemaEnvPath": "../../.env"
  },
  "relativePath": "..",
  "clientVersion": "5.22.0",
  "engineVersion": "605197351a3c8bdd595af2d2a9bc3025bca48ea2",
  "datasourceNames": [
    "db"
  ],
  "activeProvider": "postgresql",
  "inlineDatasources": {
    "db": {
      "url": {
        "fromEnvVar": "POSTGRES_URL",
        "value": null
      }
    }
  },
  "inlineSchema": "generator client {\n  provider      = \"prisma-client-js\"\n  output        = \"./generated-client\"\n  binaryTargets = [\"native\", \"debian-openssl-3.0.x\", \"linux-musl-arm64-openssl-1.1.x\", \"linux-musl-arm64-openssl-3.0.x\", \"linux-musl-openssl-3.0.x\", \"linux-arm64-openssl-3.0.x\"]\n}\n\ndatasource db {\n  provider = \"postgresql\"\n  url      = env(\"POSTGRES_URL\")\n}\n\nenum OrderStatus {\n  PENDING\n  ACCEPTED\n  PREPARING\n  READY_FOR_PICKUP\n  ASSIGNED_TO_RIDER\n  REJECTED\n  SHIPPED\n  DELIVERED\n  CANCELLED\n}\n\n// The order's own view of rider progress, distinct from the rider's own\n// status on the Mongo `riders` collection (which flips back to AVAILABLE\n// once released) — this one is a one-way record of what happened on THIS\n// order and is never reset.\nenum OrderRiderStatus {\n  ASSIGNED\n  OUT_FOR_DELIVERY\n  DELIVERED\n}\n\nenum PaymentStatus {\n  PENDING\n  COMPLETED\n  FAILED\n  // No money was ever due or attempted: a COD order cancelled before the rider\n  // collected, or an online checkout the customer abandoned. Distinct from\n  // FAILED, which means the gateway declined a real attempt and is worth\n  // investigating — collapsing the two would bury genuine failures. PENDING is\n  // reserved for orders where money is still expected.\n  NOT_PAID\n  // Refund submitted to the gateway but not yet settled. Gateway refunds are\n  // asynchronous and can still fail, so REFUNDED is only set once the\n  // refund.processed webhook confirms it.\n  REFUND_PENDING\n  REFUNDED\n}\n\nenum CancelledBy {\n  CUSTOMER\n  SELLER\n  STAFF\n  SYSTEM\n}\n\n// Separate from PaymentStatus's REFUND_PENDING/REFUNDED — that field tracks\n// what was actually collected (a payment concept); this one tracks a refund\n// attempt end-to-end from the moment it's requested, including a state\n// (PROCESSING) that begins before the gateway is even called.\nenum RefundStatus {\n  NONE\n  REQUESTED\n  PROCESSING\n  COMPLETED\n  FAILED\n}\n\nenum PaymentMethod {\n  COD\n  RAZORPAY\n  // Legacy value still accepted by the createOrder zod schema. Kept so the\n  // enum cast doesn't drop existing rows, but note it is not handled\n  // consistently downstream: the stale-order job treats it as online\n  // (`paymentMethod != COD`) while the refund path only accepts RAZORPAY, so\n  // an ONLINE order cannot currently be refunded. Reconciling that is a\n  // behaviour change, not a schema one.\n  ONLINE\n}\n\nenum OutboxStatus {\n  PENDING\n  PUBLISHED\n  FAILED\n}\n\nenum StockReservationStatus {\n  HELD\n  CONSUMED\n  RELEASED\n}\n\nenum AuditEntityType {\n  ORDER\n  PAYMENT\n  COUPON\n  STOCK\n  REFUND\n  REFERRAL\n  // Cash a rider collected and a manager signed off. Distinct from PAYMENT:\n  // that is money moving through the gateway, this is money moving hand to\n  // hand, and the two get reconciled against each other.\n  COD\n}\n\nenum ActorType {\n  USER\n  SELLER\n  ADMIN\n  SYSTEM\n}\n\nmodel Order {\n  id            String    @id @default(cuid())\n  // The human-facing identifier: FS-NOI-30082026-001 — FS, the store's\n  // location code, the IST date, and a per-location counter that restarts\n  // daily. `id` above stays the key every relation and URL uses; this exists\n  // because \"FS-NOI-30082026-001\" is what a seller reads out over the phone\n  // and what backend console search is done by.\n  //\n  // Nullable: every order placed before this column existed has none, and a\n  // store whose locationCode has not been set yet must still be able to trade.\n  // Uniqueness is a partial index (see migration 20260831090000) so those\n  // NULLs cost nothing.\n  orderNumber   String?\n  // The statutory GST invoice number, e.g. FS/NOI/2026-27/00042. Separate from\n  // orderNumber because the two obey different rules: an order number is an\n  // operational handle that may be issued for an order later cancelled, while\n  // an invoice number must be consecutive within a financial year and is never\n  // reused. Allocated once, the first time an invoice is actually issued —\n  // which is why it is null on every order nobody has downloaded one for.\n  invoiceNumber String?\n  invoicedAt    DateTime? @db.Timestamptz(3)\n  userId        String // Reference to Mongo User ID\n  storeId       String // Reference to Mongo Store ID\n\n  // Money is Decimal, never Float: binary floating point cannot represent\n  // values like 20.35 exactly, so float totals drift against Razorpay (which\n  // settles in integer paise) and `sum(items) + delivery - discount` stops\n  // equalling totalAmount. Reads cross the API boundary via `toMoney`.\n  totalAmount    Decimal @db.Decimal(12, 2)\n  discountAmount Decimal @default(0) @db.Decimal(12, 2)\n  couponCode     String?\n  // Deliberately not an enum: the lowercase value is compared against string\n  // literals throughout user-ui and mobile, so uppercasing it would break the\n  // response contract.\n  deliverySlot   String? // \"instant\" | \"morning\" | \"evening\"\n  // The calendar day the slot belongs to, ddMMyyyy in IST — same convention as\n  // OrderNumberSequence.dateKey. Kept as the store's own day rather than a\n  // timestamp because that is what capacity is counted against, and a UTC day\n  // would roll over at 05:30 local. Null on orders placed before slots were\n  // dated, and on \"instant\", which is always today by definition.\n  deliveryDate   String?\n\n  // Delivery details\n  deliveryName         String?\n  deliveryPhone        String?\n  deliveryAddress      String?\n  deliveryCity         String?\n  deliveryPincode      String?\n  // Free text carried straight from the customer's saved address so the\n  // rider sees them on the order, not just at checkout time.\n  deliveryLandmark     String?\n  deliveryInstructions String?\n  // The exact map pin the customer dropped on their saved address, carried\n  // through to the order so the rider's map link goes to the precise spot\n  // instead of a fuzzy text-address search. Null for orders placed against\n  // an address saved before the pin-drop picker existed.\n  deliveryLatitude     Decimal? @db.Decimal(9, 6)\n  deliveryLongitude    Decimal? @db.Decimal(9, 6)\n  deliveryCharge       Decimal  @default(0) @db.Decimal(12, 2)\n  billDetails          Json? // Snapshot of { itemTotal, deliveryCharge, slotExtraCharge, packagingCharge, gstAmount, discount, totalAmount, eventId? }\n\n  status        OrderStatus    @default(PENDING)\n  paymentStatus PaymentStatus  @default(PENDING)\n  paymentMethod PaymentMethod?\n  paymentRef    String?\n\n  // Rider assignment — riderId is a bare reference to the Mongo `staffs`\n  // collection (role: RIDER), same cross-DB convention as storeId/userId above.\n  riderId            String?\n  riderStatus        OrderRiderStatus?\n  assignedAt         DateTime?         @db.Timestamptz(3)\n  assignedBy         String? // sellerId or staffId (Mongo ObjectId) who assigned the rider\n  pickupStartedAt    DateTime?         @db.Timestamptz(3) // set when status flips to SHIPPED (rider left the store)\n  deliveredAt        DateTime?         @db.Timestamptz(3) // set when status flips to DELIVERED\n  // Store to delivery pin, captured once at delivery. Stored rather than\n  // derived on read so a rider's day still adds up after an address is edited\n  // or a store moves — and so the number a rider is measured on cannot change\n  // retroactively. Null when either end had no coordinates.\n  deliveryDistanceKm Decimal?          @db.Decimal(6, 2)\n\n  // Cutting Staff prep photos — set when a CUTTING_STAFF staff member marks\n  // preparation complete (status flips to READY_FOR_PICKUP). Array of\n  // {url, publicId, uploadedAt}.\n  preparationPhotos Json?\n\n  // Rider delivery-proof photo — set when a RIDER staff member marks the\n  // order delivered. Auto-deleted (Cloudinary asset + these fields nulled)\n  // 5 days after upload by a scheduled job.\n  deliveryProofPhotoUrl      String?\n  deliveryProofPhotoPublicId String?\n  deliveryProofUploadedAt    DateTime? @db.Timestamptz(3)\n\n  rejectionReason     String?\n  // Who/why/when an order was cancelled — set on any path that flips status\n  // to CANCELLED (customer self-cancel, seller/staff cancel, or the system).\n  // cancellationReason is free text from staff but one of a fixed quick-pick\n  // list from a customer (see cancelOrderSchema).\n  cancellationReason  String?\n  cancelledBy         CancelledBy?\n  cancelledAt         DateTime?    @db.Timestamptz(3)\n  // NONE until a refund is actually requested — most cancelled orders (COD,\n  // or paid orders cancelled while still unpaid) never touch this.\n  refundStatus        RefundStatus @default(NONE)\n  // Why the last refund attempt failed, kept so an operator retrying by hand\n  // knows whether to retry at all. Written only on the FAILED transitions and\n  // cleared whenever a new attempt claims the order.\n  refundFailureReason String?\n  refundFailedAt      DateTime?    @db.Timestamptz(3)\n\n  createdAt DateTime @default(now()) @db.Timestamptz(3)\n  updatedAt DateTime @updatedAt @db.Timestamptz(3)\n\n  orderItems   OrderItem[]\n  payments     Payment[]\n  couponUsages CouponUsage[]\n\n  // Postgres serves a query from any leftmost prefix of a compound index, so\n  // standalone [userId] / [storeId] indexes would be dead weight on every\n  // write. A standalone [status] was dropped too — six enum values over the\n  // whole table is not selective enough for the planner to prefer it; the one\n  // query that does filter on status (the stale-order sweeper) is served by a\n  // partial index created in migration 20260807000001. The co-purchase job's\n  // deliveredAt scan is served the same way (migration 20260810000000).\n  @@index([userId, createdAt(sort: Desc)]) // user order history with recent-first sort\n  @@index([storeId, createdAt(sort: Desc)]) // seller order dashboard + stats range scans\n  // Backend console search is by orderNumber, so it has to stand alone rather\n  // than ride a prefix of either compound index above. Uniqueness is enforced\n  // separately by a partial index (migration 20260831090000) that Prisma\n  // cannot express, which is why this is a plain @@index.\n  @@index([orderNumber])\n  @@index([invoiceNumber])\n  // The staff/seller order board filters by the delivery day for a store, which\n  // is a different question from createdAt — an order placed yesterday can be\n  // due today. Neither existing compound index has this as a prefix.\n  @@index([storeId, deliveryDate])\n}\n\n// Per-location, per-financial-year counter behind Order.invoiceNumber.\n//\n// Separate from OrderNumberSequence below because the periods differ and the\n// guarantees differ: order numbers restart daily and may be issued for orders\n// that never complete, while GST requires invoice numbers to run consecutively\n// through a financial year (April–March). Sharing one counter would satisfy\n// neither rule.\n//\n// Advanced with the same atomic INSERT ... ON CONFLICT DO UPDATE ... RETURNING.\nmodel InvoiceSequence {\n  locationCode  String\n  // \"2026-27\" — the Indian financial year, computed in IST.\n  financialYear String\n  lastSeq       Int      @default(0)\n  updatedAt     DateTime @updatedAt @db.Timestamptz(3)\n\n  @@id([locationCode, financialYear])\n}\n\n// How many orders are already committed to one store's slot on one day.\n//\n// Capacity lives on the row rather than being read from the store's config at\n// reserve time, so a seller lowering the cap mid-day cannot retroactively\n// invalidate orders already taken against the old one. The row is created with\n// whatever the cap was when the day's first order landed.\n//\n// Claimed with a single INSERT ... ON CONFLICT DO UPDATE ... WHERE booked <\n// capacity ... RETURNING. The WHERE is the double-booking guard: two checkouts\n// racing for the last place mean one gets a row back and the other gets none,\n// with no lock held and no read-then-write window between them.\nmodel DeliverySlotBooking {\n  storeId      String\n  // ddMMyyyy in IST, matching Order.deliveryDate and OrderNumberSequence.\n  deliveryDate String\n  // \"morning\" | \"evening\" — matches Order.deliverySlot. \"instant\" is never\n  // booked here: it is capped by the store's own delivery window, not a count.\n  slotKey      String\n  booked       Int      @default(0)\n  capacity     Int\n  updatedAt    DateTime @updatedAt @db.Timestamptz(3)\n\n  @@id([storeId, deliveryDate, slotKey])\n}\n\n// Per-location, per-day counter behind Order.orderNumber's last segment.\n//\n// Advanced with a single INSERT ... ON CONFLICT DO UPDATE ... RETURNING, which\n// is atomic: two checkouts in the same millisecond take 001 and 002 rather than\n// both reading 000. Deriving the next number from MAX(orderNumber) instead\n// would race, and would scan.\n//\n// Rows are never deleted — a day's final count is a business record, and the\n// table grows by one row per active location per day.\nmodel OrderNumberSequence {\n  locationCode String\n  // The date the sequence belongs to, ddMMyyyy, in IST — the store's own\n  // calendar day, not UTC's, or the counter would roll over at 05:30 local.\n  dateKey      String\n  lastSeq      Int      @default(0)\n  updatedAt    DateTime @updatedAt @db.Timestamptz(3)\n\n  @@id([locationCode, dateKey])\n}\n\nmodel OrderItem {\n  id               String  @id @default(cuid())\n  orderId          String\n  order            Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)\n  productId        String // Reference to Mongo Product ID\n  // The catalog root behind productId, denormalised at checkout. productId is\n  // the *store variant*, so the same fish sold by four stores is four ids —\n  // co-purchase stats aggregated on it would split one product's signal four\n  // ways. Resolving it here costs nothing (checkout has already loaded the\n  // product) and spares the nightly job a Mongo lookup per row. Null on orders\n  // placed before this column existed and on any row the backfill couldn't\n  // resolve; the aggregation job skips those rather than guessing.\n  catalogProductId String?\n  quantity         Int\n  price            Decimal @db.Decimal(12, 2)\n  selectedOptions  Json?\n\n  @@index([orderId])\n  @@index([productId])\n}\n\nmodel Payment {\n  id      String        @id @default(cuid())\n  orderId String\n  order   Order         @relation(fields: [orderId], references: [id], onDelete: Cascade)\n  amount  Decimal       @db.Decimal(12, 2)\n  status  PaymentStatus @default(PENDING)\n  method  PaymentMethod\n\n  // The gateway's own payment id (Razorpay payment_id), set on capture.\n  transactionId  String? @unique\n  // The gateway's order id (Razorpay order_id), bound at checkout creation.\n  // Indexed because reconciliation looks payments up by it — it previously\n  // lived in `metadata` and could only be found by an unindexed JSON scan.\n  gatewayOrderId String? @unique\n\n  metadata Json?\n\n  createdAt DateTime @default(now()) @db.Timestamptz(3)\n  updatedAt DateTime @updatedAt @db.Timestamptz(3)\n\n  @@index([orderId])\n  @@index([status, createdAt]) // reconciliation sweep over stale PENDING rows\n}\n\nmodel CouponUsage {\n  id        String   @id @default(cuid())\n  couponId  String // Reference to Mongo Coupon ID\n  userId    String // Reference to Mongo User ID\n  orderId   String\n  order     Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)\n  createdAt DateTime @default(now()) @db.Timestamptz(3)\n\n  @@index([couponId, userId])\n  @@index([orderId])\n}\n\nmodel Notification {\n  id        String   @id @default(cuid())\n  userId    String // Reference to Mongo User ID\n  title     String\n  message   String\n  type      String   @default(\"INFO\") // \"INFO\", \"SUCCESS\", \"WARNING\", \"ERROR\"\n  category  String? // \"ORDER\", \"SYSTEM\", \"PROMO\", etc.\n  isRead    Boolean  @default(false)\n  metadata  Json? // For deep linking, e.g., { orderId: \"...\" }\n  createdAt DateTime @default(now()) @db.Timestamptz(3)\n  updatedAt DateTime @updatedAt @db.Timestamptz(3)\n\n  // The unread badge queries { userId, isRead: false }. It is served by a\n  // partial index on (userId, createdAt) WHERE is_read = false, created in\n  // migration 20260807000001 — partial because almost every row ends up read,\n  // so the index stays small no matter how much history accumulates.\n  @@index([userId, createdAt])\n}\n\n// Immutable financial audit trail — never delete rows from this table\nmodel AuditLog {\n  id         String          @id @default(cuid())\n  entityType AuditEntityType\n  entityId   String // orderId, paymentId, etc.\n  // Deliberately a String rather than an enum: the action vocabulary grows\n  // every time an event is added, and an enum would mean a schema migration\n  // for each one. Typo-safety comes from the AuditAction union in audit.ts,\n  // which is checked at the call site instead.\n  action     String\n  actorId    String? // userId, sellerId, adminId — null means system\n  actorType  ActorType?\n  metadata   Json? // snapshot of relevant data at the time of the event\n  createdAt  DateTime        @default(now()) @db.Timestamptz(3)\n\n  // entityId is an id and therefore selective on its own; a compound\n  // [entityType, entityId] would narrow almost nothing on top of it. actorId\n  // had an index but is only ever written, never filtered on.\n  @@index([entityId])\n  @@index([action, createdAt(sort: Desc)]) // listPaymentsNeedingAttention\n  @@index([createdAt])\n}\n\n// Durable record of gateway webhooks. Dedupe used to live only in Redis on a\n// TTL, which is a cache, not an audit trail — a replay after eviction would\n// re-apply, and there was no record of what the gateway actually sent.\nmodel WebhookEvent {\n  id        String @id @default(cuid())\n  provider  String // \"RAZORPAY\"\n  eventId   String // the gateway's own event id (x-razorpay-event-id)\n  eventType String\n  payload   Json\n\n  receivedAt  DateTime  @default(now()) @db.Timestamptz(3)\n  // Null means received but not yet applied — either in flight or it failed\n  // and the gateway's retry will pick it up. Dedupe keys off this, not mere\n  // row existence, so a failed attempt doesn't block the retry.\n  processedAt DateTime? @db.Timestamptz(3)\n\n  // The unprocessed set is tiny and the processed set grows without bound, so\n  // the sweeper is served by a partial index on (received_at) WHERE\n  // processed_at IS NULL (migration 20260807000001) rather than a full index\n  // over every webhook ever received.\n  @@unique([provider, eventId])\n  @@index([receivedAt])\n}\n\n// Transactional outbox. Written inside the same Postgres transaction as the\n// state change it describes, so \"committed\" and \"will be published\" are\n// atomic. Publishing straight to RabbitMQ after a commit loses the message if\n// the process dies in between.\nmodel OutboxEvent {\n  id          String       @id @default(cuid())\n  aggregate   String // \"ORDER\" | \"PAYMENT\"\n  aggregateId String\n  eventType   String // \"ORDER_CREATED\" | \"COUPON_APPLIED\"\n  queue       String // target RabbitMQ queue\n  payload     Json\n  status      OutboxStatus @default(PENDING)\n  attempts    Int          @default(0)\n  lastError   String?\n  createdAt   DateTime     @default(now()) @db.Timestamptz(3)\n  publishedAt DateTime?    @db.Timestamptz(3)\n\n  // Claimed by the relay so two instances can't publish the same row. Rows are\n  // selected FOR UPDATE SKIP LOCKED and stamped; a claim older than the lease\n  // window is treated as abandoned and retried.\n  lockedAt DateTime? @db.Timestamptz(3)\n  lockedBy String?\n\n  // The relay only ever reads PENDING rows and the retention job only ever\n  // reads settled ones, so both are served by partial indexes rather than one\n  // full index over a table that grows forever (migration 20260807000001).\n  @@index([aggregate, aggregateId])\n}\n\n// Durable record of a Mongo stock decrement. Stock is reserved in Mongo before\n// the Postgres order transaction (so we never sell stock we didn't hold), which\n// leaves a window where a crash loses the only record of the reservation. This\n// row is written first and marked CONSUMED inside the order transaction; a\n// sweeper releases anything left HELD.\nmodel StockReservation {\n  id        String                 @id @default(cuid())\n  orderId   String? // set once the order transaction commits\n  userId    String\n  items     Json // [{ productId, quantity }]\n  status    StockReservationStatus @default(HELD)\n  createdAt DateTime               @default(now()) @db.Timestamptz(3)\n  updatedAt DateTime               @updatedAt @db.Timestamptz(3)\n\n  // Like the outbox, the sweeper only reads HELD rows — partial index in\n  // migration 20260807000001.\n  @@index([orderId])\n}\n\n// ── Co-purchase intelligence ─────────────────────────────────────────────────\n// Powers \"Frequently Bought Together\". Aggregated incrementally from delivered\n// orders by the nightly job in packages/jobs (co-purchase.job.ts), then read on\n// the product page. All three tables are keyed by *catalog* product id (a Mongo\n// ObjectId), never a store variant — see the note on OrderItem.catalogProductId.\n//\n// These are derived data: everything here can be rebuilt from Order/OrderItem\n// by resetting CoPurchaseState, which is why nothing else may write to them.\n\n// One row per unordered pair of catalog products that have appeared in the same\n// delivered order. The pair is stored once with catalogA < catalogB so a pair\n// can never be double-counted under two orderings; reads must therefore look at\n// both columns, hence the two indexes.\n// Cash a rider took at the door, one row per delivered COD order.\n//\n// Written when the order flips to DELIVERED rather than derived from Order on\n// read: the amount owed is what was collected at that moment, and a later\n// refund or edit to the order must not silently change what a rider is holding.\n// Reconciliation is about the cash, not about the order's current state.\nmodel CodCollection {\n  id      String @id @default(cuid())\n  // One collection per order — a second delivery of the same order is a bug,\n  // and the unique index is what makes a retried mark-delivered idempotent.\n  orderId String @unique\n  // Bare references to the Mongo `staffs` and `stores` collections, the same\n  // cross-DB convention Order.riderId/storeId already use.\n  riderId String\n  storeId String\n\n  amount      Decimal  @db.Decimal(12, 2)\n  collectedAt DateTime @db.Timestamptz(3)\n\n  // Null until a manager marks the cash received. This is the outstanding\n  // balance: sum of amounts where this is null.\n  settlementId String?\n  settlement   CodSettlement? @relation(fields: [settlementId], references: [id])\n\n  createdAt DateTime @default(now()) @db.Timestamptz(3)\n\n  // \"What does this rider still owe\" — the query the dashboard opens on.\n  @@index([riderId, settlementId])\n  @@index([storeId, collectedAt(sort: Desc)])\n}\n\n// A manager acknowledging cash handed over, covering one or more collections.\n//\n// Separate from CodCollection so a settlement can cover a partial set: a rider\n// who hands over some of what they hold gets the collections they settled\n// stamped, and the rest stay outstanding.\nmodel CodSettlement {\n  id      String @id @default(cuid())\n  riderId String\n  storeId String\n\n  amount     Decimal @db.Decimal(12, 2)\n  // Denormalised so the history list doesn't need a join per row to say\n  // \"12 orders, ₹8,400\".\n  orderCount Int\n\n  // The seller or staff Mongo id that signed off. Who took responsibility for\n  // the cash is the whole point of the record.\n  settledBy String\n  notes     String?\n\n  createdAt DateTime @default(now()) @db.Timestamptz(3)\n\n  collections CodCollection[]\n\n  @@index([storeId, createdAt(sort: Desc)])\n  @@index([riderId, createdAt(sort: Desc)])\n}\n\n// A rider's shift check-in: a selfie and a location, taken at the store.\n//\n// The computed distance is stored alongside the raw coordinates rather than\n// only the pass/fail, so a disputed check-in can be re-examined against the\n// numbers that were actually used instead of re-derived against a store pin\n// that may have moved since.\nmodel StaffAttendance {\n  id      String @id @default(cuid())\n  staffId String\n  storeId String\n\n  checkInAt  DateTime  @db.Timestamptz(3)\n  checkOutAt DateTime? @db.Timestamptz(3)\n\n  selfieUrl      String\n  selfiePublicId String\n\n  latitude         Decimal @db.Decimal(9, 6)\n  longitude        Decimal @db.Decimal(9, 6)\n  // Metres from the store at check-in, and whether that was inside the fence.\n  // Out-of-range attempts are recorded, not discarded — \"the rider tried to\n  // check in from 4km away\" is exactly what a manager needs to see.\n  distanceMeters   Int\n  isWithinGeofence Boolean\n\n  createdAt DateTime @default(now()) @db.Timestamptz(3)\n\n  // The manager's daily roster view, and one person's own history.\n  @@index([storeId, checkInAt(sort: Desc)])\n  @@index([staffId, checkInAt(sort: Desc)])\n}\n\nmodel ProductCoPurchase {\n  catalogA   String\n  catalogB   String\n  orderCount Int      @default(0)\n  updatedAt  DateTime @updatedAt @db.Timestamptz(3)\n\n  @@id([catalogA, catalogB])\n  @@index([catalogA, orderCount(sort: Desc)])\n  @@index([catalogB, orderCount(sort: Desc)])\n}\n\n// Orders containing this catalog product, counted once per order regardless of\n// quantity or how many of its variants the order held. Denominator for the\n// conditional probability P(B | A) and one of the two marginals in lift.\nmodel ProductOrderStat {\n  catalogProductId String   @id\n  orderCount       Int      @default(0)\n  updatedAt        DateTime @updatedAt @db.Timestamptz(3)\n}\n\n// Single-row aggregation cursor. lastDeliveredAt is the high-water mark over\n// Order.deliveredAt; totalOrders is the population size lift is computed\n// against. Advanced in the same transaction as the counters it accompanies, so\n// a crashed run resumes without double-counting the batch it was mid-way\n// through. Deleting this row is the supported way to force a full rebuild\n// (truncate the two tables above first, or the counts will double).\nmodel CoPurchaseState {\n  id              String    @id @default(\"singleton\")\n  lastDeliveredAt DateTime? @db.Timestamptz(3)\n  totalOrders     Int       @default(0)\n  updatedAt       DateTime  @updatedAt @db.Timestamptz(3)\n}\n",
  "inlineSchemaHash": "4ce0104b710a61c0e59ac93b9385551e05c84fda8f6190858eb9a4cab93e8b40",
  "copyEngine": true
}

const fs = require('fs')

config.dirname = __dirname
if (!fs.existsSync(path.join(__dirname, 'schema.prisma'))) {
  const alternativePaths = [
    "prisma/generated-client",
    "generated-client",
  ]
  
  const alternativePath = alternativePaths.find((altPath) => {
    return fs.existsSync(path.join(process.cwd(), altPath, 'schema.prisma'))
  }) ?? alternativePaths[0]

  config.dirname = path.join(process.cwd(), alternativePath)
  config.isBundled = true
}

config.runtimeDataModel = JSON.parse("{\"models\":{\"Order\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"orderNumber\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"invoiceNumber\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"invoicedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"storeId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"totalAmount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"discountAmount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"couponCode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deliverySlot\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deliveryDate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deliveryName\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deliveryPhone\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deliveryAddress\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deliveryCity\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deliveryPincode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deliveryLandmark\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deliveryInstructions\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deliveryLatitude\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deliveryLongitude\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deliveryCharge\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"billDetails\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"OrderStatus\",\"default\":\"PENDING\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"paymentStatus\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"PaymentStatus\",\"default\":\"PENDING\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"paymentMethod\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"PaymentMethod\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"paymentRef\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"riderId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"riderStatus\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"OrderRiderStatus\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"assignedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"assignedBy\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pickupStartedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deliveredAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deliveryDistanceKm\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"preparationPhotos\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deliveryProofPhotoUrl\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deliveryProofPhotoPublicId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deliveryProofUploadedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"rejectionReason\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cancellationReason\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cancelledBy\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"CancelledBy\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cancelledAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"refundStatus\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"RefundStatus\",\"default\":\"NONE\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"refundFailureReason\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"refundFailedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"orderItems\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"OrderItem\",\"relationName\":\"OrderToOrderItem\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"payments\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Payment\",\"relationName\":\"OrderToPayment\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"couponUsages\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"CouponUsage\",\"relationName\":\"CouponUsageToOrder\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"InvoiceSequence\":{\"dbName\":null,\"fields\":[{\"name\":\"locationCode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"financialYear\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lastSeq\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":{\"name\":null,\"fields\":[\"locationCode\",\"financialYear\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"DeliverySlotBooking\":{\"dbName\":null,\"fields\":[{\"name\":\"storeId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deliveryDate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"slotKey\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"booked\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"capacity\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":{\"name\":null,\"fields\":[\"storeId\",\"deliveryDate\",\"slotKey\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"OrderNumberSequence\":{\"dbName\":null,\"fields\":[{\"name\":\"locationCode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dateKey\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lastSeq\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":{\"name\":null,\"fields\":[\"locationCode\",\"dateKey\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"OrderItem\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"orderId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"order\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Order\",\"relationName\":\"OrderToOrderItem\",\"relationFromFields\":[\"orderId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"productId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"catalogProductId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"quantity\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"price\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"selectedOptions\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Payment\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"orderId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"order\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Order\",\"relationName\":\"OrderToPayment\",\"relationFromFields\":[\"orderId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"amount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"PaymentStatus\",\"default\":\"PENDING\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"method\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"PaymentMethod\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"transactionId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"gatewayOrderId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"metadata\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"CouponUsage\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"couponId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"orderId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"order\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Order\",\"relationName\":\"CouponUsageToOrder\",\"relationFromFields\":[\"orderId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Notification\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"title\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"message\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"INFO\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"category\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isRead\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"metadata\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"AuditLog\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"entityType\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"AuditEntityType\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"entityId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"action\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"actorId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"actorType\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ActorType\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"metadata\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"WebhookEvent\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"provider\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"eventId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"eventType\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"payload\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"receivedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"processedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"provider\",\"eventId\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"provider\",\"eventId\"]}],\"isGenerated\":false},\"OutboxEvent\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"aggregate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"aggregateId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"eventType\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"queue\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"payload\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"OutboxStatus\",\"default\":\"PENDING\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"attempts\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lastError\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"publishedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lockedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lockedBy\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"StockReservation\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"orderId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"items\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"StockReservationStatus\",\"default\":\"HELD\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"CodCollection\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"orderId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"riderId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"storeId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"amount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"collectedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"settlementId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"settlement\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"CodSettlement\",\"relationName\":\"CodCollectionToCodSettlement\",\"relationFromFields\":[\"settlementId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"CodSettlement\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"riderId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"storeId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"amount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"orderCount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"settledBy\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"notes\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"collections\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"CodCollection\",\"relationName\":\"CodCollectionToCodSettlement\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"StaffAttendance\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"staffId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"storeId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"checkInAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"checkOutAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"selfieUrl\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"selfiePublicId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"latitude\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"longitude\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"distanceMeters\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isWithinGeofence\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Boolean\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"ProductCoPurchase\":{\"dbName\":null,\"fields\":[{\"name\":\"catalogA\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"catalogB\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"orderCount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":{\"name\":null,\"fields\":[\"catalogA\",\"catalogB\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"ProductOrderStat\":{\"dbName\":null,\"fields\":[{\"name\":\"catalogProductId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"orderCount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"CoPurchaseState\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"singleton\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lastDeliveredAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"totalOrders\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false}},\"enums\":{\"OrderStatus\":{\"values\":[{\"name\":\"PENDING\",\"dbName\":null},{\"name\":\"ACCEPTED\",\"dbName\":null},{\"name\":\"PREPARING\",\"dbName\":null},{\"name\":\"READY_FOR_PICKUP\",\"dbName\":null},{\"name\":\"ASSIGNED_TO_RIDER\",\"dbName\":null},{\"name\":\"REJECTED\",\"dbName\":null},{\"name\":\"SHIPPED\",\"dbName\":null},{\"name\":\"DELIVERED\",\"dbName\":null},{\"name\":\"CANCELLED\",\"dbName\":null}],\"dbName\":null},\"OrderRiderStatus\":{\"values\":[{\"name\":\"ASSIGNED\",\"dbName\":null},{\"name\":\"OUT_FOR_DELIVERY\",\"dbName\":null},{\"name\":\"DELIVERED\",\"dbName\":null}],\"dbName\":null},\"PaymentStatus\":{\"values\":[{\"name\":\"PENDING\",\"dbName\":null},{\"name\":\"COMPLETED\",\"dbName\":null},{\"name\":\"FAILED\",\"dbName\":null},{\"name\":\"NOT_PAID\",\"dbName\":null},{\"name\":\"REFUND_PENDING\",\"dbName\":null},{\"name\":\"REFUNDED\",\"dbName\":null}],\"dbName\":null},\"CancelledBy\":{\"values\":[{\"name\":\"CUSTOMER\",\"dbName\":null},{\"name\":\"SELLER\",\"dbName\":null},{\"name\":\"STAFF\",\"dbName\":null},{\"name\":\"SYSTEM\",\"dbName\":null}],\"dbName\":null},\"RefundStatus\":{\"values\":[{\"name\":\"NONE\",\"dbName\":null},{\"name\":\"REQUESTED\",\"dbName\":null},{\"name\":\"PROCESSING\",\"dbName\":null},{\"name\":\"COMPLETED\",\"dbName\":null},{\"name\":\"FAILED\",\"dbName\":null}],\"dbName\":null},\"PaymentMethod\":{\"values\":[{\"name\":\"COD\",\"dbName\":null},{\"name\":\"RAZORPAY\",\"dbName\":null},{\"name\":\"ONLINE\",\"dbName\":null}],\"dbName\":null},\"OutboxStatus\":{\"values\":[{\"name\":\"PENDING\",\"dbName\":null},{\"name\":\"PUBLISHED\",\"dbName\":null},{\"name\":\"FAILED\",\"dbName\":null}],\"dbName\":null},\"StockReservationStatus\":{\"values\":[{\"name\":\"HELD\",\"dbName\":null},{\"name\":\"CONSUMED\",\"dbName\":null},{\"name\":\"RELEASED\",\"dbName\":null}],\"dbName\":null},\"AuditEntityType\":{\"values\":[{\"name\":\"ORDER\",\"dbName\":null},{\"name\":\"PAYMENT\",\"dbName\":null},{\"name\":\"COUPON\",\"dbName\":null},{\"name\":\"STOCK\",\"dbName\":null},{\"name\":\"REFUND\",\"dbName\":null},{\"name\":\"REFERRAL\",\"dbName\":null},{\"name\":\"COD\",\"dbName\":null}],\"dbName\":null},\"ActorType\":{\"values\":[{\"name\":\"USER\",\"dbName\":null},{\"name\":\"SELLER\",\"dbName\":null},{\"name\":\"ADMIN\",\"dbName\":null},{\"name\":\"SYSTEM\",\"dbName\":null}],\"dbName\":null}},\"types\":{}}")
defineDmmfProperty(exports.Prisma, config.runtimeDataModel)
config.engineWasm = undefined


const { warnEnvConflicts } = require('./runtime/library.js')

warnEnvConflicts({
    rootEnvPath: config.relativeEnvPaths.rootEnvPath && path.resolve(config.dirname, config.relativeEnvPaths.rootEnvPath),
    schemaEnvPath: config.relativeEnvPaths.schemaEnvPath && path.resolve(config.dirname, config.relativeEnvPaths.schemaEnvPath)
})

const PrismaClient = getPrismaClient(config)
exports.PrismaClient = PrismaClient
Object.assign(exports, Prisma)

// file annotations for bundling tools to include these files
path.join(__dirname, "libquery_engine-darwin-arm64.dylib.node");
path.join(process.cwd(), "prisma/generated-client/libquery_engine-darwin-arm64.dylib.node")

// file annotations for bundling tools to include these files
path.join(__dirname, "libquery_engine-debian-openssl-3.0.x.so.node");
path.join(process.cwd(), "prisma/generated-client/libquery_engine-debian-openssl-3.0.x.so.node")

// file annotations for bundling tools to include these files
path.join(__dirname, "libquery_engine-linux-musl-arm64-openssl-1.1.x.so.node");
path.join(process.cwd(), "prisma/generated-client/libquery_engine-linux-musl-arm64-openssl-1.1.x.so.node")

// file annotations for bundling tools to include these files
path.join(__dirname, "libquery_engine-linux-musl-arm64-openssl-3.0.x.so.node");
path.join(process.cwd(), "prisma/generated-client/libquery_engine-linux-musl-arm64-openssl-3.0.x.so.node")

// file annotations for bundling tools to include these files
path.join(__dirname, "libquery_engine-linux-musl-openssl-3.0.x.so.node");
path.join(process.cwd(), "prisma/generated-client/libquery_engine-linux-musl-openssl-3.0.x.so.node")

// file annotations for bundling tools to include these files
path.join(__dirname, "libquery_engine-linux-arm64-openssl-3.0.x.so.node");
path.join(process.cwd(), "prisma/generated-client/libquery_engine-linux-arm64-openssl-3.0.x.so.node")
// file annotations for bundling tools to include these files
path.join(__dirname, "schema.prisma");
path.join(process.cwd(), "prisma/generated-client/schema.prisma")
