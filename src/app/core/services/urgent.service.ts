import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Species, UrgentRequest, UrgentType } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class UrgentService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/urgent`;

  list(filters: { type?: UrgentType; species?: Species; city?: string } = {}) {
    let params = new HttpParams();
    if (filters.type) params = params.set('type', filters.type);
    if (filters.species) params = params.set('species', filters.species);
    if (filters.city) params = params.set('city', filters.city);
    return this.http.get<UrgentRequest[]>(this.base, { params });
  }

  get(id: string) {
    return this.http.get<UrgentRequest>(`${this.base}/${id}`);
  }

  create(payload: Partial<UrgentRequest>) {
    return this.http.post<UrgentRequest>(this.base, payload);
  }
}
