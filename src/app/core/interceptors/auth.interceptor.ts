import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError, of } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Skip adding Authorization header for the refresh endpoint
  const isRefreshEndpoint = req.url.includes('/auth/refresh');
  if (isRefreshEndpoint) {
    console.log('AuthInterceptor - Refresh endpoint, skipping Authorization header');
    console.log('AuthInterceptor - Refresh endpoint URL:', req.url);
    console.log('AuthInterceptor - Refresh endpoint method:', req.method);
    console.log('AuthInterceptor - Request will be sent with withCredentials from service');
    console.log('AuthInterceptor - sessionId cookie (HttpOnly) should be sent automatically by browser');
    // Ensure the request passes through without modification - withCredentials is set in the service
    return next(req);
  }

  // Check if token needs to be refreshed before making the request
  const shouldRefresh = authService.shouldRefreshToken();
  
  if (shouldRefresh) {
    console.log('AuthInterceptor - Token expired or about to expire, refreshing proactively');
    
    // Refresh the token first, then make the request with the new token
    return authService.refreshAccessToken().pipe(
      switchMap((refreshSuccess) => {
        if (refreshSuccess) {
          // Get the new token and make the request
          const newToken = authService.getAccessToken();
          if (newToken) {
            console.log('AuthInterceptor - Token refreshed, making request with new token');
            const clonedRequest = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`,
              },
            });
            return next(clonedRequest);
          }
        }
        
        // Refresh failed, try to proceed with existing token (will likely fail with 401)
        console.warn('AuthInterceptor - Token refresh failed, proceeding with existing token');
        const token = authService.getAccessToken();
        const clonedRequest = token ? req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        }) : req;
        
        return next(clonedRequest).pipe(
          catchError((error: HttpErrorResponse) => {
            // If we get 401, clear data and return error
            if (error.status === 401) {
              console.error('AuthInterceptor - Request failed with 401 after refresh attempt');
            }
            return throwError(() => error);
          })
        );
      }),
      catchError((refreshError) => {
        // Refresh failed, try to proceed with existing token
        console.error('AuthInterceptor - Token refresh error, proceeding with existing token:', refreshError);
        const token = authService.getAccessToken();
        const clonedRequest = token ? req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        }) : req;
        
        return next(clonedRequest);
      })
    );
  }

  // Token is still valid, proceed with normal request
  const token = authService.getAccessToken();
  console.log('AuthInterceptor - Intercepting request to:', req.url);
  console.log('AuthInterceptor - Token available:', token ? 'Yes' : 'No');

  // Clone the request and add the authorization header if token exists
  let clonedRequest = req;
  if (token) {
    clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('AuthInterceptor - Authorization header added to request');
  }

  // Execute the request and handle 401 errors as a fallback (in case token expired between check and request)
  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized - access token expired
      // IMPORTANT: When access token expires, we should NOT log out the user.
      // Instead, call /auth/refresh API with refreshToken from cookies to get a new access token.
      if (error.status === 401) {
        console.log('AuthInterceptor - Received 401 (access token expired), calling /auth/refresh API with refreshToken from cookies');

        // Try to refresh the token by calling /auth/refresh API with refreshToken from cookies
        return authService.refreshAccessToken().pipe(
          switchMap((refreshSuccess) => {
            if (refreshSuccess) {
              // Get the new token and retry the original request
              const newToken = authService.getAccessToken();
              if (newToken) {
                console.log('AuthInterceptor - Access token refreshed successfully via /auth/refresh, retrying original request');
                const retryRequest = req.clone({
                  setHeaders: {
                    Authorization: `Bearer ${newToken}`,
                  },
                });
                return next(retryRequest);
              }
            }
            // Refresh failed - return the original error but don't log out
            // User will only be logged out if refreshToken itself is invalid (handled in refreshAccessToken)
            console.error('AuthInterceptor - Token refresh failed or no new token received');
            return throwError(() => error);
          }),
          catchError((refreshError) => {
            // Refresh API call failed - return the original error but don't log out
            // User will only be logged out if refreshToken itself is invalid (handled in refreshAccessToken)
            console.error('AuthInterceptor - Token refresh API call error:', refreshError);
            return throwError(() => error);
          })
        );
      }

      // For other errors, just pass them through
      return throwError(() => error);
    })
  );
};

