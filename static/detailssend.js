// document.addEventListener("DOMContentLoaded", function () {
//     var serviceType = document.getElementById('service-type').value;

//     document.querySelectorAll(".book-now").forEach(button => {
//         button.addEventListener("click", function (event) {
//             event.preventDefault();

//             let userId = this.getAttribute("data-id");
//             let phoneNumber = this.getAttribute("data-phone");
//             let customerId = this.getAttribute("customerid");
//             let customerName = this.getAttribute("customername");
//             let customerPhone = this.getAttribute("customerphone");
//             let serviceprovidername = this.getAttribute("serviceprovidername");
//             let profile = this.getAttribute("profile");

//             console.log("User ID:", userId);
//             console.log("Phone Number:", phoneNumber);
//             console.log("Customer ID:", customerId);
//             console.log("Customer Name:", customerName);
//             console.log("Customer Phone:", customerPhone);
//             console.log("Service Type:", serviceType);
//             console.log("Service Provider Name:", serviceprovidername);

//             function getCSRFToken() {
//                 let token = document.querySelector('meta[name="csrf-token"]');
//                 if (token) {
//                     return token.getAttribute('content');
//                 }
//                 return document.cookie.split('; ')
//                     .find(row => row.startsWith('csrftoken='))?.split('=')[1];
//             }

//             const csrfToken = getCSRFToken();
//             console.log("CSRF Token:", csrfToken);

//             // Send booking data to server
//             fetch("/viewprofile/", {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                     "X-CSRFToken": csrfToken
//                 },
//                 body: JSON.stringify({
//                     user_id: userId,
//                     phone: phoneNumber,
//                     serviceprovidername: serviceprovidername,
//                     profile: profile,
//                     customer_id: customerId,
//                     customer_phone: customerPhone,
//                     customer_name: customerName,
//                     serviceType: serviceType
//                 })
//             })
//             .then(response => {
//                 if (!response.ok) {
//                     throw new Error(`HTTP error! Status: ${response.status}`);
//                 }
//                 return response.json();  // Ensure JSON response
//             })
//             .then(result => {
//                 console.log("Full response:", result);
//                 if (result.success) {
//                     alert("Booking successful! " + (result.message || "No message provided"));

//                     // Redirect directly with query parameters
//                     window.location.href = `/viewprofile/?user_id=${userId}&phone_number=${phoneNumber}&customer_id=${customerId}&customer_name=${customername}&customer_phone=${customerPhone}&service_type=${serviceType}&service_provider_name=${serviceprovidername}&profile=${encodeURIComponent(profile)}`;

                    

//                 } else {
//                     alert("Booking failed: " + (result.message || "Unknown error"));
//                 }
//             })
//             .catch(error => {
//                 console.error("Fetch error:", error);
//                 alert("An error occurred while processing your request. Please try again.");
//             });
//         });
//     });
// });
