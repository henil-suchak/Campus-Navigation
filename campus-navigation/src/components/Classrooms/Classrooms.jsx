// frontend/src/components/Classrooms/Classrooms.jsx
import React, { useState, useEffect } from 'react';
import './Classrooms.css';

const Classrooms = () => {
    const [classrooms, setClassrooms] = useState([]);

    useEffect(() => {
        const fetchClassrooms = async () => {
            try {
                const response = await fetch('http://localhost:5001/api/classrooms');
                const data = await response.json();
                setClassrooms(data);
            } catch (error) {
                console.error("Failed to fetch classrooms:", error);
            }
        };
        fetchClassrooms();
    }, []);

    return (
        <div className="classrooms-container">
            <h2>Classrooms & Lecture Halls</h2>
            <table className="classrooms-table">
                <thead>
                    <tr>
                        <th>Room Number</th>
                        <th>Building</th>
                        <th>Capacity</th>
                        <th>Equipment</th>
                    </tr>
                </thead>
                <tbody>
                    {classrooms.map(room => (
                        <tr key={room._id}>
                            <td>{room.roomNumber}</td>
                            <td>{room.building?.name}</td>
                            <td>{room.capacity}</td>
                            <td>{room.equipment.join(', ')}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Classrooms;
