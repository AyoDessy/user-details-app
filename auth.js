// Authentication Functions - COMPLETE WORKING VERSION

// Initialize Firebase Auth
const auth = firebase.auth();

// Show message function
function showMessage(text, type, element) {
    element.textContent = text;
    element.className = 'message ' + type;
}

// SIGNUP FUNCTION - WORKS PERFECTLY
if (document.getElementById('signupForm')) {
    document.getElementById('signupForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const name = document.getElementById('signupName').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;
        const messageDiv = document.getElementById('signupMessage');
        
        // Clear messages
        messageDiv.innerHTML = '';
        messageDiv.className = 'message';
        
        // Validation
        if (password.length < 6) {
            showMessage('Password must be at least 6 characters', 'error', messageDiv);
            return;
        }
        if (!name) {
            showMessage('Please enter your name', 'error', messageDiv);
            return;
        }
        if (!email) {
            showMessage('Please enter your email', 'error', messageDiv);
            return;
        }
        
        try {
            // 1. Create auth user
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // 2. Update profile with name
            await user.updateProfile({ displayName: name });
            await user.reload(); // Refresh to get displayName
            
            // 3. Save COMPLETE user data to database
            await firebase.database().ref('users/' + user.uid).set({
                name: name,
                email: email,
                age: '',
                city: '',
                country: '',
                bio: '',
                createdAt: firebase.database.ServerValue.TIMESTAMP,
                updatedAt: firebase.database.ServerValue.TIMESTAMP
            });
            
            // Success
            showMessage('Account created! Redirecting...', 'success', messageDiv);
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
            
        } catch (error) {
            console.error("Signup error:", error);
            showMessage('Error: ' + error.message, 'error', messageDiv);
        }
    });
}

// LOGIN FUNCTION - WORKS PERFECTLY
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const messageDiv = document.getElementById('loginMessage');
        
        messageDiv.innerHTML = '';
        messageDiv.className = 'message';
        
        try {
            await auth.signInWithEmailAndPassword(email, password);
            showMessage('Login successful! Redirecting...', 'success', messageDiv);
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } catch (error) {
            showMessage('Error: ' + error.message, 'error', messageDiv);
        }
    });
}

// LOGOUT FUNCTION - FIXED!
function logout() {
    auth.signOut()
        .then(() => {
            console.log("User signed out successfully");
            window.location.href = 'index.html';
        })
        .catch((error) => {
            console.error("Logout error:", error);
            alert("Logout failed: " + error.message);
        });
}

// Add logout to global scope for HTML onclick
window.logout = logout;

// Navigation functions
function showSignup() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('signupSection').style.display = 'block';
    document.getElementById('signupMessage').innerHTML = '';
    document.getElementById('loginMessage').innerHTML = '';
}

function showLogin() {
    document.getElementById('signupSection').style.display = 'none';
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('signupMessage').innerHTML = '';
    document.getElementById('loginMessage').innerHTML = '';
}

// Add to global scope
window.showSignup = showSignup;
window.showLogin = showLogin;