import { useState, useEffect } from 'react';  
import axios from 'axios';  
import ProductList from './ProductList';  
import ProductForm from './ProductForm';  
import { Button } from 'react-bootstrap';  
import '../AppStyles.css';  
  
const ProductApp = () => {  
   const [products, setProducts] = useState([]);  
   const [selectedProduct, setSelectedProduct] = useState(null);  
   const [showForm, setShowForm] = useState(false);  
   const [error, setError] = useState(null); // Add error state  
  
  
   useEffect(() => {  
      fetchProducts();  
   }, []);  
  
   const fetchProducts = async () => {  
      try {  
        const response = await axios.get('http://127.0.0.1:5000/products');  
        setProducts(response.data);  
      } catch (error) {  
        console.error('Error fetching products:', error);  
        setError("Error fetching products. Please try again later."); // Set error message  
      }  
   };  
  
   const handleAddProduct = () => {  
      setSelectedProduct(null);  
      setShowForm(true);  
   };  
  
   const handleEditProduct = (product) => {
      setSelectedProduct({ ...product }); // Create a copy to avoid mutation issues
      setShowForm(true);
  }; 
  
   const handleProductUpdated = () => {  
      fetchProducts(); // Refresh product list after update  
      setSelectedProduct(null);  
      setShowForm(false);  
   };  
  
   const handleCloseForm = () => {  
      setShowForm(false);  
      setSelectedProduct(null);  
   };  
  
  
   const handleProductDeleted = () => {  
      fetchProducts();  
    };  
  
   const handleClearProducts = async () => {
      try {
        const response = await axios.post('http://127.0.0.1:5000/reset_database', { model: 'product' }); // Send model name
        console.log(response.data.message);
        // Refresh product list or update state as needed
      } catch (error) {
        console.error("Error clearing products:", error);
      }
    };

  return (
      <div className="app-container"> 
        <h1>Product Management</h1>  
        {error && <div style={{ color: 'red' }}>{error}</div>}{/* Display error message */}  
        <Button onClick={handleAddProduct}>Add Product</Button>
        <Button variant="danger" onClick={handleClearProducts}>Clear Products</Button>  
        {showForm && (  
           <ProductForm  
              selectedProduct={selectedProduct}  
              onProductUpdated={() => handleProductUpdated()}  
              onClose={handleCloseForm}  
           />  
        )}  
  
        {products && (  
           <ProductList  
              products={products}  
              onEditProduct={handleEditProduct}  
              onProductDeleted={handleProductDeleted}  
           />  
        )}  
      </div>  
   );  
};  
  
export default ProductApp;
