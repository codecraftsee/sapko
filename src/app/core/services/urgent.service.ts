import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { MatchSuggestion, Species, UrgentRequest, UrgentStatus, UrgentType } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class UrgentService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/urgent`;

  list(filters: {
    type?: UrgentType;
    species?: Species;
    city?: string;
    status?: UrgentStatus;
    near_lat?: number;
    near_lng?: number;
    radius_m?: number;
    since_days?: number;
  } = {}) {
    let params = new HttpParams();
    if (filters.type) params = params.set('type', filters.type);
    if (filters.species) params = params.set('species', filters.species);
    if (filters.city) params = params.set('city', filters.city);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.near_lat != null) params = params.set('near_lat', String(filters.near_lat));
    if (filters.near_lng != null) params = params.set('near_lng', String(filters.near_lng));
    if (filters.radius_m != null) params = params.set('radius_m', String(filters.radius_m));
    if (filters.since_days != null) params = params.set('since_days', String(filters.since_days));
    return this.http.get<UrgentRequest[]>(this.base, { params });
  }

  get(id: string) {
    return this.http.get<UrgentRequest>(`${this.base}/${id}`);
  }

  create(payload: Partial<UrgentRequest>) {
    return this.http.post<UrgentRequest>(this.base, payload);
  }

  potentialMatches(id: string) {
    return this.http.get<MatchSuggestion[]>(`${this.base}/${id}/potential-matches`);
  }

  confirmMatch(suggestionId: string) {
    return this.http.post<MatchSuggestion>(`${this.base}/matches/${suggestionId}/confirm`, {});
  }

  rejectMatch(suggestionId: string) {
    return this.http.post<MatchSuggestion>(`${this.base}/matches/${suggestionId}/reject`, {});
  }
}
