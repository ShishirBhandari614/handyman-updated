
const admin = require("firebase-admin");
const axios = require("axios");
const serviceAccount = require("../finalsemproject/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://handyman-fc64d-default-rtdb.asia-southeast1.firebasedatabase.app/"
});

const ref = admin.database().ref("service_providers");

ref.on("child_changed", async (snapshot) => {
  const providerId = snapshot.key;
  const data = snapshot.val();

  console.log("Detected change:", providerId, data);

  try {
    await axios.post("http://127.0.0.1:8000/firebase-update-status/", {
      provider_id: providerId,
      is_online: data.is_online
    });

    console.log("✅ Django updated");
    
  } catch (err) {
    console.error("❌ Django update failed:", err.message);
  }
});