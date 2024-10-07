from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from marshmallow import Schema, fields, validate
from marshmallow import ValidationError
from datetime import date
from password import my_password
from apscheduler.schedulers.background import BackgroundScheduler

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+mysqlconnector://root:{my_password}@127.0.0.1:3306/e_commerce_db?auth_plugin=mysql_native_password'
db = SQLAlchemy(app)
ma = Marshmallow(app)

class CustomerSchema(ma.Schema):
    name = fields.String(required=True)
    email = fields.String(required=True)
    phone = fields.String(required=True)

    class Meta:
        fields = ("name", "email", "phone", "id")

class CustomerAccountSchema(ma.Schema):
    username = fields.String(required=True)
    password = fields.String(required=True)

    class Meta:
        fields = ("username", "password", "id", "customer_id")

customer_account_schema = CustomerAccountSchema()
customer_accounts_schema = CustomerAccountSchema(many=True)

class ProductSchema(ma.Schema):
    name = fields.String(required=True, validate=validate.Length(min=1))
    price = fields.Float(required=True, validate=validate.Range(min=0))
    stock = fields.Integer()

    class Meta:
        fields = ("name", "price", "id", "stock")

product_schema = ProductSchema()
products_schema = ProductSchema(many=True)

customer_schema = CustomerSchema()
customers_schema = CustomerSchema(many=True)

# Define the association table first
order_product = db.Table('Order_Product',
    db.Column('order_id', db.Integer, db.ForeignKey('Orders.id'), primary_key=True),
    db.Column('product_id', db.Integer, db.ForeignKey('Products.id'),
 primary_key=True),

    db.ForeignKeyConstraint(['order_id'], ['Orders.id']),
    db.ForeignKeyConstraint(['product_id'], ['Products.id'])
)

class Product(db.Model):
    __tablename__ = 'Products'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    price = db.Column(db.Float,
 nullable=False)
    stock = db.Column(db.Integer, default=0)

    orders = db.relationship('Order', secondary=order_product, 
                            back_populates='products',  # Use back_populates
                            primaryjoin=(order_product.c.product_id == id),
                            secondaryjoin='Order.id == Order_Product.c.order_id')

class Customer(db.Model):
    __tablename__ = 'Customers'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(225), nullable=False)
    email = db.Column(db.String(320))
    phone = db.Column(db.String(15))
    orders = db.relationship('Order', back_populates='customer')

class Order(db.Model):
    __tablename__ = 'Orders'
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False, default=date.today)
    customer_id = db.Column(db.Integer, db.ForeignKey('Customers.id'))
    customer = db.relationship('Customer', back_populates='orders')
    status = db.Column(db.String(50), nullable=False, default='pending')

    products = db.relationship('Product', secondary=order_product, 
                              back_populates='orders',  # Use back_populates
                              primaryjoin=(order_product.c.order_id == id),
                              secondaryjoin=(order_product.c.product_id == Product.id))

    def calculate_total_price(self):
        total_price = 0
        for product in self.products:
            total_price += product.price
        return total_price

class OrderSchema(ma.Schema):
    customer_id = fields.Integer(required=True)
    products = fields.Nested(ProductSchema, many=True)
    status = fields.Str()

    class Meta:
        fields = ("id", "date", "customer_id", "products", "status")

order_schema = OrderSchema()
orders_schema = OrderSchema(many=True)

class CustomerAccount(db.Model):
    __tablename__ = 'customer_accounts'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(255), unique=True, nullable=False)
    password = db.Column(db.String(255),
 nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('Customers.id'))
    customer = db.relationship('Customer', backref='customer_account', uselist=False)

def calculate_total_price(self):
    total_price = 0
    for product in self.products:
        total_price += product.price  # Assuming you'll add quantity later
    return total_price

@app.route('/customers', methods=['GET'])
def get_customers():
    customers = Customer.query.all()
    return customers_schema.jsonify(customers)

@app.route('/customers', methods=['POST'])
def add_customer():
    try:
        # Validate and deserialize input
        customer_data = customer_schema.load(request.json)
    except ValidationError as err:
        return jsonify(err.messages), 400

    new_customer = Customer(name=customer_data['name'], email=customer_data['email'], phone=customer_data['phone'])
    db.session.add(new_customer)
    db.session.commit()
    return jsonify({"message": "New customer added successfully"}), 201

@app.route('/customers/<int:id>', methods=['PUT'])
def update_customer(id):
    customer = Customer.query.get_or_404(id)
    try:
        customer_data = customer_schema.load(request.json)
    except ValidationError as err:
        return jsonify(err.messages), 400

    customer.name = customer_data['name']
    customer.email = customer_data['email']
    customer.phone = customer_data['phone']
    db.session.commit()
    return jsonify({"message": "Customer details updated successfully"}), 200

@app.route('/customers/<int:id>',
methods=['DELETE'])
def delete_customer(id):
    customer = Customer.query.get_or_404(id)
    db.session.delete(customer)
    db.session.commit()
    return jsonify({"message": "Customer removed succcessfully"}), 200

@app.route('/customer_accounts', methods=['POST'])
def add_customer_account():
    try:
        account_data = customer_account_schema.load(request.json)
    except ValidationError as err:
        return jsonify(err.messages), 400

    new_account = CustomerAccount(username=account_data['username'], password=account_data['password'], customer_id=account_data['customer_id'])
    db.session.add(new_account)
    db.session.commit()
    return jsonify({"message": "New customer account added successfully"}), 201

@app.route('/customer_accounts/<int:id>', methods=['GET'])
def get_customer_account(id):
    account = CustomerAccount.query.get_or_404(id)
    return customer_account_schema.jsonify(account)

@app.route('/customer_accounts/<int:id>', methods=['PUT'])
def update_customer_account(id):
    account = CustomerAccount.query.get_or_404(id)
    try:
        account_data = customer_account_schema.load(request.json)
    except ValidationError as err:
        return jsonify(err.messages), 400

    account.username = account_data['username']
    account.password = account_data['password']  # In a real app, hash the password!
    db.session.commit()
    return jsonify({"message": "Customer account updated successfully"}), 200

@app.route('/customer_accounts/<int:id>', methods=['DELETE'])
def delete_customer_account(id):
    account = CustomerAccount.query.get_or_404(id)
    db.session.delete(account)
    db.session.commit()
    return jsonify({"message": "Customer account deleted successfully"}), 200

@app.route('/products', methods=['POST'])
def add_product():
    try:
        # Validate and deserialize input
        product_data =product_schema.load(request.json)
    except ValidationError as err:
        return jsonify(err.messages), 400
    new_product = Product(name=product_data['name'], price=product_data['price'], stock=product_data['stock'])
    db.session.add(new_product)
    db.session.commit()
    return jsonify({"message": "Product added successfully"}), 201

@app.route('/products', methods=['GET'])
def get_products():
    products = Product.query.all()
    return products_schema.jsonify(products)

@app.route('/products/<int:id>', methods=['PUT'])
def update_product(id):
    product = Product.query.get_or_404(id)
    try:
        # Validate and deserialize input
        product_data = product_schema.load(request.json)
    except ValidationError as err:
        return jsonify(err.messages), 400
    
    product.name = product_data['name']
    product.price = product_data['price']
    product.stock = product_data['stock']
    db.session.commit()
    return jsonify({"message": "Product updated successfully"}), 200

@app.route('/products/<int:id>', methods=['DELETE'])
def delete_product(id):
    product = Product.query.get_or_404(id)
    db.session.delete(product)
    db.session.commit()
    return jsonify({"message": "Product deleted successfully"}), 200

@app.route('/customers/by-email', methods=['GET'])
def query_customer_by_email():
    email = request.args.get('email')
    customer = Customer.query.filter_by(email=email).first()
    if customer:
        return customer_schema.jsonify(customer)
    else:
        return jsonify({"message": "Customer not found"}), 404

@app.route('/products/by-id/<int:product_id>', methods=['GET'])
def query_product_by_id(product_id):
    print(f"Searching for product with id: {product_id}")
    product = Product.query.get_or_404(product_id)
    print(f"Found product: {product.name}")
    return product_schema.jsonify(product)

@app.route('/orders', methods=['POST'])
def place_order():
    try:
        order_data = order_schema.load(request.json) 
    except ValidationError as err:
        return jsonify(err.messages), 400

    new_order = Order(date=date.today(), customer_id=order_data['customer_id'])
    db.session.add(new_order)
    db.session.commit()
    return jsonify({"message": "Order placed successfully"}), 201

@app.route('/orders/<int:id>', methods=['GET'])
def get_order(id):
    order = Order.query.get_or_404(id)
    return order_schema.jsonify(order)

@app.route('/orders/<int:order_id>/status', methods=['PUT'])
def update_order_status(order_id):
    order = Order.query.get_or_404(order_id)
    try:
        new_status = request.json['status']
        # Add validation for allowed status values if needed
        order.status = new_status
        db.session.commit()
        return jsonify({"message": "Order status updated successfully"}), 200
    except KeyError:
        return jsonify({"error": "Missing 'status' field in request body"}), 400

@app.route('/products/<int:id>/stock', methods=['GET'])
def get_product_stock(id):
    product = Product.query.get_or_404(id)
    return jsonify({"product_id": id, "name": product.name, "stock": product.stock})

@app.route('/products/<int:id>/stock', methods=['PUT'])
def update_product_stock(id):
    product = Product.query.get_or_404(id)
    try:
        # Assuming the request body contains a 'stock' field
        new_stock = request.json['stock'] 
        if new_stock < 0:
            raise ValueError("Stock cannot be negative")
        product.stock = new_stock
        db.session.commit()
        return jsonify({"message": "Product stock updated successfully"}), 200
    except KeyError:
        return jsonify({"error": "Missing 'stock' field in request body"}), 400
    except ValueError as e:
        return jsonify({"error": str(e)}), 400 

@app.route('/customers/<int:customer_id>/orders', methods=['GET'])
def get_customer_orders(customer_id):
    customer = Customer.query.get_or_404(customer_id)
    orders = customer.orders
    return orders_schema.jsonify(orders)

@app.route('/orders/<int:order_id>/cancel', methods=['PUT'])
def cancel_order(order_id):
    order = Order.query.get_or_404(order_id)
    order.status = 'canceled'  # Set status to canceled
    db.session.commit()
    return jsonify({"message": "Order canceled successfully"}), 200

@app.route('/orders/<int:order_id>/total-price', methods=['GET'])
def get_order_total_price(order_id):
    order = Order.query.get_or_404(order_id)
    total_price = order.calculate_total_price()
    return jsonify({"total_price": total_price})

RESTOCK_THRESHOLD = 10

def restock_products():
    """
    This function checks stock levels and restocks products.
    """
    with app.app_context():
        products = Product.query.all()
        for product in products:
            if product.stock < RESTOCK_THRESHOLD:
                # 1. Determine Restock Quantity (replace with your actual logic)
                restock_quantity = 50  

                # 2. Simulate Placing an Order with a Supplier (replace with your actual API call)
                try:
                    # Example API call (replace with your actual supplier API call)
                    order_result = {"success": True, "order_id": "SUPPLIER-ORDER-123"}  

                    if order_result["success"]:
                        print(f"Placed order for {restock_quantity} of {product.name} with supplier. "
                              f"Supplier Order ID: {order_result['order_id']}")

                    else:
                        print(f"Error placing order for {product.name}: {order_result.get('error')}")

                except Exception as e:
                    print(f"Error placing order for {product.name}: {e}")
                product.stock += 50  # Add 50 to the stock
                print(f"Restocked product {product.name} (ID: {product.id}) to {product.stock}")

        db.session.commit()

# Schedule the restock_products function to run every day at midnight
scheduler = BackgroundScheduler()
scheduler.add_job(restock_products, 'cron', hour=0, minute=0)  # Run daily at midnight
scheduler.start()

# Call the restock_products function once when the program starts
restock_products() 

# Initialize the database and create tables
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)