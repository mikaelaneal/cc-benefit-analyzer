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
            console.error("Error loading user data:", error);
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
                    <button class="archive-card" data-card="${cardKey}">Archive</button>
                </td>
            `;
            cardsTableBody.appendChild(row);

            row.querySelector(".remove-card").addEventListener("click", function () {
                removeCard(cardKey);
            });

            row.querySelector(".archive-card").addEventListener("click", function () {
                archiveCard(cardKey);
            });
        });
    }

    // 🔹 ADD SELECTED CARD TO USER'S ACCOUNT
    addCardBtn.addEventListener("click", function () {
        const selectedCard = cardDropdown.value;
        if (!auth.currentUser) {
            alert("Please log in to save your cards.");
            return;
        }

        if (addedCards.includes(selectedCard)) {
            alert("This card is already added!");
            return;
        }

        addedCards.push(selectedCard);
        updateTable();

        // Save to Firebase
        db.collection("users").doc(auth.currentUser.uid).set({ savedCards: addedCards }, { merge: true });
    });

    // 🔹 REMOVE CARD FROM USER'S ACCOUNT & FIREBASE
    function removeCard(cardKey) {
        addedCards = addedCards.filter(card => card !== cardKey);
        updateTable();

        if (auth.currentUser) {
            db.collection("users").doc(auth.currentUser.uid).update({ savedCards: addedCards });
        }
    }

    // 🔹 ARCHIVE CARD (Save It Separately)
    function archiveCard(cardKey) {
        if (auth.currentUser) {
            db.collection("users").doc(auth.currentUser.uid).update({
                archivedCards: firebase.firestore.FieldValue.arrayUnion(cardKey)
            });
        }
        removeCard(cardKey);
    }

    // 🔹 FIND BEST CARD FOR SELECTED EXPENSE
    findBestCardBtn.addEventListener("click", function () {
        if (addedCards.length === 0) {
            alert("Please add at least one credit card.");
            return;
        }

        const selectedExpense = expenseDropdown.value;
        let bestCard = null;
        let highestReward = 0;

        addedCards.forEach((cardKey) => {
            const rewardPercentage = parseFloat(benefits[cardKey][selectedExpense]);

            if (rewardPercentage > highestReward) {
                highestReward = rewardPercentage;
                bestCard = benefits[cardKey].name;
            }
        });

        recommendationText.innerText = bestCard 
            ? `Use your ${bestCard} for ${selectedExpense} because it has the highest rewards rate of ${highestReward}%.`
            : "No recommendation available.";
    });

    // 🔹 HANDLE LOGIN & LOGOUT
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
    forgotPasswordLink.addEventListener("click", function () {
        const email = loginEmail.value.trim();
        if (!email) {
            alert("Please enter your email before clicking 'Reset Password'.");
            return;
        }

        auth.sendPasswordResetEmail(email)
            .then(() => {
                alert("A password reset email has been sent. Please check your inbox.");
            })
            .catch((error) => {
                alert("Error resetting password: " + error.message);
            });
    });

    // 🔹 LOGOUT USER
    logoutBtn.addEventListener("click", function () {
        auth.signOut().then(() => {
            userStatus.innerText = "Not logged in";
            logoutBtn.style.display = "none";
            loginForm.style.display = "block";
        });
    });
});
