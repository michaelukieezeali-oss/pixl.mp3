
const uploadInput = document.getElementById("music-upload");
const songList = document.getElementById("song-list");
const audioPlayer = document.getElementById("audio-player");
const progressBar = document.getElementById("progress-bar");
const currentTimeDisplay = document.getElementById("current-time");
const durationDisplay = document.getElementById("duration");
const currentSong = document.getElementById("current-song");

// Format seconds into minutes and seconds
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${minutes}:${String(secs).padStart(2, "0")}`;
}


// Update progress as music plays
audioPlayer.addEventListener("timeupdate", () => {
    if (!audioPlayer.duration) return;

    progressBar.value =
        (audioPlayer.currentTime / audioPlayer.duration) * 100;

    currentTimeDisplay.textContent =
        formatTime(audioPlayer.currentTime);
});

// Display total song duration
audioPlayer.addEventListener("loadedmetadata", () => {
    durationDisplay.textContent =
        formatTime(audioPlayer.duration);
});

// Allow users to seek through a song
progressBar.addEventListener("input", () => {
    if (!audioPlayer.duration) return;

    audioPlayer.currentTime =
        (progressBar.value / 100) * audioPlayer.duration;
});


let songs = [];
let currentAudioURL = null;

// Upload music
uploadInput.addEventListener("change", function () {

    const files = Array.from(uploadInput.files);

    files.forEach(function(file) {

        if (!file.type.startsWith("audio/")) {
            alert(file.name + " is not an audio file.");
            return;
        }

        songs.push(file);
    });

    displaySongs();
    uploadInput.value = "";
});

// Display uploaded songs
function displaySongs() {

    songList.innerHTML = "";

    if (songs.length === 0) {
        songList.textContent = "No music uploaded yet.";
        return;
    }

    songs.forEach(function(song, index) {

        const songElement = document.createElement("div");
        songElement.className = "song-item";

        const name = document.createElement("span");
        name.textContent = "♫ " + song.name;

        const playButton = document.createElement("button");
        playButton.textContent = "PLAY";

        playButton.addEventListener("click", function() {
            playSong(index);
        });

        songElement.appendChild(name);
        songElement.appendChild(playButton);

        songList.appendChild(songElement);
    });
}

// Play selected music
async function playSong(index) {

    const song = songs[index];

    if (currentAudioURL) {
        URL.revokeObjectURL(currentAudioURL);
    }

    currentAudioURL = URL.createObjectURL(song);

    audioPlayer.src = currentAudioURL;
    currentSong.textContent = song.name;

    try {
        await audioPlayer.play();
    } catch (error) {
        console.error("Playback error:", error);
        alert("Pixl couldn't play this file. Try another MP3 file.");
    }
}
