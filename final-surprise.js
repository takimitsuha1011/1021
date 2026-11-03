const video = document.getElementById("surprise-video");
const videoFrame = document.querySelector(".video-frame");
const centerPlayButton = document.getElementById("center-play-button");
const playButton = document.getElementById("play-button");
const seekSlider = document.getElementById("video-seek");
const videoTime = document.getElementById("video-time");
const muteButton = document.getElementById("mute-button");
const fullscreenButton = document.getElementById("fullscreen-button");
const videoStatus = document.getElementById("video-status");

// Stop the background music player as soon as the final surprise page loads
(function stopMusicPlayer() {
  const tryStop = () => {
    const audioEl = document.querySelector("audio");
    if (audioEl && !audioEl.paused) {
      audioEl.pause();
    }
  };
  tryStop();
  // Retry after a short delay in case the music player initialises after this script
  setTimeout(tryStop, 300);
})();

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function updatePlayState() {
  const isPlaying = !video.paused && !video.ended;
  const label = isPlaying ? "Pause video" : "Play video";
  playButton.textContent = isPlaying ? "Ⅱ" : "▶";
  playButton.setAttribute("aria-label", label);
  centerPlayButton.setAttribute("aria-label", label);
  videoFrame.classList.toggle("is-playing", isPlaying);
}

function updateTime() {
  const duration = Number.isFinite(video.duration) ? video.duration : 0;
  const currentTime = Number.isFinite(video.currentTime) ? video.currentTime : 0;
  videoTime.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
  seekSlider.value = duration > 0 ? String(Math.round((currentTime / duration) * 1000)) : "0";
}

async function togglePlayback() {
  if (video.paused) {
    try {
      await video.play();
      videoStatus.textContent = "";
      videoStatus.hidden = true;
    } catch (error) {
      videoStatus.textContent = "The video couldn't be played. Check that media/final-surprise.mp4 is available.";
      videoStatus.hidden = false;
      console.error("Could not play the final surprise video:", error);
    }
  } else {
    video.pause();
  }
  updatePlayState();
}

centerPlayButton.addEventListener("click", togglePlayback);
playButton.addEventListener("click", togglePlayback);

// Clicking the video itself toggles play/pause
video.addEventListener("click", togglePlayback);

video.addEventListener("play", updatePlayState);
video.addEventListener("pause", updatePlayState);
video.addEventListener("ended", updatePlayState);
video.addEventListener("loadedmetadata", () => {
  videoStatus.hidden = true;
  updateTime();
  // Set the video-frame's aspect-ratio to match the video's native dimensions
  if (video.videoWidth && video.videoHeight) {
    videoFrame.style.aspectRatio = `${video.videoWidth} / ${video.videoHeight}`;
  }
});
video.addEventListener("timeupdate", updateTime);
video.addEventListener("error", () => {
  videoStatus.textContent = "Add your video as media/final-surprise.mp4 to play your surprise.";
  videoStatus.hidden = false;
  updatePlayState();
});

seekSlider.addEventListener("input", () => {
  if (Number.isFinite(video.duration) && video.duration > 0) {
    video.currentTime = (Number(seekSlider.value) / 1000) * video.duration;
  }
});

muteButton.addEventListener("click", () => {
  video.muted = !video.muted;
  muteButton.textContent = video.muted ? "🔇" : "🔊";
  muteButton.setAttribute("aria-label", video.muted ? "Unmute video" : "Mute video");
});

fullscreenButton.addEventListener("click", async () => {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await videoFrame.requestFullscreen();
      video.controls = true;
    }
  } catch (error) {
    videoStatus.textContent = "Fullscreen isn't available in this browser.";
    console.error("Could not toggle video fullscreen:", error);
  }
});

document.addEventListener("fullscreenchange", () => {
  const isFullscreen = document.fullscreenElement === videoFrame;
  video.controls = isFullscreen;
  fullscreenButton.setAttribute("aria-label", isFullscreen ? "Exit fullscreen" : "Enter fullscreen");
});

updatePlayState();
updateTime();
