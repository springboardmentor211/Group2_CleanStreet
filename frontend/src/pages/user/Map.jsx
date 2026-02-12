import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Container, Typography, Box, Paper, Chip, Stack, Button, Divider, alpha } from '@mui/material'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import axios from 'axios'
import booleanPointInPolygon from '@turf/boolean-point-in-polygon'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw'
import 'leaflet-draw/dist/leaflet.draw.css'
import 'leaflet-routing-machine'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'
import 'leaflet-easyprint'

// Fix default icon paths for Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).toString(),
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).toString(),
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).toString(),
})

const statusColor = {
  open: '#1976d2',
  pending: '#ed6c02',
  resolved: '#2e7d32'
}

const categoryColors = {
  sanitation: '#43a047',
  infrastructure: '#1e88e5',
  electricity: '#f9a825',
  water: '#00acc1',
  roads: '#8e24aa'
}

const createDivIcon = (color) => L.divIcon({
  className: 'custom-div-icon',
  html: `
    <div style="display:flex;align-items:center;justify-content:center;width:26px;height:32px;">
      <svg width="26" height="32" viewBox="0 0 26 32" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 0C6.4 0 1 5.4 1 12c0 9.1 12 20 12 20s12-10.9 12-20C25 5.4 19.6 0 13 0z" fill="${color}" stroke="#ffffff" stroke-width="2" />
        <circle cx="13" cy="12" r="4" fill="#ffffff" />
      </svg>
    </div>
  `,
  iconSize: [26, 32],
  iconAnchor: [13, 32],
  popupAnchor: [0, -28]
})

const createUserIcon = () => L.divIcon({
  className: 'custom-user-icon',
  html: `
    <div style="width:20px;height:20px;border-radius:50%;background:#111827;border:2px solid #ffffff;box-shadow:0 0 0 6px rgba(17,24,39,0.2),0 8px 12px rgba(0,0,0,0.25);"></div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -12]
})

const nearbyRadiusKm = 2

const toRadians = (deg) => (deg * Math.PI) / 180

const distanceKm = (from, to) => {
  const earthRadiusKm = 6371
  const dLat = toRadians(to.lat - from.lat)
  const dLng = toRadians(to.lng - from.lng)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(from.lat)) * Math.cos(toRadians(to.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return earthRadiusKm * c
}

function DrawControl({ onShapeCreated }) {
  const map = useMap()
  useEffect(() => {
    const drawnItems = new L.FeatureGroup()
    map.addLayer(drawnItems)

    const drawControl = new L.Control.Draw({
      draw: {
        polygon: true,
        rectangle: true,
        circle: false,
        polyline: false,
        marker: false
      },
      edit: {
        featureGroup: drawnItems
      }
    })
    map.addControl(drawControl)

    const createdHandler = (e) => {
      const layer = e.layer
      drawnItems.addLayer(layer)
      onShapeCreated(layer)
    }
    map.on(L.Draw.Event.CREATED, createdHandler)

    return () => {
      map.off(L.Draw.Event.CREATED, createdHandler)
      map.removeControl(drawControl)
      map.removeLayer(drawnItems)
    }
  }, [map, onShapeCreated])
  return null
}

function RoutingControl({ from, to, onReady }) {
  const map = useMap()
  useEffect(() => {
    if (!from || !to) return
    const control = L.Routing.control({
      waypoints: [L.latLng(from.lat, from.lng), L.latLng(to.lat, to.lng)],
      show: false,
      addWaypoints: false,
      routeWhileDragging: false,
      router: L.Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1' })
    }).addTo(map)
    control.on('routesfound', (e) => onReady?.(e))
    return () => { map.removeControl(control) }
  }, [map, from, to, onReady])
  return null
}

function EasyPrintControl() {
  const map = useMap()
  useEffect(() => {
    const printer = L.easyPrint({
      position: 'topleft',
      sizeModes: ['Current', 'A4Landscape', 'A4Portrait'],
      filename: 'clean-street-map',
      exportOnly: true
    }).addTo(map)
    return () => {
      if (printer && printer._container) {
        map.removeControl(printer)
      }
    }
  }, [map])
  return null
}

const Map = () => {
  const [issues, setIssues] = useState([])
  const [filteredIssues, setFilteredIssues] = useState([])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [routeTo, setRouteTo] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [shapeFilter, setShapeFilter] = useState(null)

  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN

  useEffect(() => {
    axios.get('/api/reports', { withCredentials: true })
      .then(res => {
        const data = res.data?.reports || res.data || []
        const normalized = data
          .filter(r => r.latitude && r.longitude)
          .map(r => ({
            id: r._id,
            title: r.title,
            category: r.category?.toLowerCase(),
            status: r.status?.toLowerCase(),
            lat: r.latitude,
            lng: r.longitude,
            address: r.address
          }))
        setIssues(normalized)
      })
      .catch(err => console.error('Failed to fetch issues', err))
  }, [])

  useEffect(() => {
    // Get user location for routing
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserLocation(null)
      )
    }
  }, [])

  useEffect(() => {
    let filtered = issues
    if (selectedCategories.length) {
      filtered = filtered.filter(i => selectedCategories.includes(i.category))
    }
    if (shapeFilter) {
      const shapeGeoJSON = shapeFilter.toGeoJSON()
      filtered = filtered.filter(i => booleanPointInPolygon([i.lng, i.lat], shapeGeoJSON))
    }
    if (userLocation) {
      filtered = filtered.filter(i => distanceKm(userLocation, { lat: i.lat, lng: i.lng }) <= nearbyRadiusKm)
    }
    setFilteredIssues(filtered)
  }, [issues, selectedCategories, shapeFilter, userLocation])

  const allCategories = useMemo(() => {
    const set = new Set(issues.map(i => i.category).filter(Boolean))
    return Array.from(set)
  }, [issues])

  const handleToggleCategory = (cat) => {
    setSelectedCategories(prev => {
      if (prev.includes(cat)) return prev.filter(c => c !== cat)
      return [...prev, cat]
    })
  }

  const defaultCenter = userLocation || { lat: 20.5937, lng: 78.9629 }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          Interactive Map
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Explore reported issues, filter by category, draw areas, plan routes, and print views.
        </Typography>
        {userLocation && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Showing issues within {nearbyRadiusKm} km of your location.
          </Typography>
        )}
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mb: 2 }}>
          {allCategories.map(cat => (
            <Chip
              key={cat}
              label={cat}
              onClick={() => handleToggleCategory(cat)}
              color={selectedCategories.includes(cat) ? 'primary' : 'default'}
              sx={{
                textTransform: 'capitalize',
                bgcolor: selectedCategories.includes(cat) ? `${(categoryColors[cat] || '#1976d2')}22` : undefined,
                color: selectedCategories.includes(cat) ? (categoryColors[cat] || '#1976d2') : undefined
              }}
            />
          ))}
          {!!selectedCategories.length && (
            <Chip label="Clear" onClick={() => setSelectedCategories([])} variant="outlined" />
          )}
        </Stack>

        <Box sx={{ mt: 2, height: '70vh', borderRadius: 2, overflow: 'hidden' }}>
          <MapContainer center={[defaultCenter.lat, defaultCenter.lng]} zoom={12} style={{ height: '100%', width: '100%' }}>
            {mapboxToken ? (
              <TileLayer
                url={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`}
                tileSize={512}
                zoomOffset={-1}
              />
            ) : (
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
            )}

            {/* Controls */}
            <EasyPrintControl />
            <DrawControl onShapeCreated={layer => setShapeFilter(layer)} />

            {userLocation && (
              <Marker position={[userLocation.lat, userLocation.lng]} icon={createUserIcon()}>
                <Popup>You're here</Popup>
              </Marker>
            )}

            <MarkerClusterGroup chunkedLoading>
              {filteredIssues.map(issue => (
                <Marker key={issue.id} position={[issue.lat, issue.lng]} icon={createDivIcon(statusColor[issue.status] || '#1976d2')}>
                  <Popup>
                    <Typography variant="subtitle1" fontWeight={700}>{issue.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{issue.address}</Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <Chip label={issue.category} size="small" sx={{ textTransform: 'capitalize' }} />
                      <Chip label={issue.status} size="small" color={issue.status === 'resolved' ? 'success' : issue.status === 'pending' ? 'warning' : 'primary'} sx={{ textTransform: 'capitalize' }} />
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                      <Button size="small" variant="contained" onClick={() => setRouteTo({ lat: issue.lat, lng: issue.lng })} disabled={!userLocation}>
                        Plan Route
                      </Button>
                      <Button size="small" variant="outlined" onClick={() => window.open(`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${issue.lat},${issue.lng}`, '_blank')}>
                        Street View
                      </Button>
                    </Stack>
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>

            {routeTo && userLocation && (
              <RoutingControl from={userLocation} to={routeTo} onReady={() => { /* noop */ }} />
            )}
          </MapContainer>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button variant="outlined" onClick={() => setShapeFilter(null)}>Clear Area Filter</Button>
          <Button variant="outlined" onClick={() => setSelectedCategories([])}>Clear Category Filter</Button>
          <Button variant="outlined" onClick={() => setRouteTo(null)} disabled={!routeTo}>Clear Route</Button>
        </Stack>
      </Paper>
    </Container>
  )
}

export default Map
