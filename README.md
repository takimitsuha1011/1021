# 1021

Open `index.html` to start the birthday surprise. After the nickname prompt, the experience is split into these pages:

- `birthday.html` — the birthday greeting and link to the memory wall.
- `memory-wall.html` — a wall of 12 flip-to-read illustrated memories and a link to the trivia quest.
- `trivia.html` — a five-question quiz; all answers must be correct to reveal the vault button.
- `digital-vault.html` — the birthday letter, interactive digital vault letters, and a link to the cake.
- `cake.html` — make a wish, light and blow out four candles, then tap the cake to serve a slice and reveal the final gift.
- `final-surprise.html` — a custom video player for the last birthday surprise.

To add the final surprise video, place an MP4 named `final-surprise.mp4` in the `media` folder. The player on `final-surprise.html` loads `media/final-surprise.mp4`.

The birthday, memory-wall, and cake pages use separate stylesheets; the cake experience has its own `cake.css` and `cake.js`.

Question 5 in `trivia.js` accepts any non-empty typed answer and sends it to `zakinaik000@gmail.com` through FormSubmit's AJAX endpoint. The visitor is informed next to the answer field that FormSubmit will send the response to that address. Confirm the recipient address using the first verification email FormSubmit sends. The site must be online for this to work; FormSubmit handles the submission.

The birthday wish form on `cake.html` also sends non-empty wishes to `zakinaik000@gmail.com` through FormSubmit and tells the visitor before submission. Confirm the recipient address with FormSubmit if it has not already been verified.

## Birthday song player

The player stays in the top-right corner while moving between birthday pages. It starts as a small spinning vinyl button; tap it to open the compact controls and use the back arrow to collapse it without stopping the song. The expanded player includes mute and volume controls. The player attempts to start the first song when the page opens. Browsers may block audible autoplay until the visitor interacts with the page; if so, open the player and press play. Songs advance automatically when a track ends. The previous button restarts the current track, and pressing it again within three seconds goes to the previous track. Internal page links use in-page navigation so the same audio element keeps playing without restarting. Open the site through an HTTP/HTTPS server (for example, GitHub Pages or VS Code Live Server), not by opening the HTML files directly; browsers block the requests needed for in-page navigation from `file://`.

To add songs and her photo, put the audio and image files in a `media` folder and edit `music-config.js`. Add a `songs` array with one entry per song; the next button cycles through the list. Each song can have its own cover and timestamped lyrics. Set `coverSrc` to her photo (for example, `media/her-photo.jpg`); the photo is cropped to the spinning record. For example:

```js
window.BIRTHDAY_MUSIC = {
  songs: [
    {
      title: "Our Song",
      artist: "For you",
      audioSrc: "media/our-song.mp3",
      coverSrc: "media/our-photo.jpg",
      lyrics: [
        { time: 0, text: "First lyric line" },
        { time: 12, text: "Next lyric line" }
      ]
    },
    {
      title: "Another Song",
      artist: "Another Artist",
      audioSrc: "media/another-song.mp3",
      coverSrc: "media/our-photo.jpg",
      lyrics: []
    },
    {
      title: "One More Song",
      artist: "One More Artist",
      audioSrc: "media/one-more-song.mp3",
      coverSrc: "media/our-photo.jpg",
      lyrics: []
    }
  ]
};
```

Lyrics appear beside the cover whenever the player is expanded. Three lines are shown at a time, with the current line highlighted and the lyrics scrolling automatically from the timestamps in seconds. Add the lyrics and timing yourself; automatic song transcription needs a speech-to-text service, which this static site does not use. There are no public upload controls. The config and any media files added to the repository are still visible to anyone who can access a publicly deployed site.



a gift hor her