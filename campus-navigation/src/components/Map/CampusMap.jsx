import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useLocation, useNavigate } from 'react-router-dom';
import L from 'leaflet';
import './CampusMap.css';
import NavigationInfoPanel from './NavigationInfoPanel';

import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

const MapController = ({ path }) => {
    const map = useMap();
    useEffect(() => {
        const timer = setTimeout(() => map.invalidateSize(), 100);
        let polyline = null;
        if (path) {
            const latLngs = path.map(coords => [coords[1], coords[0]]);
            polyline = L.polyline(latLngs, { color: '#007bff', weight: 5, opacity: 0.8 }).addTo(map);
            // In live nav, we don't fit bounds; we let the user's location be the focus.
        }
        return () => {
            clearTimeout(timer);
            if (polyline) map.removeLayer(polyline);
        };
    }, [map, path]);
    return null;
};

const CampusMap = () => {
    const INITIAL_CENTER = [23.03378, 72.5475]; 
    const campusBounds = L.latLngBounds([23.030, 72.542], [23.038, 72.552]);
    
    const [buildings, setBuildings] = useState([]);
    const [userPosition, setUserPosition] = useState(null);
    const [currentPath, setCurrentPath] = useState(null);
    const [currentDistance, setCurrentDistance] = useState(0);
    const location = useLocation();
    const navigate = useNavigate();
    
    const { start, startName, destination, destinationName } = location.state || {};
    
    // --- THIS IS THE KEY LOGIC ---
    // The start point is EITHER a custom building from the Directions page OR the user's live position.
    const routeStartPoint = start || (userPosition ? [userPosition.lng, userPosition.lat] : null);
    const routeStartName = startName || "Your Location";

    // Navigation is active if we have a valid start point and a destination.
    const isNavigating = !!(routeStartPoint && destination);

    // --- REAL-TIME ROUTING EFFECT ---
    useEffect(() => {
        // This effect runs whenever the user's position changes OR when a custom start point is provided.
        if (isNavigating) {
            const fetchRoute = async () => {
                try {
                    const response = await fetch('http://localhost:5001/api/routing/get-path', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            startCoords: routeStartPoint, 
                            endCoords: destination 
                        })
                    });
                    const data = await response.json();
                    setCurrentPath(data.path);
                    setCurrentDistance(data.distance);
                } catch (error) {
                    console.error("Failed to fetch real-time route:", error);
                }
            };
            
            // Use a timeout to avoid sending too many API requests (debouncing).
            const handler = setTimeout(() => {
                fetchRoute();
            }, 300); // Recalculate route shortly after user moves.
            
            return () => clearTimeout(handler);
        }
    }, [userPosition, start, destination, isNavigating]); // Re-run when any routing parameter changes.

    useEffect(() => {
        const fetchBuildings = async () => { /* ... fetch logic remains the same ... */ };
        fetchBuildings();
    }, []);

    const handleCancelNavigation = () => {
        setCurrentPath(null);
        setCurrentDistance(0);
        // Go back to the directions page to start a new route.
        navigate('/directions', { replace: true });
    };

    const userLocationIcon = new L.divIcon({ className: 'user-location-icon', html: '<div class="user-dot"></div>', iconSize: [20, 20] });

    return (
        <div className="map-page-container">
            {isNavigating && <NavigationInfoPanel destinationName={destinationName} distance={currentDistance} onCancel={handleCancelNavigation}/>}
            <div className="map-wrapper">
                <MapContainer center={INITIAL_CENTER} zoom={17} className="leaflet-map" maxBounds={campusBounds} minZoom={16}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'/>
                    
                    {/* Only show all buildings if we are NOT navigating */}
                    {!isNavigating && Array.isArray(buildings) && buildings.map(b => <Marker key={b._id} position={[b.location.coordinates[1], b.location.coordinates[0]]}><Popup><b>{b.name}</b></Popup></Marker>)}
                    
                    <LocationTracker campusBounds={campusBounds} onLocationUpdate={setUserPosition} />
                    
                    {/* Show markers for user, start, and end points during navigation */}
                    {userPosition && <Marker position={userPosition} icon={userLocationIcon}><Popup>Your Location</Popup></Marker>}
                    {isNavigating && start && <Marker position={[start[1], start[0]]}><Popup>{startName}</Popup></Marker>}
                    {isNavigating && destination && <Marker position={[destination[1], destination[0]]}><Popup>{destinationName}</Popup></Marker>}
                    
                    {/* The controller now only needs the calculated path to draw */}
                    <MapController path={currentPath} />
                </MapContainer>
            </div>
        </div>
    );
};

// LocationTracker remains unchanged
const LocationTracker = ({ campusBounds, onLocationUpdate }) => {
    const map = useMap();
    useEffect(() => {
        map.locate({ watch: true, enableHighAccuracy: true }).on("locationfound", function (e) {
            if (campusBounds.contains(e.latlng)) { onLocationUpdate(e.latlng); } 
            else { onLocationUpdate(null); }
        });
    }, [map, campusBounds, onLocationUpdate]);
    return null;
};

export default CampusMap;