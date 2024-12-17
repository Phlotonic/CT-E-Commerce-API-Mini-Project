import { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Table, Button, Alert, Spinner, Modal, Form } from 'react-bootstrap';
import OrderForm from './OrderForm';

const OrderApp = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showOrderForm, setShowOrderForm] = useState(false);
    const [selectedCustomerId, setSelectedCustomerId] = useState(null);
    const [customers, setCustomers] = useState([]);
    const [orderFormError, setOrderFormError] = useState(null);

const fetchOrders = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:5000/orders');
                setOrders(response.data);
            } catch (error) {
                console.error("Error fetching orders:", error);
                setError("Error fetching orders. Please try again.");
            } finally {
                setLoading(false);
            }
        };

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:5000/orders');
                setOrders(response.data);
            } catch (error) {
                console.error("Error fetching orders:", error);
                setError("Error fetching orders. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        const fetchCustomers = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:5000/customers');
                setCustomers(response.data);
            } catch (error) {
                console.error("Error fetching customers:", error);
                // Handle customer fetch error appropriately (e.g., set an error state)
            }
        };

        fetchOrders();
        fetchCustomers();
    }, []);

    const handleCancelOrder = async (orderId) => {
        try {
            await axios.put(`http://127.0.0.1:5000/orders/${orderId}/cancel`);
            setOrders(prevOrders => prevOrders.map(order => 
                order.id === orderId ? { ...order, status: 'cancelled' } : order
            ));
        } catch (error) {
            console.error("Error cancelling order:", error);
            if (error.response && error.response.data && error.response.data.error) {
                setError(error.response.data.error);
            } else if (error.request) {
                setError("Network error. Please check your connection.");
            } else {
                setError(`Error cancelling order ${orderId}. Please try again.`);
            }
        }
    };

    const handleShowOrderForm = () => {
        setShowOrderForm(true);
    };

    const handleCloseOrderForm = () => {
        setShowOrderForm(false);
        setSelectedCustomerId(null);
        fetchOrders(); // Refresh order list
        setOrderFormError(null);
    };

    const handleCustomerChange = (event) => {
        setSelectedCustomerId(parseInt(event.target.value, 10));
    };

    const handleClearOrders = async () => {
        try {
          const response = await axios.delete('http://127.0.0.1:5000/orders'); // Send model name
          console.log(response.data.message);
          setOrders([]); // Clear orders in component state
        } catch (error) {
          console.error("Error clearing orders:", error);
          setError("Error clearing orders. Please try again.");
        }
      };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Submitting...</span>
                </Spinner>
            </div>
        );
    }

    if (error) {
        return <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>;
    }

    return (
        <Container className="my-5">
            <h2>Orders</h2>

            <Button onClick={handleShowOrderForm}>Add Order</Button>
            <Button variant="danger" onClick={handleClearOrders}>Clear Orders</Button>

            <Modal show={showOrderForm} onHide={handleCloseOrderForm}>
                <Modal.Header closeButton>
                    <Modal.Title>Place Order</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group controlId="customerSelect">
                        <Form.Label>Select Customer:</Form.Label>
                        <Form.Control as="select" onChange={handleCustomerChange} value={selectedCustomerId || ''}>
                            <option value="">Select a customer</option>
                            {customers.map(customer => (
                                <option key={customer.id} value={customer.id}>{customer.name}</option>
                            ))}
                        </Form.Control>
                    </Form.Group>

                    {selectedCustomerId && (
                        <OrderForm
                            customerId={selectedCustomerId}
                            onOrderPlaced={handleCloseOrderForm}
                            onError={setOrderFormError}
                        />
                    )}
                    {orderFormError && <Alert variant="danger">{orderFormError}</Alert>}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseOrderForm}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {orders.length === 0 ? (
                <p>No orders found.</p>
            ) : (
                <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Customer ID</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Products</th>
                        <th>Total Price</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => {
                        console.log("Order:", order);

                        const totalPrice = order.products && order.products.length > 0 ?
                            order.products.reduce((sum, p) => {
                                const price = parseFloat(p?.price || 0);
                                const quantity = parseInt(p?.quantity || 0, 10);
                                console.log("Product:", p, typeof p?.price, typeof p?.quantity, price, quantity);
                                return sum + (price * quantity);
                            }, 0) : 0;

                        return (
                            <tr key={order.id}>
                                <td>{order.id}</td>
                                <td>{order.customer_id}</td>
                                <td>{order.date}</td>
                                <td>{order.status}</td>
                                <td>
                                    <ul>
                                        {order.products?.map(product => (
                                            <li key={product.id}>
                                                {product.name}
                                                <span className="text-muted"> (Price: ${product.price}, Quantity: {product.quantity})</span> {/* Display quantity */}
                                            </li>
                                        ))}
                                    </ul>
                                </td>
                                <td>${totalPrice.toFixed(2)}</td>
                                <td>
                                    {order.status === 'pending' && (
                                        <Button variant="danger" size="sm" onClick={() => handleCancelOrder(order.id)}>
                                            Cancel
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
            )}
        </Container>
    );
};

export default OrderApp;