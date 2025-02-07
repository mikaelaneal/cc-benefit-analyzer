document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded and parsed"); // Debugging log

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

    const db = firebase.firestore();
    const auth = firebase.auth();

    // ---- CARD BENEFITS DATABASE ----
    const benefits = {
        "amex_blue_cash": { name: "Amex Blue Cash Preferred", groceries: "6%", gas: "1%", travel: "1%", subscriptions: "3%" },
        "chase_freedom": { name: "Chase Freedom Flex", groceries: "3%", gas: "5%", travel: "5%", subscriptions: "1.5%" },
        "bofa_cash": { name: "Bank of America Customized Cash", groceries: "3%", gas: "3%", travel: "2%", subscriptions: "3%" }
    };

    let addedCards = [];

    // 🔹 ADD SELECTED CARD TO TABLE
    addCardBtn.addEventListener("click", function () {
        const selectedCard = cardDropdown.value;

        // Prevent duplicate cards
        if (addedCards.includes(selectedCard)) {
            alert("This card has already been added!");
            return;
        }

        addedCards.push(selectedCard);
        const cardData = benefits[selectedCard];

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${cardData.name}</td>
            <td>${cardData.groceries}</td>
            <td>${cardData.gas}</td>
            <td>${cardData.travel}</td>
            <td>${cardData.subscriptions}</td>
        `;
        cardsTableBody.appendChild(row);
    });

    // 🔹 FIND BEST CARD FOR SELECTED EXPENSE
    findBestCardBtn.addEventListener("click", function () {
        if (addedCards.length === 0) {
            alert("Please add at least one credit card.");
            return;
        }

        const selectedExpense = expenseDropdown.value;
        let bestCard = null;
        let highestReward = 0;

        // Compare all added cards to find the best one for the selected expense
        addedCards.forEach((cardKey) => {
            const rewardPercentage = parseFloat(benefits[cardKey][selectedExpense]);

            if (rewardPercentage > highestReward) {
                highestReward = rewardPercentage;
                bestCard = benefits[cardKey].name;
            }
        });

        // Display recommendation
        if (bestCard) {
            recommendationText.innerText = `Use your ${bestCard} for ${selectedExpense} because it has the highest rewards rate of ${highestReward}%.`;
        } else {
            recommendationText.innerText = "No recommendation available.";
        }
    });

    // ---- LOGIN / SIGNUP FUNCTIONALITY ----

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

    // 🔹 LOGIN USER (ONLY IF VERIFIED)
    loginBtn.addEventListener("click", function () {
        const email = loginEmail.value.trim();
        const password = loginPassword.value.trim();

        if (!email || !password) {
            alert("Please enter both email and password.");
            return;
        }

        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;

                if (user.emailVerified) {
                    userStatus.innerText = `Logged in as ${user.email}`;
                    logoutBtn.style.display = "block";
                    loginForm.style.display = "none";
                    signupForm.style.display = "none";
                } else {
                    auth.signOut();
                    alert("Your email is not verified. Please check your inbox and verify before logging in.");
                }
            })
            .catch((error) => {
                alert("Login failed: " + error.message);
            });
    });

    // 🔹 SIGN UP USER (WITH EMAIL VERIFICATION)
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
                const user = userCredential.user;

                // Send email verification
                user.sendEmailVerification()
                    .then(() => {
                        alert("A verification email has been sent to your email address. Please verify before logging in.");
                        signupForm.style.display = "none";
                        loginForm.style.display = "block";
                    })
                    .catch((error) => {
                        alert("Error sending verification email: " + error.message);
                    });
            })
            .catch((error) => {
                alert("Signup failed: " + error.message);
            });
    });

    // 🔹 RESEND VERIFICATION EMAIL
    resendEmailBtn.addEventListener("click", function () {
        const user = auth.currentUser;

        if (user && !user.emailVerified) {
            user.sendEmailVerification()
                .then(() => {
                    alert("A new verification email has been sent. Please check your inbox.");
                })
                .catch((error) => {
                    alert("Error resending verification email: " + error.message);
                });
        } else {
            alert("You must be logged in to resend the verification email.");
        }
    });

    // 🔹 LOGOUT USER
    logoutBtn.addEventListener("click", function () {
        auth.signOut().then(() => {
            userStatus.innerText = "Not logged in";
            logoutBtn.style.display = "none";
            loginForm.style.display = "block";
        });
    });

    // 🔹 KEEP USERS LOGGED IN
    auth.onAuthStateChanged((user) => {
        if (user) {
            userStatus.innerText = `Logged in as ${user.email}`;
            logoutBtn.style.display = "block";
            loginForm.style.display = "none";
            signupForm.style.display = "none";
        } else {
            userStatus.innerText = "Not logged in";
            logoutBtn.style.display = "none";
            loginForm.style.display = "block";
        }
    });
});
