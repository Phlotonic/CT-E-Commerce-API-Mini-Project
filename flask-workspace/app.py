from datetime import date
from flask import Flask, jsonify, request, g 
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from marshmallow import fields, validate, ValidationError
from sqlalchemy.orm import DeclarativeBase, relationship, mapped_column, Mapped, backref
from sqlalchemy import Integer, String, Float, Date  # Import necessary SQLALchemy types
from flask_cors import CORS
from password import my_password
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL') or \
                                        f'mysql+mysqlconnector://root:{my_password}@127.0.0.1:3306/e_commerce_db'
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

class Base(DeclarativeBase):
    pass

ma = Marshmallow(app)
db = SQLAlchemy(app, model_class=Base)

# Association table with quantity
order_product = db.Table('Order_Product', Base.metadata,
    db.Column('order_id', db.Integer, db.ForeignKey('Orders.id'), primary_key=True),
    db.Column('product_id', db.Integer, db.ForeignKey('Products.id'), primary_key=True),
    db.Column('quantity', db.Integer, default=1)
)

class Product(db.Model):
    __tablename__ = 'Products'
    id: Mapped[int] = mapped_column(primary_key=True, type_=Integer)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    stock: Mapped[int] = mapped_column(Integer, default=0)
    
    orders = relationship("Order", secondary=order_product, back_populates="products")

class Customer(db.Model):
    __tablename__ = 'Customers'
    id: Mapped[int] = mapped_column(primary_key=True, type_=Integer)
    name: Mapped[str] = mapped_column(String(225), nullable=False)
    email: Mapped[str] = mapped_column(String(320), unique=True)
    phone: Mapped[str] = mapped_column(String(15))
    
    orders = relationship('Order', back_populates='customer', cascade="all, delete-orphan")

class Order(db.Model):
    __tablename__ = 'Orders'
    id: Mapped[int] = mapped_column(primary_key=True, type_=Integer)
    date: Mapped[date] = mapped_column(Date, nullable=False, default=date.today)
    customer_id: Mapped[int] = mapped_column(Integer, db.ForeignKey('Customers.id'))
    status: Mapped[str] = mapped_column(String(50), default='pending')

    customer = relationship('Customer', back_populates='orders')
    products = relationship('Product', secondary=order_product, back_populates='orders')

    def calculate_total_price(self):
        total_price = 0
        for product in self.products:
            order_product_row = db.session.query(order_product).filter_by(order_id=self.id, product_id=product.id).first()
            if order_product_row:
                quantity = order_product_row.quantity
                total_price += product.price * quantity
        return total_price

class CustomerAccount(db.Model):
    __tablename__ = 'customer_accounts'
    id: Mapped[int] = mapped_column(primary_key=True, type_=Integer)
    username: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)  # Remember to hash passwords in a real application!
    customer_id: Mapped[int] = mapped_column(Integer, db.ForeignKey('Customers.id'))

    customer = relationship('Customer', backref='customer_account', uselist=False)

# Schemas
class CustomerSchema(ma.Schema):
    class Meta:
        fields = ("id", "name", "email", "phone")

class CustomerAccountSchema(ma.Schema):
    class Meta:
        fields = ("username", "password", "id", "customer_id")

class ProductSchema(ma.Schema):
    class Meta:
        model = Product
        include_fk = True
        load_instance = True
        fields = ('id', 'name', 'price', 'stock')

class OrderSchema(ma.Schema):
    customer_name = fields.Str(attribute="customer.name")
    products = fields.List(fields.Nested(ProductSchema))
    class Meta:
        model = Order
        include_fk = True
        load_instance = True
        fields = ("id", "date", "customer_id", "products", "status", "customer_name")

customer_schema = CustomerSchema()
customers_schema = CustomerSchema(many=True)
customer_account_schema = CustomerAccountSchema()
customer_accounts_schema = CustomerAccountSchema(many=True)
product_schema = ProductSchema()
products_schema = ProductSchema(many=True)
order_schema = OrderSchema()
orders_schema = OrderSchema(many=True)


# Routes
@app.teardown_appcontext
def teardown_db(exception):
    db = g.pop('db', None)
    if db is not None:
        db.session.close()

@app.before_request
def before_request():
    g.db = db

@app.route('/customers', methods=['GET'])
def get_customers():
    customers = Customer.query.all()
    return customers_schema.jsonify(customers)

@app.route('/customers/<int:customer_id>', methods=['GET'])
def get_customer(customer_id):
    customer = Customer.query.get(customer_id)
    if customer is None:
        return jsonify({'error': 'Customer not found'}), 404
    return customer_schema.jsonify(customer)

@app.route('/customers', methods=['POST'])
def add_customer():
    try:
        customer_data = customer_schema.load(request.json)
    except ValidationError as err:
        return jsonify(err.messages), 400

    new_customer = Customer(**customer_data)
    db.session.add(new_customer)
    db.session.commit()
    return jsonify({"message": "New customer added successfully", "customer_id": new_customer.id}), 201

@app.route('/customers/<int:id>', methods=['PUT'])
def update_customer(id):
    customer = Customer.query.get_or_404(id)
    try:
        customer_data = customer_schema.load(request.json)
    except ValidationError as err:
        return jsonify(err.messages), 400

    for key, value in customer_data.items():
        setattr(customer, key, value)

    db.session.commit()
    return jsonify({"message": "Customer details updated successfully"}), 200

@app.route('/customers/<int:id>', methods=['DELETE'])
def delete_customer(id):
    customer = Customer.query.get_or_404(id)
    db.session.delete(customer)
    db.session.commit()
    return jsonify({"message": "Customer removed successfully"}), 200

@app.route('/customer_accounts', methods=['POST'])
def add_customer_account():
    try:
        account_data = customer_account_schema.load(request.json)
    except ValidationError as err:
        return jsonify(err.messages), 400

    new_account = CustomerAccount(**account_data)
    db.session.add(new_account)
    db.session.commit()
    return jsonify({"message": "New customer account added successfully"}), 201

@app.route('/customer_accounts/<int:id>', methods=['GET'])
def get_customer_account(id):
    account = CustomerAccount.query.get_or_404(id)
    return customer_account_schema.jsonify(account)

@app.route('/customers/<int:customer_id>/account', methods=['GET'])
def get_customer_account_by_customer_id(customer_id):
    customer = Customer.query.get_or_404(customer_id)
    if customer.customer_account:
        account_data = customer_account_schema.dump(customer.customer_account)
        return jsonify(account_data), 200
    else:
        return jsonify({'error': 'Customer account not found'}), 404

@app.route('/customer_accounts/<int:id>', methods=['PUT'])
def update_customer_account(id):
    account = CustomerAccount.query.get_or_404(id)
    try:
        account_data = customer_account_schema.load(request.json)
    except ValidationError as err:
        return jsonify(err.messages), 400

    for key, value in account_data.items():
        setattr(account, key, value)

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
        product_data = product_schema.load(request.json)
        # Additional validation
        if not isinstance(product_data.get('price'), (int, float)):
            return jsonify({"error": "Price must be a number"}), 400
        if not isinstance(product_data.get('stock'), int):
            return jsonify({"error": "Stock must be an integer"}), 400
        new_product = Product(**product_data)
        db.session.add(new_product)
        db.session.commit()
        return jsonify({"message": "Product added successfully", "product_id": new_product.id}), 201
    except ValidationError as err:
        return jsonify({"error": err.messages}), 400
    except Exception as e:
        db.session.rollback()
        print(f"Error adding product: {e}")
        return jsonify({"error": "An error occurred while adding the product."}), 500

@app.route('/products', methods=['GET'])
def get_products():
    products = Product.query.all()
    return products_schema.jsonify(products)

@app.route('/products/<int:id>', methods=['GET'])
def get_product(id):
    product = Product.query.get_or_404(id)
    return product_schema.jsonify(product)

@app.route('/products/<int:id>', methods=['GET'])
def get_product_by_id(id):
    product = Product.query.get_or_404(id)
    if product:
        return product_schema.jsonify(product)
    else:
        return jsonify({"error": "Product not found"}), 404

@app.route('/products/<int:id>', methods=['PUT'])
def update_product(id):
    product = Product.query.get_or_404(id)
    try:
        product_data = product_schema.load(request.json)
    except ValidationError as err:
        return jsonify(err.messages), 400

    for key, value in product_data.items():
        setattr(product, key, value)
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
    product = Product.query.get_or_404(product_id)
    return product_schema.jsonify(product)

@app.route('/orders', methods=['GET'])
def get_orders():
    all_orders = Order.query.options(db.joinedload(Order.customer)).all()
    serialized_orders = orders_schema.dump(all_orders)
    return jsonify(serialized_orders), 200

@app.route('/orders/<int:order_id>', methods=['GET'])
def get_order(order_id):
    order = Order.query.options(db.joinedload(Order.customer)).get_or_404(order_id)
    order_result = order_schema.dump(order)
    total_price = order.calculate_total_price()
    order_result['total_price'] = total_price

    # Add product quantities to the serialized data
    for product_data in order_result.get('products', []):
        order_item = next((item for item in order.products if item.id == product_data['id']), None)
        if order_item:
            association = db.session.query(order_product).filter_by(order_id=order.id, product_id=product_data['id']).first()
            if association:
                product_data['quantity'] = association.quantity
            else:
                product_data['quantity'] = 0
        else:
            product_data['quantity'] = 0

    return jsonify(order_result), 200

@app.route('/orders', methods=['POST'])
def place_order():
    try:
        order_data = request.get_json()
        customer_id = order_data.get('customer_id')
        products = order_data.get('products')

        # Input Validation
        if not customer_id:
            return jsonify({"error": "customer_id is required"}), 400
        if not products or not isinstance(products, list):
            return jsonify({"error": "products must be a non-empty list"}), 400

        new_order = Order(customer_id=customer_id, date=date.today(), status='pending')
        db.session.add(new_order)
        db.session.flush()  # Flush to get the new_order.id

        for product_data in products:
            product_id = product_data.get('product_id')
            quantity = product_data.get('quantity')

            if not product_id or quantity is None:
                return jsonify({'error': 'product_id and quantity are required for each product'}), 400
            if quantity <= 0:
                return jsonify({"error": "Quantity must be greater than 0"}), 400

            product = Product.query.get(product_id)
            if not product:
                return jsonify({'error': f'Product with id {product_id} not found'}), 404

            if product.stock < quantity:
                return jsonify({'error': f'Not enough stock for product {product.name}'}), 400

            try:
                product.stock -= quantity
                # Correctly associate product with the order and update/insert quantity
                new_order.products.append(product)
                
                # Check if an entry already exists in the association table
                existing_entry = db.session.query(order_product).filter_by(order_id=new_order.id, product_id=product_id).first()
                if existing_entry:
                    # Update the quantity of the existing entry
                    db.session.execute(order_product.update().where(
                        (order_product.c.order_id == new_order.id) & (order_product.c.product_id == product_id)
                    ).values(quantity=quantity))
                else:
                    # Insert a new entry into the association table
                    db.session.execute(order_product.insert().values(order_id=new_order.id, product_id=product_id, quantity=quantity))

            except Exception as e:
                db.session.rollback()
                print(f"Error updating stock or associating product: {e}")
                return jsonify({"error": "An error occurred during order processing."}), 500

        db.session.commit()
        return jsonify({"message": "Order placed successfully", "order_id": new_order.id}), 201

    except Exception as e:
        db.session.rollback()
        print(f"Error placing order: {e}")
        return jsonify({"error": "An error occurred while placing the order."}), 500

@app.route('/orders/<int:order_id>/status', methods=['PUT'])
def update_order_status(order_id):
    try:
        order = Order.query.get_or_404(order_id)
        new_status = request.json.get('status')
        if new_status is None:
            return jsonify({"error": "Missing 'status' field in request body"}), 400

        order.status = new_status
        db.session.commit()
        return jsonify({"message": "Order status updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error updating order status: {e}")
        return jsonify({"error": "Failed to update order status"}), 500

@app.route('/orders/<int:order_id>/cancel', methods=['PUT'])
def cancel_order(order_id):
    try:
        order = Order.query.get_or_404(order_id)
        if order.status.lower() != 'pending':
            return jsonify({"error": "Order cannot be cancelled (not pending)"}), 400

        order.status = 'cancelled'

        for product in order.products:
            order_product_row = db.session.query(order_product).filter_by(order_id=order.id, product_id=product.id).first()
            if order_product_row:
                try:
                    product.stock += order_product_row.quantity
                except Exception as e:
                    db.session.rollback()
                    print(f"Error restoring stock for product {product.id}: {e}")
                    return jsonify({"error": f"An error occurred while restoring stock for product {product.id}"}), 500

        db.session.commit()
        return jsonify({"message": "Order cancelled successfully"}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error cancelling order: {e}")
        return jsonify({"error": "Failed to cancel order"}), 500

@app.route('/products/<int:id>/stock', methods=['GET', 'PUT'])
def product_stock(id):
    product = Product.query.get_or_404(id)
    if request.method == 'GET':
        return jsonify({"product_id": id, "name": product.name, "stock": product.stock})
    elif request.method == 'PUT':
        try:
            new_stock = int(request.json.get('stock', 0))
            if new_stock < 0:
                return jsonify({"error": "Stock cannot be negative"}), 400
            product.stock = new_stock
            db.session.commit()
            return jsonify({"message": "Product stock updated successfully"}), 200
        except (TypeError, ValueError):
            return jsonify({"error": "Invalid stock value"}), 400

RESTOCK_THRESHOLD = 10

def restock_products():
    products = Product.query.all()
    for product in products:
        if product.stock < RESTOCK_THRESHOLD:
            restock_quantity = 50 
            try:
                    # Example API call (replace with your actual supplier API call)
                    order_result = {"success": True}  

                    if order_result["success"]:
                        print(f"Placed order for {restock_quantity} of {product.name} with supplier. "
                              f"Supplier Order ID: {order_result['order_id']}")
                    else:
                        print(f"Error placing order for {product.name}: {order_result.get('error')}")
            except Exception as e:
                    print(f"Error placing order for {product.name}: {e}")

            product.stock += restock_quantity
            print(f"Restocked product {product.name} (ID: {product.id}) to {product.stock}")
    db.session.commit()  # Commit within the function, still inside the app context

# Schedule the restock_products function
# scheduler = BackgroundScheduler()
# scheduler.add_job(restock_products, 'cron', hour=0, minute=0) 
# scheduler.start()

@app.teardown_appcontext
def teardown_db(exception):
    db = g.pop('db', None)

    if db is not None:
        db.session.close()

@app.before_request
def before_request():
    g.db = db

if __name__ == '__main__':
    with app.app_context():
        db.metadata.clear()
        db.create_all()
    app.run(debug=True)