from flask import Flask, request, jsonify
from flask_cors import CORS  # Importă CORS
from datetime import datetime
from models import db, User, Wallet, Document

app = Flask(__name__)
CORS(app)  # Permite CORS pentru toate rutele

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# Rută pentru adăugarea unui utilizator
@app.route('/add_user', methods=['POST'])
def add_user():
    data = request.get_json()
    wallet_address = data.get('wallet_address')
    
    # Verificăm dacă există deja un utilizator cu acest portofel
    wallet = Wallet.query.filter_by(wallet_address=wallet_address).first()
    if not wallet:
        # Creăm un utilizator nou dacă nu există
        new_user = User(first_name='', last_name='')
        db.session.add(new_user)
        db.session.commit()

        # Asociem portofelul cu utilizatorul
        new_wallet = Wallet(wallet_address=wallet_address, user_id=new_user.id)
        db.session.add(new_wallet)
        db.session.commit()

    return jsonify({"message": "User added successfully!"})

# Rută pentru obținerea informațiilor unui utilizator pe baza adresei portofelului
@app.route('/user/<wallet_address>', methods=['GET'])
def get_user_by_wallet(wallet_address):
    wallet = Wallet.query.filter_by(wallet_address=wallet_address).first()
    if wallet:
        user = db.session.get(User, wallet.user_id)
        if user:
            return jsonify({
                'first_name': user.first_name,
                'last_name': user.last_name,
                'user_id': user.id
            })
    return jsonify({'error': 'User not found'}), 404

# Rută pentru actualizarea informațiilor utilizatorului (nume și prenume)
@app.route('/update_user/<wallet_address>', methods=['PUT'])
def update_user(wallet_address):
    data = request.get_json()
    wallet = Wallet.query.filter_by(wallet_address=wallet_address).first()
    if wallet:
        user = db.session.get(User, wallet.user_id)
        if user:
            user.first_name = data.get('first_name')
            user.last_name = data.get('last_name')
            db.session.commit()
            return jsonify({'message': 'User updated successfully'})
    return jsonify({'error': 'User not found'}), 404


# Rută pentru a salva documentul încărcat pe blockchain
@app.route('/upload_document', methods=['POST'])
def upload_document():
    data = request.get_json()
    wallet_address = data.get('wallet_address')
    document_name = data.get('document_name')
    upload_date = datetime.now()
    
    # Căutăm utilizatorul după adresa portofelului
    wallet = Wallet.query.filter_by(wallet_address=wallet_address).first()
    if wallet:
        # Creăm un nou document asociat portofelului
        new_document = Document(document_name=document_name, upload_date=upload_date, wallet_id=wallet.id)
        db.session.add(new_document)
        db.session.commit()
        return jsonify({'message': 'Document uploaded successfully'})
    
    return jsonify({'error': 'User not found'}), 404

@app.route('/documents/<wallet_address>', methods=['GET'])
def get_documents(wallet_address):
    wallet = Wallet.query.filter_by(wallet_address=wallet_address).first()
    if wallet:
        user = db.session.get(User, wallet.user_id)
        if user:
            documents = Document.query.filter_by(wallet_id=wallet.id).all()
            if documents:
                doc_list = [{'name': doc.document_name, 'upload_date': doc.upload_date.strftime('%Y-%m-%d %H:%M:%S')} for doc in documents]
                return jsonify({'documents': doc_list})
    return jsonify({'error': 'User not found'}), 404

@app.route('/add_new_wallet', methods=['POST'])
def add_new_wallet():
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
        return jsonify({"error": "Database error"}), 500

# Rulare aplicație
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
