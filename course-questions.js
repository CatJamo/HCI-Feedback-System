const questionList = document.getElementById("questionList");
const addBtn = document.getElementById("addBtn");
const dialog = document.getElementById("dialog");
const addForm = document.getElementById("addForm");
const cancelBtn = document.getElementById("cancelBtn");

cancelBtn.addEventListener("click", () => {
    dialog.close();
    addForm.reset();
});

function addQuestionCard(question) {
    const questionCard = document.createElement("div");
    questionCard.className = "q-card";
    questionCard.innerHTML = `
        <div class="q-text">${question.text}</div>
        <div class="q-actions">
            <button class="btn" type="button" data-action="evaluate">Auswerten</button>
            <button class="btn secondary" type="button" data-action="delete">Löschen</button>
        </div>
        `;
    questionList.appendChild(questionCard);
    updateEmptyState();
}

addForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = document.getElementById("qText").value.trim();
    if (!text) return;
    addQuestionCard({ text });
    dialog.close();
    addForm.reset();
});

questionList.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    const action = btn?.dataset?.action;
    if (!action) return;
    const card = e.target.closest(".q-card");
    if (action === "delete" && card) {
        card.remove();
        updateEmptyState();
    }
    if (action === "evaluate") {
        
    }
});

function updateEmptyState() {
    const empty = document.getElementById("emptyState");
    if (!empty) return;
    empty.style.display = questionList.querySelectorAll(".q-card").length ? "none" : "block";
}

function newQuestion() {
    dialog.showModal();
}

addBtn.addEventListener("click", newQuestion);

