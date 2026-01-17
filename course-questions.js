const questionList = document.getElementById("questionList");
const addBtn = document.getElementById("addBtn");
const dialog = document.getElementById("dialog");
const addForm = document.getElementById("addForm");
const cancelBtn = document.getElementById("cancelBtn");
const courseTitle = document.getElementById("courseTitle");
const evaluateDialog = document.getElementById("evaluateDialog");
const evaluateCloseBtn = document.getElementById("evaluateCloseBtn");
const answerList = document.getElementById("answerList");

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

evaluateCloseBtn.addEventListener("click", () => {
  evaluateDialog.close();
});

let questions = [];

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
    await openEvaluation(card.dataset.id);
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

function renderAnswers(questionId, answers) {
  answerList.innerHTML = "";
  const question = questions.find((item) => item._id === questionId);
  const title = document.createElement("h3");
  title.textContent = question ? question.text : "Auswertung";
  answerList.appendChild(title);

  const filtered = answers.filter((answer) => answer.questionId === questionId);
  if (!filtered.length) {
    const empty = document.createElement("p");
    empty.textContent = "Noch keine Abgaben.";
    answerList.appendChild(empty);
    return;
  }

  if (question?.format === "scale") {
    const meta = document.createElement("div");
    meta.className = "bar-meta";
    meta.textContent = `Abgaben: ${filtered.length}`;
    answerList.appendChild(meta);
    answerList.appendChild(renderScaleChart(filtered));
    return;
  }

  filtered.forEach((answer) => {
    const entry = document.createElement("div");
    entry.className = "q-card";
    entry.innerHTML = `
      <div class="q-text">${answer.value}</div>
    `;
    answerList.appendChild(entry);
  });
}

function renderScaleChart(answers) {
  const counts = [0, 0, 0, 0, 0];
  answers.forEach((answer) => {
    const value = Number(answer.value);
    if (value >= 1 && value <= 5) {
      counts[value - 1] += 1;
    }
  });
  const maxCount = Math.max(1, ...counts);

  const chart = document.createElement("div");
  chart.className = "bar-chart";
  counts.forEach((count, index) => {
    const row = document.createElement("div");
    row.className = "bar-row";
    const width = (count / maxCount) * 100;
    row.innerHTML = `
      <div class="bar-label">${index + 1}</div>
      <div class="bar-track">
        <div class="bar-fill" style="width: ${width}%"></div>
      </div>
      <div class="bar-value">${count}</div>
    `;
    chart.appendChild(row);
  });
  return chart;
}

async function openEvaluation(questionId) {
  await ensureDb();
  const res = await dbFind({
    type: "course_answer",
    courseId: course.id,
    questionId
  });
  const answers = res.ok && Array.isArray(res.data.docs) ? res.data.docs : [];
  renderAnswers(questionId, answers);
  evaluateDialog.showModal();
}

async function loadQuestions() {
  await ensureDb();
  courseTitle.textContent = `${course.name} ${course.semester}`;
  const res = await dbFind({ type: "course_question", courseId: course.id });
  questionList.innerHTML = "";
  if (res.ok && Array.isArray(res.data.docs)) {
    questions = res.data.docs;
    questions.forEach((question) => addQuestionCard(question));
  }
  updateEmptyState();
}

loadQuestions();
