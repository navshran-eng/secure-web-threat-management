/* =========================================================
   SECURE WEB - SECURITY ASSESSMENT
========================================================= */


/* =========================================================
   QUIZ QUESTIONS
========================================================= */

const quizQuestions = [

    {
        question:
            "You receive an email asking you to urgently verify your account using a link. What should you do?",

        options: [
            "Click the link immediately",
            "Reply with your password",
            "Verify the sender and access the official website directly",
            "Forward the email to everyone"
        ],

        answer: 2,

        explanation:
            "Unexpected urgent requests should be verified independently. Avoid using suspicious links."
    },


    {
        question:
            "Which password is generally the strongest?",

        options: [
            "password123",
            "John2005",
            "Summer2026",
            "A long, unique password or passphrase"
        ],

        answer: 3,

        explanation:
            "Long, unique passwords or passphrases are generally harder to guess and should not be reused."
    },


    {
        question:
            "What is the main purpose of multi-factor authentication (MFA)?",

        options: [
            "To make websites load faster",
            "To provide an additional authentication factor",
            "To remove the need for passwords everywhere",
            "To encrypt every file on your device"
        ],

        answer: 1,

        explanation:
            "MFA adds another authentication factor beyond the password."
    },


    {
        question:
            "What should you do before opening an unexpected attachment?",

        options: [
            "Open it immediately",
            "Disable antivirus protection",
            "Verify the sender and context",
            "Rename the file"
        ],

        answer: 2,

        explanation:
            "Unexpected attachments can contain malicious content. Verify the sender and context before opening them."
    },


    {
        question:
            "Which URL characteristic can be a warning sign of phishing?",

        options: [
            "A familiar domain entered manually",
            "An unusually long URL containing suspicious terms",
            "A bookmarked website",
            "A website using a normal company domain"
        ],

        answer: 1,

        explanation:
            "Unusually long or deceptive URLs can contain indicators associated with phishing."
    },


    {
        question:
            "Why are software security updates important?",

        options: [
            "They only change the application's appearance",
            "They can fix known security vulnerabilities",
            "They permanently remove the need for antivirus software",
            "They make every password stronger"
        ],

        answer: 1,

        explanation:
            "Security updates commonly address known vulnerabilities that attackers may otherwise exploit."
    },


    {
        question:
            "What is a safer approach when using an unfamiliar public Wi-Fi network?",

        options: [
            "Perform sensitive activities without checking anything",
            "Share your passwords with other users",
            "Avoid sensitive activities unless the connection is trusted",
            "Disable all device security controls"
        ],

        answer: 2,

        explanation:
            "Untrusted networks can introduce security risks. Avoid sensitive activity unless appropriate protections are in place."
    },


    {
        question:
            "What is ransomware?",

        options: [
            "A type of backup software",
            "Malware that can restrict access to data and demand payment",
            "A password manager",
            "A browser extension for privacy"
        ],

        answer: 1,

        explanation:
            "Ransomware is malicious software that can restrict access to data or systems and demand payment."
    },


    {
        question:
            "What is the safest response to a suspicious login notification?",

        options: [
            "Ignore every login notification",
            "Share the notification with strangers",
            "Verify the activity through the service's official channels",
            "Send your password to the notification sender"
        ],

        answer: 2,

        explanation:
            "Unexpected login notifications should be verified through the service's official website or application."
    },


    {
        question:
            "Why should important files be backed up?",

        options: [
            "Backups guarantee that malware cannot infect a device",
            "Backups can help recover data after loss or certain attacks",
            "Backups eliminate the need for software updates",
            "Backups make phishing impossible"
        ],

        answer: 1,

        explanation:
            "Backups provide a recovery option if important data is lost, damaged, or affected by an attack."
    }

];


/* =========================================================
   QUIZ STATE
========================================================= */

let currentQuestion = 0;

let quizScore = 0;

let selectedAnswer = null;

let questionAnswered = false;


/* =========================================================
   DOM ELEMENTS
========================================================= */

const questionNumber =
    document.getElementById("questionNumber");

const progressPercent =
    document.getElementById("progressPercent");

const progressFill =
    document.getElementById("progressFill");

const questionText =
    document.getElementById("questionText");

const answerOptions =
    document.getElementById("answerOptions");

const questionFeedback =
    document.getElementById("questionFeedback");

const nextQuestion =
    document.getElementById("nextQuestion");

const quizContainer =
    document.getElementById("quizContainer");

const quizResult =
    document.getElementById("quizResult");

const finalScore =
    document.getElementById("finalScore");

const scoreMessage =
    document.getElementById("scoreMessage");

const restartQuiz =
    document.getElementById("restartQuiz");

const checklistButton =
    document.getElementById("checklistButton");

const checklistResult =
    document.getElementById("checklistResult");

const recommendations =
    document.getElementById("recommendations");


/* =========================================================
   PAGE INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "Secure Web assessment.js loaded successfully."
        );

        if (
            questionText &&
            answerOptions
        ) {

            loadQuestion();

        } else {

            console.error(
                "Assessment quiz elements were not found."
            );

        }

    }
);


/* =========================================================
   LOAD QUESTION
========================================================= */

function loadQuestion() {

    const question =
        quizQuestions[currentQuestion];

    if (!question) {

        console.error(
            "Question not found:",
            currentQuestion
        );

        return;
    }


    selectedAnswer = null;

    questionAnswered = false;


    questionText.textContent =
        question.question;


    answerOptions.innerHTML = "";


    questionFeedback.textContent = "";

    questionFeedback.className =
        "question-feedback";


    nextQuestion.disabled = true;


    if (
        currentQuestion ===
        quizQuestions.length - 1
    ) {

        nextQuestion.textContent =
            "Finish Assessment";

    } else {

        nextQuestion.textContent =
            "Next Question";

    }


    const questionCount =
        currentQuestion + 1;


    const percentage =
        Math.round(
            (
                questionCount /
                quizQuestions.length
            ) * 100
        );


    questionNumber.textContent =
        `Question ${questionCount} of ${quizQuestions.length}`;


    progressPercent.textContent =
        `${percentage}%`;


    progressFill.style.width =
        `${percentage}%`;


    question.options.forEach(
        function (option, index) {

            const button =
                document.createElement("button");


            button.type =
                "button";


            button.className =
                "answer-option";


            button.textContent =
                option;


            button.addEventListener(
                "click",
                function () {

                    selectAnswer(
                        index,
                        button
                    );

                }
            );


            answerOptions.appendChild(
                button
            );

        }
    );

}


/* =========================================================
   SELECT ANSWER
========================================================= */

function selectAnswer(
    index,
    button
) {

    if (questionAnswered) {
        return;
    }


    selectedAnswer = index;


    const options =
        document.querySelectorAll(
            ".answer-option"
        );


    options.forEach(
        function (option) {

            option.classList.remove(
                "selected"
            );

        }
    );


    button.classList.add(
        "selected"
    );


    checkAnswer();

}


/* =========================================================
   CHECK ANSWER
========================================================= */

function checkAnswer() {

    const question =
        quizQuestions[currentQuestion];


    const options =
        document.querySelectorAll(
            ".answer-option"
        );


    questionAnswered = true;


    options.forEach(
        function (option) {

            option.classList.add(
                "disabled"
            );

        }
    );


    if (
        selectedAnswer ===
        question.answer
    ) {

        quizScore++;


        options[selectedAnswer]
            .classList.add(
                "correct"
            );


        questionFeedback.className =
            "question-feedback correct";


        questionFeedback.textContent =
            "Correct. " +
            question.explanation;

    } else {

        options[selectedAnswer]
            .classList.add(
                "incorrect"
            );


        options[question.answer]
            .classList.add(
                "correct"
            );


        questionFeedback.className =
            "question-feedback incorrect";


        questionFeedback.textContent =
            "Incorrect. " +
            question.explanation;

    }


    nextQuestion.disabled = false;

}


/* =========================================================
   NEXT QUESTION
========================================================= */

if (nextQuestion) {

    nextQuestion.addEventListener(
        "click",
        function () {

            if (!questionAnswered) {
                return;
            }


            if (
                currentQuestion <
                quizQuestions.length - 1
            ) {

                currentQuestion++;

                loadQuestion();

            } else {

                finishQuiz();

            }

        }
    );

}


/* =========================================================
   FINISH QUIZ
========================================================= */

function finishQuiz() {

    const score =
        quizScoreToPercentage();


    finalScore.textContent =
        score;


    scoreMessage.textContent =
        getScoreMessage(score);


    quizContainer.style.display =
        "none";


    quizResult.classList.add(
        "show"
    );


    /*
     * If the checklist has already been
     * calculated, save the complete assessment.
     */

    const checklistResultVisible =
        checklistResult &&
        checklistResult.classList.contains("show");


    if (checklistResultVisible) {

        saveAssessment(
            score,
            getChecklistScore(),
            getChecklistItems()
        );

    }

}


/* =========================================================
   SCORE MESSAGE
========================================================= */

function getScoreMessage(score) {

    if (score >= 90) {

        return (
            "Your answers show strong cybersecurity awareness. " +
            "Continue reviewing security practices regularly."
        );

    }


    if (score >= 70) {

        return (
            "You demonstrate a good understanding of common " +
            "cybersecurity practices. Review the missed topics " +
            "to strengthen your knowledge."
        );

    }


    if (score >= 50) {

        return (
            "You have a basic understanding of cybersecurity, " +
            "but several areas could benefit from additional attention."
        );

    }


    return (
        "Your assessment indicates several cybersecurity topics " +
        "that would benefit from further learning and review."
    );

}


/* =========================================================
   RESTART QUIZ
========================================================= */

if (restartQuiz) {

    restartQuiz.addEventListener(
        "click",
        function () {

            currentQuestion = 0;

            quizScore = 0;

            selectedAnswer = null;

            questionAnswered = false;


            quizResult.classList.remove(
                "show"
            );


            quizContainer.style.display =
                "block";


            loadQuestion();

        }
    );

}


/* =========================================================
   QUIZ SCORE
========================================================= */

function quizScoreToPercentage() {

    return Math.round(
        (
            quizScore /
            quizQuestions.length
        ) * 100
    );

}


/* =========================================================
   CHECKLIST BUTTON
========================================================= */

if (checklistButton) {

    checklistButton.addEventListener(
        "click",
        calculateChecklist
    );

}


/* =========================================================
   CALCULATE CHECKLIST
========================================================= */

function calculateChecklist() {

    const checkboxes =
        document.querySelectorAll(
            'input[name="securityPractice"]'
        );


    let checkedCount = 0;


    checkboxes.forEach(
        function (checkbox) {

            if (checkbox.checked) {

                checkedCount++;

            }

        }
    );


    const total =
        checkboxes.length;


    const score =
        total === 0
            ? 0
            : Math.round(
                (
                    checkedCount /
                    total
                ) * 100
            );


    checklistResult.className =
        "checklist-result show";


    checklistResult.innerHTML = `

        <div class="checklist-score">

            <strong>
                ${score}/100
            </strong>

            <span>
                ${checkedCount} of ${total}
                practices selected
            </span>

        </div>

        <div class="checklist-progress">

            <div
                class="checklist-progress-fill"
                style="width: ${score}%"
            ></div>

        </div>

    `;


    generateRecommendations();


    /*
     * Save only when the quiz is complete.
     */

    if (
        quizResult &&
        quizResult.classList.contains("show")
    ) {

        saveAssessment(
            quizScoreToPercentage(),
            score,
            getChecklistItems()
        );

    } else {

        checklistResult.innerHTML += `

            <p class="assessment-save-note">
                Complete the cybersecurity quiz to save
                your complete assessment result.
            </p>

        `;

    }

}


/* =========================================================
   GET CHECKLIST SCORE
========================================================= */

function getChecklistScore() {

    const checkboxes =
        document.querySelectorAll(
            'input[name="securityPractice"]'
        );


    if (checkboxes.length === 0) {
        return 0;
    }


    let checkedCount = 0;


    checkboxes.forEach(
        function (checkbox) {

            if (checkbox.checked) {

                checkedCount++;

            }

        }
    );


    return Math.round(
        (
            checkedCount /
            checkboxes.length
        ) * 100
    );

}


/* =========================================================
   GET CHECKLIST ITEMS
========================================================= */

function getChecklistItems() {

    const checkboxes =
        document.querySelectorAll(
            'input[name="securityPractice"]'
        );


    const selected = [];


    checkboxes.forEach(
        function (checkbox) {

            if (checkbox.checked) {

                selected.push(
                    checkbox.value
                );

            }

        }
    );


    return selected;

}


/* =========================================================
   GENERATE RECOMMENDATIONS
========================================================= */

function generateRecommendations() {

    if (!recommendations) {
        return;
    }


    const checkboxes =
        document.querySelectorAll(
            'input[name="securityPractice"]'
        );


    const recommendationList = [];


    checkboxes.forEach(
        function (checkbox) {

            if (checkbox.checked) {
                return;
            }


            switch (checkbox.value) {


                case "password":

                    recommendationList.push({

                        title:
                            "Improve Password Security",

                        message:
                            "Use long, unique passwords for important accounts and avoid reusing passwords."

                    });

                    break;


                case "mfa":

                    recommendationList.push({

                        title:
                            "Enable Multi-Factor Authentication",

                        message:
                            "Enable MFA on important accounts whenever the service provides it."

                    });

                    break;


                case "updates":

                    recommendationList.push({

                        title:
                            "Keep Software Updated",

                        message:
                            "Install security updates for your operating system, browser, and applications."

                    });

                    break;


                case "phishing":

                    recommendationList.push({

                        title:
                            "Strengthen Phishing Awareness",

                        message:
                            "Verify unexpected messages, senders, attachments, and URLs before interacting with them."

                    });

                    break;


                case "wifi":

                    recommendationList.push({

                        title:
                            "Use Public Wi-Fi Carefully",

                        message:
                            "Avoid sensitive activity on untrusted networks and use appropriate security protections."

                    });

                    break;


                case "backup":

                    recommendationList.push({

                        title:
                            "Maintain Backups",

                        message:
                            "Keep important files backed up so they can be recovered after data loss or certain attacks."

                    });

                    break;

            }

        }
    );


    if (
        recommendationList.length === 0
    ) {

        recommendations.innerHTML = `

            <div class="recommendation-item">

                <div class="recommendation-icon">
                    ✓
                </div>

                <div>

                    <h4>
                        Security Practices Reviewed
                    </h4>

                    <p>
                        You selected all available security
                        practices in this checklist. Continue
                        reviewing your security habits regularly.
                    </p>

                </div>

            </div>

        `;

        return;

    }


    recommendations.innerHTML =
        recommendationList
            .map(
                function (item) {

                    return `

                        <div class="recommendation-item">

                            <div class="recommendation-icon">
                                !
                            </div>

                            <div>

                                <h4>
                                    ${escapeHTML(
                                        item.title
                                    )}
                                </h4>

                                <p>
                                    ${escapeHTML(
                                        item.message
                                    )}
                                </p>

                            </div>

                        </div>

                    `;

                }
            )
            .join("");

}


/* =========================================================
   SAVE ASSESSMENT
========================================================= */

async function saveAssessment(
    quizScoreValue,
    checklistScoreValue,
    checklistItems
) {

    try {

        const formData =
            new FormData();


        formData.append(
            "quiz_score",
            quizScoreValue
        );


        formData.append(
            "checklist_score",
            checklistScoreValue
        );


        formData.append(
            "checklist_items",
            JSON.stringify(
                checklistItems
            )
        );


        const response =
            await fetch(
                "php/assessment-save.php",
                {
                    method: "POST",
                    body: formData
                }
            );


        if (!response.ok) {

            throw new Error(
                "HTTP error " +
                response.status
            );

        }


        const data =
            await response.json();


        if (!data.success) {

            console.error(
                "Assessment could not be saved:",
                data.message
            );

            return;

        }


        console.log(
            "Assessment saved successfully.",
            data.assessment
        );


    } catch (error) {

        console.error(
            "Unable to save assessment:",
            error
        );

    }

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value;


    return div.innerHTML;

}