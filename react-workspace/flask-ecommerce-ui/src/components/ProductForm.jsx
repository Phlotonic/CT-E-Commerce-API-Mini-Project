import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { func, object } from 'prop-types';
import { Form, Button, Alert, Modal, Spinner } from 'react-bootstrap';
import axios from 'axios';

const ProductForm = ({ onProductUpdated, selectedProduct }) => {
    const [product, setProduct] = useState({ name: '', price: 0, stock: 0 }); // Initialize with default values
    const [errors, setErrors] = useState({});
    const [isSubmitting, setSubmitting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (id) {
            const fetchProduct = async () => {
                try {
                    const response = await axios.get(`http://127.0.0.1:5000/products/${id}`);
                    setProduct(response.data);
                } catch (error) {
                    setErrorMessage("Error fetching product. Please try again later.");
                    console.error("Error fetching product:", error);
                }
            };
            fetchProduct();
        } else if (selectedProduct) {
            setProduct(selectedProduct);
        }
    }, [id, selectedProduct]);

    const validateForm = () => {
        const errors = {};
        if (!product.name) errors.name = 'Product name is required';
        if (!product.price || product.price <= 0) errors.price = 'Price must be a positive number';
        if (product.stock < 0) errors.stock = 'Stock cannot be negative';
        setErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            if (id) {
                await axios.put(`http://127.0.0.1:5000/products/${id}`, product);
            } else {
                await axios.post(`http://127.0.0.1:5000/products`, product);
            }
            setShowSuccessModal(true);
            if (onProductUpdated) {
                onProductUpdated();
            }
        } catch (error) {
            console.error("Error submitting product:", error);
            if (error.response) {
                setErrorMessage(error.response.data.error || error.response.data.message || "Server error. Please try again.");
            } else if (error.request) {
                setErrorMessage("Network Error. Please check your connection.");
            } else {
                setErrorMessage("An error occurred. Please try again later.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setProduct(prevProduct => ({
            ...prevProduct,
            [name]: name === 'price' || name === 'stock' ? parseFloat(value) : value
        }));
    };

    const handleClose = () => {
        setShowSuccessModal(false);
        setProduct({ name: '', price: 0, stock: 0 });
        setErrors({});
        setErrorMessage('');
        if (onProductUpdated) {
            onProductUpdated();
        }
        navigate('/products');
    };

    if (isSubmitting) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Submitting...</span>
                </Spinner>
            </div>
        );
    }

    return (
        <>
            <Form onSubmit={handleSubmit}>
                <h3>{id ? 'Edit' : 'Add'} Product</h3>
                {errorMessage && <Alert variant="danger" onClose={() => setErrorMessage('')} dismissible>{errorMessage}</Alert>}
                <Form.Group controlId="productName">
                    <Form.Label>Name:</Form.Label>
                    <Form.Control
                        type="text"
                        name="name"
                        value={product.name}
                        onChange={handleChange}
                        isInvalid={!!errors.name}
                    />
                    <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group controlId="productPrice">
                    <Form.Label>Price:</Form.Label>
                    <Form.Control
                        type="number"
                        name="price"
                        value={product.price}
                        onChange={handleChange}
                        isInvalid={!!errors.price}
                    />
                    <Form.Control.Feedback type="invalid">{errors.price}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group controlId="productStock">
                    <Form.Label>Stock:</Form.Label>
                    <Form.Control
                        type="number"
                        name="stock"
                        value={product.stock}
                        onChange={handleChange}
                        isInvalid={!!errors.stock}
                    />
                    <Form.Control.Feedback type="invalid">{errors.stock}</Form.Control.Feedback>
                </Form.Group>

                <Button variant="primary" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Spinner as="span" animation="border" size="sm" /> : 'Submit'}
                </Button>
            </Form>

            <Modal show={showSuccessModal} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Success</Modal.Title>
                </Modal.Header>
                <Modal.Body>Product has been successfully {id ? 'updated' : 'added'}!</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>Close</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

ProductForm.propTypes = {
    onProductUpdated: func,
    selectedProduct: object
};

export default ProductForm;