import React, { useState } from 'react';

interface CheckInFormData {
  ticketId: string;
  passengerId: string;
}

const CheckInPage: React.FC = () => {
  const [formData, setFormData] = useState<CheckInFormData>({
    ticketId: '',
    passengerId: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    
    try {
      // In a real application, this would call the API
      console.log('Checking in with data:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage({ 
        type: 'success', 
        text: 'Check-in successful! Your boarding pass has been sent to your email.' 
      });
      
      // Reset form
      setFormData({
        ticketId: '',
        passengerId: ''
      });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Failed to check in. Please verify your ticket information and try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div>
      <h1 className="page-title">Check-in for Your Flight</h1>
      <p className="page-subtitle">Enter your ticket details to check in</p>
      
      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}
      
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="ticketId">Ticket ID</label>
            <input
              type="text"
              id="ticketId"
              name="ticketId"
              className="form-control"
              value={formData.ticketId}
              onChange={handleChange}
              required
              placeholder="Enter your ticket ID"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="passengerId">Passenger ID</label>
            <input
              type="text"
              id="passengerId"
              name="passengerId"
              className="form-control"
              value={formData.passengerId}
              onChange={handleChange}
              required
              placeholder="Enter your passenger ID"
            />
          </div>
          
          <button 
            type="submit" 
            className="btn" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Check In'}
          </button>
        </form>
      </div>
      
      <div className="card">
        <h2>Check-in Information</h2>
        <p>
          Online check-in is available 24 hours before your flight's departure time.
          You will need your ticket ID and passenger ID to complete the check-in process.
        </p>
        <p>
          After checking in, you will receive your boarding pass via email.
          Please print your boarding pass or save it on your mobile device before arriving at the airport.
        </p>
      </div>
    </div>
  );
};

export default CheckInPage;