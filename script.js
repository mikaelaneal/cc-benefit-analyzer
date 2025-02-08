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

    // ---- CREDIT CARD ELEMENTS ----
    const cardDropdown = document.getElementById("card");
    const addCardBtn = document.getElementById("add-card");
    const cardsTableBody = document.getElementById("cards-table-body");
    const expenseDropdown = document.getElementById("expense");
    const findBestCardBtn = document.getElementById("find-best-card");
    const recommendationText = document.getElementById("recommendation");

    // ✅ Ensure Firebase is properly initialized
    if (!firebase.apps.length) {
        console.error("🔥 Firebase is not initialized! Check Firebase setup.");
        return;
    }

    const db = firebase.firestore();
    const auth = firebase.auth();

    // 🔹 LOGIN USER
    if (loginBtn) {
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
    }

    // 🔹 SIGNUP USER
    if (signupBtn) {
        signupBtn.addEventListener("click", function () {
            const email = signupEmail.value.trim();
            const password = signupPassword.value.trim();
            const confirmPassword = signupPasswordConfirm.value.trim();

            if (!email || !password || !confirmPassword) {
                alert("⚠️ Please fill out all fields.");
                return;
            }

            if (password !== confirmPassword) {
                alert("⚠️ Passwords do not match.");
                return;
            }

            auth.createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    const user = userCredential.user;

                    // Send email verification
                    user.sendEmailVerification()
                        .then(() => {
                            alert("📩 A verification email has been sent. Please verify before logging in.");
                            signupForm.style.display = "none";
                            loginForm.style.display = "block";
                        })
                        .catch((error) => {
                            alert("❌ Error sending verification email: " + error.message);
                        });
                })
                .catch((error) => {
                    alert("❌ Signup failed: " + error.message);
                });
        });
    }

    // 🔹 PASSWORD RESET
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener("click", function () {
            const email = loginEmail.value.trim();
            if (!email) {
                alert("⚠️ Enter your email before resetting password.");
                return;
            }

            auth.sendPasswordResetEmail(email)
                .then(() => {
                    alert("📩 Password reset email sent. Check your inbox.");
                })
                .catch((error) => {
                    alert("❌ Error resetting password: " + error.message);
                });
        });
    }

    // 🔹 LOGOUT USER
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
            auth.signOut().then(() => {
                console.log("✅ User logged out.");
                userStatus.innerText = "Not logged in";
                logoutBtn.style.display = "none";
                loginForm.style.display = "block";
            });
        });
    }

    // 🔹 AUTH STATE LISTENER
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

});
