(() => {
  const config = window.BIRTHDAY_MUSIC;
  if (!config) {
    throw new Error("music-config.js must load before music-player.js.");
  }

  const songs = Array.isArray(config.songs) && config.songs.length ? config.songs : [config];
  let currentSongIndex = 0;
  let currentSong = songs[currentSongIndex];

  const audio = document.createElement("audio");
  audio.preload = "metadata";
  audio.setAttribute("aria-label", "Birthday song");

  const player = document.createElement("aside");
  player.className = "birthday-music-player is-collapsed";
  player.setAttribute("aria-label", "Birthday song player");

  const discButton = document.createElement("button");
  discButton.className = "birthday-music-disc";
  discButton.type = "button";
  discButton.setAttribute("aria-label", `Open player for ${currentSong.title || "birthday song"}`);
  const discArt = document.createElement("span");
  discArt.className = "birthday-music-turntable";
  discArt.setAttribute("aria-hidden", "true");
  const record = document.createElement("span");
  record.className = "birthday-music-record";
  const discImage = document.createElement("img");
  discImage.alt = "";
  record.append(discImage);
  const discCenter = document.createElement("span");
  discCenter.className = "birthday-music-disc-center";
  discCenter.setAttribute("aria-hidden", "true");
  record.append(discCenter);
  discArt.append(record);
  discButton.append(discArt);

  const collapsedMute = makeButton("🔊", "Mute song");
  collapsedMute.classList.add("birthday-music-mute", "birthday-music-mute-collapsed");
  collapsedMute.setAttribute("aria-pressed", "false");

  const mute = makeButton("🔊", "Mute song");
  mute.classList.add("birthday-music-mute");
  mute.setAttribute("aria-pressed", "false");

  const expandedPlayer = document.createElement("div");
  expandedPlayer.className = "birthday-music-expanded";
  const back = makeButton("→", "Close player");
  back.classList.add("birthday-music-back");

  const main = document.createElement("div");
  main.className = "birthday-music-main";

  const cover = document.createElement("div");
  cover.className = "birthday-music-cover";
  cover.setAttribute("aria-hidden", "true");
  cover.textContent = "♫";

  const info = document.createElement("div");
  info.className = "birthday-music-info";
  const title = document.createElement("p");
  title.className = "birthday-music-title";
  title.textContent = currentSong.title || "Birthday song";
  const artist = document.createElement("p");
  artist.className = "birthday-music-artist";
  artist.textContent = currentSong.artist || "";
  const lyrics = document.createElement("div");
  lyrics.className = "birthday-music-lyrics";
  lyrics.setAttribute("aria-label", "Song lyrics");
  info.append(title, artist, lyrics);
  main.append(cover, info);

  const controls = document.createElement("div");
  controls.className = "birthday-music-controls";
  const previous = makeButton("⏮", "Restart song or play previous song");
  const play = makeButton("▶", "Play song");
  play.classList.add("birthday-music-button-primary");
  const next = makeButton("⏭", "Next song");
  const seek = document.createElement("input");
  seek.className = "birthday-music-seek";
  seek.type = "range";
  seek.min = "0";
  seek.max = "1000";
  seek.value = "0";
  seek.setAttribute("aria-label", "Song progress");
  const time = document.createElement("span");
  time.className = "birthday-music-time";
  time.textContent = "0:00 / 0:00";
  controls.append(previous, play, next, seek, time);

  const volumeControls = document.createElement("div");
  volumeControls.className = "birthday-music-volume-controls";
  const volume = document.createElement("input");
  volume.className = "birthday-music-volume";
  volume.type = "range";
  volume.min = "0";
  volume.max = "1";
  volume.step = "0.05";
  volume.value = String(audio.volume);
  volume.setAttribute("aria-label", "Song volume");
  volumeControls.append(mute, volume);

  const status = document.createElement("p");
  status.className = "birthday-music-status";
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  expandedPlayer.append(main, back, controls, volumeControls, status);
  player.append(discButton, collapsedMute, expandedPlayer);

  const wrapper = document.createElement("div");
  wrapper.id = "page-content";
  while (document.body.firstChild) wrapper.append(document.body.firstChild);
  document.body.append(wrapper, player, audio);

  let lyricsData = [];
  let lastActiveIndex = -1;
  next.disabled = songs.length < 2;
  renderSong(currentSong);

  discButton.addEventListener("click", () => {
    player.classList.remove("is-collapsed");
    player.classList.add("is-expanded");
    discButton.setAttribute("aria-expanded", "true");
    back.focus();
  });

  back.addEventListener("click", () => {
    player.classList.remove("is-expanded");
    player.classList.add("is-collapsed");
    discButton.setAttribute("aria-expanded", "false");
    discButton.focus();
  });

  play.addEventListener("click", async () => {
    if (audio.paused) {
      try {
        await audio.play();
        status.textContent = "";
      } catch (error) {
        status.textContent = `Couldn't play the song: ${error.message}`;
      }
    } else {
      audio.pause();
    }
  });

  previous.addEventListener("click", () => {
    if (songs.length > 1 && audio.currentTime <= 3) {
      changeSong(-1, !audio.paused);
      return;
    }
    audio.currentTime = 0;
    updateProgress();
  });

  next.addEventListener("click", () => {
    changeSong(1, !audio.paused);
  });

  mute.addEventListener("click", () => {
    audio.muted = !audio.muted;
  });
  collapsedMute.addEventListener("click", () => {
    audio.muted = !audio.muted;
  });

  volume.addEventListener("input", () => {
    audio.volume = Number(volume.value);
    audio.muted = audio.volume === 0;
  });

  audio.addEventListener("volumechange", () => {
    volume.value = String(audio.volume);
    const isMuted = audio.muted || audio.volume === 0;
    [mute, collapsedMute].forEach((button) => {
      button.textContent = isMuted ? "🔇" : "🔊";
      button.setAttribute("aria-label", isMuted ? "Unmute song" : "Mute song");
      button.setAttribute("aria-pressed", String(isMuted));
    });
  });

  audio.addEventListener("play", () => {
    player.classList.add("is-playing");
    play.textContent = "Ⅱ";
    play.setAttribute("aria-label", "Pause song");
  });
  audio.addEventListener("pause", () => {
    player.classList.remove("is-playing");
    play.textContent = "▶";
    play.setAttribute("aria-label", "Play song");
  });
  audio.addEventListener("error", () => {
    status.textContent = "The song file couldn't be loaded. Check audioSrc in music-config.js.";
  });
  audio.addEventListener("loadedmetadata", updateProgress);
  audio.addEventListener("timeupdate", updateProgress);
  audio.addEventListener("ended", () => {
    if (songs.length > 1) {
      changeSong(1, true);
    } else {
      player.classList.remove("is-playing");
      play.textContent = "▶";
      play.setAttribute("aria-label", "Play song");
    }
  });
  seek.addEventListener("input", () => {
    if (Number.isFinite(audio.duration) && audio.duration > 0) {
      audio.currentTime = (Number(seek.value) / 1000) * audio.duration;
    }
  });

  function makeButton(text, label) {
    const button = document.createElement("button");
    button.className = "birthday-music-button";
    button.type = "button";
    button.textContent = text;
    button.setAttribute("aria-label", label);
    return button;
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${remainingSeconds}`;
  }

  function changeSong(direction, autoplay) {
    if (songs.length < 2) return;
    currentSongIndex = (currentSongIndex + direction + songs.length) % songs.length;
    currentSong = songs[currentSongIndex];
    renderSong(currentSong, autoplay);
  }

  function renderSong(song, autoplay = false) {
    audio.pause();
    title.textContent = song.title || "Birthday song";
    artist.textContent = song.artist || "";
    discButton.setAttribute("aria-label", `Open player for ${song.title || "birthday song"}`);
    lyricsData = Array.isArray(song.lyrics)
      ? song.lyrics
        .filter((line) => line && Number.isFinite(Number(line.time)) && typeof line.text === "string")
        .map((line) => ({ time: Number(line.time), text: line.text }))
        .sort((first, second) => first.time - second.time)
      : [];

    if (lyricsData.length) {
      lyrics.replaceChildren(...lyricsData.map((line) => {
        const element = document.createElement("p");
        element.className = "birthday-music-lyric";
        element.textContent = line.text;
        return element;
      }));
    } else {
      const emptyLyrics = document.createElement("p");
      emptyLyrics.className = "birthday-music-lyric";
      emptyLyrics.textContent = "Add timestamped lyrics in music-config.js.";
      lyrics.replaceChildren(emptyLyrics);
    }

    const coverSrc = typeof song.coverSrc === "string" ? song.coverSrc : "";
    [discImage, cover].forEach((imageContainer) => {
      if (!coverSrc) {
        if (imageContainer === discImage) imageContainer.removeAttribute("src");
        else imageContainer.replaceChildren("♫");
        return;
      }
      const image = imageContainer === discImage ? discImage : document.createElement("img");
      image.src = coverSrc;
      image.alt = "";
      image.addEventListener("error", () => {
        if (imageContainer === discImage) image.removeAttribute("src");
        else cover.replaceChildren("♫");
      }, { once: true });
      if (imageContainer !== discImage) cover.replaceChildren(image);
    });

    audio.currentTime = 0;
    if (typeof song.audioSrc === "string" && song.audioSrc.trim()) {
      audio.src = song.audioSrc;
      audio.load();
      status.textContent = "";
      play.disabled = false;
      previous.disabled = false;
      seek.disabled = false;
      if (autoplay) {
        audio.play().catch((error) => {
          status.textContent = `Couldn't play the song: ${error.message}`;
        });
      }
    } else {
      audio.removeAttribute("src");
      status.textContent = "Add your song path in music-config.js to enable playback.";
      play.disabled = true;
      previous.disabled = true;
      seek.disabled = true;
    }
    time.textContent = "0:00 / 0:00";
    seek.value = "0";
    lastActiveIndex = -1;
    updateProgress();
  }

  function updateProgress() {
    const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
    const current = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
    seek.value = duration ? String(Math.round((current / duration) * 1000)) : "0";
    time.textContent = `${formatTime(current)} / ${formatTime(duration)}`;

    let activeIndex = -1;
    lyricsData.forEach((line, index) => {
      if (line.time <= current) activeIndex = index;
    });
    const lyricElements = lyrics.querySelectorAll(".birthday-music-lyric");
    lyricElements.forEach((line, index) => {
      line.classList.toggle("is-current", index === activeIndex);
    });
    if (activeIndex !== lastActiveIndex && activeIndex >= 0 && lyricElements[activeIndex]) {
      const activeLine = lyricElements[activeIndex];
      const lineHeight = activeLine.getBoundingClientRect().height;
      const targetScrollTop = Math.max(
        0,
        lyrics.scrollTop + activeLine.getBoundingClientRect().top - lyrics.getBoundingClientRect().top - lineHeight
      );
      lyrics.scrollTo({
        top: targetScrollTop,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
      });
    }
    lastActiveIndex = activeIndex;
  }

  async function runPageScripts(parsedDocument, destination) {
    for (const script of parsedDocument.body.querySelectorAll("script")) {
      if (script.type && script.type !== "text/javascript" && script.type !== "application/javascript") continue;
      let source = script.textContent;
      if (script.src) {
        const scriptUrl = new URL(script.getAttribute("src"), destination);
        if (scriptUrl.origin !== window.location.origin) {
          throw new Error(`Refusing to execute a cross-origin page script: ${scriptUrl.href}`);
        }
        const response = await fetch(scriptUrl);
        if (!response.ok) throw new Error(`Could not load page script ${scriptUrl.pathname}.`);
        source = await response.text();
      }
      if (source.trim()) new Function(source)();
    }
  }

  function updateStylesheets(parsedDocument, destination) {
    const nextStylesheets = Array.from(parsedDocument.querySelectorAll('link[rel="stylesheet"]'))
      .map((link) => new URL(link.getAttribute("href"), destination))
      .filter((url) => url.origin === window.location.origin);
    document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
      const url = new URL(link.href);
      if (url.origin === window.location.origin) link.remove();
    });
    nextStylesheets.forEach((url) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = url.href;
      document.head.append(link);
    });
  }

  async function navigate(destination, addHistory = true) {
    const target = new URL(destination, window.location.href);
    if (target.origin !== window.location.origin) {
      window.location.assign(target.href);
      return;
    }

    try {
      const response = await fetch(target.href, { headers: { "X-Requested-With": "fetch" } });
      if (!response.ok) throw new Error(`Page request failed with status ${response.status}.`);
      const parsedDocument = new DOMParser().parseFromString(await response.text(), "text/html");
      if (!parsedDocument.body || !parsedDocument.title) throw new Error("The requested page is incomplete.");

      window.dispatchEvent(new Event("birthday:pageleave"));
      // Stop music when entering the final surprise page
      if (target.pathname.includes("final-surprise")) {
        audio.pause();
      }
      // Resume music when leaving the final surprise page (going to any other page)
      if (window.location.pathname.includes("final-surprise") && !target.pathname.includes("final-surprise")) {
        audio.play().catch(() => {});
      }
      document.body.className = parsedDocument.body.className;
      document.title = parsedDocument.title;
      updateStylesheets(parsedDocument, target);

      const pageNodes = Array.from(parsedDocument.body.childNodes).filter((node) => {
        return !(node.nodeType === Node.ELEMENT_NODE && node.tagName === "SCRIPT");
      });
      wrapper.replaceChildren(...pageNodes.map((node) => document.importNode(node, true)));
      if (addHistory) {
        window.history.pushState({}, "", target.href);
        window.scrollTo(0, 0);
      }
      await runPageScripts(parsedDocument, target);
    } catch (error) {
      status.textContent = `Page transition failed; opening the page normally. ${error.message}`;
      window.location.assign(target.href);
    }
  }

  window.navigateTo = navigate;
  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest("a[href]");
    if (!link || link.target || link.hasAttribute("download")) return;
    const target = new URL(link.href, window.location.href);
    if (target.origin !== window.location.origin || !target.pathname.endsWith(".html")) return;
    event.preventDefault();
    navigate(target.href);
  });

  window.addEventListener("popstate", () => {
    navigate(window.location.href, false);
  });

  if (typeof currentSong.audioSrc === "string" && currentSong.audioSrc.trim()) {
    audio.play().then(() => {
      status.textContent = "";
    }).catch((error) => {
      if (error.name === "NotAllowedError") {
        status.textContent = "Autoplay was blocked by your browser. Press play to start the song.";
      } else {
        status.textContent = `Couldn't start the song automatically: ${error.message}`;
      }
    });
  }
})();
