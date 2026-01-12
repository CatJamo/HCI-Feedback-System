const courseTitle = document.getElementById("courseTitle");
const courseQuestionsBtn = document.getElementById("courseQuestionsBtn");
const lectureList = document.getElementById("lectureList");

const courseId = readQueryParam("courseId") || getStoredJson("hci_course")?.id;
if (!courseId) {
  courseTitle.textContent = "Kurs nicht gefunden";
} else {
  setStoredJson("hci_course", { id: courseId });
}

function addLessonButton(lesson) {
  const button = document.createElement("button");
  button.className = "lecture-pill";
  button.type = "button";
  button.textContent = lesson.name;
  button.addEventListener("click", () => {
    window.location.href = `stu-lessons.html?courseId=${encodeURIComponent(courseId)}&lessonId=${encodeURIComponent(lesson._id)}`;
  });
  lectureList.appendChild(button);
}

async function loadCourse() {
  await ensureDb();
  if (!courseId) return;
  const courseRes = await dbGetDoc(courseId);
  if (courseRes.ok) {
    courseTitle.textContent = `Kurs ${courseRes.data.name} ${courseRes.data.semester || ""}`.trim();
    setStoredJson("hci_course", {
      id: courseRes.data._id,
      name: courseRes.data.name,
      semester: courseRes.data.semester
    });
  }

  courseQuestionsBtn.addEventListener("click", () => {
    window.location.href = `stu-course-questions.html?courseId=${encodeURIComponent(courseId)}`;
  });

  const lessonRes = await dbFind({ type: "lesson", courseId });
  lectureList.innerHTML = "";
  if (lessonRes.ok && Array.isArray(lessonRes.data.docs)) {
    lessonRes.data.docs.forEach((lesson) => addLessonButton(lesson));
  }
}

loadCourse();
