const semesterCourses = document.getElementById("semesterSelect");
const courseList = document.getElementById("courseGrid");
const dialog = document.getElementById("addDialog");
const addBtn = document.getElementById("addCard");
const addForm = document.getElementById("addForm");
const cancelBtn = document.getElementById("cancelBtn");

cancelBtn.addEventListener("click", () => {
    dialog.close();
    addForm.reset();
});


function addCourseCard(course) {
    const courseCard = document.createElement("article");
    courseCard.className = "card course-card";
    courseCard.innerHTML = `
        <div>
            <div class="course-name">${course.name}</div>
            <div class="course-meta">Semester: <span class="semesterLabel">${course.semester}</span></div>
        </div>
        `;
    courseList.appendChild(courseCard);
    if (course.semester !== semesterCourses.value) {
        courseCard.style.display = "none";
    }
}

function newCourse() {
    dialog.showModal();
}

addBtn.addEventListener("click", newCourse);

addForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(addForm);
    const courseName = formData.get("courseName");
    const semester = formData.get("courseSemester");
    const newCourse = { name: courseName, semester: semester };
    addCourseCard(newCourse);
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

filterCourses();


