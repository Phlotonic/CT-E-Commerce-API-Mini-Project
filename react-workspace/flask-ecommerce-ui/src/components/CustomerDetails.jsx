import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { array, func } from 'prop-types';
import { Button, Modal, Container, Card, Row, Col, Alert, Spinner } from 'react-bootstrap'; // Import Spinner
import axios from 'axios';

const CustomerDetails = () => {
    const [customer, setCustomer] = useState(null); // Initialize as null
    const [customerAccount, setCustomerAccount] = useState(null); // Initialize as null
    const [loading, setLoading] = useState(true);  // Add loading state
    const [error, setError] = useState(null);      // Add error state
    const [showSuccessModal, setShowSuccessModal] = useState(false); // Define showSuccessModal state
    const [errorMessage, setErrorMessage] = useState(''); // Define errorMessage state
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {  // Combine both fetches into one effect
            try {
                const customerResponse = await axios.get(`http://127.0.0.1:5000/customers/${id}`);
                setCustomer(customerResponse.data);

                // Use customer ID from the response to fetch account details
                const accountId = customerResponse.data.id;
                const accountResponse = await axios.get(`http://127.0.0.1:5000/customer_accounts/${accountId}`); // Corrected URL for single account
                setCustomerAccount(accountResponse.data);

            } catch (fetchError) { // More descriptive variable name
                console.error("Error fetching data:", fetchError);
                // Check for specific error conditions and set errorMessage accordingly
                if (fetchError.response && fetchError.response.status === 404) {
                    setErrorMessage("Customer not found."); // Specific error message
                } else {
                    setError("Error fetching customer details. Please try again."); // General error
                }
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id]);

    const deleteCustomer = async () => {
        try {
            await axios.delete(`http://127.0.0.1:5000/customers/${id}`);
            setShowSuccessModal(true); // Show success modal after successful deletion
        } catch (deleteError) { // More descriptive variable name
            console.error("Error deleting customer:", deleteError);
            // Check for specific error conditions and set errorMessage
            if (deleteError.response && deleteError.response.status === 404) {
                setErrorMessage("Customer not found."); // Specific error message
            }
            else if (deleteError.response && deleteError.response.status === 500){
                setErrorMessage("Server error. Please try again later.") // Server error message
            }
            else if (deleteError.request){
                setErrorMessage("Network error. Please check your connection.") // Network error message
            }
            else {
                setError("Error deleting customer. Please try again."); // General error
            }
        }
    };

    const handleClose = () => {
        setShowSuccessModal(false);
        navigate('/customers');
    };

    if (loading) {
        return (
          <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        );
      }

      if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    if (!customer) { // Handle case where customer is not found
        return <Alert variant="warning">Customer not found.</Alert>;
    }


    return (
        <Container className='my-5'>
            <Row>
                <h3>Customer Details</h3>
            </Row>
            <Row className='my-3'>
                <Card className='shadow-lg rounded-3'>
                    <Card.Body>
                        <Card.Title className="mb-3"><h3>Customer Details:</h3></Card.Title>
                        <Card.Text>
                            <Row><p><strong>Name: </strong> {customer && customer.name}</p></Row>
                            <Row><p><strong>E-mail: </strong> {customer && customer.email}</p></Row>
                            <Row><p><strong>Phone number: </strong> {customer && customer.phone}</p></Row>
                            <Row><p><strong>Customer ID: </strong> {customer && customer.id}</p></Row>
                        </Card.Text>
                        </Card.Body>
                </Card>
                
            </Row>
            <Row className='my-3'>
                <Col xs={12} md={4}> 
                <Button variant='secondary' className='mx-2 my-3' style={{minWidth: '60%',}} onClick={() => navigate(`/customers`)}>Return to Customer List</Button>
                </Col>
                <Col xs={12} md={4}>
                    <Button variant='primary' className='mx-2 my-3' style={{minWidth: '60%',}} onClick={() => navigate(`/edit-customer/${customer.id}`)}>Edit</Button>
                </Col>
                <Col xs={12} md={4}>
                    <Button variant='danger' className='mx-2 my-3' style={{minWidth: '60%',}} onClick={() => deleteCustomer(customer.id)}>Delete</Button>
                </Col>
            </Row>
            <Row className='my-3'>
                <Col>
                <Button variant='primary' className='mx-2 my-3' style={{minWidth: '75%',}} onClick={() => navigate(`/add-order/${customer.id}`)}>Create Order</Button>
                </Col>
            </Row>
            <Modal show={showSuccessModal} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Success!</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Customer has been successfully deleted!
                </Modal.Body>
                <Modal.Footer>
                    <Button variant='secondary' onClick={handleClose}>
                        Close
                    </Button>
                </Modal.Footer>

            </Modal>
        </Container>

    )
}

CustomerDetails.propTypes = {
    customerDetails: array,
    customerAccountDetails: array,
    onEditCustomer: func,
    onCustomerDeleted: func
}

export default CustomerDetails;