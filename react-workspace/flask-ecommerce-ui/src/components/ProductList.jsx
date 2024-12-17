import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { array, func } from 'prop-types';
import { Button, Container, ListGroup, Row, Col } from 'react-bootstrap';
import axios from 'axios';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const navigate = useNavigate();

    const fetchProducts = async() => {
        try {
            const response = await axios.get(`http://127.0.0.1:5000/products`);
            setProducts(response.data);
        } catch(error) {
            console.log("Error fetching products: ", error);
        }
    };

    const deleteProduct = async(id) => {
        try {
            await axios.delete(`http://127.0.0.1:5000/products/${id}`)
            fetchProducts();
            
        } catch(error) {
            console.log("Error deleting product: ", error);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    return (
        <Container>
            <Row>
                <Col className='mt-4'>
                    <h2>Products</h2>
                    <ListGroup className='my-4'>
                        {products.map(product => (
                            <ListGroup.Item key={product.id} className="d-flex justify-content-between align-items-center shadow-sm p-3 mb-3 bg-white rounded">
                                {product.name} | ID: {product.id}
                                <div>
                                    <Button variant='secondary' className='me-2' onClick={() => navigate(`/product/${product.id}`)}>Details</Button>
                                    <Button variant='primary' className='me-2' onClick={() => navigate(`/edit-product/${product.id}`)}>Edit</Button>
                                    <Button variant='danger' onClick={() => deleteProduct(product.id)}>Delete</Button>
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Col>
            </Row>
        </Container>
    );
    
};
ProductList.propTypes = {
    products: array,
    onEditProduct: func,
    onProductDeleted: func
}
export default ProductList;
