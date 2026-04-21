
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


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

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

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



/**
 * Enums
 */

exports.Prisma.AdminsScalarFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  password: 'password',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ImagesScalarFieldEnum = {
  id: 'id',
  file_id: 'file_id',
  url: 'url',
  type: 'type',
  productId: 'productId',
  createdAt: 'createdAt'
};

exports.Prisma.UsersScalarFieldEnum = {
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

exports.Prisma.Discount_codesScalarFieldEnum = {
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

exports.Prisma.Coupon_usagesScalarFieldEnum = {
  id: 'id',
  couponId: 'couponId',
  userId: 'userId',
  orderId: 'orderId',
  usedAt: 'usedAt'
};

exports.Prisma.SellersScalarFieldEnum = {
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

exports.Prisma.StaffsScalarFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  password: 'password',
  isActive: 'isActive',
  sellerId: 'sellerId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.StoresScalarFieldEnum = {
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

exports.Prisma.FavoritesScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  productId: 'productId',
  createdAt: 'createdAt'
};

exports.Prisma.Site_configScalarFieldEnum = {
  id: 'id',
  categories: 'categories',
  subCategories: 'subCategories',
  categoryImages: 'categoryImages',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ProductsScalarFieldEnum = {
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
  basePricePerKg: 'basePricePerKg',
  basePricePerUnit: 'basePricePerUnit',
  pricingMethod: 'pricingMethod',
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

exports.Prisma.BannersScalarFieldEnum = {
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

exports.Prisma.Seller_eventsScalarFieldEnum = {
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

exports.Prisma.SignupAccessCodeScalarFieldEnum = {
  id: 'id',
  email: 'email',
  role: 'role',
  code: 'code',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.Abandoned_cartsScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  items: 'items',
  storeId: 'storeId',
  storeName: 'storeName',
  totalAmount: 'totalAmount',
  notifiedAt: 'notifiedAt',
  isConverted: 'isConverted',
  lastUpdatedAt: 'lastUpdatedAt',
  createdAt: 'createdAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};
exports.ImageType = exports.$Enums.ImageType = {
  PRODUCT: 'PRODUCT',
  USER_AVATAR: 'USER_AVATAR',
  STORE_AVATAR: 'STORE_AVATAR'
};

exports.productStatus = exports.$Enums.productStatus = {
  Active: 'Active',
  NonActive: 'NonActive'
};

exports.sellerEventType = exports.$Enums.sellerEventType = {
  FREE_DELIVERY: 'FREE_DELIVERY',
  DISCOUNT: 'DISCOUNT',
  FLASH_SALE: 'FLASH_SALE'
};

exports.Prisma.ModelName = {
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
  SignupAccessCode: 'SignupAccessCode',
  abandoned_carts: 'abandoned_carts'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
