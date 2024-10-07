E-Commerce API - README

This project implements a RESTful API for an e-commerce platform using Flask, SQLAlchemy, and Marshmallow. It provides endpoints for managing customers, products, orders, and customer accounts.

Features

Customer Management:
Add new customers
Retrieve customer details
Update customer information
Delete customers

Product Management:
Add new products
Retrieve product details
Update product information
Delete products
View and manage product stock levels

Order Management:
Place orders
Retrieve order details
Track order status
View order history
Cancel orders
Calculate order total price

Customer Account Management:
Create customer accounts
Retrieve account details
Update account information
Delete accounts

Auto-Restock:
Automatically restock products when stock levels fall below a threshold.
Technologies Used

Flask: Python web framework

SQLAlchemy: Object-Relational Mapper (ORM) for database interaction

Marshmallow: Object serialization/deserialization library

MySQL: Relational database

mysql-connector-python: MySQL connector for Python

APScheduler: Task scheduling library

Database Setup

Install MySQL: If you don't have MySQL installed, download and install it from the official website.
Create Database: Create a new database named e_commerce_db.
Create Tables: The necessary tables (Customers, Products, Orders, Customer_Accounts, Order_Product) will be created automatically when you run the application for the first time.

Installation

Clone the repository:
Bash
git clone https://github.com/your-username/CT-E-Commerce-API.git

Create a virtual environment:
Bash
python -m venv venv

Activate the virtual environment:
Bash
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

Install dependencies:
Bash
pip install -r requirements.txt   

Create password.py: Create a file named password.py in the project root and add your MySQL password:
Python
my_password = "your_mysql_password"

Run the application:
Bash
python app.py

API Endpoints

Customers

Method	Endpoint	Description
GET	/customers	Get all customers
POST	/customers	Add a new customer
PUT	/customers/<int:id>	Update customer with given ID
DELETE	/customers/<int:id>	Delete customer with given ID

Customer Accounts

Method	Endpoint	Description
POST	/customer_accounts	Create a new customer account
GET	/customer_accounts/<int:id>	Get customer account with given ID
PUT	/customer_accounts/<int:id>	Update customer account with given ID
DELETE	/customer_accounts/<int:id>	Delete customer account with given ID

Products

Method	Endpoint	Description
GET	/products	Get all products
POST	/products	Add a new product
PUT	/products/<int:id>	Update product with given ID
DELETE	/products/<int:id>	Delete product with given ID
GET	/products/by-id/<int:product_id>	Get product by ID

Orders

Method	Endpoint	Description
POST	/orders	Place a new order
GET	/orders/<int:id>	Get order with given ID
PUT	/orders/<int:order_id>/status	Update the status of an order
PUT	/orders/<int:order_id>/cancel	Cancel an order
GET	/orders/<int:order_id>/total-price	Calculate the total price of an order

Stock Management

Method	Endpoint	Description
GET	/products/<int:id>/stock	Get the stock level of a product
PUT	/products/<int:id>/stock	Update the stock level of a product

Order History

Method	Endpoint	Description
GET	/customers/<int:customer_id>/orders	Get the order history of a customer

Auto-Restock
The application uses APScheduler to automatically restock products when their stock falls below a defined threshold (RESTOCK_THRESHOLD). The restocking logic is defined in the restock_products() function. Currently, it's configured to run daily at midnight. You can adjust the schedule and the restocking logic as needed.

Postman Collection
A Postman collection (e_commerce_db.postman_collection.json) is included in the postman_collections folder. You can import this collection into Postman to easily test the API endpoints.

Contributing
Contributions are welcome! If you find any issues or have suggestions for improvements, please feel free to open an issue or submit a pull request. 
