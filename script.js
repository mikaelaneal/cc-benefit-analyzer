document.addEventListener("DOMContentLoaded", function () {
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const loginBtn = document.getElementById("login-btn");
    const signupBtn = document.getElementById("signup-btn");
    const logoutBtn = document.getElementById("logout-btn");
    const userStatus = document.getElementById("user-status");

    const db = firebase.firestore();
    const auth = firebase.auth();

    // 🔹 Login User
    loginBtn.addEventListener("click", function () {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
            alert("Please enter both email and password.");
            return;
        }

        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                userStatus.innerText = `Logged in as ${userCredential.user.email}`;
                logoutBtn.style.display = "block";
                loginBtn.style.display = "none";
                signupBtn.style.display = "none";
            })
            .catch((error) => {
                alert("Login failed: " + error.message);
            });
    });

    // 🔹 Sign Up New User
    signupBtn.addEventListener("click", function () {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
            alert("Please enter both email and password.");
            return;
        }

        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                userStatus.innerText = `Account created: ${userCredential.user.email}`;
                logoutBtn.style.display = "block";
                loginBtn.style.display = "none";
                signupBtn.style.display = "none";
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
            loginBtn.style.display = "block";
            signupBtn.style.display = "block";
        });
    });

    // 🔹 Check If User Is Logged In (Auto-detect login state)
    auth.onAuthStateChanged((user) => {
        if (user) {
            userStatus.innerText = `Logged in as ${user.email}`;
            logoutBtn.style.display = "block";
            loginBtn.style.display = "none";
            signupBtn.style.display = "none";

            // Update recommendation logic with user ID
            const userId = user.uid;
            document.getElementById("get-recommendation").addEventListener("click", function () {
                const card = document.getElementById("card").value;
                const expense = document.getElementById("expense").value;
                let recommendation = "";

                const benefits = {
                    "amex_blue_cash": { groceries: "6%", gas: "1%", travel: "1%", subscriptions: "3%" },
                    "chase_freedom": { groceries: "3%", gas: "5%", travel: "5%", subscriptions: "1.5%" },
                    "bofa_cash": { groceries: "3%", gas: "3%", travel: "2%", subscriptions: "3%" }
                };

                recommendation = `Use your ${card.replace("_", " ")} for ${expense} because it has the highest rewards rate of ${benefits[card][expense]}.`;

                document.getElementById("recommendation").innerText = recommendation;

                // Store user selections in Firebase
                db.collection("users").doc(userId).set({
                    selectedCard: card,
                    selectedExpense: expense,
                    lastRecommendation: recommendation
                }, { merge: true });
            });
        } else {
            userStatus.innerText = "Not logged in";
            logoutBtn.style.display = "none";
            loginBtn.style.display = "block";
            signupBtn.style.display = "block";
        }
    });
});
