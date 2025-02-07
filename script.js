document.addEventListener("DOMContentLoaded", function () {
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

    const showSignup = document.getElementById("show-signup");
    const showLogin = document.getElementById("show-login");

    const userStatus = document.getElementById("user-status");

    const cardDropdown = document.getElementById("card");
    const expenseDropdown = document.getElementById("expense");
    const recommendationText = document.getElementById("recommendation");
    const getRecommendationBtn = document.getElementById("get-recommendation");

    const db = firebase.firestore();
    const auth = firebase.auth();

    // 🔹 Show Signup Form & Hide Login
    showSignup.addEventListener("click", function () {
        loginForm.style.display = "none";
        signupForm.style.display = "block";
        loginTitle.innerText = "Sign Up";
    });

    // 🔹 Show Login Form & Hide Signup
    showLogin.addEventListener("click", function () {
        signupForm.style.display = "none";
        loginForm.style.display = "block";
        loginTitle.innerText = "Login";
    });

    // 🔹 Login User
    loginBtn.addEventListener("click", function () {
        const email = loginEmail.value.trim();
        const password = loginPassword.value.trim();

        if (!email || !password) {
            alert("Please enter both email and password.");
            return;
        }

        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                userStatus.innerText = `Logged in as ${userCredential.user.email}`;
                logoutBtn.style.display = "block";
                loginForm.style.display = "none";
                signupForm.style.display = "none";
            })
            .catch((error) => {
                alert("Login failed: " + error.message);
            });
    });

    // 🔹 Sign Up New User (with Password Matching)
    signupBtn.addEventListener("click", function () {
        const email = signupEmail.value.trim();
        const password = signupPassword.value.trim();
        const confirmPassword = signupPasswordConfirm.value.trim();

        if (!email || !password || !confirmPassword) {
            alert("Please fill out all fields.");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                userStatus.innerText = `Account created: ${userCredential.user.email}`;
                logoutBtn.style.display = "block";
                signupForm.style.display = "none";
            })
            .catch((error) => {
                alert("Signup failed: " + error.message);
            });
    });

    // 🔹 Logout User
    logoutBtn.addEventListener("click", function () {
        auth.signOut().then(() => {
            userStatus.innerText = "Not logged in";
            logoutBtn.style.display = "none";
            loginForm.style.display = "block";
        });
    });

    // 🔹 Keep Users Logged In
    auth.onAuthStateChanged((user) => {
        if (user) {
            userStatus.innerText = `Logged in as ${user.email}`;
            logoutBtn.style.display = "block";
            loginForm.style.display = "none";
            signupForm.style.display = "none";

            // Enable recommendations only for logged-in users
            getRecommendationBtn.addEventListener("click", function () {
                const selectedCard = cardDropdown.value;
                const selectedExpense = expenseDropdown.value;
                let recommendation = "";

                const benefits = {
                    "amex_blue_cash": { groceries: "6%", gas: "1%", travel: "1%", subscriptions: "3%" },
                    "chase_freedom": { groceries: "3%", gas: "5%", travel: "5%", subscriptions: "1.5%" },
                    "bofa_cash": { groceries: "3%", gas: "3%", travel: "2%", subscriptions: "3%" }
                };

                recommendation = `Use your ${selectedCard.replace("_", " ")} for ${selectedExpense} because it has the highest rewards rate of ${benefits[selectedCard][selectedExpense]}.`;

                recommendationText.innerText = recommendation;

                // Store user selections in Firebase under their unique user ID
                db.collection("users").doc(user.uid).set({
                    selectedCard: selectedCard,
                    selectedExpense: selectedExpense,
                    lastRecommendation: recommendation
                }, { merge: true });
            });
        } else {
            userStatus.innerText = "Not logged in";
            logoutBtn.style.display = "none";
            loginForm.style.display = "block";
        }
    });
});
