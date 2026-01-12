const registerForm = document.getElementById("registerForm");

async function handleRegister(event) {
  event.preventDefault();
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!username || !email || !password) {
    alert("Bitte alle Felder ausfüllen.");
    return;
  }

  await ensureDb();
  const existing = await dbGetDoc(`user:${username}`);
  if (existing.ok) {
    alert("Der Nutzername ist bereits vergeben.");
    return;
  }

  const newUser = {
    _id: `user:${username}`,
    type: "user",
    username,
    email,
    password,
    createdAt: new Date().toISOString()
  };
  const created = await dbPutDoc(newUser);
  if (!created.ok) {
    alert("Registrierung fehlgeschlagen.");
    return;
  }

  alert("Registrierung erfolgreich. Bitte einloggen.");
  window.location.href = "login.html";
}

registerForm.addEventListener("submit", handleRegister);
