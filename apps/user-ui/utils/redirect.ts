let redirectToLogin = () => {
    window.location.href = "/";
  };
  
  export const setRedirectHandler = (handler: () => void) => {
    redirectToLogin = handler;
  };
  
  export const runRedirectToLogin = () => {
    redirectToLogin();
  };
  
  
  
