
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
let currentsongindex= -1;
const nextbutton =document.getElementById("next-button");
const prevbutton = document.getElementById("previous-button");
nextbutton.addEventListener("click", () => {
    if (songs.length === 0) return;

    currentsongindex = (currentsongindex + 1) % songs.length;
    playSong(currentsongindex);
});
prevbutton.addEventListener("click", () => {
    if (songs.length === 0) return;

    currentsongindex = (currentsongindex - 1 + songs.length) % songs.length;
    playSong(currentsongindex);
});

// Open Pixl's music database
const databasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open("PixlMP3Library", 1);

    request.onupgradeneeded = function () {
        const db = request.result;

        db.createObjectStore("songs", {
            keyPath: "id",
            autoIncrement: true
        });
    };

    request.onsuccess = function () {
        resolve(request.result);
    };

    request.onerror = function () {
        reject(request.error);
    };
});

/// Save a song to Pixl's library
async function saveSong(file) {
    const db = await databasePromise;

    return new Promise((resolve, reject) => {
        const transaction = db.transaction("songs", "readwrite");

        transaction.objectStore("songs").add({
            name: file.name,
            file: file
        });

        transaction.oncomplete = resolve;
        transaction.onerror = () => reject(transaction.error);
    });
}

// Load saved songs from the database
async function loadSongs() {
    const db = await databasePromise;

    return new Promise((resolve, reject) => {
        const transaction = db.transaction("songs", "readonly");
        const request = transaction.objectStore("songs").getAll();

        request.onsuccess = function () {
            songs = request.result;
            displaySongs();
            resolve();
        };

        request.onerror = () => reject(request.error);
    });
}

// Upload multiple songs
uploadInput.addEventListener("change", async function () {
    const files = Array.from(uploadInput.files);

    for (const file of files) {
        if (!file.type.startsWith("audio/")) {
            alert(file.name + " is not an audio file.");
            continue;
        }

        try {
            await saveSong(file);
        } catch (error) {
            console.error("Save error:", error);
            alert("Couldn't save " + file.name);
        }
    }

    await loadSongs();
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

    if (!song) return;
    currentsongindex = index;

    if (currentAudioURL) {
        URL.revokeObjectURL(currentAudioURL);
    }

    currentAudioURL = URL.createObjectURL(song.file);

    audioPlayer.src = currentAudioURL;
    currentSong.textContent = song.name;

    try {
        await audioPlayer.play();
    } catch (error) {
        console.error("Playback error:", error);
        alert("Pixl couldn't play this file. Try another MP3 file.");
    }
}

// PLAY / PAUSE BUTTON
const playPauseButton = document.getElementById("play-pause-button");

playPauseButton.textContent = "▶ PLAY";

playPauseButton.addEventListener("click", async function () {
    if (!audioPlayer.src) {
        alert("Please select a song first!");
        return;
    }

    if (audioPlayer.paused) {
        try {
            await audioPlayer.play();
        } catch (error) {
            console.error("Playback error:", error);
        }
    } else {
        audioPlayer.pause();
    }
});

audioPlayer.addEventListener("play", function () {
    playPauseButton.textContent = "⏸ PAUSE";
});

audioPlayer.addEventListener("pause", function () {
    playPauseButton.textContent = "▶ PLAY";
});

// Load saved music when Pixl starts
loadSongs();
