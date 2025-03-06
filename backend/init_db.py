from config import app, db  # Importă aplicația Flask și obiectul db
from models import User, Wallet, Document  # Importă modelele

# Creează tabelele în baza de date
with app.app_context():
    db.create_all()
    print("Tabelele au fost create cu succes!")
