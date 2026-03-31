
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

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  phone: 'phone',
  fullName: 'fullName',
  hashedPassword: 'hashedPassword',
  hashedPin: 'hashedPin',
  role: 'role',
  isEmailVerified: 'isEmailVerified',
  isActive: 'isActive',
  lastLoginAt: 'lastLoginAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TrustedDeviceScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  deviceId: 'deviceId',
  deviceName: 'deviceName',
  ipAddress: 'ipAddress',
  isTrusted: 'isTrusted',
  lastUsedAt: 'lastUsedAt',
  createdAt: 'createdAt'
};

exports.Prisma.WalletScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  balance: 'balance',
  status: 'status',
  isFrozen: 'isFrozen',
  qrCode: 'qrCode',
  version: 'version',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.KycProfileScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  walletId: 'walletId',
  fullName: 'fullName',
  dob: 'dob',
  address: 'address',
  idType: 'idType',
  idNumber: 'idNumber',
  idFrontUrl: 'idFrontUrl',
  idBackUrl: 'idBackUrl',
  selfieUrl: 'selfieUrl',
  idFrontImage: 'idFrontImage',
  idBackImage: 'idBackImage',
  selfieImage: 'selfieImage',
  status: 'status',
  verifiedAt: 'verifiedAt',
  rejectedReason: 'rejectedReason',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LedgerEntryScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  referenceId: 'referenceId',
  entryType: 'entryType',
  amount: 'amount',
  balanceBefore: 'balanceBefore',
  balanceAfter: 'balanceAfter',
  status: 'status',
  description: 'description',
  notes: 'notes',
  relatedUserId: 'relatedUserId',
  orderId: 'orderId',
  merchantId: 'merchantId',
  metadata: 'metadata',
  createdAt: 'createdAt'
};

exports.Prisma.OutboxEventScalarFieldEnum = {
  id: 'id',
  exchange: 'exchange',
  routingKey: 'routingKey',
  payload: 'payload',
  status: 'status',
  attempts: 'attempts',
  availableAt: 'availableAt',
  publishedAt: 'publishedAt',
  lastError: 'lastError',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.IdempotencyKeyScalarFieldEnum = {
  id: 'id',
  key: 'key',
  userId: 'userId',
  endpoint: 'endpoint',
  requestHash: 'requestHash',
  responseStatus: 'responseStatus',
  responseBody: 'responseBody',
  createdAt: 'createdAt',
  expiresAt: 'expiresAt'
};

exports.Prisma.P2PTransferScalarFieldEnum = {
  id: 'id',
  senderId: 'senderId',
  recipientId: 'recipientId',
  amount: 'amount',
  note: 'note',
  status: 'status',
  senderLedgerId: 'senderLedgerId',
  recipientLedgerId: 'recipientLedgerId',
  idempotencyKey: 'idempotencyKey',
  createdAt: 'createdAt'
};

exports.Prisma.PaymentRequestScalarFieldEnum = {
  id: 'id',
  requesterId: 'requesterId',
  requestedFromId: 'requestedFromId',
  amount: 'amount',
  reason: 'reason',
  status: 'status',
  transferId: 'transferId',
  expiresAt: 'expiresAt',
  respondedAt: 'respondedAt',
  createdAt: 'createdAt'
};

exports.Prisma.PaymentOrderScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  accountId: 'accountId',
  amount: 'amount',
  status: 'status',
  failureReason: 'failureReason',
  failureCode: 'failureCode',
  idempotencyKey: 'idempotencyKey',
  ledgerId: 'ledgerId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BankAccountScalarFieldEnum = {
  id: 'id',
  accountNumber: 'accountNumber',
  bankName: 'bankName',
  accountHolder: 'accountHolder',
  email: 'email',
  phone: 'phone',
  balance: 'balance',
  accountType: 'accountType',
  ifscCode: 'ifscCode',
  branch: 'branch',
  status: 'status',
  isFrozen: 'isFrozen',
  freezeReason: 'freezeReason',
  approvedBy: 'approvedBy',
  approvedAt: 'approvedAt',
  version: 'version',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  userId: 'userId'
};

exports.Prisma.LinkedBankAccountScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  accountId: 'accountId',
  bankName: 'bankName',
  maskedAccount: 'maskedAccount',
  isDefault: 'isDefault',
  createdAt: 'createdAt'
};

exports.Prisma.BankAccountApprovalScalarFieldEnum = {
  id: 'id',
  accountId: 'accountId',
  adminId: 'adminId',
  action: 'action',
  reason: 'reason',
  comments: 'comments',
  createdAt: 'createdAt'
};

exports.Prisma.BankAdminScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  bankName: 'bankName',
  permissions: 'permissions',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.MerchantScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  businessName: 'businessName',
  businessType: 'businessType',
  businessCategory: 'businessCategory',
  gstNumber: 'gstNumber',
  panNumber: 'panNumber',
  address: 'address',
  merchantQrCode: 'merchantQrCode',
  balance: 'balance',
  pendingBalance: 'pendingBalance',
  commissionRate: 'commissionRate',
  status: 'status',
  isFrozen: 'isFrozen',
  settlementBankAccountId: 'settlementBankAccountId',
  approvedAt: 'approvedAt',
  version: 'version',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.MerchantPaymentScalarFieldEnum = {
  id: 'id',
  merchantId: 'merchantId',
  customerId: 'customerId',
  amount: 'amount',
  commission: 'commission',
  netAmount: 'netAmount',
  status: 'status',
  settlementId: 'settlementId',
  settledAt: 'settledAt',
  customerLedgerId: 'customerLedgerId',
  idempotencyKey: 'idempotencyKey',
  createdAt: 'createdAt'
};

exports.Prisma.RefundScalarFieldEnum = {
  id: 'id',
  merchantId: 'merchantId',
  paymentId: 'paymentId',
  customerId: 'customerId',
  amount: 'amount',
  reason: 'reason',
  status: 'status',
  merchantLedgerId: 'merchantLedgerId',
  customerLedgerId: 'customerLedgerId',
  idempotencyKey: 'idempotencyKey',
  createdAt: 'createdAt'
};

exports.Prisma.SettlementScalarFieldEnum = {
  id: 'id',
  merchantId: 'merchantId',
  amount: 'amount',
  commission: 'commission',
  settledAmount: 'settledAmount',
  bankAccountId: 'bankAccountId',
  status: 'status',
  utrNumber: 'utrNumber',
  requestedAt: 'requestedAt',
  completedAt: 'completedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.UserRole = exports.$Enums.UserRole = {
  USER: 'USER',
  MERCHANT: 'MERCHANT',
  BANK_ADMIN: 'BANK_ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN'
};

exports.WalletStatus = exports.$Enums.WalletStatus = {
  PENDING_PIN: 'PENDING_PIN',
  PENDING_KYC: 'PENDING_KYC',
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  CLOSED: 'CLOSED'
};

exports.IdType = exports.$Enums.IdType = {
  PAN: 'PAN',
  AADHAAR: 'AADHAAR',
  PASSPORT: 'PASSPORT'
};

exports.KycStatus = exports.$Enums.KycStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
};

exports.LedgerEntryType = exports.$Enums.LedgerEntryType = {
  WALLET_TOPUP: 'WALLET_TOPUP',
  P2P_SEND: 'P2P_SEND',
  P2P_RECEIVE: 'P2P_RECEIVE',
  MERCHANT_PAYMENT: 'MERCHANT_PAYMENT',
  MERCHANT_REFUND: 'MERCHANT_REFUND',
  PAYMENT_REQUEST_PAID: 'PAYMENT_REQUEST_PAID',
  ADMIN_ADJUSTMENT: 'ADMIN_ADJUSTMENT'
};

exports.LedgerStatus = exports.$Enums.LedgerStatus = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED'
};

exports.OutboxStatus = exports.$Enums.OutboxStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  PUBLISHED: 'PUBLISHED',
  FAILED: 'FAILED'
};

exports.TransferStatus = exports.$Enums.TransferStatus = {
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  REVERSED: 'REVERSED'
};

exports.PaymentRequestStatus = exports.$Enums.PaymentRequestStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED'
};

exports.OrderStatus = exports.$Enums.OrderStatus = {
  PROCESSING: 'PROCESSING',
  INITIATED: 'INITIATED',
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  EXPIRED: 'EXPIRED'
};

exports.BankAccountType = exports.$Enums.BankAccountType = {
  SAVINGS: 'SAVINGS',
  CURRENT: 'CURRENT'
};

exports.BankAccountStatus = exports.$Enums.BankAccountStatus = {
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  ACTIVE: 'ACTIVE',
  CLOSED: 'CLOSED'
};

exports.ApprovalAction = exports.$Enums.ApprovalAction = {
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  FROZEN: 'FROZEN',
  UNFROZEN: 'UNFROZEN',
  CLOSED: 'CLOSED'
};

exports.BusinessType = exports.$Enums.BusinessType = {
  RETAIL: 'RETAIL',
  FOOD: 'FOOD',
  SERVICES: 'SERVICES',
  ONLINE: 'ONLINE',
  OTHER: 'OTHER'
};

exports.MerchantStatus = exports.$Enums.MerchantStatus = {
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  CLOSED: 'CLOSED'
};

exports.SettlementStatus = exports.$Enums.SettlementStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED'
};

exports.Prisma.ModelName = {
  User: 'User',
  TrustedDevice: 'TrustedDevice',
  Wallet: 'Wallet',
  KycProfile: 'KycProfile',
  LedgerEntry: 'LedgerEntry',
  OutboxEvent: 'OutboxEvent',
  IdempotencyKey: 'IdempotencyKey',
  P2PTransfer: 'P2PTransfer',
  PaymentRequest: 'PaymentRequest',
  PaymentOrder: 'PaymentOrder',
  BankAccount: 'BankAccount',
  LinkedBankAccount: 'LinkedBankAccount',
  BankAccountApproval: 'BankAccountApproval',
  BankAdmin: 'BankAdmin',
  Merchant: 'Merchant',
  MerchantPayment: 'MerchantPayment',
  Refund: 'Refund',
  Settlement: 'Settlement'
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
