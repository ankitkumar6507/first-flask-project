// Fetch recharge data from backend
fetch('/api/get_recharge_data')
  .then(response => response.json())
  .then(data => {
    
    document.getElementById('btn1').innerText = `₹${data.amount1}`;
    document.getElementById('btn1').setAttribute('onclick', `showPaymentSection(${data.amount1})`);

    document.getElementById('btn2').innerText = `₹${data.amount2}`;
    document.getElementById('btn2').setAttribute('onclick', `showPaymentSection(${data.amount2})`);

    document.getElementById('qrCodeImage').src = data.qr_code_link;
    document.getElementById('upiId').innerText = data.upi_id;
  })
  .catch(error => {
    console.error('Error fetching recharge data:', error);
  });
   

// Function to show payment section
function showPaymentSection(amount) {
  document.getElementById('selectedAmount').innerText = "Amount: ₹" + amount;
  document.getElementById('paymentSection').style.display = 'block';
  document.getElementById('amountInput').value = amount;
}

// Copy UPI ID
function copyUPI() {
  var upi = document.getElementById('upiId').innerText;
  navigator.clipboard.writeText(upi);
  alert("UPI ID Copied: " + upi);
}
