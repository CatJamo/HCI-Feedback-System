const entryList = document.getElementById('entryList');
const emptyState = document.getElementById('emptyState');
const newFeedbackBtn = document.getElementById('sendFeedbackBtn');
const newQuestionBtn = document.getElementById('sendQuestionBtn');
const statLeft = document.getElementById('statLeft');
const statRight = document.getElementById('statRight');
const statLeftButton = document.getElementById('statLeftButton');
const statRightButton = document.getElementById('statRightButton');

function newQuestion(text) {

    const entry = document.createElement('div');
    entry.className = 'entry';
    entry.innerHTML = `
        <div class="entry-text">${text}</div>
        <div class="vote-row">
            <div class="vote">
                <button type="button" data-action="up">▲</button>
                <span class="up-count">0</span>
            </div>
            <div class="vote">
                <button type="button" data-action="down">▼</button>
                <span class="down-count">0</span>
            </div>
            <span style="color:var(--highlight);font-weight:900;font-size:12px;">
            Frage
            </span>
        </div>
    `;
    entryList.appendChild(entry);
    emptyState.style.display = 'none';
}

function newFeedback(text) {

    const entry = document.createElement('div');
    entry.className = 'entry';
    entry.innerHTML = `
        <div class="entry-text">${text}</div>
        <div class="vote-row">
            <div class="vote">
                <button type="button" data-action="up">▲</button>
                <span class="up-count">0</span>
            </div>
            <div class="vote">
                <button type="button" data-action="down">▼</button>
                <span class="down-count">0</span>
            </div>
            <span style="color:var(--highlight);font-weight:900;font-size:12px;">
            Feedback
            </span>
        </div>
    `;
    entryList.appendChild(entry);
    emptyState.style.display = 'none';
}

newQuestionBtn.addEventListener('click', () => {
    const questionInput = document.getElementById('questionInput');
    const text = questionInput.value.trim();
    if (text) {
        newQuestion(text);
        questionInput.value = '';
    }
});

newFeedbackBtn.addEventListener('click', () => {
    const feedbackInput = document.getElementById('feedbackInput');
    const text = feedbackInput.value.trim();
    if (text) {
        newFeedback(text);
        feedbackInput.value = '';
    }
});

entryList.addEventListener('click', (event) => {
    if (event.target.tagName === 'BUTTON') {
        const action = event.target.getAttribute('data-action');
        const countSpan = event.target.nextElementSibling;
        let count = parseInt(countSpan.textContent);
        if (action === 'up') {
            count += 1;
        } else if (action === 'down') {
            count += 1;
        }
        countSpan.textContent = count;
    }
});

statLeftButton.addEventListener('click', () => {
    let count = parseInt(statLeft.textContent);
    count += 1;
    statLeft.textContent = count;
});

statRightButton.addEventListener('click', () => {
    let count = parseInt(statRight.textContent);
    count += 1;
    statRight.textContent = count;
});
