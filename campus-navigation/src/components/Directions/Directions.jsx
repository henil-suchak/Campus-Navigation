import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Directions.css';

const Directions = () => {
    const navigate = useNavigate();

    // State for user inputs and selections
    const [startQuery, setStartQuery] = useState('');
    const [endQuery, setEndQuery] = useState('');
    const [startPoint, setStartPoint] = useState(null);
    const [endPoint, setEndPoint] = useState(null);
    
    // State for live search suggestions
    const [startSuggestions, setStartSuggestions] = useState([]);
    const [endSuggestions, setEndSuggestions] = useState([]);

    // Debounce timer for API calls
    useEffect(() => {
        if (startQuery.length < 2) {
            setStartSuggestions([]);
            return;
        }
        const timer = setTimeout(() => {
            fetch(`http://localhost:5001/api/buildings/search?q=${startQuery}`)
                .then(res => res.json())
                .then(data => setStartSuggestions(data));
        }, 300); // Wait 300ms after user stops typing
        return () => clearTimeout(timer);
    }, [startQuery]);

    useEffect(() => {
        if (endQuery.length < 2) {
            setEndSuggestions([]);
            return;
        }
        const timer = setTimeout(() => {
            fetch(`http://localhost:5001/api/buildings/search?q=${endQuery}`)
                .then(res => res.json())
                .then(data => setEndSuggestions(data));
        }, 300);
        return () => clearTimeout(timer);
    }, [endQuery]);

    // Handle selecting a suggestion
    const handleSelectStart = (building) => {
        setStartPoint(building);
        setStartQuery(building.name);
        setStartSuggestions([]);
    };
    const handleSelectEnd = (building) => {
        setEndPoint(building);
        setEndQuery(building.name);
        setEndSuggestions([]);
    };

    // Handle "Get Directions" button click
    const handleGetDirections = () => {
        if (!startPoint || !endPoint) {
            alert("Please select a valid start and end point.");
            return;
        }
        navigate('/map', {
            state: {
                start: startPoint.location.coordinates,
                startName: startPoint.name,
                destination: endPoint.location.coordinates,
                destinationName: endPoint.name
            }
        });
    };

    return (
        <div className="directions-container">
            <h2>Get Directions</h2>
            <div className="directions-form">
                <div className="input-group">
                    <label htmlFor="start">Start Location</label>
                    <input
                        id="start"
                        type="text"
                        placeholder="Type to search buildings..."
                        value={startQuery}
                        onChange={(e) => {
                            setStartQuery(e.target.value);
                            setStartPoint(null); // Clear selection if user types again
                        }}
                        autoComplete="off"
                    />
                    {startSuggestions.length > 0 && (
                        <ul className="suggestions-list">
                            {startSuggestions.map(b => (
                                <li key={b._id} onClick={() => handleSelectStart(b)}>{b.name}</li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="input-group">
                    <label htmlFor="end">Destination</label>
                    <input
                        id="end"
                        type="text"
                        placeholder="Type to search buildings..."
                        value={endQuery}
                        onChange={(e) => {
                            setEndQuery(e.target.value);
                            setEndPoint(null);
                        }}
                        autoComplete="off"
                    />
                    {endSuggestions.length > 0 && (
                        <ul className="suggestions-list">
                            {endSuggestions.map(b => (
                                <li key={b._id} onClick={() => handleSelectEnd(b)}>{b.name}</li>
                            ))}
                        </ul>
                    )}
                </div>

                <button onClick={handleGetDirections} className="directions-button">
                    Get Directions
                </button>
            </div>
        </div>
    );
};

export default Directions;