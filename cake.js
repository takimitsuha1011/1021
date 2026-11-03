const wishButton = document.getElementById("wish-button");
const wishForm = document.getElementById("wish-form");
const wishInput = document.getElementById("wish-input");
const wishMessage = document.getElementById("wish-message");
const cake = document.getElementById("cake");
const cakeScene = document.getElementById("birthdaySceneSvg");
const cakeInstruction = document.getElementById("cake-instruction");
const lightButton = document.getElementById("light-button");
const blowButton = document.getElementById("blow-button");
const manualBlowButton = document.getElementById("manual-blow-button");
const candleStatus = document.getElementById("candle-status");
const giftSurpriseLink = document.getElementById("gift-surprise-link");
const flames = cake.querySelectorAll(".flame-group");

let microphoneStream;
let audioContext;
let analyser;
let microphoneFrame;
let loudFrames = 0;
let candlesLit = false;
let candlesOut = false;
let sliceServed = false;

wishButton.addEventListener("click", () => {
  const isOpening = wishForm.hidden;
  wishForm.hidden = !isOpening;
  wishButton.setAttribute("aria-expanded", String(isOpening));
  if (isOpening) wishInput.focus();
});

wishForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const wish = wishInput.value.trim();
  if (!wish) {
    wishInput.focus();
    return;
  }

  const submitButton = wishForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = "Sending...";
  wishMessage.textContent = "";
  try {
    const response = await fetch("https://formsubmit.co/ajax/zakinaik000@gmail.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        subject: "Birthday Wish",
        wish
      })
    });
    if (!response.ok) {
      throw new Error(`Email service returned ${response.status}.`);
    }
    const result = await response.json();
    if (result.success !== "true" && result.success !== true) {
      throw new Error(result.message || "The email service did not accept the wish.");
    }
    wishForm.hidden = true;
    wishButton.setAttribute("aria-expanded", "false");
    wishMessage.textContent = "Your wish has been sent to stars ✨";
  } catch (error) {
    submitButton.disabled = false;
    submitButton.textContent = "Send my wish";
    wishMessage.textContent = "We couldn't send your wish. Please check your connection and try again.";
    console.error("Could not send birthday wish:", error);
  }
});

function stopMicrophone() {
  if (microphoneFrame !== undefined) {
    cancelAnimationFrame(microphoneFrame);
    microphoneFrame = undefined;
  }
  if (microphoneStream) {
    microphoneStream.getTracks().forEach((track) => track.stop());
    microphoneStream = undefined;
  }
  if (audioContext && audioContext.state !== "closed") {
    audioContext.close();
    audioContext = undefined;
  }
}

function lightCandles() {
  candlesLit = true;
  cake.classList.remove("candles-out");
  cake.classList.add("candles-lit");
  cake.setAttribute("aria-label", "Four lit candles on a decorated birthday cake");
  lightButton.hidden = true;
  blowButton.hidden = false;
  manualBlowButton.hidden = false;
  candleStatus.textContent = "All four candles are glowing. Make a wish, then blow them out! ✨";
}

function extinguishCandles(message) {
  candlesOut = true;
  cake.classList.remove("candles-lit");
  cake.classList.add("candles-out");
  flames.forEach((flame) => flame.setAttribute("aria-label", "Candle flame is out"));
  cake.setAttribute("aria-disabled", "false");
  cake.setAttribute("aria-label", "Birthday cake with candles blown out. Tap to take a slice.");
  cakeInstruction.textContent = "The candles are out! Tap on the cake to take a slice.";
  candleStatus.textContent = message;
  blowButton.hidden = true;
  manualBlowButton.hidden = true;
  stopMicrophone();
}

function monitorMicrophone() {
  const samples = new Uint8Array(analyser.fftSize);
  analyser.getByteTimeDomainData(samples);
  let sumSquares = 0;
  for (const sample of samples) {
    const normalized = (sample - 128) / 128;
    sumSquares += normalized * normalized;
  }
  const volume = Math.sqrt(sumSquares / samples.length);

  if (volume > 0.12) {
    loudFrames += 1;
  } else {
    loudFrames = 0;
  }

  if (loudFrames >= 4) {
    extinguishCandles("What a lovely birthday blow! All four candles are out. 🎉");
    return;
  }

  microphoneFrame = requestAnimationFrame(monitorMicrophone);
}

function microphoneErrorMessage(error) {
  if (window.isSecureContext === false) {
    return "Microphone access needs a secure page (HTTPS or localhost). Use the tap-to-blow button instead.";
  }
  if (error && error.name === "NotAllowedError") {
    return "Microphone access was denied. Use the tap-to-blow button instead.";
  }
  if (error && error.name === "NotFoundError") {
    return "No microphone was found. Use the tap-to-blow button instead.";
  }
  return "The microphone couldn't start. Use the tap-to-blow button instead.";
}

lightButton.addEventListener("click", lightCandles);

blowButton.addEventListener("click", async () => {
  const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !AudioContextConstructor) {
    candleStatus.textContent = "Microphone blowing isn't supported here. Use the tap-to-blow button instead.";
    return;
  }

  blowButton.disabled = true;
  candleStatus.textContent = "Allow microphone access, then blow toward your device. 🎤";
  try {
    microphoneStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    if (candlesOut) {
      stopMicrophone();
      return;
    }
    audioContext = new AudioContextConstructor();
    await audioContext.resume();
    if (candlesOut) {
      stopMicrophone();
      return;
    }
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 1024;
    audioContext.createMediaStreamSource(microphoneStream).connect(analyser);
    blowButton.textContent = "Listening... 💨 Blow now!";
    blowButton.disabled = false;
    candleStatus.textContent = "I'm listening! Blow toward your microphone to put out all four candles.";
    microphoneFrame = requestAnimationFrame(monitorMicrophone);
  } catch (error) {
    stopMicrophone();
    if (candlesOut) return;
    blowButton.disabled = false;
    candleStatus.textContent = microphoneErrorMessage(error);
  }
});

manualBlowButton.addEventListener("click", () => {
  extinguishCandles("Wish made! All four candles are out. 🎉");
});

function serveSlice() {
  if (!candlesOut) {
    candleStatus.textContent = "Light the candles and blow them out before taking a slice. 🕯️";
    return;
  }
  if (sliceServed) {
    candleStatus.textContent = "Enjoy your birthday cake! Your slice is ready. 🍰";
    return;
  }

  sliceServed = true;
  cakeScene.classList.add("cutting-active");
  window.setTimeout(() => {
    document.getElementById("bottomTierClippedWrapper").setAttribute("clip-path", "url(#bottomTierCutoutClip)");
    cakeScene.classList.remove("cutting-active");
    cakeScene.classList.add("slice-served");
    giftSurpriseLink.hidden = false;
  }, 420);
  cake.setAttribute("aria-label", "A slice has been taken from the birthday cake");
  candleStatus.textContent = "A slice, just for you! Happy Birthday! 🍰";
}

cake.addEventListener("click", serveSlice);
cake.addEventListener("keydown", (event) => {
  if ((event.key === "Enter" || event.key === " ") && !event.repeat) {
    event.preventDefault();
    serveSlice();
  }
});

function handlePageLeave() {
  stopMicrophone();
  window.removeEventListener("pagehide", handlePageLeave);
  window.removeEventListener("birthday:pageleave", handlePageLeave);
}

window.addEventListener("pagehide", handlePageLeave, { once: true });
window.addEventListener("birthday:pageleave", handlePageLeave, { once: true });
