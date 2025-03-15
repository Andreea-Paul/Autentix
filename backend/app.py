from flask import Flask, request, jsonify
from flask_cors import CORS  # Enable Cross-Origin Resource Sharing for all routes
from datetime import datetime
from models import db, User, Wallet, Document
import bcrypt
import binascii

app = Flask(__name__)
CORS(app)  # Allow CORS for all routes

# Flask configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# --------------------- User Operations ---------------------

@app.route('/add_user', methods=['POST'])
def add_user():
    """
    Adds a new user if the wallet address is not already associated with an existing user.
    A new wallet entry is created and linked to the newly created user.
    """
    data = request.get_json()
    wallet_address = data.get('wallet_address')

    # Check if the wallet already exists
    wallet = Wallet.query.filter_by(wallet_address=wallet_address).first()
    if not wallet:
        # Create a new user with empty name and access code
        new_user = User(name='', access_code='')
        db.session.add(new_user)
        db.session.commit()

        # Associate the wallet with the newly created user
        new_wallet = Wallet(wallet_address=wallet_address, user_id=new_user.id)
        db.session.add(new_wallet)
        db.session.commit()

    return jsonify({"message": "User added successfully!"})


@app.route('/user/<wallet_address>', methods=['GET'])
def get_user_by_wallet(wallet_address):
    """
    Retrieves user information (name, access code, and user ID) based on the associated wallet address.
    Returns an error if no user is found.
    """
    wallet = Wallet.query.filter_by(wallet_address=wallet_address).first()
    if wallet:
        user = db.session.get(User, wallet.user_id)
        if user:
            return jsonify({
                'name': user.name,
                'access_code': user.access_code,
                'user_id': user.id
            })
    return jsonify({'error': 'User not found'}), 404


@app.route('/update_user/<wallet_address>', methods=['PUT'])
def update_user(wallet_address):
    """
    Updates a user's name and access code based on the associated wallet address.
    The access code is securely hashed before storing it in the database.
    """
    data = request.get_json()
    wallet = Wallet.query.filter_by(wallet_address=wallet_address).first()

    if wallet:
        user = db.session.get(User, wallet.user_id)
        if user:
            # Update user name
            user.name = data.get('name')

            # Update access code if provided
            access_code = data.get('access_code')
            if access_code:
                hashed_access_code = bcrypt.hashpw(access_code.encode('utf-8'), bcrypt.gensalt())
                user.access_code = binascii.hexlify(hashed_access_code).decode('utf-8')

            db.session.commit()
            return jsonify({'message': 'User updated successfully'})

    return jsonify({'error': 'User not found'}), 404

# --------------------- Document Operations ---------------------

@app.route('/upload_document', methods=['POST'])
def upload_document():
    """
    Associates a document with a user's wallet.
    Saves the document name and upload timestamp in the database.
    """
    data = request.get_json()
    wallet_address = data.get('wallet_address')
    document_name = data.get('document_name')
    upload_date = datetime.now()
    
    # Find the wallet by address
    wallet = Wallet.query.filter_by(wallet_address=wallet_address).first()
    if wallet:
        # Create a new document entry
        new_document = Document(document_name=document_name, upload_date=upload_date, wallet_id=wallet.id)
        db.session.add(new_document)
        db.session.commit()
        return jsonify({'message': 'Document uploaded successfully'})
    
    return jsonify({'error': 'User not found'}), 404


@app.route('/documents/<wallet_address>', methods=['GET'])
def get_documents(wallet_address):
    """
    Retrieves all documents associated with the given wallet address.
    Each document includes its name and formatted upload date.
    """
    wallet = Wallet.query.filter_by(wallet_address=wallet_address).first()
    if wallet:
        user = db.session.get(User, wallet.user_id)
        if user:
            documents = Document.query.filter_by(wallet_id=wallet.id).all()
            if documents:
                doc_list = [{
                    'name': doc.document_name,
                    'upload_date': doc.upload_date.strftime('%Y-%m-%d %H:%M:%S')
                } for doc in documents]
                return jsonify({'documents': doc_list})
    return jsonify({'error': 'User not found'}), 404

# --------------------- Wallet Operations ---------------------

@app.route('/add_new_wallet', methods=['POST'])
def add_new_wallet():
    """
    Adds a new wallet entry for an existing user.
    Requires both wallet address and user ID. Prevents duplicate wallets.
    """
    data = request.json
    wallet_address = data.get('wallet_address')
    user_id = data.get('user_id')

    if not wallet_address or not user_id:
        return jsonify({"error": "Missing wallet address or user ID"}), 400

    existing_wallet = Wallet.query.filter_by(wallet_address=wallet_address).first()
    if existing_wallet:
        return jsonify({"error": "Wallet already exists"}), 400

    new_wallet = Wallet(wallet_address=wallet_address, user_id=user_id)
    db.session.add(new_wallet)
    try:
        db.session.commit()
        return jsonify({"message": "Wallet added successfully"}), 201
    except Exception as e:
        db.session.rollback()
        print(f"Database error: {e}")  # Log the error
        return jsonify({"error": "Database error"}), 500

# --------------------- Run Application ---------------------

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
