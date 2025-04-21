
const balance = document.getElementById("balance");
const supportLink = document.getElementById('customer-support-link');

document.addEventListener('DOMContentLoaded', function() {
  //fetch balance
  fetch('/api/balance')
  .then(response => response.json())
    
  .then(data => {
      if (data.balance !== undefined) {
          balance.textContent = "₹" + data.balance + ".00";
          
      } 
  })
  .catch(error => {
      console.error('Error fetching balance:', error);
  });

  // fetch profile details
  fetch('/api/profile')
  .then(response => response.json())
  .then(data => {
    console.log('Profile Data:', data);

    // Check if required fields exist
    if (data.name !== undefined && data.id !== undefined && data.mobile !== undefined) {
        document.getElementById('name').textContent = data.name;
        document.getElementById('id').textContent = "ID: " + data.id;
        document.getElementById('mobile').textContent = "Mobile: " + data.mobile;
    } else {
        console.error('Missing profile data:', data);
    }
  })
  .catch(error => {
    console.error('Error fetching profile details:', error);
  }); 

  fetch('/api/customer-support-link')
  .then(response => response.json())
  .then(data => {
      if (data.link) {
          
          
          supportLink.href = data.link;
           // in case you want to hide by default
      }
  })
  .catch(error => {
      console.error('Error fetching support link:', error);
  });
});

function withdraw() {
  alert("Recharge one time to withdraw")
}
