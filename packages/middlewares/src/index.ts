export {
  allowRoles,
  isSeller,
  isApprovedSeller,
  isAdminOrApprovedSeller,
  isAdmin,
  isUser,
  isStaff,
  isSellerOrStaff,
  hasStaffRole,
} from "./authorizeRole.js";
export {
  STAFF_SCOPE_HEADER,
  ALL_STAFF_SCOPES,
  LEGACY_STAFF_COOKIES,
  staffCookieNames,
  parseStaffScope,
  staffScopeOf,
  allStaffAccessCookieNames,
  allStaffRefreshCookieNames,
  type StaffScope,
} from "./staffCookies.js";
export { default as isAuthenticated } from "./isAuthenticated.js";
export { default as optionalAuth } from "./optionalAuth.js";
