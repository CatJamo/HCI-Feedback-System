const qrOpenBtn = document.getElementById("qrOpenBtn");
const qrCloseBtn = document.getElementById("qrCloseBtn");
const qrDialog = document.getElementById("qrDialog");
const statleft = document.getElementById("statLeft");
const statright = document.getElementById("statRight");
const resetSelect = document.getElementById("resetSelect");
qrOpenBtn.addEventListener("click", () => {
    qrDialog.showModal();
});
qrCloseBtn.addEventListener("click", () => {
    qrDialog.close();
});

function timerFunction(timer) {
    if (isNaN(timer) || timer < 0) return;
    setTimeout(() => {
        statleft.innerHTML = "0";
        statright.innerHTML = "0";
    }, timer);
}

resetSelect.addEventListener("change", () => {
    const value = resetSelect.value;
    if (value === "never") return;
    statleft.innerHTML = value;
    timerFunction(value * 1000);
});




