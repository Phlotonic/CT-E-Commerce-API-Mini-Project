import { func, number } from 'prop-types';
import { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios for API calls

const OrderList = ({ customerId, onOrderSelect }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true); // Add loading state
    const [error, setError] = useState(null);     // Add error state


    useEffect(() => {
        const fetchOrders = async () => {
            if (customerId) {
                try {
                    const response = await axios.get(`http://127.0.0.1:5000/customers/${customerId}/orders`);
                    setOrders(response.data);
                } catch (error) {
                    console.error("Error fetching orders:", error);
                    setError("Error fetching orders. Please try again.");
                } finally {
                    setLoading(false);
                }
            }
        };


        fetchOrders();
    }, [customerId]);


    if (loading) {
        return <div>Loading orders...</div>;
    }


    if (error) {
        return <div>Error: {error}</div>;
    }


    if (!customerId) { // Conditional to handle missing customerId

        return <div>Select a customer to view their orders.</div>;
    }

    if (!orders || orders.length === 0) { // Conditional for no orders
        return <div>No orders found for this customer.</div>;

    }


    return (
        <div className="order-list">
            <h3>Orders</h3>
            <ul>
                {orders.map(order => (
                    <li key={order.id} onClick={() => onOrderSelect(order.id)}>
                        Order ID: {order.id}, Date: {order.date}, Status: {order.status} {/* Include order status */}
                    </li>
                ))}
            </ul>
        </div>
    );
};

OrderList.propTypes = {
    customerId: number,
    onOrderSelect: func
};

export default OrderList;