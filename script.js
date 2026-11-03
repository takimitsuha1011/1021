const memories = [
  {
    caption: "Looking pretty as always.❤️",
    note: "You never needed to try so hard to look beautiful. You just did, naturally. 🥹💗",
    art: "❤️",
    image: "images/1.1.jpg"
  },
  {
    caption: "That innocent little smile. 🥰",
    note: "That little smile of yours could make me forget whatever was bothering me. I wish I could see it one more time.",
    art: "🥰",
    image: "images/2.jpg"
  },
  {
    caption: "Your hair, your smile. 🥹",
    note: "I could look at this picture for hours and still find something new to adore about you. 🎀🤍",
    art: "🌙",
    image: "images/6.jpg"
  },
  {
    caption: "Cutest little selfie. 💗",
    note: "The hearts around you make sense, because how could anyone look at you and not adore you? 🩷🧸",
    art: "💗",
    image: "images/4.jpg"
  },
  {
    caption: "Hiding that pretty face. 🤍",
    note: "You hiding your face like this was somehow even cuter than when you showed it. 😭🎀",
    art: "🤍",
    image: "images/5.jpg"
  },
  {
    caption: "A face full of innocence. 🌷",
    note: "There's something so peaceful and innocent about this picture. It reminds me of the simple, sweet girl I fell for. 🥹🌸",
    art: "🌷",
    image: "images/111.jpg"
  },
  {
    caption: "Little balcony beauty. 🤎",
    note: "The way you look into the camera here, so simple, so pretty. 🥹🤎🎀",
    art: "🤎",
    image: "images/22.jpg"
  },
  {
    caption: "Your hand in mine. ❤️",
    note: "Imagine if we could hold hands like this again, without a single worry, just enjoying being close to each other. 🫂💗",
    art: "❤️",
    image: "images/14.jpg"
  },
  {
    caption: "Beautiful in black. 🖤",
    note: "You look so graceful in black. I swear, you could wear anything and still be my favorite view. 🎀🖤",
    art: "🖤",
    image: "images/18.jpg"
  },
  {
    caption: "Pretty in every angle. 🤍",
    note: "This little selfie is proof that you don't need a perfect pose to look adorable. 🥹🫶🏻",
    art: "🤍",
    image: "images/10.jpg"
  },
  {
    caption: "Blooming among flowers. 🌸",
    note: "Surrounded by flowers, yet somehow you're still the prettiest thing in the picture. 🌷💗",
    art: "🌸",
    image: "images/199.jpg"
  },
  {
    caption: "Pretty without even trying. ❤️‍🩹",
    note: "You look so soft and peaceful here. I hope life gives you a million reasons to smile like this. 🥹🤍",
    art: "💖",
    image: "images/12.jpg"
  }
];

const palette = ["#FDE8B2", "#F9D5D3", "#DFD3E8", "#D4E4D2"];
const grid = document.getElementById("polaroid-grid");

memories.forEach((memory, index) => {
  const scene = document.createElement("button");
  scene.type = "button";
  scene.className = `polaroid-scene aspect-[4/5] min-h-52 relative ${index % 2 === 0 ? "-rotate-1" : "rotate-1"}`;
  scene.setAttribute("aria-label", `${memory.caption} memory. Tap to read its note.`);
  scene.setAttribute("aria-pressed", "false");

  const card = document.createElement("span");
  card.className = "polaroid-card";

  const front = document.createElement("span");
  front.className = "polaroid-face";

  const tape = document.createElement("span");
  tape.className = "washi-tape";
  tape.setAttribute("aria-hidden", "true");

  const art = document.createElement("span");
  art.className = "memory-art";
  art.style.backgroundColor = palette[index % palette.length];
  art.setAttribute("aria-hidden", "true");
  if (memory.image) {
    const image = document.createElement("img");
    image.className = "memory-photo";
    image.src = memory.image;
    image.alt = "";
    art.append(image);
  } else {
    art.textContent = memory.art;
  }

  const caption = document.createElement("span");
  caption.className = "memory-caption";
  caption.textContent = memory.caption;
  front.append(tape, art, caption);

  const back = document.createElement("span");
  back.className = "polaroid-face polaroid-back";

  const note = document.createElement("span");
  note.className = "memory-note";
  note.textContent = memory.note;

  const hint = document.createElement("span");
  hint.className = "memory-hint";
  hint.textContent = "Tap to flip back ↩";
  back.append(note, hint);
  card.append(front, back);
  scene.append(card);

  scene.addEventListener("click", () => {
    const flipped = card.classList.toggle("is-flipped");
    scene.setAttribute("aria-pressed", String(flipped));
  });

  grid.append(scene);
});
