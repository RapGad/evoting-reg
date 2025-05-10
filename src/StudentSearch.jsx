import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import './StudentSearch.css';

const StudentSearch = () => {
  const [indexNumber, setIndexNumber] = useState('');
  const [studentData, setStudentData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [error, setError] = useState('');
  const [otpStatus, setOtpStatus] = useState({});
  const [otpResponse, setOtpResponse] = useState(null);

  const url = 'https://evoting-backend-delta.vercel.app'

  const handleSearch = async (e) => {
    e.preventDefault();


    setIsLoading(true);
    setError('');
    setStudentData(null);
    const data = {
        studentId: indexNumber
    }

    
    try {
      const response = await axios.post(`${url}/api/auth/verify-student`,data);
      console.log(response.data)
      setStudentData(response.data.student);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch student data');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOTP = async (studentId) => {
    const id = {id: studentId}
    if (!studentData) return;
    
    setIsSendingOtp(true);
    setOtpStatus(prev => ({ ...prev, [studentId]: 'sending' }));
    setOtpResponse(null);
    
    try {
      const response = await axios.post(`${url}/api/auth/send-otp`, id);
      console.log(response)
      console.log(id)
      
      setOtpStatus(prev => ({ ...prev, [studentId]: 'sent' }));
      setOtpResponse(response.data); // Store full response if needed
      
      setTimeout(() => {
        setOtpStatus(prev => ({ ...prev, [studentId]: '' }));
      }, 5000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                         err.response?.statusText || 
                         'Failed to send OTP';
      
      setOtpStatus(prev => ({ ...prev, [studentId]: 'failed' }));
      setOtpResponse({ error: errorMessage });
      
      setTimeout(() => {
        setOtpStatus(prev => ({ ...prev, [studentId]: '' }));
      }, 3000);
      
      console.error('OTP error:', err);
    } finally {
      setIsSendingOtp(false);
    }
  };

  return (
    <div className="student-search-container">
      <motion.div 
        className="search-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2>
          <span className="icon">🔍</span>
          Student Verification
        </h2>
        
        <form onSubmit={handleSearch}>
          <div className="search-input-group">
            <input
              type="text"
              value={indexNumber}
              onChange={(e) => setIndexNumber(e.target.value)}
              placeholder="Enter student index number"
              required
            />
            <button 
              type="submit" 
              disabled={isLoading}
              className="search-button"
            >
              {isLoading ? (
                <span className="spinner"></span>
              ) : (
                'Search'
              )}
            </button>
          </div>
          {error && <p className="error-message">{error}</p>}
        </form>
      </motion.div>

      {studentData && (
        <motion.div 
          className="results-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3>Student Details</h3>
          
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Index No</th>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{studentData.indexNumber}</td>
                  <td>{studentData.name}</td>
                  <td>
                    <div className="contact-info">
                      <span style={ studentData.phone.length === 12 ? { color: 'green' } : { color: 'red' }}>{studentData.phone}</span>
                    </div>
                  </td>
                  <td>
                    <div className="otp-action">
                    <button
                      onClick={() => handleSendOTP(studentData._id)}
                      disabled={isSendingOtp || otpStatus[studentData.indexNumber] === 'sending'}
                      className={`otp-button ${otpStatus[studentData.indexNumber] || ''}`}
                    >
                      {otpStatus[studentData.indexNumber] === 'sending' ? (
                        <span className="small-spinner"></span>
                      ) : otpStatus[studentData.indexNumber] === 'sent' ? (
                        '✓ Sent'
                      ) : otpStatus[studentData.indexNumber] === 'failed' ? (
                        'Retry'
                      ) : (
                        'Send OTP'
                      )}
                    </button>
                    {otpResponse?.message && (
                        <span className="otp-message success">
                          {otpResponse.message}
                        </span>
                      )}
                      {otpResponse?.error && (
                        <span className="otp-message error">
                          {otpResponse.error}
                        </span>
                      )}

                    </div>
                    
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default StudentSearch;