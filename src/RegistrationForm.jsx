import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './RegistrationForm.css';
import axios from 'axios';

const RegistrationForm = () => {
    const url = "https://evoting-backend-delta.vercel.app/"

  const [formData, setFormData] = useState({
    indexNumber: '',
    name: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = () => {
    const newErrors = {};

    
    if (formData.name.length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }
    
    if (!formData.phone.match(/^[0-9]{10,15}$/)) {
      newErrors.phone = 'Invalid phone number (10-15 digits)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
        if (formData.phone.startsWith('0')) {
            formData.phone = '233' + formData.phone.slice(1);
          }

      console.log(JSON.stringify(formData))
      const response = await axios.post(`${url}api/student/create`,JSON.stringify(formData),{
        headers: {
            'Content-Type': 'application/json',
          },
      })
      console.log(response)
      
      if (!response.status === 200) throw new Error('Submission failed');
      
      setIsSuccess(true);
      // Reset form after 2 seconds
      setTimeout(() => {
        setFormData({ indexNumber: '', name: '', phone: '' });
        setIsSuccess(false);
      }, 2000);
    } catch (error) {
      alert('Error submitting form: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <motion.div 
      className="registration-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2>Voter Registration</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="indexNumber">Index Number</label>
          <input
            type="text"
            id="indexNumber"
            name="indexNumber"
            value={formData.indexNumber}
            onChange={handleChange}
            placeholder="Enter your index number"
            className={errors.indexNumber ? 'error' : ''}
          />
          {errors.indexNumber && <span className="error-message">{errors.indexNumber}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            className={errors.name ? 'error' : ''}
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter your phone number"
            className={errors.phone ? 'error' : ''}
          />
          {errors.phone && <span className="error-message">{errors.phone}</span>}
        </div>

        <motion.button
          type="submit"
          className="submit-button"
          disabled={isSubmitting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isSubmitting ? (
            <div className="spinner"></div>
          ) : isSuccess ? (
            '✓ Registered!'
          ) : (
            'Register'
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default RegistrationForm;