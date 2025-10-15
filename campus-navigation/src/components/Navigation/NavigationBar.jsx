import React from 'react';
import { NavLink } from 'react-router-dom';
import './NavigationBar.css';

const NavigationBar = () => {
    return (
        <nav className="navbar">
            <div className="nav-container">
                <NavLink to="/" className="nav-logo">
                    Campus Navigator
                </NavLink>
                <ul className="nav-menu">
                    <li className="nav-item">
                        <NavLink to="/" className="nav-links" end>Home</NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink to="/map" className="nav-links">Map</NavLink>
                    </li>
                    {/* --- NEW LINK --- */}
                    <li className="nav-item">
                        <NavLink to="/directions" className="nav-links">Directions</NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink to="/departments" className="nav-links">Departments</NavLink>
                    </li>
                    
                     <li className="nav-item">
                        <NavLink to="/details" className="nav-links">College Details</NavLink>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default NavigationBar;