'use client';

import React, { useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker,
  Tooltip,
  useMap
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { formatTemp } from '../../lib/weatherUtils';

// Configure default icon URLs for Leaflet in Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapController({ center, zoom, onMapClick }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);

  useEffect(() => {
    if (onMapClick) {
      const clickHandler = (e) => {
        onMapClick(e.latlng);
      };
      map.on('click', clickHandler);
      return () => {
        map.off('click', clickHandler);
      };
    }
  }, [map, onMapClick]);

  return null;
}

export default function LeafletMap({
  mapRef,
  mapCenter,
  zoomLevel,
  weatherStations,
  getHeatmapColor,
  selectCity,
  temperatureUnit,
  clickedLocation,
  handleMapClick
}) {
  return (
    <MapContainer
      ref={mapRef}
      center={mapCenter}
      zoom={zoomLevel}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
      attributionControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Weather station markers */}
      {weatherStations.filter((s) => typeof s.lat === 'number' && typeof s.lng === 'number' && !isNaN(s.lat) && !isNaN(s.lng)).map((station) => (
        <CircleMarker
          key={station.id}
          center={[station.lat, station.lng]}
          radius={12}
          fillColor={getHeatmapColor(station)}
          color="#ffffff"
          weight={2}
          opacity={0.8}
          fillOpacity={0.6}
          eventHandlers={{
            click: () => selectCity(station.name)
          }}
        >
          <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={false}>
            <div className="text-xs font-bold">
              {station.name}: {formatTemp(station.temp, temperatureUnit)}
            </div>
          </Tooltip>
          <Popup>
            <div className="text-center p-1">
              <div className="font-bold text-sm">{station.name}</div>
              <div className="text-xs text-slate-600">{station.condition}</div>
              <div className="text-lg font-bold text-blue-600">
                {formatTemp(station.temp, temperatureUnit)}
              </div>
            </div>
          </Popup>
        </CircleMarker>
      ))}

      {/* Clicked location marker */}
      {clickedLocation && (
        <Marker
          position={[clickedLocation.lat, clickedLocation.lng]}
          icon={L.divIcon({
            className: 'custom-marker',
            html: `<div class="flex items-center gap-1 bg-slate-800/95 backdrop-blur-md text-white px-3 py-1.5 rounded-xl border border-blue-500/30 shadow-xl text-sm font-bold">
                    <svg class="w-4 h-4 text-blue-400 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3" fill="currentColor"/>
                    </svg>
                    ${clickedLocation.name}
                  </div>`,
            iconSize: [150, 40],
            iconAnchor: [75, 20]
          })}
        />
      )}

      <MapController
        center={mapCenter}
        zoom={zoomLevel}
        onMapClick={handleMapClick}
      />
    </MapContainer>
  );
}
