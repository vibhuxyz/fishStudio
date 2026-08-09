import type { AxiosRequestConfig } from "axios";

export interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  requireAuth?: boolean;
  _retry?: boolean;
  /**
   * Still refresh on 401, but don't bounce the user to /login if the refresh
   * also fails. For identity probes that are *expected* to 401 for the other
   * role (see useSeller), where a failure means "not this role", not
   * "session over".
   */
  skipAuthRedirect?: boolean;
}
