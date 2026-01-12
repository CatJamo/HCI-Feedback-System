const questionList = document.getElementById("questionList");
const addBtn = document.getElementById("addBtn");
const dialog = document.getElementById("dialog");
const addForm = document.getElementById("addForm");
const cancelBtn = document.getElementById("cancelBtn");
const courseTitle = document.getElementById("courseTitle");

const course = getStoredJson("hci_course");
const user = getStoredJson("hci_user");
if (!user) {
  window.location.href = "login.html";
}
if (!course) {
  window.location.href = "mycourse.html";
}

cancelBtn.addEventListener("click", () => {
  dialog.close();
  addForm.reset();
});

function addQuestionCard(question) {
  const questionCard = document.createElement("div");
  questionCard.className = "q-card";
  questionCard.dataset.id = question._id;
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

addForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = document.getElementById("qText").value.trim();
  const type = addForm.querySelector("input[name='type']:checked")?.value || "text";
  if (!text) return;

  const newQuestion = {
    type: "course_question",
    courseId: course.id,
    text,
    format: type,
    createdAt: new Date().toISOString()
  };
  const created = await dbPutDoc(newQuestion);
  if (!created.ok) {
    alert("Frage konnte nicht gespeichert werden.");
    return;
  }
  addQuestionCard({ ...newQuestion, _id: created.data.id });
  dialog.close();
  addForm.reset();
});

questionList.addEventListener("click", async (e) => {
  const btn = e.target.closest("button");
  const action = btn?.dataset?.action;
  if (!action) return;
  const card = e.target.closest(".q-card");
  if (!card) return;
  if (action === "delete") {
    const docId = card.dataset.id;
    const current = await dbGetDoc(docId);
    if (current.ok) {
      await dbDeleteDoc(current.data);
    }
    card.remove();
    updateEmptyState();
  }
  if (action === "evaluate") {
    window.location.href = `stu-course-questions.html?courseId=${encodeURIComponent(course.id)}`;
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

async function loadQuestions() {
  await ensureDb();
  courseTitle.textContent = `${course.name} ${course.semester}`;
  const res = await dbFind({ type: "course_question", courseId: course.id });
  questionList.innerHTML = "";
  if (res.ok && Array.isArray(res.data.docs)) {
    res.data.docs.forEach((question) => addQuestionCard(question));
  }
  updateEmptyState();
}

loadQuestions();
