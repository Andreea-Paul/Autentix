from flask import Flask, request, jsonify
from config import app, db  # Importă configurațiile din config.py
from models import User, Wallet, Document  # Importă modelele din models.py
from flask_cors import CORS

# Ruta principală
@app.route('/')
def home():
    return "Backend is running!"

CORS(app, origins="http://localhost:5173")

# Ruta pentru adăugarea unui utilizator
@app.route('/add_user', methods=['POST'])
def add_user():
    data = request.get_json()
    wallet_address = data.get('wallet_address')
    first_name = data.get('first_name')
    last_name = data.get('last_name')

    if not wallet_address:
        return jsonify({'error': 'No wallet address provided'}), 400
    
    # Verificăm dacă utilizatorul există deja (după adresa portofelului)
    wallet = Wallet.query.filter_by(wallet_address=wallet_address).first()
    if wallet:
        return jsonify({'message': 'Wallet address already registered'}), 400

    # Creăm un nou utilizator
    new_user = User(first_name=first_name, last_name=last_name)
    db.session.add(new_user)
    db.session.commit()

    # Creăm un nou portofel pentru utilizator
    new_wallet = Wallet(wallet_address=wallet_address, user_id=new_user.id)
    db.session.add(new_wallet)
    db.session.commit()

    return jsonify({'message': 'User and wallet added successfully'}), 200


# Pornirea serverului
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
