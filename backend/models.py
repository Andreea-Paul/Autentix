from config import db

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=True)
    access_code = db.Column(db.String(50), nullable=True)
    wallets = db.relationship('Wallet', backref='user', lazy=True)

class Wallet(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    wallet_address = db.Column(db.String(255), unique=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

class Document(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    document_name = db.Column(db.String(255), nullable=False)
    upload_date = db.Column(db.DateTime, default=db.func.current_timestamp())
    wallet_id = db.Column(db.Integer, db.ForeignKey('wallet.id'), nullable=False)
