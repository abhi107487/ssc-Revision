const content = document.getElementById('content');
let currentQ = 0, score = 0, data = [], currentLang = 'en'; // Language state add ki

// 1. Subjects Load Karein
async function loadSubjects() {
    try {
        const res = await fetch('data/subjects.json');
        const json = await res.json();
        content.innerHTML = "<h2>Select Subject</h2>";
        json.subjects.forEach(s => {
            const btn = document.createElement('button');
            btn.innerText = s.name;
            btn.onclick = () => loadGSChapters();
            content.appendChild(btn);
        });
    } catch(e) { content.innerHTML = "<h3>Error loading subjects</h3>"; }
}

// 2. Chapters Load Karein
async function loadGSChapters() {
    const res = await fetch('data/gs_data.json');
    const json = await res.json();
    content.innerHTML = "<h2>Select Chapter</h2><button onclick='loadSubjects()'>← Back</button>";
    json.chapters.forEach(c => {
        const btn = document.createElement('button');
        btn.innerText = c.chapterName;
        btn.onclick = () => showTopics(c.topics);
        content.appendChild(btn);
    });
}

// 3. Topics
function showTopics(topics) {
    content.innerHTML = "<h2>Select Topic</h2><button onclick='loadGSChapters()'>← Back</button>";
    topics.forEach(t => {
        const btn = document.createElement('button');
        btn.innerText = t.topicName;
        btn.className = "btn-primary";
        btn.onclick = () => startQuiz(t.file);
        content.appendChild(btn);
    });
}

// 4. Quiz Start
async function startQuiz(fileName) {
    const res = await fetch(`data/gs/polity/${fileName}`);
    const json = await res.json();
    data = json.questions;
    currentQ = 0; score = 0;
    render();
}

// Language Switcher Helper
function toggleLang() {
    currentLang = currentLang === 'en' ? 'hi' : 'en';
    render();
}

// 5. Quiz Render (Language support ke saath)
function render() {
    const q = data[currentQ];
    const progress = ((currentQ) / data.length) * 100;
    document.getElementById('progress-bar').style.width = `${progress}%`;

    // Dynamic Content based on language
    const questionText = currentLang === 'en' ? q.q_en : q.q_hi;
    const options = currentLang === 'en' ? q.options_en : q.options_hi;

    content.innerHTML = `
        <button style="margin-bottom:15px; width:auto; padding:8px 15px; font-size:12px;" onclick="toggleLang()">
            ${currentLang === 'en' ? 'हिन्दी में बदलें' : 'Switch to English'}
        </button>
        <div class="card">
            <p style="color:var(--text-s)">Question ${currentQ + 1} of ${data.length}</p>
            <h3>${questionText}</h3>
            <div class="options-grid" id="opts"></div>
        </div>`;

    const optDiv = document.getElementById('opts');
    options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.innerText = opt;
        btn.onclick = () => check(i, btn);
        optDiv.appendChild(btn);
    });
}

// 6. Check Answer
function check(idx, btn) {
    const q = data[currentQ];
    const btns = document.querySelectorAll('.options-grid button');
    btns.forEach(b => b.style.pointerEvents = 'none');

    if (idx === q.answer) {
        btn.classList.add('correct');
        score++;
    } else {
        btn.classList.add('wrong');
        btns[q.answer].classList.add('correct');
    }

    setTimeout(() => {
        currentQ++;
        if (currentQ < data.length) render();
        else showResults();
    }, 1000);
}

// 7. Results
function showResults() {
    const accuracy = ((score / data.length) * 100).toFixed(1);
    content.innerHTML = `<div class="card">
        <h2>Quiz Completed!</h2>
        <p>Score: ${score} / ${data.length}</p>
        <p>Accuracy: ${accuracy}%</p>
        <button class="btn-primary" onclick="location.reload()">Restart App</button>
    </div>`;
}

loadSubjects();
