const qrOpenBtn = document.getElementById("qrOpenBtn");
const qrCloseBtn = document.getElementById("qrCloseBtn");
const qrDialog = document.getElementById("qrDialog");
const qrCourseLink = document.getElementById("qrCourseLink");
const qrCourseImage = document.getElementById("qrCourseImage");
const courseTitle = document.getElementById("courseTitle");
const courseSemester = document.getElementById("courseSemester");
const courseQuestionsBtn = document.getElementById("courseQuestionsBtn");
const courseList = document.getElementById("courseGrid");
const addBtn = document.getElementById("addCard");
const addForm = document.getElementById("addForm");
const cancelBtn = document.getElementById("cancelBtn");
const addDialog = document.getElementById("addDialog");

const course = getStoredJson("hci_course");
const user = getStoredJson("hci_user");
if (!user) {
  window.location.href = "login.html";
}
if (!course) {
  window.location.href = "mycourse.html";
}

cancelBtn.addEventListener("click", () => {
  addDialog.close();
  addForm.reset();
});

qrOpenBtn.addEventListener("click", () => {
  qrDialog.showModal();
});

qrCloseBtn.addEventListener("click", () => {
  qrDialog.close();
});

courseQuestionsBtn.addEventListener("click", () => {
  window.location.href = `course-questions.html`;
});

function addLessonCard(lesson) {
  const lessonCard = document.createElement("article");
  lessonCard.className = "card course-card";
  lessonCard.innerHTML = `
    <div>
      <div class="course-name">${lesson.name}</div>
      <div class="course-meta">${lesson.description || ""}</div>
    </div>
  `;
  lessonCard.addEventListener("click", () => {
    setStoredJson("hci_lesson", {
      id: lesson._id,
      name: lesson.name
    });
    window.location.href = "lessons.html";
  });
  courseList.appendChild(lessonCard);
}

function newLesson() {
  addDialog.showModal();
}

addBtn.addEventListener("click", newLesson);

addForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(addForm);
  const lessonName = formData.get("lessonName");
  const lessonDescription = formData.get("lessonDescription");

  const newLesson = {
    type: "lesson",
    courseId: course.id,
    name: lessonName,
    description: lessonDescription,
    createdAt: new Date().toISOString()
  };
  const created = await dbPutDoc(newLesson);
  if (!created.ok) {
    alert("Vorlesung konnte nicht gespeichert werden.");
    return;
  }
  addLessonCard({ ...newLesson, _id: created.data.id });
  addDialog.close();
  addForm.reset();
});

async function loadLessons() {
  await ensureDb();
  courseTitle.textContent = course.name;
  courseSemester.textContent = course.semester;
  qrCourseLink.href = `stu-courses.html?courseId=${encodeURIComponent(course.id)}`;
  qrCourseLink.textContent = qrCourseLink.href;
  qrCourseImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrCourseLink.href)}`;

  const res = await dbFind({ type: "lesson", courseId: course.id });
  const existingAddCard = addBtn;
  courseList.innerHTML = "";
  courseList.appendChild(existingAddCard);
  if (res.ok && Array.isArray(res.data.docs)) {
    res.data.docs.forEach((lesson) => addLessonCard(lesson));
  }
}

loadLessons();
