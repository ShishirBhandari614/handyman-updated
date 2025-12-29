import http.client
import json

def send_sms(phone_number, message):
    try:
        if not phone_number.startswith("+977"):
            phone_number = "+977" + phone_number 
        # Establish HTTPS connection to Infobip API
        conn = http.client.HTTPSConnection("558qyj.api.infobip.com")
        
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
            'Authorization': 'App 7342f90ef54c43cf994145c367cd587f-adee39c5-ae2e-4356-b6ea-0593f5d22b74',  # Your API key
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
