import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenResponse, User } from '../models/api.models';

const ACCESS_KEY = 'sapko.access';
const REFRESH_KEY = 'sapko.refresh';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  private _user = signal<User | null>(null);
  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);
  readonly isAdmin = computed(() => this._user()?.role === 'admin');

  get accessToken(): string | null {
    return localStorage.getItem(ACCESS_KEY);
  }
  get refreshToken(): string | null {
    return localStorage.getItem(REFRESH_KEY);
  }

  loadCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.base}/api/auth/me`).pipe(
      tap((u) => this._user.set(u)),
    );
  }

  login(email: string, password: string): Observable<TokenResponse> {
    const body = new HttpParams().set('username', email).set('password', password);
    return this.http
      .post<TokenResponse>(`${this.base}/api/auth/login`, body.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      .pipe(tap((res) => this.storeTokens(res)));
  }

  register(payload: { email: string; password: string; full_name?: string; phone?: string; city?: string }) {
    return this.http
      .post<TokenResponse>(`${this.base}/api/auth/register`, payload)
      .pipe(tap((res) => this.storeTokens(res)));
  }

  logout() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    this._user.set(null);
  }

  private storeTokens(res: TokenResponse) {
    localStorage.setItem(ACCESS_KEY, res.access_token);
    localStorage.setItem(REFRESH_KEY, res.refresh_token);
  }
}
