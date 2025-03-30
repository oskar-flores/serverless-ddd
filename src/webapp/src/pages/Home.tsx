import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div>
      <h1 className="page-title">Welcome to Travier</h1>
      <p className="page-subtitle">Your one-stop solution for plane ticketing</p>
      
      <div className="card">
        <h2>Our Services</h2>
        <p>Travier provides a comprehensive plane ticketing service with the following features:</p>
        
        <div className="features-grid">
          <div className="feature">
            <h3>Book a Flight</h3>
            <p>Search and book flights to your favorite destinations.</p>
            <Link to="/booking" className="btn">Book Now</Link>
          </div>
          
          <div className="feature">
            <h3>Check-in Online</h3>
            <p>Save time at the airport by checking in online.</p>
            <Link to="/check-in" className="btn">Check-in</Link>
          </div>
          
          <div className="feature">
            <h3>Manage Payments</h3>
            <p>View and manage your payments and refunds.</p>
            <Link to="/payment" className="btn">Payments</Link>
          </div>
        </div>
      </div>
      
      <div className="card">
        <h2>About Travier</h2>
        <p>
          Travier is a modern plane ticketing service built using Domain-Driven Design principles.
          Our platform is designed to provide a seamless experience for booking flights, checking in,
          and managing payments.
        </p>
        <p>
          We leverage serverless architecture to ensure high availability and scalability,
          allowing us to serve customers efficiently even during peak travel seasons.
        </p>
      </div>
    </div>
  );
};

export default Home;