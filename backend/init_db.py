from config import app, db  
from models import User, Wallet, Document  

# Create table in Database
with app.app_context():
    db.create_all()
    print("Tabelele au fost create cu succes!")
