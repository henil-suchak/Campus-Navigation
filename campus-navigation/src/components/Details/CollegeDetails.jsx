import React, { useState, useEffect } from 'react';
import './CollegeDetails.css';

const CollegeDetails = () => {
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setLoading(true);
                // Make one single, efficient API call to our new endpoint
                const response = await fetch('http://localhost:5001/api/details');
                const data = await response.json();
                setDetails(data);
            } catch (error) {
                console.error("Failed to fetch college details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, []);

    if (loading) {
        // You can add a loading spinner component here
        return <p>Loading college details...</p>;
    }

    if (!details) {
        return <p>Could not load college details.</p>;
    }

    return (
        <div className="details-container">
            <h2>Campus Overview</h2>
            
            <div className="summary-grid">
                <div className="summary-card">
                    <h3>{details.buildingCount}</h3>
                    <p>Total Buildings</p>
                </div>
                <div className="summary-card">
                    <h3>{details.departmentCount}</h3>
                    <p>Departments</p>
                </div>
                <div className="summary-card">
                    <h3>{details.classroomCount || 0}</h3>
                    <p>Classrooms & Labs</p>
                </div>
            </div>

            <div className="details-section">
                <h3>Recently Added Buildings</h3>
                <ul className="building-list">
                    {details.recentBuildings.map(building => (
                        <li key={building._id} className="building-list-item">
                            <h4>{building.name}</h4>
                            <p>{building.info}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default CollegeDetails;