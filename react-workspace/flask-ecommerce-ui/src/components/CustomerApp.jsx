import { Alert, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import axios from 'axios';
import CustomerList from './CustomerList';
import CustomerFormWrapper from './CustomerFormWrapper';
import '../AppStyles.css';

const CustomerApp = ({ selectedCustomerId }) => {
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(selectedCustomerId || null);
    const [loading, setLoading] = useState(true); // Add loading state
    const [error, setError] = useState(null); // Add error state
    const navigate = useNavigate();
    const customerListRef = useRef(null);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:5000/customers');
                setCustomers(response.data);

                if (selectedCustomerId) {
                    const customer = response.data.find(c => c.id === selectedCustomerId);
                    setSelectedCustomer(customer || null); // Set to null if not found
                }
            } catch (error) {
                console.error("Error fetching customers:", error);
                setError("Error fetching customers. Please try again.");
            } finally {
                setLoading(false); // Set loading to false after fetching
            }
        };

        fetchCustomers();
    }, [selectedCustomerId]);

    const handleCustomerSelect = (customerId) => {
        const customer = customers.find(c => c.id === customerId);
        setSelectedCustomer(customer); // Set selectedCustomer directly
        navigate(`/customers/${customerId}`); // Navigate to customer details page
    };

    const updateCustomerList = () => {
        if (customerListRef.current) {
            customerListRef.current.fetchCustomers();
        }
    };

    if (loading) {
        return <div>Loading customers...</div>; // Display loading message
    }

    if (error) {
        return <Alert variant="danger">{error}</Alert>; // Display error message
    }

    return (
        <div className='app-container'>
            <h1>Our Customers</h1>
            <CustomerFormWrapper customerId={selectedCustomer?.id} onUpdateCustomerList={updateCustomerList} />
            <CustomerList ref={customerListRef} onCustomerSelect={handleCustomerSelect} />
            {selectedCustomer && (
                <Button variant='primary' className='mx-2 my-3' style={{ minWidth: '75%' }} onClick={() => navigate(`/orders/${selectedCustomer.id}`)}>
                    Create Order
                </Button>
            )}
        </div>
    );
};

CustomerApp.propTypes = {
    selectedCustomerId: PropTypes.number
};

export default CustomerApp;