from automation.backend.database import SessionLocal
from automation.backend.models import User
from automation.backend.auth import get_password_hash

def create_admin_user():
    db = SessionLocal()
    try:
        # Check if exists
        user = db.query(User).filter(User.email == "Admin").first()
        if not user:
            hashed_password = get_password_hash("Admin")
            new_user = User(email="Admin", hashed_password=hashed_password, role="master")
            db.add(new_user)
            db.commit()
            print("User 'Admin' created successfully.")
        else:
            print("User 'Admin' already exists.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()
