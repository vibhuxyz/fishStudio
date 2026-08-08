
let redirectToLogin = (path: string) => {
  window.location.href = path;
};

export const setRedirectHandler = (handler: (path: string) => void) => {
  redirectToLogin = handler;
};

export const runRedirectToLogin = (path: string = "/login") => {
  redirectToLogin(path);
};
