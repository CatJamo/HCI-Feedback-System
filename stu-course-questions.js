const questionList = document.getElementById("questionList");
const courseTitle = document.getElementById("courseTitle");

const courseId = readQueryParam("courseId") || getStoredJson("hci_course")?.id;
if (!courseId) {
  courseTitle.textContent = "Kurs nicht gefunden";
}

function renderSubmitCard() {
  const card = document.createElement("div");
  card.className = "q-card";
  card.dataset.type = "submit";
  card.style.justifyContent = "center";
  card.innerHTML = `<button class="btn primary" id="submitAnswersBtn" type="button">Frage absenden</button>`;
  questionList.appendChild(card);
}

function renderScaleQuestion(question) {
  const card = document.createElement("div");
  card.className = "q-card";
  card.dataset.type = "scale";
  card.dataset.id = question._id;
  card.innerHTML = `
    <div class="q-text">${question.text}</div>
    <div class="q-scale">
      <label><input type="radio" name="q_${question._id}" value="1"> 1</label>
      <label><input type="radio" name="q_${question._id}" value="2"> 2</label>
      <label><input type="radio" name="q_${question._id}" value="3"> 3</label>
      <label><input type="radio" name="q_${question._id}" value="4"> 4</label>
      <label><input type="radio" name="q_${question._id}" value="5"> 5</label>
    </div>
  `;
  questionList.appendChild(card);
}

function renderTextQuestion(question) {
  const card = document.createElement("div");
  card.className = "q-card";
  card.dataset.type = "text";
  card.dataset.id = question._id;
  card.innerHTML = `
    <div class="q-text">${question.text}</div>
    <textarea class="q-textarea" placeholder="Deine Antwort?"></textarea>
  `;
  questionList.appendChild(card);
}

async function submitAnswers() {
  const cards = Array.from(questionList.querySelectorAll(".q-card"));
  const submissions = [];

  cards.forEach((card) => {
    const type = card.dataset.type;
    const questionId = card.dataset.id;
    if (!questionId) return;
    if (type === "scale") {
      const selected = card.querySelector("input[type='radio']:checked");
      if (selected) {
        submissions.push({
          type: "course_answer",
          courseId,
          questionId,
          format: "scale",
          value: Number(selected.value),
          createdAt: new Date().toISOString()
        });
      }
    } else if (type === "text") {
      const text = card.querySelector("textarea")?.value.trim();
      if (text) {
        submissions.push({
          type: "course_answer",
          courseId,
          questionId,
          format: "text",
          value: text,
          createdAt: new Date().toISOString()
        });
      }
    }
  });

  if (!submissions.length) {
    alert("Bitte mindestens eine Antwort eingeben.");
    return;
  }

  for (const submission of submissions) {
    await dbPutDoc(submission);
  }

  alert("Antworten gespeichert.");
}

async function loadQuestions() {
  await ensureDb();
  if (!courseId) return;
  const courseRes = await dbGetDoc(courseId);
  if (courseRes.ok) {
    courseTitle.textContent = `${courseRes.data.name} ${courseRes.data.semester || ""}`.trim();
    setStoredJson("hci_course", {
      id: courseRes.data._id,
      name: courseRes.data.name,
      semester: courseRes.data.semester
    });
  }

  const res = await dbFind({ type: "course_question", courseId });
  questionList.innerHTML = "";
  renderSubmitCard();
  if (res.ok && Array.isArray(res.data.docs)) {
    res.data.docs.forEach((question) => {
      if (question.format === "scale") {
        renderScaleQuestion(question);
      } else {
        renderTextQuestion(question);
      }
    });
  }

  const submitBtn = document.getElementById("submitAnswersBtn");
  submitBtn.addEventListener("click", submitAnswers);
}

loadQuestions();
