import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './DepartmentStyles.css';

const DepartmentList = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:5001/api/departments');
                const data = await response.json();
                setDepartments(data);
            } catch (error) {
                console.error("Failed to fetch departments:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDepartments();
    }, []);

    if (loading) {
        return <div className="loading-spinner"></div>;
    }

    return (
        <div className="department-container">
            <h2>Our Departments</h2>
            <p className="department-intro">Select a department to view its faculty members and details.</p>
            <div className="department-grid">
                {departments.map(dept => (
                    <Link to={`/departments/${dept._id}`} key={dept._id} className="department-card">
                        <h3>{dept.name}</h3>
                        <p>Head of Department: {dept.hod}</p>
                        <p>Location: {dept.building?.name}</p>
                        <span>View Faculty &rarr;</span>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default DepartmentList;