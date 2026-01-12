const semesterCourses = document.getElementById("semesterSelect");
const courseList = document.getElementById("courseGrid");
const dialog = document.getElementById("addDialog");
const addBtn = document.getElementById("addCard");
const addForm = document.getElementById("addForm");
const cancelBtn = document.getElementById("cancelBtn");
const logoutBtn = document.getElementById("logoutBtn");

const user = getStoredJson("hci_user");
if (!user) {
  window.location.href = "login.html";
}

cancelBtn.addEventListener("click", () => {
  dialog.close();
  addForm.reset();
});

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("hci_user");
  localStorage.removeItem("hci_course");
  localStorage.removeItem("hci_lesson");
});

function addCourseCard(course) {
  const courseCard = document.createElement("article");
  courseCard.className = "card course-card";
  courseCard.dataset.semester = course.semester;
  courseCard.innerHTML = `
    <div>
      <div class="course-name">${course.name}</div>
      <div class="course-meta">Semester: <span class="semesterLabel">${course.semester}</span></div>
    </div>
  `;
  courseCard.addEventListener("click", () => {
    setStoredJson("hci_course", {
      id: course._id,
      name: course.name,
      semester: course.semester
    });
    window.location.href = "courses.html";
  });
  courseList.appendChild(courseCard);
  if (course.semester !== semesterCourses.value) {
    courseCard.style.display = "none";
  }
}

function newCourse() {
  dialog.showModal();
}

addBtn.addEventListener("click", newCourse);

addForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(addForm);
  const courseName = formData.get("courseName");
  const semester = formData.get("courseSemester");

  const newCourse = {
    type: "course",
    ownerId: user.id,
    name: courseName,
    semester,
    createdAt: new Date().toISOString()
  };

  const created = await dbPutDoc(newCourse);
  if (!created.ok) {
    alert("Kurs konnte nicht gespeichert werden.");
    return;
  }
  addCourseCard({ ...newCourse, _id: created.data.id });
  dialog.close();
  addForm.reset();
});

function filterCourses() {
  const selectedSemester = semesterCourses.value;
  const courseCards = courseList.getElementsByClassName("course-card");
  for (let card of courseCards) {
    const semesterLabel = card.querySelector(".semesterLabel").textContent;
    if (semesterLabel === selectedSemester) {
      card.style.display = "";
    } else {
      card.style.display = "none";
    }
  }
}

semesterCourses.addEventListener("change", filterCourses);

async function loadCourses() {
  await ensureDb();
  const res = await dbFind({
    type: "course",
    ownerId: user?.id || "__none__"
  });
  const existingAddCard = addBtn;
  courseList.innerHTML = "";
  courseList.appendChild(existingAddCard);
  if (res.ok && Array.isArray(res.data.docs)) {
    res.data.docs.forEach((course) => addCourseCard(course));
  }
  filterCourses();
}

loadCourses();


