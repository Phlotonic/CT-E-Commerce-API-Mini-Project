import { useState, useEffect } from 'react';
import axios from 'axios';
import { func, object } from 'prop-types';
import { Form, Button, Alert, Container, Modal } from 'react-bootstrap';

const CustomerForm = ({ params, customerId, onUpdateCustomerList, navigate }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({});
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const { id } = params;
    if (id) {
      fetchCustomerData(id);
    }
  }, [params]);

  useEffect(() => {
    setSelectedCustomerId(customerId);

    if (customerId) {
      fetchCustomerData(customerId);
    } else {
      setName('');
      setEmail('');
      setPhone('');
    }
  }, [customerId]);

  const fetchCustomerData = (id) => {
    axios.get(`http://127.0.0.1:5000/customers/${id}`)
      .then(response => {
        const customerData = response.data;
        setName(customerData.name);
        setEmail(customerData.email);
        setPhone(customerData.phone);
        setSelectedCustomerId(id);
      })
      .catch(error => {
        console.error('Error fetching customer data:', error);
        setError(error.toString());
      });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    switch (name) {
      case 'name':
        setName(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'phone':
        setPhone(value);
        break;
      default:
        break;
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!name.trim()) errors.name = 'Name is required';
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!email.trim() || !emailPattern.test(email)) errors.email = 'Valid email is required';
    const phonePattern = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    if (!phone.trim() || !phonePattern.test(phone)) errors.phone = 'Valid phone number is required';
    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length === 0) {
      setIsLoading(true);
      setError(null);

      try {
        const customerData = {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
        };

        const apiUrl = selectedCustomerId
          ? `http://127.0.0.1:5000/customers/${selectedCustomerId}`
          : `http://127.0.0.1:5000/customers`;

        const httpMethod = selectedCustomerId ? axios.put : axios.post;

        await httpMethod(apiUrl, customerData);

        if (onUpdateCustomerList) {
          onUpdateCustomerList();
        }

        setShowSuccessModal(true);
      } catch (error) {
        console.error('Error submitting customer data:', error);
        setError(error.toString());
      } finally {
        setIsLoading(false);
      }
    } else {
      setErrors(errors);
    }
  };

  const closeModal = () => {
    setShowSuccessModal(false);
    setName('');
    setEmail('');
    setPhone('');
    setErrors({});
    setSelectedCustomerId(null);
    navigate('/customers');
  };

  return (
    <Container>
      {isLoading && <Alert variant="info">Submitting customer data...</Alert>}
      {error && <Alert variant="danger">Error: {error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formGroupName">
          <Form.Label>Name</Form.Label>
          <Form.Control type="text" name="name" value={name} onChange={handleChange} />
          {errors.name && <div style={{ color: 'red' }}>{errors.name}</div>}
        </Form.Group>

        <Form.Group controlId="formGroupEmail">
          <Form.Label>Email</Form.Label>
          <Form.Control type="text" name="email" value={email} onChange={handleChange} />
          {errors.email && <div style={{ color: 'red' }}>{errors.email}</div>}
        </Form.Group>

        <Form.Group controlId="formGroupPhone">
          <Form.Label>Phone</Form.Label>
          <Form.Control type="tel" name="phone" value={phone} onChange={handleChange} />
          {errors.phone && <div style={{ color: 'red' }}>{errors.phone}</div>}
        </Form.Group>

        <Button variant="primary" type="submit">Submit</Button>
      </Form>

      <Modal show={showSuccessModal} onHide={closeModal}>
        <Modal.Header>
          <Modal.Title>Success!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          The customer has been successfully {selectedCustomerId ? 'updated' : 'added'}.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>Close</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

CustomerForm.propTypes = {
  customerId: Number,
  onUpdateCustomerList: func,
  params: object,
  navigate: func
};

export default CustomerForm;