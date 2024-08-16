// Declare global variables at the top of the file
let proofAdded = false;

function getUserInfo() {
    var userId = document.getElementById("userIdInput").value;
    var modal = document.getElementById("popupForm");
    var span = document.getElementsByClassName("close")[0];

    // Clear previous data in the popup form fields
    document.getElementById("offence").value = "";
    document.getElementById("action").value = "";
    document.getElementById("advice").value = "";
    document.getElementById("rm").value = "";
    document.getElementById("reportedBy").value = "";
    document.getElementById("note").value = "";
    document.getElementById("proofInput").value = "";

    // Fetch user information to validate existence and get username
    fetch(`/userinfo/${userId}`)
        .then(response => response.json())
        .then(data => {
            if (data.username) {  // Check if username exists in the response
                window.currentUserData = data; // Store user data globally if valid
                showPopup(); // Show popup only if data is successfully fetched
            } else {
                alert(data.message); // Alert the user if no valid data found
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to fetch user data.');
        });
}

function toggleProofInput() {
    const proofInput = document.getElementById('proofInput');
    const addProofButton = document.querySelector('#proofSection button');
    
    if (proofInput.style.display === 'none') {
        proofInput.style.display = 'block';
        addProofButton.textContent = 'Remove Proof';
        proofAdded = true;
    } else {
        proofInput.style.display = 'none';
        addProofButton.textContent = 'Add Proof';
        proofInput.value = ''; // Clear the input when hiding
        proofAdded = false;
    }
}

function submitReport() {
    console.log("submitReport function called");

    try {
        var userId = window.currentUserData ? window.currentUserData.userId : "Unknown ID";
        var username = window.currentUserData ? window.currentUserData.username : "Unknown User";
        var offence = document.getElementById("offence").value;
        var reportedByInput = document.getElementById("reportedBy").value;
        var action = document.getElementById("action").value;
        var advice = document.getElementById("advice").value;
        var note = document.getElementById("note").value;
        var proof = document.getElementById("proofInput").value;
        var rmInput = document.getElementById("rm").value;

        console.log("Collected form data:", { userId, username, offence, reportedByInput, action, advice, note, proof, rmInput });

        // Format the Reported by ID
        var reportedByFormatted = reportedByInput ? `<@${reportedByInput.trim()}>` : "";

        // Process the RM input to format multiple IDs
        var rmFormatted = rmInput.split(/\s+/).filter(Boolean).map(id => `<@${id.trim()}>`).join(' ');

        // Start constructing the report string with user details
        var report = `${userId}\n${username}\n<@${userId}>\n`;

        // Add details in the specified order
        if (offence.trim()) report += `\n- Offence: ${offence}`;
        if (reportedByFormatted) report += `\n- Reported by: ${reportedByFormatted}`;
        if (action.trim()) report += `\n- Action: ${action}`;
        if (advice.trim()) report += `\n- Advice: ${advice}`;
        if (note.trim()) report += `\n- Note: ${note}`;
        if (proofAdded) {
            report += `\n- Proof: ${proof.trim() || ''}`;
        }
        if (rmFormatted.trim()) report += `\n- RM: ${rmFormatted}`;

        console.log("Generated report:", report);

        document.getElementById("reportBox").value = report;  // Display the report in the text box
        document.getElementById("popupForm").style.display = "none";  // Close the modal

        console.log("Report submitted and popup closed");
    } catch (error) {
        console.error("Error in submitReport function:", error);
    }
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

function copyText() {
    var text = document.getElementById("reportBox").value; // Get the value of the text area
    if (!navigator.clipboard) {
        alert('Clipboard API not available. Please copy manually.');
        return;
    }
    navigator.clipboard.writeText(text).then(function() {
        alert("Copied the text: " + text);
    }).catch(function(err) {
        console.error('Failed to copy text: ', err);
        alert("Failed to copy text. Please try manually.");
    });
}

function clearUserId() {
    document.getElementById("userIdInput").value = "";
}

// Event listener for when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded and parsed");
    var submitButton = document.querySelector('button[onclick="submitReport()"]');
    if (submitButton) {
        console.log("Submit button found");
        submitButton.addEventListener('click', function() {
            console.log("Submit button clicked");
            submitReport();
        });
    } else {
        console.log("Submit button not found");
    }
});