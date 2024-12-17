import { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Alert } from 'react-bootstrap';
import PropTypes from 'prop-types';

const OrderForm = ({ customerId, onOrderPlaced, onError }) => {
    const [availableProducts, setAvailableProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [error, setError] = useState(null);
    const [orderSuccess, setOrderSuccess] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:5000/products');
                setAvailableProducts(response.data);
            } catch (error) {
                console.error("Error fetching products:", error);
                setError("Error fetching products. Please try again.");
            }
        };

        fetchProducts();
    }, []);

    const handleProductChange = (productId, quantity) => {
        setSelectedProducts(prevSelectedProducts => {
            const updatedProducts = prevSelectedProducts.map(product =>
                product.product_id === productId ? { ...product, quantity: parseInt(quantity, 10) } : product
            );

            const existingProductIndex = updatedProducts.findIndex(p => p.product_id === productId);

            if (existingProductIndex === -1 && quantity > 0) {
                updatedProducts.push({ product_id: productId, quantity: parseInt(quantity, 10) });
            } else if (quantity === 0 && existingProductIndex !== -1) {
                updatedProducts.splice(existingProductIndex, 1);
            }

            return updatedProducts;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!customerId) {
            setError("Select a customer before placing order.");
            return;
        }

        if (selectedProducts.length === 0) {
            setError("Please select at least one product to place an order.");
            return;
        }

        if (typeof customerId !== 'number') {
            setError("Invalid customer ID. Cannot place order.");
            return;
        }

        try {
            const productsForOrder = selectedProducts.map(({ product_id, quantity }) => ({ product_id, quantity }));

            const response = await axios.post('http://127.0.0.1:5000/orders', {
                customer_id: customerId,
                products: productsForOrder,
            });

            console.log("Order placed successfully:", response.data);
            setSelectedProducts([]);
            setOrderSuccess(true);
            setError(null);

            if (onOrderPlaced) {
                onOrderPlaced();
            }
        } catch (error) {
            console.error("Error placing order:", error);
            if (error.response && error.response.data) {
                onError(error.response.data.error || error.response.data.message || "An error occurred while placing your order.");
            } else if (error.request) {
                onError("Network error. Please check your connection.");
            } else {
                onError("An error occurred. Please try again.");
            }
        }
    };

    if (availableProducts.length === 0 && !error) {
        return <p>Loading product data...</p>;
    }

    if (orderSuccess) {
        return (
            <Alert variant="success" onClose={() => setOrderSuccess(false)} dismissible>
                Order placed successfully!
            </Alert>
        );
    }

    return (
        <div>
            <h3>Place Order</h3>
            {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
            <Form onSubmit={handleSubmit}>
                {availableProducts.map(product => (
                    <Form.Group key={product.id} controlId={`product-${product.id}`}>
                        <Form.Label>{product.name} (Stock: {product.stock})</Form.Label>
                        <Form.Control
                            type="number"
                            min="0"
                            max={product.stock}
                            placeholder="Quantity"
                            onChange={e => handleProductChange(product.id, parseInt(e.target.value) || 0)}
                        />
                    </Form.Group>
                ))}
                <Button type="submit" disabled={!customerId}>Place Order</Button>
            </Form>
        </div>
    );
};

OrderForm.propTypes = {
    customerId: PropTypes.number,
    onOrderPlaced: PropTypes.func,
    onError: PropTypes.func
};

export default OrderForm;