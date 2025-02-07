document.addEventListener("DOMContentLoaded", function () {
    console.log("🔥 DOM fully loaded and parsed"); // Debugging log

    // ---- LOGIN / SIGNUP ELEMENTS ----
    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");
    const loginTitle = document.getElementById("login-title");

    const loginEmail = document.getElementById("login-email");
    const loginPassword = document.getElementById("login-password");
    const signupEmail = document.getElementById("signup-email");
    const signupPassword = document.getElementById("signup-password");
    const signupPasswordConfirm = document.getElementById("signup-password-confirm");

    const loginBtn = document.getElementById("login-btn");
    const signupBtn = document.getElementById("signup-btn");
    const logoutBtn = document.getElementById("logout-btn");
    const resendEmailBtn = document.getElementById("resend-email");
    const forgotPasswordLink = document.getElementById("forgot-password");

    const showSignup = document.getElementById("show-signup");
    const showLogin = document.getElementById("show-login");
    const userStatus = document.getElementById("user-status");

    // ✅ Debugging: Check if loginBtn exists
    if (!loginBtn) {
        console.error("❌ ERROR: loginBtn element not found! Check index.html");
        return;
    }

    // ✅ Ensure Firebase is properly initialized
    if (!firebase.apps.length) {
        console.error("🔥 Firebase is not initialized! Check Firebase setup.");
        return;
    }

    const db = firebase.firestore();
    const auth = firebase.auth();

    // 🔹 LOGIN USER (Fix Button Click)
    loginBtn.addEventListener("click", function () {
        const email = loginEmail.value.trim();
        const password = loginPassword.value.trim();

        if (!email || !password) {
            alert("⚠️ Please enter both email and password.");
            return;
        }

        console.log("🔄 Attempting to log in with:", email); // Debugging log

        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log("✅ Login successful:", user.email);

                if (user.emailVerified) {
                    userStatus.innerText = `Logged in as ${user.email}`;
                    logoutBtn.style.display = "block";
                    loginForm.style.display = "none";
                    signupForm.style.display = "none";
                } else {
                    alert("⚠️ Your email is not verified. Please verify before logging in.");
                    auth.signOut();
                }
            })
            .catch((error) => {
                console.error("❌ Login failed:", error.message);
                alert("Login failed: " + error.message);
            });
    });

    // 🔹 CHECK AUTH STATE (Fix Login Button Not Updating UI)
    auth.onAuthStateChanged((user) => {
        if (user) {
            console.log("🔄 User is logged in:", user.email);
            userStatus.innerText = `Logged in as ${user.email}`;
            logoutBtn.style.display = "block";
            loginForm.style.display = "none";
            signupForm.style.display = "none";
        } else {
            console.log("🚪 No user is logged in.");
            userStatus.innerText = "Not logged in";
            logoutBtn.style.display = "none";
            loginForm.style.display = "block";
        }
    });

    // 🔹 LOGOUT USER
    logoutBtn.addEventListener("click", function () {
        auth.signOut().then(() => {
            console.log("✅ User logged out.");
            userStatus.innerText = "Not logged in";
            logoutBtn.style.display = "none";
            loginForm.style.display = "block";
        });
    });
});
