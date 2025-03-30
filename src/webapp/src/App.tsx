import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import './App.css';

// Pages
import Home from './pages/Home';
import BookingPage from './pages/BookingPage';
import CheckInPage from './pages/CheckInPage';
import PaymentPage from './pages/PaymentPage';

const App: React.FC = () => {
  return (
    <div className="app">
      <header className="app-header">
        <div className="container">
          <h1>Travier</h1>
          <nav>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/booking">Book a Flight</Link></li>
              <li><Link to="/check-in">Check-in</Link></li>
              <li><Link to="/payment">Payments</Link></li>
            </ul>
          </nav>
        </div>
      </header>
      
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/check-in" element={<CheckInPage />} />
          <Route path="/payment" element={<PaymentPage />} />
        </Routes>
      </main>
      
      <footer className="app-footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Travier - Plane Ticketing Service</p>
        </div>
      </footer>
    </div>
  );
};

export default App;