import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import './App.css';
import NavigationBar from './components/Navigation/NavigationBar';
import Footer from './components/Footer/Footer';

// Import components
import Home from './components/Home/Home';
import Directions from './components/Directions/Directions'; // <-- Import new component
import DepartmentList from './components/Departments/DepartmentList';
import DepartmentFaculty from './components/Departments/DepartmentFaculty';
import FacultyDetail from './components/Departments/FacultyDetail';

import CollegeDetails from './components/Details/CollegeDetails'; 
const CampusMap = React.lazy(() => import('./components/Map/CampusMap'));

function App() {
  return (
    <Router>
      <div className="app-container">
        <NavigationBar />
        <main className="main-content">
          <Suspense fallback={<div className="loading-spinner"></div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/map" element={<CampusMap />} />
              {/* --- NEW ROUTE --- */}
              <Route path="/directions" element={<Directions />} />
              <Route path="/departments" element={<DepartmentList />} />
              <Route path="/departments/:id" element={<DepartmentFaculty />} />
              <Route path="/faculty/:id" element={<FacultyDetail />} />

              <Route path="/details" element={<CollegeDetails />} /> 
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;