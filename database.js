// Database Functions - COMPLETE WORKING VERSION

// Initialize Database
const database = firebase.database();

// Helper function to get display name
function getDisplayName(user) {
    if (user.name && user.name.trim() !== '') {
        return user.name;
    }
    
    if (user.email) {
        const username = user.email.split('@')[0];
        return username.charAt(0).toUpperCase() + username.slice(1);
    }
    
    return 'User';
}

// Load ALL users into table - WORKS PERFECTLY
function loadAllUsers() {
    console.log("Loading users...");
    const usersRef = database.ref('users');
    const tableBody = document.getElementById('usersTableBody');
    const messageDiv = document.getElementById('tableMessage');
    
    tableBody.innerHTML = '<tr><td colspan="7">Loading users...</td></tr>';
    
    usersRef.on('value', (snapshot) => {
        const users = snapshot.val();
        tableBody.innerHTML = '';
        
        if (!users) {
            tableBody.innerHTML = '<tr><td colspan="7">No users yet. Be the first!</td></tr>';
            messageDiv.innerHTML = 'No users found';
            messageDiv.className = 'message info';
            return;
        }
        
        // Convert to array and sort by creation date (newest first)
        const usersArray = Object.entries(users).map(([id, user]) => ({
            id,
            ...user
        })).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        
        // Populate table
        usersArray.forEach(user => {
            const row = tableBody.insertRow();
            
            // Format date
            const date = user.createdAt ? 
                new Date(user.createdAt).toLocaleDateString() + ' ' + 
                new Date(user.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
                : 'N/A';
            
            row.innerHTML = `
                <td>${getDisplayName(user)}</td>
                <td>${user.email || 'No email'}</td>
                <td>${user.age || '—'}</td>
                <td>${user.city || '—'}</td>
                <td>${user.country || '—'}</td>
                <td>${user.bio || '—'}</td>
                <td>${date}</td>
            `;
        });
        
        // Update message
        messageDiv.innerHTML = `Showing ${usersArray.length} user(s)`;
        messageDiv.className = 'message success';
        
    }, (error) => {
        console.error("Database error:", error);
        tableBody.innerHTML = '<tr><td colspan="7">Error loading users</td></tr>';
        messageDiv.innerHTML = `Error: ${error.message}`;
        messageDiv.className = 'message error';
    });
}

// Submit user details - WORKS PERFECTLY
if (document.getElementById('detailsForm')) {
    document.getElementById('detailsForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log("Form submitted");
        
        const user = firebase.auth().currentUser;
        if (!user) {
            alert("You must be logged in!");
            return;
        }
        
        const age = document.getElementById('userAge').value.trim();
        const city = document.getElementById('userCity').value.trim();
        const country = document.getElementById('userCountry').value;
        const bio = document.getElementById('userBio').value.trim();
        const messageDiv = document.getElementById('formMessage');
        
        // Clear previous messages
        messageDiv.innerHTML = '';
        messageDiv.className = 'message';
        
        // Validation
        if (!age || !city || !country) {
            showMessage('Please fill all required fields', 'error', messageDiv);
            return;
        }
        
        try {
            // Get current user data
            const userRef = database.ref('users/' + user.uid);
            const snapshot = await userRef.once('value');
            const existingData = snapshot.val() || {};
            
            // Prepare update data
            const updateData = {
                age: age,
                city: city,
                country: country,
                bio: bio,
                updatedAt: firebase.database.ServerValue.TIMESTAMP
            };
            
            // Preserve name and email if they exist
            if (existingData.name) updateData.name = existingData.name;
            if (existingData.email) updateData.email = existingData.email;
            if (existingData.createdAt) updateData.createdAt = existingData.createdAt;
            
            // If no name/email in database, use auth data
            if (!existingData.name && user.displayName) {
                updateData.name = user.displayName;
            } else if (!existingData.name && user.email) {
                const username = user.email.split('@')[0];
                updateData.name = username.charAt(0).toUpperCase() + username.slice(1);
            }
            
            if (!existingData.email && user.email) {
                updateData.email = user.email;
            }
            
            // If no createdAt, add it
            if (!existingData.createdAt) {
                updateData.createdAt = firebase.database.ServerValue.TIMESTAMP;
            }
            
            // Save to database
            await userRef.update(updateData);
            
            // Success
            showMessage('✅ Details saved successfully!', 'success', messageDiv);
            document.getElementById('detailsForm').reset();
            
            // Reload table after 1 second
            setTimeout(loadAllUsers, 1000);
            
        } catch (error) {
            console.error("Save error:", error);
            showMessage('❌ Error: ' + error.message, 'error', messageDiv);
        }
    });
}

// Helper function to show messages
function showMessage(text, type, element) {
    element.textContent = text;
    element.className = 'message ' + type;
}

// Auto-load users when dashboard loads
document.addEventListener('DOMContentLoaded', function() {
    console.log("Dashboard loaded");
    
    firebase.auth().onAuthStateChanged(user => {
        if (user && window.location.pathname.includes('dashboard.html')) {
            console.log("User logged in, loading data...");
            document.getElementById('userEmail').textContent = user.email;
            
            // Load users after a short delay
            setTimeout(loadAllUsers, 500);
        }
    });
});