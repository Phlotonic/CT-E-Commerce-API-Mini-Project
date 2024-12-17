import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert, Button, Modal, Container, Card, Row, Col } from 'react-bootstrap';
import axios from 'axios';

const ProductDetails = () => {
    const [productDetails, setProductDetails] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const { id } = useParams();
    const navigate = useNavigate();

    const fetchProductDetails = async(id) => {
        try {
            const response = await axios.get(`http://127.0.0.1:5000/products/${id}`);
            setProductDetails(response.data);
        } catch(error) {
            console.log("Error fetching products: ", error);
            setErrorMessage(error.message);
        }
    };

    const deleteProduct = async(id) => {
        try {
            await axios.delete(`http://127.0.0.1:5000/products/${id}`);
            setShowSuccessModal(true);
        } catch (error) {
            setErrorMessage(error.message);
        } 
    };

    useEffect(() => {
        if(id) {
            fetchProductDetails(id);
        }
    }, [id]);

    const handleClose = () => {
        setShowSuccessModal(false);
        navigate('/products');
    };

    return (
        <Container className='my-5'>
            <Row>
                <h3>Product Details</h3>
            </Row>
            {errorMessage && <Alert variant='danger'>{errorMessage}</Alert>}
            <Row className='my-3'>
                <Card className='shadow-lg rounded-3'>
                    <Card.Body>
                        <Card.Title><h4>{productDetails.name}</h4></Card.Title>
                        <Card.Text>
                            Price: ${productDetails.price} <br/>
                            Stock: {productDetails.stock} <br/>
                            ID: {productDetails.id}
                        </Card.Text>
                        </Card.Body>
                </Card>
                
            </Row>
            <Row className='my-3'>
                <Col xs={12} md={4}> 
                <Button variant='secondary' className='mx-2 my-3' style={{minWidth: '60%',}} onClick={() => navigate(`/products`)}>Return to Product List</Button>
                </Col>
                <Col xs={12} md={4}>
                    <Button variant='primary' className='mx-2 my-3' style={{minWidth: '60%',}} onClick={() => navigate(`/edit-product/${productDetails.id}`)}>Edit</Button>
                </Col>
                <Col xs={12} md={4}>
                    <Button variant='danger' className='mx-2 my-3' style={{minWidth: '60%',}} onClick={() => deleteProduct(productDetails.id)}>Delete</Button>
                </Col>
            </Row>
            <Modal show={showSuccessModal} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Success!</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Product has been successfully deleted!
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

export default ProductDetails;