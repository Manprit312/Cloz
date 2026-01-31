import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User, UserRole } from '@models/user.model';
import { delay, Observable, of, throwError, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  gender: string;
}

export interface SignupResponse {
  mfaSessionId: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  mfaSessionId: string;
}

export interface MfaVerifyRequest {
  mfaSessionId: string;
  otpCode: string;
  password: string;
}

export interface MfaVerifyResponse {
  // Add response fields based on your backend response
  // For now, assuming it returns user data or tokens
  [key: string]: any;
}

export interface RefreshTokenResponse {
  accessToken?: string;
  token?: string;
  expiresIn?: number;
  [key: string]: any;
}

export interface LogoutRequest {
  // Empty request body for logout
}

export interface LogoutResponse {
  message?: string;
  [key: string]: any;
}

/** Response from GET /user/profile - used for currentUser and userProfile */
export interface GetProfileResponse {
  username?: string;
  email?: string;
  name?: string;
  gender?: string;
  role?: string;
  darkMode?: boolean;
  [key: string]: any;
}

/** Body for PATCH /user/profile - send only fields being updated */
export interface UpdateProfileRequest {
  name?: string;
  gender?: string;
  password?: string;
}

export interface UpdateProfileResponse {
  message?: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private users: Record<string, { password: string; role: UserRole }> = {
    admin: { password: 'admin', role: 'admin' },
    user: { password: 'user', role: 'user' },
  };

  login(username: string, password: string): Observable<User> {
    const found = this.users[username];

    if (found && found.password === password) {
      const user: User = { username, role: found.role };
      return of(user).pipe(delay(400)); // Simulate delay
    } else {
      return throwError(() => new Error('Invalid credentials'));
    }
  }

  signup(signupData: SignupRequest): Observable<SignupResponse> {
    return this.http.post<SignupResponse>(
      `${environment.backendBaseUrl}/auth/signup`,
      signupData,
      {
        withCredentials: true // Required for cookies
      }
    );
  }

  loginKeycloak(loginData: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${environment.backendBaseUrl}/auth/login`,
      loginData,
      {
        withCredentials: true // Required for cookies
      }
    );
  }

  verifyMfa(verifyData: MfaVerifyRequest): Observable<MfaVerifyResponse> {
    return this.http.post<MfaVerifyResponse>(
      `${environment.backendBaseUrl}/auth/mfa/verify`,
      verifyData,
      {
        withCredentials: true
      }
    );
  }

  /**
   * Refresh the access token using the session ID from Capacitor Preferences
   * Sends sessionId in X-Session-Id header instead of relying on cookies
   * @param sessionId The session ID to send in X-Session-Id header
   * @returns Observable with the new access token and expiration time
   */
  refreshToken(sessionId: string): Observable<RefreshTokenResponse> {
    console.log('UserService - refreshToken: Calling /auth/refresh endpoint');
    console.log('UserService - refreshToken: Endpoint URL:', `${environment.backendBaseUrl}/auth/refresh`);
    console.log('UserService - refreshToken: Sending X-Session-Id header:', sessionId);
    
    return this.http.post<RefreshTokenResponse>(
      `${environment.backendBaseUrl}/auth/refresh`,
      null, // No body - sessionId header identifies the session
      {
        headers: {
          'X-Session-Id': sessionId,
        }
      }
    ).pipe(
      tap({
        next: (response) => {
          console.log('UserService - refreshToken: Success response:', response);
        },
        error: (error) => {
          console.error('UserService - refreshToken: Error response:', error);
          console.error('UserService - refreshToken: Error status:', error?.status);
          console.error('UserService - refreshToken: Error message:', error?.error?.message || error?.message);
          console.error('UserService - refreshToken: Full error:', error);
        }
      })
    );
  }

  /**
   * Logout user by calling the logout API
   * @param sessionId The session ID to send in X-Session-Id header
   * @returns Observable with the logout response
   */
  logout(sessionId: string): Observable<LogoutResponse> {
    const logoutData: LogoutRequest = {};
    
    return this.http.post<LogoutResponse>(
      `${environment.backendBaseUrl}/auth/logout`,
      logoutData,
      {
        headers: {
          'X-Session-Id': sessionId,
        }
      }
    );
  }

  /**
   * Get user profile. GET {{baseurl}}/user/profile.
   * Auth interceptor adds Bearer token. Call after verify to populate currentUser and userProfile.
   */
  getProfile(): Observable<GetProfileResponse> {
    return this.http.get<GetProfileResponse>(
      `${environment.backendBaseUrl}/user/profile`
    );
  }

  /**
   * Update user profile (name, gender, password). Uses PATCH {{baseurl}}/user/profile.
   * Auth interceptor adds Bearer token.
   */
  updateProfile(body: UpdateProfileRequest): Observable<UpdateProfileResponse> {
    return this.http.patch<UpdateProfileResponse>(
      `${environment.backendBaseUrl}/user/profile`,
      body,
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
