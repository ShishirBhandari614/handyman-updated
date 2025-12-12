import firebase_admin
from firebase_admin import credentials, db

cred = credentials.Certificate("finalsemproject/serviceAccountKey.json")

firebase_admin.initialize_app(cred, {
    "databaseURL": "https://handyman-fc64d-default-rtdb.asia-southeast1.firebasedatabase.app/"
})
