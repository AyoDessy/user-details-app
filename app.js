// Firebase Configuration - REPLACE WITH YOUR ACTUAL CONFIG!
const firebaseConfig = {
  apiKey: "AIzaSyB1HD1WOXG1s7zaqZcK_hPSD5laROT_1iU",
  authDomain: "userdetailsapp-f5ca2.firebaseapp.com",
  databaseURL: "https://userdetailsapp-f5ca2-default-rtdb.firebaseio.com",
  projectId: "userdetailsapp-f5ca2",
  storageBucket: "userdetailsapp-f5ca2.firebasestorage.app",
  messagingSenderId: "310136570832",
  appId: "1:310136570832:web:ab86a972bf24563789efd5"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Check auth state on page load
document.addEventListener('DOMContentLoaded', function() {
    firebase.auth().onAuthStateChanged(user => {
        const currentPage = window.location.pathname.split('/').pop();
        
        if (user && currentPage === 'index.html') {
            // User logged in but on login page → redirect to dashboard
            window.location.href = 'dashboard.html';
        } else if (!user && currentPage === 'dashboard.html') {
            // User not logged in but on dashboard → redirect to login
            window.location.href = 'index.html';
        }
    });
});

// Navigation functions
function showSignup() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('signupSection').style.display = 'block';
}

function showLogin() {
    document.getElementById('signupSection').style.display = 'none';
    document.getElementById('loginSection').style.display = 'block';
}

// Add to global scope
window.showSignup = showSignup;
window.showLogin = showLogin;