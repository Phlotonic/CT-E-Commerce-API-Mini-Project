E-Commerce Application
Project Overview
This project is a full-stack e-commerce application built using React for the frontend and Flask (Python) for the backend. It provides core functionalities for managing customers, products, and orders, along with several bonus features. The application is designed to be a learning tool, demonstrating best practices in web development, including component-based architecture, routing, form handling, data fetching, and error handling.

Technologies Used
Frontend:

React

React Router

React Bootstrap

Axios (for API requests)

Backend:

Flask (Python)

Flask-SQLAlchemy (for database interaction)

Flask-Marshmallow (for data serialization and validation)

MySQL Connector (for database connection)

Flask-CORS (for Cross-Origin Resource Sharing)

Werkzeug (for password hashing)

Python os module (for environment variables)

Project Structure
The project is organized into the following directories:

react-workspace/flask-ecommerce-ui/src/: Contains all frontend code.

components/: Contains all React components.

CustomerApp.jsx: Manages customer-related components.

CustomerForm.jsx: Form for creating and updating customer details.

CustomerFormWrapper.jsx: Wraps CustomerForm to handle routing.

CustomerList.jsx: Displays a list of customers.

ProductApp.jsx: Manages product-related components.

ProductForm.jsx: Form for creating and updating product details.

ProductList.jsx: Displays a list of products.

OrderApp.jsx: Manages order-related components.

OrderForm.jsx: Form for placing new orders.

OrderList.jsx: Displays a list of orders.

HomePage.jsx: The application's homepage.

NavigationBar.jsx: Navigation bar for the application.

NotFound.jsx: Component for handling 404 errors.

CustomerDetails.jsx: Displays details for a specific customer.

ProductDetails.jsx: Displays details for a specific product.

App.jsx: Main application component with routing.

AppStyles.css: CSS styles for the application.

flask-workspace/: Contains all backend code.

app.py: Main Flask application file.

password.py: (Placeholder) For storing database password. Do not store passwords directly in code.

venv/: Python virtual environment.

Project Requirements and Status
Here's a detailed breakdown of the project requirements and their current implementation status:

I. Customer and CustomerAccount Management:

Create Customer Form:

Status: Fully implemented. A functional form allows users to input and submit customer information (name, email, phone).

Details: Uses React Bootstrap components for styling and form handling. Includes basic validation.

Read Customer Details:

Status: Fully implemented. A component displays customer details fetched from the backend based on their ID.

Details: Uses axios to fetch data from the backend and displays it in a user-friendly format.

Update Customer Form:

Status: Fully implemented. A form allows users to update customer details.

Details: Uses the same form as the create customer form, but pre-populates with existing data.

Delete Customer Information:

Status: Fully implemented. Customers can be deleted from the database based on their ID.

Details: Uses axios.delete to send a delete request to the backend. Includes cascading deletes for related orders.

II. Product Catalog:

List Products:

Status: Fully implemented. A component displays a list of available products fetched from the backend.

Details: Uses axios to fetch data and displays it in a table format.

Create Product Form:

Status: Fully implemented. A form allows adding new products, capturing name, price, and stock.

Details: Uses React Bootstrap components for styling and form handling. Includes basic validation.

Read Product Details:

Status: Fully implemented. A component displays product details fetched from the backend based on their ID.

Details: Uses axios to fetch data and displays it in a user-friendly format.

Update Product Form:

Status: Fully implemented. A form allows users to update product details, including name, price, and stock.

Details: Uses the same form as the create product form, but pre-populates with existing data.

Delete Product Information:

Status: Fully implemented. Products can be deleted from the database based on their ID.

Details: Uses axios.delete to send a delete request to the backend.

[p] Product Confirmation Module:

Status: Partially implemented. Confirmation modals appear before deleting a product.

Details: Uses React Bootstrap modals for confirmation before deleting a product. Confirmation modals are not yet implemented for update or create.

View and Manage Product Stock Levels (Bonus):

Status: Not implemented. Requires additional UI elements and backend enhancements for granular stock management.

Details: No UI or backend logic is implemented for viewing and managing stock levels.

Restock Products When Low (Bonus):

Status: Partially implemented. Backend logic exists but lacks a UI for triggering restocking and needs integration with a real supplier API and a scheduling system.

Details: The backend has a restock_products function that checks stock levels and restocks products, but it's not integrated with a real supplier API or a scheduling mechanism.

III. Order Processing:

Place Order Form:

Status: Fully implemented. A form allows placing new orders, selecting products and specifying quantities, and associating it with a customer, with date.

Details: Uses React Bootstrap components for styling and form handling. Sends data to the backend to create a new order.

[p] Manage Order History (Bonus - Basic):

Status: Partially implemented. Orders are displayed in a table, including order ID, customer ID, date, status, products, and total price.

Details: A basic order list table is implemented, but further enhancements (e.g., order details, filtering, sorting) are missing.

Cancel Order (Bonus):

Status: Fully implemented. A button allows cancellation of pending orders, and that cancellation is updated in the database and displayed in the order list.

Details: Uses axios.put to send a cancellation request to the backend.

Calculate Order Total Price (Bonus):

Status: Fully implemented. The total price is calculated based on product prices and quantities and correctly displayed in the order list.

Details: The backend calculates the total price, and the frontend displays it in the order table.

Clear Table (Bonus):

Status: Under development. A button is present on the Orders page, but the functionality to clear the table is not yet fully implemented.

Details: The button is present, but the backend route and frontend logic to clear the table are not yet fully functional.

Display Product Quantity in Orders Table (Bonus):

Status: Under development. The product name and price are displayed, but the quantity is not yet being displayed correctly in the Orders table.

Details: The backend is sending the quantity, but the frontend is not correctly displaying it.

IV. Component Creation and Organization:

Create functional or class components: Both functional and class components are used.

Organize components into a logical folder structure: Components are organized into a components directory.

Use React hooks as appropriate: useState, useEffect, and useParams are used where applicable.

V. Routing and Navigation:

Implement routing using React Router: React Router is implemented with routes for different sections and pages.

Define route paths and components: Route paths are defined with associated components.

Use navigation links or buttons: Users can navigate between different parts of the application using links and buttons.

VI. Forms and Form Handling:

Develop forms using React components: Forms are built using React components with user inputs.

Implement form validation: Basic form validation is in place for each form, including required fields and proper formatting.

Utilize React state and hooks: State and hooks are used to manage form data and user input changes.

Implement form submission handlers: Data is sent to the backend API for processing.

VII. Event Handling:

Set up event handlers to respond to user interactions: Event handlers are implemented for button clicks, form submissions, and user interactions with UI elements.

Implement event listeners for actions like button clicks, form submissions, and user interactions with UI elements.

Use event handling to trigger actions like submitting forms, deleting records, and updating data.

VIII. Integration with React-Bootstrap:

Incorporate React-Bootstrap components and utilities: React-Bootstrap components are used throughout the application.

Use React-Bootstrap components such as buttons, forms, modals, alerts, and navigation elements: React-Bootstrap components are used for styling and functionality.

Apply Bootstrap styles and CSS classes: Bootstrap styles and CSS classes are used to achieve a visually appealing and responsive layout.

IX. Error Handling:

[p] Implement error handling mechanisms: Basic error handling is in place, but needs more consistency and robust error messages to handle all potential API issues or data issues, as well as error logging.

Next Steps
Based on the current status, here are some recommended next steps:

Resolve Product Quantity Display: Focus on debugging the OrderApp.jsx component and the backend to ensure that the product quantities are displayed correctly in the Orders table.

Implement Product Confirmation Module: Implement confirmation modals for product creation and updates.

Implement Product Stock Management (Bonus): Create UI components and backend logic for viewing and managing product stock levels.

Integrate Restock Logic (Bonus): Integrate the backend restock logic with a real supplier API and a scheduling mechanism.

Enhance Order History (Bonus): Add filtering, sorting, and more detailed order information to the order history view.

Improve Error Handling: Implement more consistent and user-friendly error handling throughout the application.

Code Refactoring: Refactor and organize code for better maintainability.
