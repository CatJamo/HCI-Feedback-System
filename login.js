const loginForm = document.getElementById("loginForm");
loginForm.addEventListener("submit", function(event) {
  event.preventDefault(); // Prevent form submission
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (username === "admin" && password === "password") {
        window.location.href = "mycourse.html";
    } else {
        alert("Falscher Benutzername oder Passwort.");
    }
});