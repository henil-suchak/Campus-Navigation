import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './DepartmentStyles.css';

const FacultyDetail = () => {
    const [member, setMember] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFacultyDetail = async () => {
            try {
                setLoading(true);
                const response = await fetch(`http://localhost:5001/api/faculty/${id}`);
                const data = await response.json();
                setMember(data);
            } catch (error)
 {
                console.error("Failed to fetch faculty details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFacultyDetail();
    }, [id]);

    // NEW FUNCTION: Navigates to the map to just show the location
    const handleShowLocation = () => {
        if (member?.office?.building?.location) {
            navigate('/map', { 
                state: { 
                    highlightCoords: member.office.building.location.coordinates,
                    popupText: `${member.name}'s Office (${member.office.building.name})`
                } 
            });
        }
    };
    
    // This function navigates to the map to start live routing
    const handleGetDirections = () => {
        if (member?.office?.building?.location) {
            navigate('/map', { 
                state: { 
                    destination: member.office.building.location.coordinates,
                    destinationName: `${member.name}'s Office (${member.office.building.name})`
                } 
            });
        }
    };

    if (loading) {
        return <div className="loading-spinner"></div>;
    }
    
    if (!member) {
        return <div>Faculty member not found.</div>
    }

    return (
        <div className="department-container">
            <Link to={`/departments/${member.department._id}`} className="back-link">&larr; Back to {member.department.name} Faculty</Link>
            <div className="faculty-detail-card">
                <h2>{member.name}</h2>
                <p className="faculty-title">{member.title}</p>
                <div className="faculty-info">
                    <p><strong>Department:</strong> {member.department.name}</p>
                    <p><strong>Office Location:</strong> {member.office.building.name}</p>
                    <p><strong>Room Number:</strong> {member.office.roomNumber}</p>
                    <p><strong>Email:</strong> <a href={`mailto:${member.email}`}>{member.email}</a></p>
                    <p><strong>About:</strong> {member.details}</p>
                </div>
                {/* --- TWO BUTTONS ARE NOW RENDERED --- */}
                <div className="button-group">
                    <button onClick={handleShowLocation} className="map-button secondary">
                        Show Office Location
                    </button>
                    <button onClick={handleGetDirections} className="map-button">
                        Get Directions to Office
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FacultyDetail;