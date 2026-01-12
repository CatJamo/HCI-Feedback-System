const loginForm = document.getElementById("loginForm");

async function handleLogin(event) {
  event.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  if (!username || !password) {
    alert("Bitte Nutzername und Passwort eingeben.");
    return;
  }

  await ensureDb();
  const res = await dbGetDoc(`user:${username}`);
  if (!res.ok) {
    alert("Benutzer nicht gefunden.");
    return;
  }
  if (res.data.password !== password) {
    alert("Falscher Benutzername oder Passwort.");
    return;
  }

  setStoredJson("hci_user", { id: res.data._id, username: res.data.username });
  window.location.href = "mycourse.html";
}

loginForm.addEventListener("submit", handleLogin);
