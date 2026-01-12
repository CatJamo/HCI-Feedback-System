const entryList = document.getElementById("entryList");
const emptyState = document.getElementById("emptyState");
const newFeedbackBtn = document.getElementById("sendFeedbackBtn");
const newQuestionBtn = document.getElementById("sendQuestionBtn");
const statLeft = document.getElementById("statLeft");
const statRight = document.getElementById("statRight");
const statLeftButton = document.getElementById("statLeftButton");
const statRightButton = document.getElementById("statRightButton");
const lessonTitle = document.getElementById("lessonTitle");
const courseTitle = document.getElementById("courseTitle");
const backBtn = document.getElementById("backBtn");

const courseId = readQueryParam("courseId") || getStoredJson("hci_course")?.id;
const lessonId = readQueryParam("lessonId") || getStoredJson("hci_lesson")?.id;

if (!courseId || !lessonId) {
  lessonTitle.textContent = "Vorlesung nicht gefunden";
}

function updateEmptyState() {
  emptyState.style.display = entryList.querySelectorAll(".entry").length ? "none" : "block";
}

function renderEntry(entry) {
  const entryEl = document.createElement("div");
  entryEl.className = "entry";
  entryEl.dataset.id = entry._id;
  entryEl.dataset.kind = entry.kind;
  entryEl.innerHTML = `
    <div class="entry-text">${entry.text}</div>
    <div class="vote-row">
      <div class="vote">
        <button type="button" data-action="up">▲</button>
        <span class="up-count">${entry.up || 0}</span>
      </div>
      <div class="vote">
        <button type="button" data-action="down">▼</button>
        <span class="down-count">${entry.down || 0}</span>
      </div>
      <span style="color:var(--highlight);font-weight:900;font-size:12px;">
        ${entry.kind === "feedback" ? "Feedback" : "Frage"}
      </span>
    </div>
  `;
  entryList.appendChild(entryEl);
  updateEmptyState();
}

async function createEntry(kind, text) {
  const entry = {
    type: "lesson_entry",
    courseId,
    lessonId,
    kind,
    text,
    up: 0,
    down: 0,
    checked: false,
    createdAt: new Date().toISOString()
  };
  const created = await dbPutDoc(entry);
  if (created.ok) {
    renderEntry({ ...entry, _id: created.data.id });
  }
}

newQuestionBtn.addEventListener("click", async () => {
  const questionInput = document.getElementById("questionInput");
  const text = questionInput.value.trim();
  if (text) {
    await createEntry("question", text);
    questionInput.value = "";
  }
});

newFeedbackBtn.addEventListener("click", async () => {
  const feedbackInput = document.getElementById("feedbackInput");
  const text = feedbackInput.value.trim();
  if (text) {
    await createEntry("feedback", text);
    feedbackInput.value = "";
  }
});

entryList.addEventListener("click", async (event) => {
  const btn = event.target.closest("button");
  if (!btn) return;
  const action = btn.getAttribute("data-action");
  const entry = btn.closest(".entry");
  if (!entry) return;
  const countSpan = btn.nextElementSibling;
  let count = parseInt(countSpan.textContent, 10) || 0;
  if (action === "up") {
    count += 1;
  } else if (action === "down") {
    count += 1;
  }
  countSpan.textContent = count;
  await updateDoc(entry.dataset.id, (doc) => {
    doc[action] = (doc[action] || 0) + 1;
    return doc;
  });
});

statLeftButton.addEventListener("click", async () => {
  let count = parseInt(statLeft.textContent, 10) || 0;
  count += 1;
  statLeft.textContent = count;
  await updateDoc(`lesson_stats:${lessonId}`, (doc) => {
    doc.up = (doc.up || 0) + 1;
    return doc;
  });
});

statRightButton.addEventListener("click", async () => {
  let count = parseInt(statRight.textContent, 10) || 0;
  count += 1;
  statRight.textContent = count;
  await updateDoc(`lesson_stats:${lessonId}`, (doc) => {
    doc.down = (doc.down || 0) + 1;
    return doc;
  });
});

async function loadLesson() {
  await ensureDb();
  if (courseId && lessonId) {
    backBtn.addEventListener("click", () => {
      window.location.href = `stu-courses.html?courseId=${encodeURIComponent(courseId)}`;
    });

    const courseRes = await dbGetDoc(courseId);
    if (courseRes.ok) {
      courseTitle.textContent = courseRes.data.name;
      setStoredJson("hci_course", {
        id: courseRes.data._id,
        name: courseRes.data.name,
        semester: courseRes.data.semester
      });
    }

    const lessonRes = await dbGetDoc(lessonId);
    if (lessonRes.ok) {
      lessonTitle.textContent = lessonRes.data.name;
      setStoredJson("hci_lesson", {
        id: lessonRes.data._id,
        name: lessonRes.data.name
      });
    }

    const statsRes = await dbGetDoc(`lesson_stats:${lessonId}`);
    if (statsRes.ok) {
      statLeft.textContent = statsRes.data.up || 0;
      statRight.textContent = statsRes.data.down || 0;
    } else {
      await dbPutDoc({
        _id: `lesson_stats:${lessonId}`,
        type: "lesson_stats",
        lessonId,
        courseId,
        up: 0,
        down: 0
      });
      statLeft.textContent = "0";
      statRight.textContent = "0";
    }

    const entriesRes = await dbFind({ type: "lesson_entry", lessonId });
    entryList.innerHTML = "";
    if (entriesRes.ok && Array.isArray(entriesRes.data.docs)) {
      entriesRes.data.docs.forEach((entry) => renderEntry(entry));
    }
    updateEmptyState();
  }
}

loadLesson();
