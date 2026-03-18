let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let answered = 0;
let selectedAnswers = {};
let quizMode = 'practice'; // 'practice' or 'test'
let startTime = null;

async function startQuiz() {
    const numQuestions = parseInt(document.getElementById('numQuestions').value);
    const qtype = document.querySelector('input[name="qtype"]:checked').value;
    quizMode = document.querySelector('input[name="mode"]:checked').value;
    
    try {
        let response;
        if (qtype === 'all') {
            response = await fetch(`/api/quiz?num=${numQuestions}`);
        } else {
            response = await fetch(`/api/quiz/by-type?type=${qtype}&num=${numQuestions}`);
        }
        
        currentQuestions = await response.json();
        currentQuestionIndex = 0;
        score = 0;
        answered = 0;
        selectedAnswers = {};
        startTime = new Date();
        
        document.getElementById('startScreen').style.display = 'none';
        document.getElementById('quizScreen').style.display = 'block';
        document.getElementById('totalQuestions').textContent = currentQuestions.length;
        
        loadQuestion();
    } catch (error) {
        alert('Error loading quiz: ' + error);
    }
}

function loadQuestion() {
    if (currentQuestionIndex >= currentQuestions.length) {
        showResults();
        return;
    }
    
    const question = currentQuestions[currentQuestionIndex];
    document.getElementById('questionNumber').textContent = currentQuestionIndex + 1;
    document.getElementById('questionText').textContent = question.question;
    document.getElementById('feedback').style.display = 'none';
    
    // Display image if question has one
    const imageContainer = document.getElementById('questionImage');
    if (question.image) {
        imageContainer.innerHTML = `<img src="${question.image}" style="max-width: 100%; height: auto; border-radius: 8px; margin-bottom: 15px; border: 2px solid #2d3139;">`;
        imageContainer.style.display = 'block';
    } else {
        imageContainer.style.display = 'none';
    }
    
    // Update progress bar
    const progress = ((currentQuestionIndex) / currentQuestions.length) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
    
    // Clear previous selections
    selectedAnswers[currentQuestionIndex] = null;
    
    if (question.type === 'multiple_choice') {
        loadMultipleChoice(question);
    } else if (question.type === 'matching') {
        loadMatching(question);
    }
}

function loadMultipleChoice(question) {
    document.getElementById('multipleChoice').style.display = 'block';
    document.getElementById('matching').style.display = 'none';
    
    const container = document.getElementById('choicesContainer');
    container.innerHTML = '';
    
    question.choices.forEach((choice, index) => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.textContent = choice;
        btn.onclick = () => selectChoice(index, btn, choice);
        container.appendChild(btn);
    });
}

function loadMatching(question) {
    document.getElementById('multipleChoice').style.display = 'none';
    document.getElementById('matching').style.display = 'block';
    
    const container = document.getElementById('pairsContainer');
    container.innerHTML = '';
    
    const pairs = question.pairs;
    
    // Get all right-side values
    const rightValues = pairs.map(p => p.right);
    
    // Create matching interface with dropdowns
    let html = `<div class="matching-container" style="grid-template-columns: 1fr; gap: 15px;">`;
    
    pairs.forEach((pair, index) => {
        // Shuffle the options for each dropdown
        const shuffledOptions = [...rightValues].sort(() => Math.random() - 0.5);
        
        html += `
            <div class="matching-item" style="display: flex; align-items: center; gap: 15px; background: transparent; border: none; padding: 0;">
                <div style="flex: 0 0 45%; padding: 12px; background: #252b33; border: 2px solid #2d3139; border-radius: 8px; color: #e0e0e0;">
                    ${pair.left}
                </div>
                <div style="flex: 1;">
                    <select class="matching-dropdown" id="match-${index}" onchange="recordMatching(${index}, this.value)">
                        <option value="">-- Select Answer --</option>
                        ${shuffledOptions.map(option => `<option value="${option}">${option}</option>`).join('')}
                    </select>
                </div>
            </div>
        `;
    });
    
    html += `</div>`;
    container.innerHTML = html;
    
    // Initialize selectedAnswers for matching question
    if (!selectedAnswers[currentQuestionIndex]) {
        selectedAnswers[currentQuestionIndex] = {};
    }
}

function recordMatching(index, value) {
    const question = currentQuestions[currentQuestionIndex];
    const pair = question.pairs[index];
    
    if (!selectedAnswers[currentQuestionIndex]) {
        selectedAnswers[currentQuestionIndex] = {};
    }
    
    if (value === '') {
        delete selectedAnswers[currentQuestionIndex][pair.left];
    } else {
        selectedAnswers[currentQuestionIndex][pair.left] = value;
    }
}

function selectChoice(index, btn, choice) {
    // Remove previous selection
    document.querySelectorAll('.choice-btn').forEach(b => b.classList.remove('selected'));
    
    // Select current
    btn.classList.add('selected');
    selectedAnswers[currentQuestionIndex] = choice;
}

async function submitAnswer() {
    const question = currentQuestions[currentQuestionIndex];
    let userAnswer = selectedAnswers[currentQuestionIndex];
    let isCorrect = false;
    let feedbackClass = 'feedback-incorrect';
    let feedbackText = '';
    
    if (userAnswer === null || userAnswer === undefined) {
        alert('Please select an answer');
        return;
    }
    
    if (question.type === 'multiple_choice') {
        isCorrect = userAnswer === question.answer;
    } else if (question.type === 'matching') {
        // Check if all pairs match
        isCorrect = true;
        if (!userAnswer || typeof userAnswer !== 'object') {
            isCorrect = false;
        } else {
            for (let left in userAnswer) {
                const pairObj = question.pairs.find(p => p.left === left);
                if (!pairObj || userAnswer[left] !== pairObj.right) {
                    isCorrect = false;
                    break;
                }
            }
        }
    }
    
    if (isCorrect) {
        score++;
        feedbackClass = 'feedback-correct';
        feedbackText = '✓ Correct!';
    } else {
        if (question.type === 'multiple_choice') {
            feedbackText = `✗ Incorrect. The correct answer is: <strong>${question.answer}</strong>`;
        } else if (question.type === 'matching') {
            const correctPairs = question.pairs.map(p => `${p.left}: ${p.right}`).join('<br>');
            feedbackText = `✗ Incorrect. The correct answers are:<br><strong>${correctPairs}</strong>`;
        }
    }
    
    answered++;
    
    // Show feedback
    const feedbackDiv = document.getElementById('feedback');
    const feedbackContent = document.getElementById('feedbackContent');
    feedbackContent.innerHTML = feedbackText;
    feedbackContent.className = feedbackClass;
    feedbackDiv.style.display = 'block';
    
    // Disable submit button, enable next
    document.getElementById('submitBtn').disabled = true;
    document.getElementById('skipBtn').textContent = 'Next';
    document.getElementById('skipBtn').onclick = nextQuestion;
}

function skipQuestion() {
    if (quizMode === 'test') {
        alert('Test Mode: You must answer all questions. Please select an answer.');
        return;
    }
    answered++;
    nextQuestion();
}

function nextQuestion() {
    currentQuestionIndex++;
    loadQuestion();
    document.getElementById('submitBtn').disabled = false;
    document.getElementById('skipBtn').textContent = 'Skip';
    document.getElementById('submitBtn').onclick = submitAnswer;
}

function showResults() {
    document.getElementById('quizScreen').style.display = 'none';
    document.getElementById('resultsScreen').style.display = 'block';
    
    const percentage = Math.round((score / currentQuestions.length) * 100);
    document.getElementById('scorePercentage').textContent = percentage + '%';
    document.getElementById('correctCount').textContent = score;
    document.getElementById('totalCount').textContent = currentQuestions.length;
    
    let message = '';
    if (percentage === 100) {
        message = '🎉 Perfect! You got everything right!';
    } else if (percentage >= 80) {
        message = '🌟 Great job! You\'re doing excellent!';
    } else if (percentage >= 60) {
        message = '👍 Good effort! Keep practicing!';
    } else if (percentage >= 40) {
        message = '📚 You\'re making progress! Review and try again.';
    } else {
        message = '💪 Don\'t give up! Review the material and try again.';
    }
    
    document.getElementById('scoreMessage').textContent = message;
    
    // Save test results if in test mode
    if (quizMode === 'test') {
        saveTestResult(percentage);
    }
}

function saveTestResult(percentage) {
    const testResult = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        score: percentage,
        correct: score,
        total: currentQuestions.length,
        questions: currentQuestions,
        answers: selectedAnswers,
        duration: Math.round((new Date() - startTime) / 1000)
    };
    
    let testResults = JSON.parse(localStorage.getItem('testResults')) || [];
    testResults.push(testResult);
    localStorage.setItem('testResults', JSON.stringify(testResults));
}

function viewTestHistory() {
    const testResults = JSON.parse(localStorage.getItem('testResults')) || [];
    
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('testHistoryScreen').style.display = 'block';
    
    const testList = document.getElementById('testList');
    
    if (testResults.length === 0) {
        testList.innerHTML = '<div class="no-tests-message"><p>No test results yet. Start by taking a test!</p></div>';
        return;
    }
    
    // Sort by most recent first
    testResults.reverse();
    
    testList.innerHTML = testResults.map((result, index) => `
        <div class="test-item-wrapper">
            <div class="test-item" onclick="reviewTest(${result.id})">
                <div class="test-info">
                    <div class="test-date">${result.date}</div>
                    <div class="test-details">${result.correct}/${result.total} correct • ${result.duration} seconds</div>
                </div>
                <div class="test-score">${result.score}%</div>
            </div>
            <button class="btn btn-sm btn-danger" onclick="deleteTest(${result.id}, event)" style="margin-left: 10px;">Delete</button>
        </div>
    `).join('');
}

function reviewTest(testId) {
    const testResults = JSON.parse(localStorage.getItem('testResults')) || [];
    const testResult = testResults.find(r => r.id === testId);
    
    if (!testResult) {
        alert('Test not found');
        return;
    }
    
    document.getElementById('testHistoryScreen').style.display = 'none';
    document.getElementById('testReviewScreen').style.display = 'block';
    
    document.getElementById('reviewScore').textContent = testResult.score + '%';
    document.getElementById('reviewCorrect').textContent = `${testResult.correct}/${testResult.total}`;
    document.getElementById('reviewDate').textContent = testResult.date;
    
    // Build incorrect answers list
    const incorrectAnswersContainer = document.getElementById('incorrectAnswersContainer');
    let incorrectAnswersHtml = '';
    
    testResult.questions.forEach((question, index) => {
        const userAnswer = testResult.answers[index];
        let isCorrect = false;
        
        if (question.type === 'multiple_choice') {
            isCorrect = userAnswer === question.answer;
        } else if (question.type === 'matching') {
            isCorrect = true;
            if (!userAnswer || typeof userAnswer !== 'object') {
                isCorrect = false;
            } else {
                for (let left in userAnswer) {
                    const pairObj = question.pairs.find(p => p.left === left);
                    if (!pairObj || userAnswer[left] !== pairObj.right) {
                        isCorrect = false;
                        break;
                    }
                }
            }
        }
        
        if (!isCorrect) {
            let userAnswerDisplay = '';
            let correctAnswerDisplay = '';
            
            if (question.type === 'multiple_choice') {
                userAnswerDisplay = userAnswer || 'Not answered';
                correctAnswerDisplay = question.answer;
            } else if (question.type === 'matching') {
                if (!userAnswer || Object.keys(userAnswer).length === 0) {
                    userAnswerDisplay = 'Not answered';
                } else {
                    userAnswerDisplay = Object.keys(userAnswer).map(left => `${left}: ${userAnswer[left]}`).join('<br>');
                }
                correctAnswerDisplay = question.pairs.map(p => `${p.left}: ${p.right}`).join('<br>');
            }
            
            incorrectAnswersHtml += `
                <div class="incorrect-item">
                    <div class="question">Q${index + 1}: ${question.question}</div>
                    <div class="label">Your Answer:</div>
                    <div class="user-answer">${userAnswerDisplay}</div>
                    <div class="label">Correct Answer:</div>
                    <div class="correct-answer">${correctAnswerDisplay}</div>
                </div>
            `;
        }
    });
    
    if (incorrectAnswersHtml === '') {
        incorrectAnswersContainer.innerHTML = '<p class="text-success">✓ All answers were correct!</p>';
    } else {
        incorrectAnswersContainer.innerHTML = incorrectAnswersHtml;
    }
}

function backToStart() {
    document.getElementById('testHistoryScreen').style.display = 'none';
    document.getElementById('startScreen').style.display = 'block';
}

function backToHistory() {
    document.getElementById('testReviewScreen').style.display = 'none';
    document.getElementById('testHistoryScreen').style.display = 'block';
}

function deleteTest(testId, event) {
    event.stopPropagation();
    
    if (confirm('Are you sure you want to delete this test result?')) {
        let testResults = JSON.parse(localStorage.getItem('testResults')) || [];
        testResults = testResults.filter(r => r.id !== testId);
        localStorage.setItem('testResults', JSON.stringify(testResults));
        viewTestHistory();
    }
}

function exitQuiz() {
    if (quizMode === 'practice' || confirm('Are you sure you want to exit? Your progress will not be saved.')) {
        document.getElementById('quizScreen').style.display = 'none';
        document.getElementById('startScreen').style.display = 'block';
        currentQuestionIndex = 0;
        score = 0;
        answered = 0;
        selectedAnswers = {};
        currentQuestions = [];
    }
}
