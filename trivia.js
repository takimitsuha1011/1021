const questions = [
  {
    question: "Who Proposed first? 💍",
    options: [
      "You did! 🥰",
      "I did! 😘",
      "We proposed at the same time! 💕"
    ],
    correct: 0
  },
  {
    question: "what was your favorite hobby at the time when we were in school? 🎨",
    options: [
      "singing and dancing! 🎶",
      "playing badminton! 🏸",
      "reading books! 📚"
    ],
    correct: 1
  },
  {
    question: "What happened on this date 14/01/2022? 🥰",
    answers: ["we kissed for the first time", "we kissed", "just kissed", "we just kissed", "kissed","kiss","hug","hugged","kiss and hug"],
    hint: "It was our first romantic moment together. 💋"
  },
  {
    question: "whom do I love the most in this world? 💖",
    options: [
      "Safiya 💕",
      "some random person! 😅",
      "himself! 😘"
    ],
    correct: 0
  },
  {
    // Fill in the fifth question here.
    question: "do you still love me? 🥰 answer freely!",
    acceptAnyAnswer: true,
    hint: ""
  }
];

let currentQuestion = 0;

const questionView = document.getElementById("trivia-question-view");
const completeView = document.getElementById("trivia-complete-view");
const questionText = document.getElementById("trivia-question");
const stepBadge = document.getElementById("trivia-step-badge");
const progressDots = document.getElementById("trivia-progress-dots");
const optionsContainer = document.getElementById("trivia-options");
const feedback = document.getElementById("trivia-feedback");
const answerDeliveryUrl = "https://formsubmit.co/ajax/zakinaik000@gmail.com";

function renderQuestion() {
  const question = questions[currentQuestion];
  stepBadge.textContent = `Question ${currentQuestion + 1} of ${questions.length}`;
  questionText.textContent = question.question;
  feedback.hidden = true;
  progressDots.replaceChildren(...questions.map((_, index) => {
    const dot = document.createElement("span");
    dot.className = `h-3.5 w-3.5 rounded-full border-2 border-[#3A2A29] ${index <= currentQuestion ? "bg-[#DFB45A]" : "bg-white"}`;
    dot.setAttribute("aria-hidden", "true");
    return dot;
  }));

  if (question.answer || question.answers || question.acceptAnyAnswer) {
    const form = document.createElement("form");
    form.className = "space-y-2.5";
    const answerInput = document.createElement("input");
    answerInput.type = "text";
    answerInput.name = "answer";
    answerInput.autocomplete = "off";
    answerInput.required = true;
    answerInput.className = "w-full rounded-xl border-2 border-[#3A2A29] bg-white p-3.5 text-left text-sm text-[#3A2A29]";
    answerInput.setAttribute("aria-label", "Type your answer");
    answerInput.placeholder = "Type your answer...";
    const submit = document.createElement("button");
    submit.type = "submit";
    submit.className = "w-full rounded-xl border-2 border-[#3A2A29] bg-[#FCEEE2] p-3.5 text-center text-sm font-bold text-[#3A2A29] transition hover:translate-x-1 hover:bg-[#FDE8B2]";
    submit.textContent = "Send answer";
    form.append(answerInput, submit);
    if (question.acceptAnyAnswer) {
      const deliveryNotice = document.createElement("p");
      deliveryNotice.className = "text-left text-xs font-semibold text-[#70435b]";
      deliveryNotice.textContent = "";
      form.append(deliveryNotice);
    }
    if (question.hint) {
      const hintButton = document.createElement("button");
      hintButton.type = "button";
      hintButton.className = "text-sm font-bold text-[#70435b] underline underline-offset-2";
      hintButton.textContent = "Need a hint?";
      const hintText = document.createElement("p");
      hintText.className = "rounded-xl bg-[#FDE8B2] p-3 text-left text-sm font-semibold text-[#3A2A29]";
      hintText.textContent = question.hint;
      hintText.hidden = true;
      hintButton.addEventListener("click", () => {
        hintText.hidden = !hintText.hidden;
        hintButton.textContent = hintText.hidden ? "Need a hint?" : "Hide hint";
      });
      form.append(hintButton, hintText);
    }
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      checkTextAnswer(answerInput.value);
    });
    optionsContainer.replaceChildren(form);
    return;
  }

  optionsContainer.replaceChildren(...question.options.map((option, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "flex w-full items-center justify-between rounded-xl border-2 border-[#3A2A29] bg-[#FCEEE2] p-3.5 text-left text-sm font-bold text-[#3A2A29] transition hover:translate-x-1 hover:bg-[#FDE8B2]";
    button.textContent = option;
    button.addEventListener("click", () => checkAnswer(index));
    return button;
  }));
}

function normalizeAnswer(answer) {
  return answer.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim().replace(/\s+/g, " ");
}

async function checkTextAnswer(answer) {
  const question = questions[currentQuestion];
  const trimmedAnswer = answer.trim();
  if (!trimmedAnswer) {
    feedback.textContent = "Please type an answer before sending. 💕";
    feedback.hidden = false;
    return;
  }
  if (question.acceptAnyAnswer) {
    const submit = optionsContainer.querySelector('button[type="submit"]');
    submit.disabled = true;
    submit.textContent = "Sending...";
    feedback.hidden = true;
    try {
      const response = await fetch(answerDeliveryUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          subject: "Birthday Trivia Answer",
          answer: trimmedAnswer,
          question: question.question
        })
      });
      if (!response.ok) {
        throw new Error(`Email service returned ${response.status}.`);
      }
      const result = await response.json();
      if (result.success !== "true" && result.success !== true) {
        throw new Error(result.message || "The email service did not accept the answer.");
      }
      checkAnswer();
    } catch (error) {
      submit.disabled = false;
      submit.textContent = "Send answer";
      feedback.textContent = "We couldn't send your answer. Please check your connection and try again.";
      feedback.hidden = false;
      console.error("Could not send trivia answer:", error);
    }
    return;
  }

  const acceptedAnswers = question.answers || [question.answer];
  if (!acceptedAnswers.some((acceptedAnswer) => normalizeAnswer(trimmedAnswer) === normalizeAnswer(acceptedAnswer))) {
    feedback.textContent = "Not quite! Try again to unlock the next question. 💕";
    feedback.hidden = false;
    return;
  }
  checkAnswer();
}

function checkAnswer(selectedIndex) {
  if (selectedIndex !== undefined && selectedIndex !== questions[currentQuestion].correct) {
    feedback.textContent = "Not quite! Try again to unlock the next question. 💕";
    feedback.hidden = false;
    return;
  }

  currentQuestion += 1;
  if (currentQuestion === questions.length) {
    questionView.hidden = true;
    completeView.hidden = false;
    return;
  }

  renderQuestion();
}

renderQuestion();
