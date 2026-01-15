# utils/firebase.py
from firebase_admin import db

def push_booking_update(booking):
    provider_id = booking.service_provider.user.id
    db.reference("booking_updates").child(str(provider_id)).set({
        "booking_id": booking.id,
        "status": booking.status,
        "customer_id": booking.customer.user.id,
        "provider_id": provider_id,
        # "updated_at": booking.updated_at.isoformat()
    })