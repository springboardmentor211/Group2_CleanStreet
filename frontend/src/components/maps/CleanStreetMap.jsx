import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons missing in Leaflet + React build
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Default configuration for the map
const JAIPUR_COORDS = [26.9124, 75.7873];
const DEFAULT_ZOOM = 13;

const mapContainerStyle = {
  height: "500px",
  width: "100%",
  borderRadius: "8px",
  overflow: "hidden",
  border: "1px solid #e0e0e0",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
};

const CleanStreetMap = () => {
  return (
    <div className="map-wrapper" style={mapContainerStyle}>
      <MapContainer 
        center={JAIPUR_COORDS} 
        zoom={DEFAULT_ZOOM} 
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false} // UX: Prevents accidental zooming while scrolling page
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={JAIPUR_COORDS}>
          <Popup>
            <strong>Clean Street Hub</strong> <br />
            Main Operation Center
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default CleanStreetMap;