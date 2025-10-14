import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useLocation } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet-routing-machine';
import './CampusMap.css';

import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetinaUrl, iconUrl: iconUrl, shadowUrl: shadowUrl,
});

// This single component now handles all map events: routing, highlighting, and resizing.
const MapController = ({ start, startName, destination, destinationName, highlightCoords, popupText }) => {
    const map = useMap();

    useEffect(() => {
        // Fix for map not rendering correctly on initial load
        const timer = setTimeout(() => map.invalidateSize(), 100);

        let routingControl = null;

        // --- All-in-one Routing and Highlighting Logic ---
        // This now correctly handles a custom start point OR a live user position.
        if (start && destination) {
            const [startLng, startLat] = start;
            const [destLng, destLat] = destination;
            
            routingControl = L.Routing.control({
                waypoints: [ L.latLng(startLat, startLng), L.latLng(destLat, destLng) ],
                show: true,
                addWaypoints: false,
                createMarker: () => null, // We add our own styled markers
                lineOptions: { styles: [{ color: '#007bff', opacity: 0.8, weight: 6 }] }
            }).addTo(map);

            // Add markers for the start and end of the custom route
            L.marker([startLat, startLng]).addTo(map).bindPopup(startName || "Start Point");
            L.marker([destLat, destLng]).addTo(map).bindPopup(destinationName || "Destination");
        } 
        // Logic for highlighting a single point remains the same
        else if (highlightCoords) {
            const [lng, lat] = highlightCoords;
            map.flyTo([lat, lng], 18);
            L.marker([lat, lng]).addTo(map).bindPopup(`<b>${popupText}</b>`).openPopup();
        }

        // Cleanup function to remove controls and timers
        return () => {
            clearTimeout(timer);
            if (routingControl) {
                map.removeControl(routingControl);
            }
        };
    }, [map, start, startName, destination, destinationName, highlightCoords, popupText]);

    return null;
};

// --- Main Map Component ---
const CampusMap = () => {
    const INITIAL_CENTER = [23.03378, 72.5475]; 
    const campusBounds = L.latLngBounds([23.030, 72.542], [23.038, 72.552]);
    
    const [buildings, setBuildings] = useState([]);
    const [userPosition, setUserPosition] = useState(null); // User's live location
    const location = useLocation();
    
    // Get all possible state properties from the navigation
    const { start, startName, destination, destinationName, highlightCoords, popupText } = location.state || {};

    // --- THIS IS THE KEY LOGIC CHANGE ---
    // Determine the final start point for routing. It's either the custom 'start' from the "Directions" page,
    // or the user's live 'userPosition' if coming from a "Get Directions" button.
    const routeStartPoint = start || (userPosition ? [userPosition.lng, userPosition.lat] : null);
    const routeStartName = startName || "Your Location";
    
    // Determine if we are in any kind of "special" mode
    const isRouting = !!(routeStartPoint && destination);
    const isHighlighting = !!(highlightCoords && !destination);

    useEffect(() => {
        const fetchBuildings = async () => {
            try {
                const response = await fetch('http://localhost:5001/api/buildings');
                const data = await response.json();
                if (Array.isArray(data)) setBuildings(data);
            } catch (error) {
                console.error("Failed to fetch buildings:", error);
            }
        };
        fetchBuildings();
    }, []);

    const userLocationIcon = new L.divIcon({
        className: 'user-location-icon', html: '<div class="user-dot"></div>', iconSize: [20, 20]
    });

    return (
        <div className="map-page-container">
            <h1 className="map-title">Interactive Campus Map</h1>
            <div className="map-wrapper">
                <MapContainer center={INITIAL_CENTER} zoom={17} className="leaflet-map" maxBounds={campusBounds} minZoom={16}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'/>
                    
                    {/* Render building markers only if we are in the default view */}
                    {!isRouting && !isHighlighting && Array.isArray(buildings) && buildings.map(building => (
                        <Marker key={building._id} position={[building.location.coordinates[1], building.location.coordinates[0]]}>
                            <Popup><b>{building.name}</b><br/>{building.info}</Popup>
                        </Marker>
                    ))}

                    {/* This component continuously tracks the user's location but renders nothing */}
                    <LocationTracker campusBounds={campusBounds} onLocationUpdate={setUserPosition} />
                    
                    {/* Render the user's blue dot if they are on campus and not routing from the Directions page */}
                    {userPosition && !start && <Marker position={userPosition} icon={userLocationIcon}><Popup>Your Location</Popup></Marker>}

                    {/* The single, powerful controller for all map actions */}
                    <MapController 
                        start={routeStartPoint}
                        startName={routeStartName}
                        destination={destination}
                        destinationName={destinationName}
                        highlightCoords={highlightCoords}
                        popupText={popupText}
                    />
                </MapContainer>
            </div>
        </div>
    );
};

// This separate component is necessary to use the useMap hook for location tracking
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