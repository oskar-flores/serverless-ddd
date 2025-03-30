import React, { useState } from 'react';

interface PaymentFormData {
  ticketId: string;
  amount: string;
  cardNumber: string;
  cardholderName: string;
  expiryDate: string;
  cvv: string;
}

interface PaymentRecord {
  id: string;
  ticketId: string;
  amount: string;
  date: string;
  status: 'completed' | 'pending' | 'refunded';
}

const PaymentPage: React.FC = () => {
  const [formData, setFormData] = useState<PaymentFormData>({
    ticketId: '',
    amount: '',
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Mock payment history data
  const [paymentHistory] = useState<PaymentRecord[]>([
    {
      id: 'PAY123456',
      ticketId: 'TKT123456',
      amount: '350.00',
      date: '2023-06-15',
      status: 'completed'
    },
    {
      id: 'PAY123457',
      ticketId: 'TKT123457',
      amount: '420.00',
      date: '2023-06-10',
      status: 'refunded'
    },
    {
      id: 'PAY123458',
      ticketId: 'TKT123458',
      amount: '280.00',
      date: '2023-06-05',
      status: 'completed'
    }
  ]);
  
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
      console.log('Processing payment with data:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage({ 
        type: 'success', 
        text: 'Payment processed successfully! A receipt has been sent to your email.' 
      });
      
      // Reset form
      setFormData({
        ticketId: '',
        amount: '',
        cardNumber: '',
        cardholderName: '',
        expiryDate: '',
        cvv: ''
      });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Failed to process payment. Please check your card details and try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getStatusClass = (status: PaymentRecord['status']) => {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'pending':
        return 'status-pending';
      case 'refunded':
        return 'status-refunded';
      default:
        return '';
    }
  };
  
  return (
    <div>
      <h1 className="page-title">Payment Management</h1>
      <p className="page-subtitle">Process payments and view your payment history</p>
      
      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}
      
      <div className="card">
        <h2>Process Payment</h2>
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
            <label htmlFor="amount">Amount ($)</label>
            <input
              type="number"
              id="amount"
              name="amount"
              className="form-control"
              value={formData.amount}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              placeholder="Enter payment amount"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="cardNumber">Card Number</label>
            <input
              type="text"
              id="cardNumber"
              name="cardNumber"
              className="form-control"
              value={formData.cardNumber}
              onChange={handleChange}
              required
              placeholder="XXXX XXXX XXXX XXXX"
              maxLength={19}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="cardholderName">Cardholder Name</label>
            <input
              type="text"
              id="cardholderName"
              name="cardholderName"
              className="form-control"
              value={formData.cardholderName}
              onChange={handleChange}
              required
              placeholder="Enter name as it appears on card"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="expiryDate">Expiry Date</label>
              <input
                type="text"
                id="expiryDate"
                name="expiryDate"
                className="form-control"
                value={formData.expiryDate}
                onChange={handleChange}
                required
                placeholder="MM/YY"
                maxLength={5}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="cvv">CVV</label>
              <input
                type="text"
                id="cvv"
                name="cvv"
                className="form-control"
                value={formData.cvv}
                onChange={handleChange}
                required
                placeholder="XXX"
                maxLength={4}
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            className="btn" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Process Payment'}
          </button>
        </form>
      </div>
      
      <div className="card">
        <h2>Payment History</h2>
        {paymentHistory.length > 0 ? (
          <div className="table-container">
            <table className="payment-table">
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>Ticket ID</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map(payment => (
                  <tr key={payment.id}>
                    <td>{payment.id}</td>
                    <td>{payment.ticketId}</td>
                    <td>${payment.amount}</td>
                    <td>{payment.date}</td>
                    <td>
                      <span className={`status ${getStatusClass(payment.status)}`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No payment history available.</p>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;