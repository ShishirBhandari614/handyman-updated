import http.client
import json

def send_sms(phone_number, message):
    try:
        if not phone_number.startswith("977"):
            phone_number = "977" + phone_number 
        # Establish HTTPS connection to Infobip API
        conn = http.client.HTTPSConnection("m3zxqj.api.infobip.com")
        
        payload = json.dumps({
            "messages": [
                {
                    "destinations": [{"to": phone_number}],
                    "from": "447491163443",  # Your Infobip sender ID
                    "text": message
                }
            ]
        })
        
        headers = {
            'Authorization': 'App 22d114024f0bc479c46696e511f75a40-09803f30-c488-4fa6-8777-ba92dd4bacfc',  # Your API key
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
        
        conn.request("POST", "/sms/2/text/advanced", payload, headers)
        res = conn.getresponse()
        status_code = res.status
        data = res.read().decode("utf-8")
        
        conn.close()  # Ensure the connection is closed after the request
        
        response = json.loads(data)
        print("Infobip API Response:", response)
        print("HTTP Status Code:", status_code)
        # Return response for verification
        if response.get("messages"):
            return {"success": True, "response": response}
        else:
            return {"success": False, "error": response}

    except Exception as e:
        return {"success": False, "error": str(e)}
