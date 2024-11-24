// Declare global variables at the top of the file
let proofAdded = false;
let isSubmitting = false;

// Theme handling
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('themeToggle');
    
    // Check for saved theme preference or default to 'light'
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Set initial icon
    updateThemeIcon(savedTheme);
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }

    // Rest of your existing DOMContentLoaded code...
});

function getUserInfo() {
    var userId = document.getElementById("userIdInput").value;
    if (!userId.trim()) {
        alert("Please enter a User ID");
        return;
    }

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
                alert(data.message || "User not found");
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to fetch user data.');
        });
}

function submitReport(event) {
    if (event) {
        event.stopPropagation();
    }
    
    if (isSubmitting) {
        return;
    }
    
    isSubmitting = true;
    
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

        const reportData = {
            userId,
            username,
            offence,
            action,
            reportedBy: reportedByInput,
            advice,
            note,
            proof: proofAdded ? proof : null,
            rm: rmInput
        };

        fetch('/submit_report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reportData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                generateAndDisplayReport(reportData);
            } else {
                alert('Error saving report to database');
            }
        })
        .catch(() => {
            alert('Error saving report to database');
        })
        .finally(() => {
            isSubmitting = false;
        });

    } catch (error) {
        isSubmitting = false;
    }
}

function generateAndDisplayReport(reportData) {
    // Move the existing report generation code here
    var report = `${reportData.userId}\n${reportData.username}\n<@${reportData.userId}>\n`;

    if (reportData.offence) report += `\n- Offence: ${reportData.offence}`;
    if (reportData.reportedBy) report += `\n- Reported by: <@${reportData.reportedBy}>`;
    if (reportData.action) report += `\n- Action: ${reportData.action}`;
    if (reportData.advice) report += `\n- Advice: ${reportData.advice}`;
    if (reportData.note) report += `\n- Note: ${reportData.note}`;
    if (proofAdded && reportData.proof) report += `\n- Proof: ${reportData.proof}`;
    if (reportData.rm) {
        const rmFormatted = reportData.rm.split(/\s+/).filter(Boolean).map(id => `<@${id.trim()}>`).join(' ');
        report += `\n- RM: ${rmFormatted}`;
    }

    document.getElementById("reportBox").value = report;
    document.getElementById("popupForm").style.display = "none";
}

function clearText() {
    document.getElementById("reportBox").value = "";
    // Show temporary success icon
    const clearButton = document.querySelector('button[onclick="clearText()"]');
    const originalText = clearButton.innerHTML;
    clearButton.innerHTML = '✓ Cleared';
    setTimeout(() => {
        clearButton.innerHTML = originalText;
    }, 1000);
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
window.addEventListener('click', function(event) {
    var footerModal = document.getElementById('footerModal');
    var popupForm = document.getElementById('popupForm');
    
    // Handle footer modal
    if (event.target === footerModal) {
        footerModal.style.display = 'none';
    }
    
    // Handle popup form
    if (event.target === popupForm) {
        popupForm.style.display = 'none';
    }
});

function copyText() {
    var text = document.getElementById("reportBox").value;
    const copyButton = document.querySelector('button[onclick="copyText()"]');
    
    if (!navigator.clipboard) {
        alert('📋 Clipboard API not available. Please copy manually.');
        return;
    }
    
    navigator.clipboard.writeText(text).then(function() {
        const originalText = copyButton.innerHTML;
        copyButton.innerHTML = '✓ Copied!';
        setTimeout(() => {
            copyButton.innerHTML = originalText;
        }, 1000);
    }).catch(function(err) {
        console.error('Failed to copy text: ', err);
        alert("❌ Failed to copy text. Please try manually.");
    });
}

function clearUserId() {
    console.log("clearUserId function called");
    document.getElementById("userIdInput").value = "";
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

// Event listener for when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded and parsed");
    
    // Only keep the clear button functionality
    var clearButton = document.getElementById('clearUserIdButton');
    if (clearButton) {
        clearButton.addEventListener('click', function() {
            console.log("Clear button clicked");
            document.getElementById("userIdInput").value = "";
        });
    } else {
        console.log("Clear button not found");
    }

    var infoButton = document.getElementById('infoButton');
    if (infoButton) {
        infoButton.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent event bubbling
            console.log("Info button clicked");
            showFooterModal();
        });
    } else {
        console.error("Info button not found");
    }
});

// Add these functions to your existing script.js file

function showFooterModal() {
    console.log("showFooterModal function called");
    var modal = document.getElementById('footerModal');
    if (modal) {
        modal.style.display = 'block';
        console.log("Modal should be visible now");
    } else {
        console.error("Footer modal element not found");
    }
}

function closeFooterModal() {
    console.log("closeFooterModal function called");
    document.getElementById('footerModal').style.display = 'none';
}

// Update the theme toggle button content
function updateThemeIcon(theme) {
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.innerHTML = theme === 'light' ? '🌙' : '☀️';
}