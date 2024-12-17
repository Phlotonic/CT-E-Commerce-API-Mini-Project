import { useState } from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import HomePage from './components/HomePage';
import CustomerList from './components/CustomerList';
import CustomerFormWrapper from './components/CustomerFormWrapper';
import ProductList from './components/ProductList';
import CustomerApp from './components/CustomerApp';
import ProductForm from './components/ProductForm';
import NavigationBar from './components/NavigationBar';
import NotFound from './components/NotFound';
import './AppStyles.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import CustomerDetails from './components/CustomerDetails';
import OrderForm from './components/OrderForm';
import OrderApp from './components/OrderApp';
import ProductDetails from './components/ProductDetails';

const CustomerAppWrapper = () => { // Wrap CustomerApp to access route parameters
  const { id } = useParams();
  const customerId = id ? parseInt(id, 10) : null; // Parse ID as integer or null

  return <CustomerApp selectedCustomerId={customerId} />; // Pass customerId as a prop
};

function App() {
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  const handleCustomerSelect = (id) => {  // Function to update selectedCustomerId
      setSelectedCustomerId(id); // Now you're using setSelectedCustomerId
  };

  return (
      <div className="app-container">
      
      <NavigationBar selectedCustomerId={selectedCustomerId} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/add-customer/" element={<CustomerFormWrapper />} />
        <Route path="/edit-customer/:id" element={<CustomerFormWrapper />} />
        <Route path="/customers" element={<CustomerList onCustomerSelect={handleCustomerSelect} />} />
        <Route path="/orders" element={<OrderApp />} />
        <Route path="/orders/:id" element={<CustomerAppWrapper />} />
        <Route path='/customer/:id' element={<CustomerDetails />} />
        <Route path="/add-product" element={<ProductForm />} />
        <Route path="/edit-product/:id" element={<ProductForm />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path='/add-order/:id' element={<OrderForm />}/>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;