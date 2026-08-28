// Cookie utility functions for managing authentication tokens

// Get token from cookie (also checks localStorage as fallback)
export function getToken() {
  // First check cookie
  const name = "token=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }

  // Fallback to localStorage for admin token compatibility
  return localStorage.getItem("token");
}

// Get user from cookie (also checks localStorage as fallback)
export function getUser() {
  // First check cookie
  const name = "hirenest_user=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      try {
        return JSON.parse(
          decodeURIComponent(c.substring(name.length, c.length)),
        );
      } catch (e) {
        return null;
      }
    }
  }

  // Fallback to localStorage for admin user compatibility
  const localUser = localStorage.getItem("hirenest_user");
  if (localUser) {
    try {
      return JSON.parse(localUser);
    } catch (e) {
      return null;
    }
  }
  return null;
}

// Set cookie (called after successful login)
export function setAuthCookie(name, value, days = 7) {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = "expires=" + date.toUTCString();
  document.cookie =
    name +
    "=" +
    encodeURIComponent(value) +
    ";" +
    expires +
    ";path=/;SameSite=Lax";
}

// Clear auth cookies and localStorage (logout)
export function clearAuthCookies() {
  // Clear cookies
  document.cookie = "token=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
  document.cookie =
    "hirenest_user=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";

  // Also clear localStorage for backward compatibility
  localStorage.removeItem("token");
  localStorage.removeItem("hirenest_user");
}

// Check if user is logged in
export function isAuthenticated() {
  return getToken() !== null;
}

// Legacy compatibility - get token (works like localStorage.getItem('token'))
export function getAuthToken() {
  return getToken();
}

// Legacy compatibility - get user (works like localStorage.getItem('hirenest_user'))
export function getAuthUser() {
  const user = getUser();
  if (!user) {
    // Try to parse from cookie directly
    const name = "hirenest_user=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        try {
          return JSON.parse(c.substring(name.length, c.length));
        } catch (e) {
          return null;
        }
      }
    }
  }
  return user;
}
