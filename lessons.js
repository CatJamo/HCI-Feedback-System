const qrOpenBtn = document.getElementById("qrOpenBtn");
const qrCloseBtn = document.getElementById("qrCloseBtn");
const qrDialog = document.getElementById("qrDialog");
const statleft = document.getElementById("statLeft");
const statright = document.getElementById("statRight");
const reset = document.getElementById("reset");
const questionList = document.getElementById("questionList");
const feedbackList = document.getElementById("feedbackList");


qrOpenBtn.addEventListener("click", () => {
    qrDialog.showModal();
});
qrCloseBtn.addEventListener("click", () => {
    qrDialog.close();
});

reset.addEventListener("click", () => {
    statleft.textContent = "0";
    statright.textContent = "0";
});

questionList.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    const action = btn?.dataset?.action;
    const card = e.target.closest(".item");
    if (!action) return;
    if (action === "up") {
        const upSpan = e.target.closest(".vote").querySelector("span");
        const currentCount = parseInt(upSpan.textContent);
        upSpan.textContent = currentCount + 1;
    } else if (action === "down") {
        const downSpan = e.target.closest(".vote").querySelector("span");
        const currentCount = parseInt(downSpan.textContent);
        downSpan.textContent = currentCount + 1;
    }else if (action === "check") {
        const textDiv = card.querySelector(".text-card");
        textDiv.style.textDecoration = "line-through";
        btn.style.color = "green";
    }
});

feedbackList.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    const action = btn?.dataset?.action;
    const card = e.target.closest(".item");
    if (!action) return;
    if (action === "up") {
        const upSpan = e.target.closest(".vote").querySelector("span");
        const currentCount = parseInt(upSpan.textContent);
        upSpan.textContent = currentCount + 1;
    } else if (action === "down") {
        const downSpan = e.target.closest(".vote").querySelector("span");
        const currentCount = parseInt(downSpan.textContent);
        downSpan.textContent = currentCount + 1;
    }else if (action === "check") {
        const textDiv = card.querySelector(".text-card");
        textDiv.style.textDecoration = "line-through";
        btn.style.color = "green";
    }
});