function getUserInfo() {
    var userId = document.getElementById("userIdInput").value;
    var modal = document.getElementById("popupForm");
    var span = document.getElementsByClassName("close")[0];

    // Fetch user information to validate existence and get username
    fetch(`/userinfo/${userId}`)
        .then(response => response.json())
        .then(data => {
            if (data.username) {  // Check if username exists in the response
                window.currentUserData = data; // Store user data globally if valid
            } else {
                alert(data.message); // Alert the user if no valid data found
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to fetch user data.');
        });

    // Display the modal for entering report details if user data is valid
    if (window.currentUserData) {
        modal.style.display = "block";
        span.onclick = function() {
            modal.style.display = "none";
        }
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }
    }
}

function submitReport() {
    var userId = window.currentUserData ? window.currentUserData.userId : "Unknown ID";
    var username = window.currentUserData ? window.currentUserData.username : "Unknown User";
    var offence = document.getElementById("offence").value;
    var action = document.getElementById("action").value;
    var advice = document.getElementById("advice").value;
    var rmInput = document.getElementById("rm").value;

    // Process the RM input to format multiple IDs
    var rmFormatted = rmInput.split(/\s+/).filter(Boolean).map(id => `<@${id.trim()}>`).join(' ');

    // Start constructing the report string with user details
    var report = `${userId}\n${username}\n<@${username}>\n`;

    // Conditionally add other details if they are filled
    if (offence.trim()) report += `\n- Offence: ${offence}`;
    if (action.trim()) report += `\n- Action: ${action}`;
    if (advice.trim()) report += `\n- Advice: ${advice}`;
    if (rmFormatted.trim()) report += `\n- RM: ${rmFormatted}`;

    document.getElementById("reportBox").value = report;  // Display the report in the text box
    document.getElementById("popupForm").style.display = "none";  // Close the modal
}

function clearText() {
    document.getElementById("reportBox").value = "";
}

function showPopup() {
    var modal = document.getElementById('popupForm');
    modal.style.display = 'block';
}

// Function to close the popup
function closePopup() {
    var modal = document.getElementById('popupForm');
    modal.style.display = 'none';
}

// Close popup when user clicks outside of it
window.onclick = function(event) {
    var modal = document.getElementById('popupForm');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}
