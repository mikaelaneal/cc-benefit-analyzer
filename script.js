document.getElementById("get-recommendation").addEventListener("click", function() {
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
    db.collection("users").doc("exampleUser").set({
        selectedCard: card,
        selectedExpense: expense,
        lastRecommendation: recommendation
    }, { merge: true });
});
