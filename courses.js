const qrOpenBtn = document.getElementById('qrOpenBtn');
const qrCloseBtn = document.getElementById('qrCloseBtn');
const qrDialog = document.getElementById('qrDialog');
const courseList = document.getElementById("courseGrid");
const addBtn = document.getElementById("addCard");
const addForm = document.getElementById("addForm");
const cancelBtn = document.getElementById("cancelBtn");

cancelBtn.addEventListener("click", () => {
    addDialog.close();
    addForm.reset();
});

qrOpenBtn.addEventListener('click', () => {
    qrDialog.showModal();
});

qrCloseBtn.addEventListener('click', () => {
    qrDialog.close();
});

function addLessonCard(lesson) {
    const lessonCard = document.createElement("article");
    lessonCard.className = "card course-card";
    lessonCard.innerHTML = `
        <div>
            <div class="course-name">${lesson.name}</div>
            <div class="course-meta">${lesson.description}</div>
        </div>
        `;
    courseList.appendChild(lessonCard);
}

function newLesson() {
    addDialog.showModal();
}

addBtn.addEventListener("click", newLesson);

addForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(addForm);
    const lessonName = formData.get("lessonName");  
    const lessonDescription = formData.get("lessonDescription");
    const newLesson = { name: lessonName, description: lessonDescription };
    addLessonCard(newLesson);
    addDialog.close();
    addForm.reset();
});
