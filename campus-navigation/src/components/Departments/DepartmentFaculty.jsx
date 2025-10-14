import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './DepartmentStyles.css';

const DepartmentFaculty = () => {
    const [faculty, setFaculty] = useState([]);
    const [department, setDepartment] = useState(null);
    const { id } = useParams(); // Gets the department ID from the URL
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDeptAndFaculty = async () => {
            try {
                setLoading(true);
                // Fetch department details to display the name
                const deptResponse = await fetch(`http://localhost:5001/api/departments/${id}`);
                const deptData = await deptResponse.json();
                setDepartment(deptData);

                // Fetch faculty for this specific department using the new API route
                const facultyResponse = await fetch(`http://localhost:5001/api/departments/${id}/faculty`);
                const facultyData = await facultyResponse.json();
                setFaculty(facultyData);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDeptAndFaculty();
    }, [id]);

    if (loading) {
        return <div className="loading-spinner"></div>;
    }

    if (!department) {
        return <div>Department not found.</div>;
    }

    return (
        <div className="department-container">
            <Link to="/departments" className="back-link">&larr; Back to all departments</Link>
            <h2>Faculty of {department.name}</h2>
            <div className="faculty-list">
                {faculty.length > 0 ? faculty.map(member => (
                    <Link to={`/faculty/${member._id}`} key={member._id} className="faculty-list-item">
                        <h4>{member.name}</h4>
                        <p>{member.title}</p>
                    </Link>
                )) : <p>No faculty members found for this department.</p>}
            </div>
        </div>
    );
};

export default DepartmentFaculty;