/* FEATURE: MAP-MOHAMMAD-JISHAN */

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet icon markers not showing up in React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Mock data for impact visualization
const issues = [
    { id: 1, lat: 26.5940, lng: 75.8710, status: 'Pending', title: 'Construction Waste - JU Gate 2', color: 'red' },
    { id: 2, lat: 26.3580, lng: 75.9250, status: 'Pending', title: 'Garbage Pile - Niwai Market', color: 'red' },
    { id: 3, lat: 26.7670, lng: 75.8500, status: 'Resolved', title: 'Pothole Fixed - Sitapura', color: 'green' }
];

const CleanStreetMap = () => {
    // Centering the map between Jaipur and Niwai
    const center = [26.6000, 75.8800];

    return (
        <div style={{ height: '500px', width: '100%', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <MapContainer center={center} zoom={10} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {issues.map((issue) => (
                    <Marker key={issue.id} position={[issue.lat, issue.lng]}>
                        <Popup>
                            <div style={{ textAlign: 'center' }}>
                                <strong style={{ color: issue.color === 'red' ? '#e74c3c' : '#27ae60' }}>
                                    {issue.status}
                                </strong>
                                <p>{issue.title}</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default CleanStreetMap;