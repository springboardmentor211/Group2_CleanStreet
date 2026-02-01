/* FEATURE: MAP-MOHAMMAD-JISHAN - Combined Filters & Geolocation */

import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet icons
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Mock data
const allIssues = [
    { id: 1, lat: 26.5940, lng: 75.8710, status: 'Pending', title: 'Construction Waste - JU Gate 2', color: 'red' },
    { id: 2, lat: 26.3580, lng: 75.9250, status: 'Pending', title: 'Garbage Pile - Niwai Market', color: 'red' },
    { id: 3, lat: 26.7670, lng: 75.8500, status: 'Resolved', title: 'Pothole Fixed - Sitapura', color: 'green' }
];

// Sub-component for smooth "Fly To" animation
const LocationMarker = ({ position }) => {
    const map = useMap();
    if (position) {
        map.flyTo(position, 14);
    }
    return position === null ? null : (
        <Marker position={position}>
            <Popup>You are here!</Popup>
        </Marker>
    );
};

const CleanStreetMap = () => {
    const [filter, setFilter] = useState('All');
    const [userLocation, setUserLocation] = useState(null);
    const center = [26.6000, 75.8800];

    // Filtering Logic
    const filteredIssues = allIssues.filter(issue => 
        filter === 'All' ? true : issue.status === filter
    );

    const handleFindMe = () => {
        if (!navigator.geolocation) {
            alert("Geolocation not supported by browser");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
            () => alert("Permission denied. Enable location to use this.")
        );
    };

    return (
        <div style={{ width: '100%', padding: '10px', fontFamily: 'Arial' }}>
            {/* Action Bar: Filters + Find Me */}
            <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {['All', 'Pending', 'Resolved'].map((type) => (
                        <button 
                            key={type}
                            onClick={() => setFilter(type)}
                            style={{
                                padding: '8px 15px',
                                borderRadius: '20px',
                                border: '1px solid #ddd',
                                backgroundColor: filter === type ? '#1976d2' : '#fff',
                                color: filter === type ? '#fff' : '#333',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            {type}
                        </button>
                    ))}
                </div>
                
                <button 
                    onClick={handleFindMe}
                    style={{
                        padding: '10px 18px',
                        backgroundColor: '#27ae60',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    Find My Location
                </button>
            </div>

            <div style={{ height: '500px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <MapContainer center={center} zoom={10} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    
                    <LocationMarker position={userLocation} />

                    {filteredIssues.map((issue) => (
                        <Marker key={issue.id} position={[issue.lat, issue.lng]}>
                            <Popup>
                                <strong style={{ color: issue.status === 'Pending' ? '#e74c3c' : '#27ae60' }}>
                                    {issue.status}
                                </strong>
                                <p>{issue.title}</p>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
};

export default CleanStreetMap;