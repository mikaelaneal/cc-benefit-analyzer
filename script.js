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

    if (!firebase.apps.length) {
        console.error("🔥 Firebase is not initialized!");
        return;
    }

    const db = firebase.firestore();
    const auth = firebase.auth();

    // ---- CARD BENEFITS DATABASE ----
    const benefits = {
        "amex_blue_cash": { name: "Amex Blue Cash Preferred", groceries: "6%", gas: "1%", travel: "1%", subscriptions: "3%" },
        "chase_freedom": { name: "Chase Freedom Flex", groceries: "3%", gas: "5%", travel: "5%", subscriptions: "1.5%" },
        "bofa_cash": { name: "Bank of America Customized Cash", groceries: "3%", gas: "3%", travel: "2%", subscriptions: "3%" }
    };

    let addedCards = [];

    // 🔹 LOAD USER'S SAVED CARDS FROM FIREBASE
    function loadUserCards(user) {
        db.collection("users").doc(user.uid).get().then((doc) => {
            if (doc.exists) {
                addedCards = doc.data().savedCards || [];
                updateTable();
            }
        }).catch((error) => {
            console.error("❌ Error loading user data:", error);
        });
    }

    // 🔹 UPDATE TABLE WITH ADDED CARDS
    function updateTable() {
        cardsTableBody.innerHTML = ""; // Clear table before adding rows

        addedCards.forEach(cardKey => {
            const cardData = benefits[cardKey];
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${cardData.name}</td>
                <td>${cardData.groceries}</td>
                <td>${cardData.gas}</td>
                <td>${cardData.travel}</td>
                <td>${cardData.subscriptions}</td>
                <td>
                    <button class="remove-card" data-card="${cardKey}">Remove</button>
                </td>
            `;
            cardsTableBody.appendChild(row);

            row.querySelector(".remove-card").addEventListener("click", function () {
                removeCard(cardKey);
            });
        });
    }

    // 🔹 ADD SELECTED CARD TO USER'S ACCOUNT
    if (addCardBtn) {
        addCardBtn.addEventListener("click", function () {
            if (!auth.currentUser) {
                alert("Please log in to save your cards.");
                return;
            }

            const selectedCard = cardDropdown.value;
            if (addedCards.includes(selectedCard)) {
                alert("This card is already added!");
                return;
            }

            addedCards.push(selectedCard);
            updateTable();

            // Save to Firebase
            db.collection("users").doc(auth.currentUser.uid).set({ savedCards: addedCards }, { merge: true });
        });
    }

    // 🔹 REMOVE CARD FROM USER'S ACCOUNT & FIREBASE
    function removeCard(cardKey) {
        addedCards = addedCards.filter(card => card !== cardKey);
        updateTable();

        if (auth.currentUser) {
            db.collection("users").doc(auth.currentUser.uid).set({ savedCards: addedCards }, { merge: true });
        }
    }

    // 🔹 LOGIN USER
    if (loginBtn) {
        loginBtn.addEventListener("click", function () {
            const email = loginEmail.value.trim();
            const password = loginPassword.value.trim();

            if (!email || !password) {
                alert("⚠️ Please enter both email and password.");
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
                        loadUserCards(user);
                    } else {
                        alert("⚠️ Your email is not verified. Please verify before logging in.");
                        auth.signOut();
                    }
                })
                .catch((error) => {
                    alert("❌ Login failed: " + error.message);
                });
        });
    }

    // 🔹 LOGOUT USER
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
            auth.signOut().then(() => {
                userStatus.innerText = "Not logged in";
                logoutBtn.style.display = "none";
                loginForm.style.display = "block";
                addedCards = [];
                updateTable();
            });
        });
    }

    // 🔹 AUTH STATE LISTENER
    auth.onAuthStateChanged((user) => {
        if (user) {
            userStatus.innerText = `Logged in as ${user.email}`;
            logoutBtn.style.display = "block";
            loginForm.style.display = "none";
            signupForm.style.display = "none";
            loadUserCards(user);
        } else {
            userStatus.innerText = "Not logged in";
            logoutBtn.style.display = "none";
            loginForm.style.display = "block";
            addedCards = [];
            updateTable();
        }
    });

    // 🔹 RESET PASSWORD FUNCTIONALITY
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
});
