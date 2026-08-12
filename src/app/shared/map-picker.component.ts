import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import * as L from 'leaflet';

// Leaflet's default icon paths break under bundlers; resolve them via CDN.
const ICON_BASE = 'https://unpkg.com/leaflet@1.9.4/dist/images';
const DEFAULT_ICON = L.icon({
  iconUrl: `${ICON_BASE}/marker-icon.png`,
  iconRetinaUrl: `${ICON_BASE}/marker-icon-2x.png`,
  shadowUrl: `${ICON_BASE}/marker-shadow.png`,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const DEFAULT_CENTER: L.LatLngTuple = [44.7866, 20.4489]; // Beograd
const DEFAULT_ZOOM = 13;

@Component({
  selector: 'app-map-picker',
  template: `
    <div class="map-picker">
      <div #mapEl class="map-picker__map" role="application" aria-label="Mapa za izbor lokacije"></div>
      <div class="map-picker__hint">
        @if (coords()) {
          <i data-lucide="map-pin"></i>
          <span>Izabrana lokacija: {{ coords()!.lat.toFixed(5) }}, {{ coords()!.lng.toFixed(5) }}</span>
          <button type="button" class="map-picker__clear" (click)="clear()">Obriši</button>
        } @else {
          <span>Klikni na mapu da označiš mesto.</span>
          @if (geolocationAvailable) {
            <button type="button" class="map-picker__locate" (click)="useMyLocation()">
              Moja lokacija
            </button>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .map-picker {
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      overflow: hidden;
      background: var(--bg-card);
    }
    .map-picker__map { height: 320px; width: 100%; }
    .map-picker__hint {
      display: flex; align-items: center; gap: 0.6rem;
      padding: 0.65rem 0.85rem;
      background: var(--bg-base);
      border-top: 1px solid var(--border);
      font-size: 0.85rem; color: var(--text-muted);
    }
    .map-picker__hint [data-lucide] { width: 0.95rem; height: 0.95rem; color: var(--primary); }
    .map-picker__clear,
    .map-picker__locate {
      margin-left: auto;
      background: transparent;
      border: 1px solid var(--border);
      color: var(--text);
      font: inherit; font-size: 0.8rem; font-weight: 500;
      padding: 0.3rem 0.7rem;
      border-radius: var(--radius-pill);
      cursor: pointer;
    }
    .map-picker__clear:hover,
    .map-picker__locate:hover { border-color: var(--primary); color: var(--primary); }
  `],
})
export class MapPickerComponent implements AfterViewInit, OnDestroy {
  initialLat = input<number | null>(null);
  initialLng = input<number | null>(null);
  pick = output<{ lat: number; lng: number }>();
  clearPick = output<void>();

  @ViewChild('mapEl', { static: true }) mapEl!: ElementRef<HTMLDivElement>;

  coords = signal<{ lat: number; lng: number } | null>(null);
  geolocationAvailable = typeof navigator !== 'undefined' && !!navigator.geolocation;

  private map?: L.Map;
  private marker?: L.Marker;

  constructor() {
    effect(() => {
      const lat = this.initialLat();
      const lng = this.initialLng();
      if (lat != null && lng != null && this.map) {
        this.placeMarker(lat, lng, false);
      }
    });
  }

  ngAfterViewInit(): void {
    const lat = this.initialLat();
    const lng = this.initialLng();
    const center: L.LatLngTuple = lat != null && lng != null ? [lat, lng] : DEFAULT_CENTER;

    this.map = L.map(this.mapEl.nativeElement).setView(center, DEFAULT_ZOOM);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(this.map);

    if (lat != null && lng != null) this.placeMarker(lat, lng, false);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.placeMarker(e.latlng.lat, e.latlng.lng, true);
    });

    setTimeout(() => this.map?.invalidateSize(), 0);
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  useMyLocation(): void {
    if (!this.geolocationAvailable) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.map?.setView([pos.coords.latitude, pos.coords.longitude], 16);
        this.placeMarker(pos.coords.latitude, pos.coords.longitude, true);
      },
      () => { /* user denied or unavailable — no-op */ },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  clear(): void {
    if (this.marker) {
      this.marker.remove();
      this.marker = undefined;
    }
    this.coords.set(null);
    this.clearPick.emit();
  }

  private placeMarker(lat: number, lng: number, emit: boolean): void {
    if (!this.map) return;
    if (this.marker) {
      this.marker.setLatLng([lat, lng]);
    } else {
      this.marker = L.marker([lat, lng], { icon: DEFAULT_ICON, draggable: true }).addTo(this.map);
      this.marker.on('dragend', () => {
        const ll = this.marker!.getLatLng();
        this.coords.set({ lat: ll.lat, lng: ll.lng });
        this.pick.emit({ lat: ll.lat, lng: ll.lng });
      });
    }
    this.coords.set({ lat, lng });
    if (emit) this.pick.emit({ lat, lng });
  }
}
