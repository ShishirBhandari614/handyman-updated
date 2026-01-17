# utils/firebase.py
from firebase_admin import db
import time

def push_booking_update(booking):
    provider_id = booking.service_provider.user.id
    db.reference("booking_updates").child(str(provider_id)).set({
        "booking_id": booking.id,
        "status": booking.status,
        "customer_id": booking.customer.user.id,
        "provider_id": provider_id,
        # "updated_at": booking.updated_at.isoformat()
    })


def push_firebase_notification(user_id, payload):
    ref = db.reference(f"notifications/{user_id}/latest")
    payload["timestamp"] = int(time.time() * 1000)
    ref.set(payload)