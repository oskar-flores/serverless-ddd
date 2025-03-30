import React, { useState } from 'react';

interface BookingFormData {
  flightId: string;
  passengerId: string;
  seatNumber: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
}

const BookingPage: React.FC = () => {
  const [formData, setFormData] = useState<BookingFormData>({
    flightId: '',
    passengerId: '',
    seatNumber: '',
    departureDate: '',
    departureTime: '',
    arrivalDate: '',
    arrivalTime: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    
    try {
      // In a real application, this would call the API
      console.log('Booking ticket with data:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage({ 
        type: 'success', 
        text: 'Ticket reserved successfully! You will receive a confirmation email shortly.' 
      });
      
      // Reset form
      setFormData({
        flightId: '',
        passengerId: '',
        seatNumber: '',
        departureDate: '',
        departureTime: '',
        arrivalDate: '',
        arrivalTime: ''
      });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Failed to reserve ticket. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div>
      <h1 className="page-title">Book a Flight</h1>
      <p className="page-subtitle">Enter your flight details to reserve a ticket</p>
      
      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}
      
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="flightId">Flight Number</label>
            <input
              type="text"
              id="flightId"
              name="flightId"
              className="form-control"
              value={formData.flightId}
              onChange={handleChange}
              required
              placeholder="e.g. FL123"
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
              placeholder="e.g. P12345"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="seatNumber">Seat Number</label>
            <input
              type="text"
              id="seatNumber"
              name="seatNumber"
              className="form-control"
              value={formData.seatNumber}
              onChange={handleChange}
              required
              placeholder="e.g. 12A"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="departureDate">Departure Date</label>
              <input
                type="date"
                id="departureDate"
                name="departureDate"
                className="form-control"
                value={formData.departureDate}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="departureTime">Departure Time</label>
              <input
                type="time"
                id="departureTime"
                name="departureTime"
                className="form-control"
                value={formData.departureTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="arrivalDate">Arrival Date</label>
              <input
                type="date"
                id="arrivalDate"
                name="arrivalDate"
                className="form-control"
                value={formData.arrivalDate}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="arrivalTime">Arrival Time</label>
              <input
                type="time"
                id="arrivalTime"
                name="arrivalTime"
                className="form-control"
                value={formData.arrivalTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            className="btn" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Reserving...' : 'Reserve Ticket'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingPage;