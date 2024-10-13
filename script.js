// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyChIMIOr2cS1e0ziz8rFjo1KF3LiK5wErU",
    authDomain: "online-quiz-application-2d98e.firebaseapp.com",
    projectId: "online-quiz-application-2d98e",
    storageBucket: "online-quiz-application-2d98e.appspot.com",
    messagingSenderId: "906645334685",
    appId: "1:906645334685:web:733136451acbf7e17b8274",
    measurementId: "G-ZR4VY0RLX8"
};

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM elements
const quizElement = document.getElementById('quiz');
const questionElement = document.getElementById('question');
const choicesElement = document.getElementById('choices');
const submitButton = document.getElementById('submit');
const resultsElement = document.getElementById('results');
const scoreElement = document.getElementById('score');

let questions = [];
let currentQuestion = 0;
let score = 1;

// Fetch questions from Firestore with error handling and logging
async function fetchQuestions() {
    try {
        const querySnapshot = await getDocs(collection(db, "questions"));

        if (querySnapshot.empty) {
            console.error("No questions found in Firestore.");
            questionElement.textContent = "No questions found.";
            return;
        }

        questions = querySnapshot.docs.map(doc => doc.data());
        console.log("Questions fetched:", questions);

        showQuestion();  // Show the first question
    } catch (error) {
        console.error("Error fetching questions:", error);
        questionElement.textContent = "Error loading questions.";
    }
}

// Display current question
function showQuestion() {
    const question = questions[currentQuestion];
    questionElement.textContent = question.question;
    choicesElement.innerHTML = '';

    Object.keys(question.choices).forEach((key, index) => {
        const button = document.createElement('button');
        button.textContent = question.choices[key];
        button.classList.add('choice');
        button.addEventListener('click', () => selectChoice(index));
        choicesElement.appendChild(button);
    });

    submitButton.style.display = 'block';
}

// Handle choice selection
function selectChoice(index) {
    const choices = choicesElement.getElementsByClassName('choice');
    for (let i = 0; i < choices.length; i++) {
        choices[i].classList.remove('selected');
    }
    choices[index].classList.add('selected');
}

// Submit answer and move to next question
function submitAnswer() {
    const selectedChoice = choicesElement.querySelector('.choice.selected');
    if (!selectedChoice) {
        alert("Please select an option!");
        return;
    }

    const answer = Array.from(choicesElement.children).indexOf(selectedChoice);  // 0-based index
    if (answer === questions[currentQuestion].correctAnswer) {
        score++;
    }

    currentQuestion++;

    if (currentQuestion < questions.length) {
        showQuestion();
    } else {
        showResults();
        saveScore("user123", score, questions.length);  // Example: saving score with userID
    }
}

// Display final results
function showResults() {
    quizElement.style.display = 'none';
    resultsElement.style.display = 'block';
    scoreElement.textContent = `${score} out of ${questions.length}`;
}

// Save score to Firestore
async function saveScore(userID, score, totalQuestions) {
    try {
        await addDoc(collection(db, "scores"), {
            userID: userID,
            score: score,
            totalQuestions: totalQuestions,
            timestamp: serverTimestamp()
        });
        console.log("Score saved successfully!");
    } catch (error) {
        console.error("Error saving score:", error);
    }
}

// Event listener for submit button
submitButton.addEventListener('click', submitAnswer);

// Start the quiz
fetchQuestions();







