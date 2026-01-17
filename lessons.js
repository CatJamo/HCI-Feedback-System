const qrOpenBtn = document.getElementById("qrOpenBtn");
const qrCloseBtn = document.getElementById("qrCloseBtn");
const qrDialog = document.getElementById("qrDialog");
const qrLessonLink = document.getElementById("qrLessonLink");
const qrLessonImage = document.getElementById("qrLessonImage");
const lessonTitle = document.getElementById("lessonTitle");
const courseTitle = document.getElementById("courseTitle");
const statLeft = document.getElementById("statLeft");
const statRight = document.getElementById("statRight");
const reset = document.getElementById("reset");
const questionList = document.getElementById("questionList");
const feedbackList = document.getElementById("feedbackList");

const course = getStoredJson("hci_course");
const lesson = getStoredJson("hci_lesson");
const user = getStoredJson("hci_user");
if (!user) {
  window.location.href = "login.html";
}
if (!course || !lesson) {
  window.location.href = "courses.html";
}

qrOpenBtn.addEventListener("click", () => {
  qrDialog.showModal();
});
qrCloseBtn.addEventListener("click", () => {
  qrDialog.close();
});

reset.addEventListener("click", async () => {
  statLeft.textContent = "0";
  statRight.textContent = "0";
  await updateDoc(`lesson_stats:${lesson.id}`, (doc) => {
    doc.up = 0;
    doc.down = 0;
    return doc;
  });
});

function renderEntry(entry, container) {
  const item = document.createElement("div");
  item.className = "item";
  item.dataset.id = entry._id;
  item.innerHTML = `
    <div class="text-card">${entry.text}</div>
    <button class="check-btn" type="button" aria-label="Eintrag erledigt" data-action="check">✓</button>
    <div class="votes">
      <div class="vote">
        <button type="button" data-action="up">▲</button>
        <span>${entry.up || 0}</span>
      </div>
      <div class="vote">
        <button type="button" data-action="down">▼</button>
        <span>${entry.down || 0}</span>
      </div>
    </div>
  `;
  if (entry.checked) {
    item.querySelector(".text-card").style.textDecoration = "line-through";
    item.querySelector(".check-btn").style.color = "green";
  }
  container.appendChild(item);
}

function resetList(container, titleText) {
  const title = document.createElement("h2");
  title.textContent = titleText;
  container.innerHTML = "";
  container.appendChild(title);
}

async function refreshStats() {
  const statsId = `lesson_stats:${lesson.id}`;
  const statsRes = await dbGetDoc(statsId);
  if (statsRes.ok) {
    statLeft.textContent = statsRes.data.up || 0;
    statRight.textContent = statsRes.data.down || 0;
  }
}

function renderEntries(entries) {
  resetList(questionList, "Fragen");
  resetList(feedbackList, "Feedback");
  entries.forEach((entry) => {
    if (entry.kind === "feedback") {
      renderEntry(entry, feedbackList);
    } else {
      renderEntry(entry, questionList);
    }
  });
}

async function refreshEntries() {
  const res = await dbFind({ type: "lesson_entry", lessonId: lesson.id });
  if (res.ok && Array.isArray(res.data.docs)) {
    const sorted = res.data.docs.slice().sort((a, b) => {
      const aTime = a.createdAt ? Date.parse(a.createdAt) : 0;
      const bTime = b.createdAt ? Date.parse(b.createdAt) : 0;
      return aTime - bTime;
    });
    renderEntries(sorted);
  }
}

async function loadLessonData() {
  await ensureDb();
  lessonTitle.textContent = lesson.name;
  courseTitle.textContent = course.name;
  qrLessonLink.href = `stu-lessons.html?courseId=${encodeURIComponent(course.id)}&lessonId=${encodeURIComponent(lesson.id)}`;
  qrLessonLink.textContent = qrLessonLink.href;
  qrLessonImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrLessonLink.href)}`;

  const statsId = `lesson_stats:${lesson.id}`;
  const statsRes = await dbGetDoc(statsId);
  if (statsRes.ok) {
    statLeft.textContent = statsRes.data.up || 0;
    statRight.textContent = statsRes.data.down || 0;
  } else {
    await dbPutDoc({
      _id: statsId,
      type: "lesson_stats",
      lessonId: lesson.id,
      courseId: course.id,
      up: 0,
      down: 0
    });
    statLeft.textContent = "0";
    statRight.textContent = "0";
  }

  await refreshEntries();
  setInterval(refreshStats, 1500);
  setInterval(refreshEntries, 4000);
}

async function handleEntryAction(event, container) {
  const btn = event.target.closest("button");
  const action = btn?.dataset?.action;
  const card = event.target.closest(".item");
  if (!action || !card) return;
  const docId = card.dataset.id;
  if (action === "check") {
    const textDiv = card.querySelector(".text-card");
    textDiv.style.textDecoration = "line-through";
    btn.style.color = "green";
    await updateDoc(docId, (doc) => {
      doc.checked = true;
      return doc;
    });
  } else if (action === "up" || action === "down") {
    const countSpan = btn.nextElementSibling;
    const currentCount = parseInt(countSpan.textContent, 10) || 0;
    countSpan.textContent = currentCount + 1;
    await updateDoc(docId, (doc) => {
      doc[action] = (doc[action] || 0) + 1;
      return doc;
    });
  }
}

questionList.addEventListener("click", (e) => handleEntryAction(e, questionList));
feedbackList.addEventListener("click", (e) => handleEntryAction(e, feedbackList));

loadLessonData();
