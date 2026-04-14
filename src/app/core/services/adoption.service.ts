import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AdoptionListing, Species } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class AdoptionService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/adoption`;

  list(filters: { species?: Species; city?: string } = {}) {
    let params = new HttpParams();
    if (filters.species) params = params.set('species', filters.species);
    if (filters.city) params = params.set('city', filters.city);
    return this.http.get<AdoptionListing[]>(this.base, { params });
  }

  get(id: string) {
    return this.http.get<AdoptionListing>(`${this.base}/${id}`);
  }

  create(payload: { pet_id: string; city: string }) {
    return this.http.post<AdoptionListing>(this.base, payload);
  }
}
