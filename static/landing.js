async function login(event) {
  event.preventDefault();
  const error = document.querySelector("#landingLoginError");
  const username = document.querySelector("#landingUser").value.trim();
  const password = document.querySelector("#landingPassword").value.trim();
  const accepted = document.querySelector("#landingDisclaimer").checked;
  if (!accepted) {
    error.textContent = "Accetta il disclaimer per continuare.";
    return;
  }
  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login non valido");
    localStorage.setItem("worldcupEdgeLoggedIn", "1");
    localStorage.setItem("worldcupEdgeDisclaimer", "1");
    window.location.href = "/";
  } catch (err) {
    error.textContent = err.message;
  }
}

document.querySelector("#landingLogin").addEventListener("submit", login);

function saveWaitlist(event) {
  event.preventDefault();
  const message = document.querySelector("#waitlistMessage");
  const name = document.querySelector("#waitlistName").value.trim();
  const contact = document.querySelector("#waitlistContact").value.trim();
  const useCase = document.querySelector("#waitlistUse").value;
  if (!name || !contact) {
    message.textContent = "Inserisci nome e contatto.";
    return;
  }
  const rows = JSON.parse(localStorage.getItem("worldcupEdgeWaitlist") || "[]");
  rows.push({
    name,
    contact,
    use_case: useCase,
    created_at: new Date().toISOString(),
  });
  localStorage.setItem("worldcupEdgeWaitlist", JSON.stringify(rows));
  message.textContent = `Interesse salvato localmente (${rows.length} lead).`;
  event.target.reset();
}

document.querySelector("#waitlistForm").addEventListener("submit", saveWaitlist);
