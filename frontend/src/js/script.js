// DOM Elements
const searchBtn = document.getElementById('search-btn');
const clearBtn = document.getElementById('clear-btn');
const searchedWordInput = document.getElementById('searchedWord');
const resultDiv = document.getElementById('result');
const errorDiv = document.getElementById('error-message');
const searchedWordDisplay = document.getElementById('searched-word');
const phoneticDisplay = document.getElementById('phonetic');
const audioPlayer = document.getElementById('audio-player');
const playBtn = document.getElementById('play-btn');
const playIcon = document.getElementById('play-icon');
const waveAnimation = document.getElementById('wave-animation');
const waveBars = document.querySelectorAll('.wave-bar');
const progressBar = document.getElementById('progress-bar');
const currentTimeDisplay = document.getElementById('current-time');
const durationDisplay = document.getElementById('duration');
const volumeIcon = document.getElementById('volume-icon');
const volumeBar = document.getElementById('volume-bar');
const settingsBtn = document.getElementById('settings-btn');
const dropdownContent = document.getElementById('dropdown-content');
const downloadBtn = document.getElementById('download-btn');
const speedBtn = document.getElementById('speed-btn');
const partOfSpeechDisplay = document.getElementById('part-of-speech');
const definitionDisplay = document.getElementById('definition');
const saveBtn = document.getElementById('save-btn');
const loadHistoryBtn = document.getElementById('load-history-btn');
const historyContainer = document.getElementById('history-container');
const historyList = document.getElementById('history-list');
const clearHistoryBtn = document.getElementById('clear-history-btn');
const themeToggle = document.getElementById('theme-toggle');

// Audio variables
let audio = new Audio();
let isPlaying = false;
let playbackRate = 1;
let animationFrameId = null;

// Initialize with default word
window.addEventListener('DOMContentLoaded', () => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeToggleIcon(savedTheme);
    
    // Set up default audio
    audio.src = "https://api.dictionaryapi.dev/media/pronunciations/en/dictionary-us.mp3";
    audio.load();
    
    audio.addEventListener('loadedmetadata', () => {
        durationDisplay.textContent = formatTime(audio.duration);
        progressBar.max = audio.duration;
    });
    
    audio.addEventListener('timeupdate', () => {
        currentTimeDisplay.textContent = formatTime(audio.currentTime);
        progressBar.value = audio.currentTime;
    });
    
    audio.addEventListener('ended', () => {
        playIcon.className = 'fas fa-play';
        isPlaying = false;
        stopWaveAnimation();
    });
    
    // Set up event listeners
    setupEventListeners();
    
    // Load history if any exists
    loadHistory();
});

function setupEventListeners() {
    searchBtn.addEventListener('click', fetchDictionaryData);
    clearBtn.addEventListener('click', clearSearch);
    searchedWordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') fetchDictionaryData();
    });
    playBtn.addEventListener('click', togglePlay);
    progressBar.addEventListener('input', setProgress);
    volumeBar.addEventListener('input', setVolume);
    settingsBtn.addEventListener('click', toggleDropdown);
    downloadBtn.addEventListener('click', downloadAudio);
    speedBtn.addEventListener('click', changePlaybackSpeed);
    saveBtn.addEventListener('click', saveToHistory);
    loadHistoryBtn.addEventListener('click', toggleHistory);
    clearHistoryBtn.addEventListener('click', clearHistory);
    themeToggle.addEventListener('click', toggleTheme);
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.matches('.settings-btn') && !e.target.matches('.settings-btn *')) {
            dropdownContent.classList.remove('show');
        }
    });
}

// Theme functions
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeToggleIcon(newTheme);
}

function updateThemeToggleIcon(theme) {
    const icon = theme === 'dark' ? 'fa-sun' : 'fa-moon';
    themeToggle.innerHTML = `<i class="fas ${icon}"></i>`;
}

// Fetch dictionary data
async function fetchDictionaryData() {
    const word = searchedWordInput.value.trim();
    
    if (!word) {
        showError('Please enter a word to search');
        return;
    }
    
    try {
        // Show loading state
        searchBtn.disabled = true;
        searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching...';
        
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        
        if (!response.ok) {
            throw new Error(await response.text().then(text => {
                try {
                    return JSON.parse(text).message || 'Word not found';
                } catch {
                    return 'Word not found';
                }
            }));
        }
        
        const data = await response.json();
        displayResult(data[0]);
        
    } catch (error) {
        showError(typeof error === 'string' ? error : error.message);
        console.error('Error:', error);
    } finally {
        searchBtn.disabled = false;
        searchBtn.innerHTML = '<i class="fas fa-search"></i> Search';
    }
}

// Display results
function displayResult(data) {
    // Display word and phonetic
    searchedWordDisplay.textContent = data.word;
    phoneticDisplay.textContent = data.phonetic || 
                                (data.phonetics.find(p => p.text)?.text || 
                                'Pronunciation not available');
    
    // Set up audio player
    const audioSrc = data.phonetics.find(p => p.audio)?.audio;
    if (audioSrc) {
        audio.src = audioSrc;
        audio.load();
        audioPlayer.style.display = 'flex';
        
        audio.addEventListener('loadedmetadata', () => {
            durationDisplay.textContent = formatTime(audio.duration);
            progressBar.max = audio.duration;
        });
        
        downloadBtn.style.display = 'block';
    } else {
        audioPlayer.style.display = 'none';
        downloadBtn.style.display = 'none';
    }
    
    // Display part of speech and definition
    if (data.meanings && data.meanings.length > 0) {
        const firstMeaning = data.meanings[0];
        partOfSpeechDisplay.textContent = firstMeaning.partOfSpeech;
        
        if (firstMeaning.definitions && firstMeaning.definitions.length > 0) {
            definitionDisplay.textContent = firstMeaning.definitions[0].definition;
        } else {
            definitionDisplay.textContent = 'No definition available';
        }
    }
    
    // Show the result and hide error
    resultDiv.style.display = 'block';
    errorDiv.style.display = 'none';
    historyContainer.style.display = 'none';
}

// Audio player functions
function togglePlay() {
    if (isPlaying) {
        audio.pause();
        playIcon.className = 'fas fa-play';
        stopWaveAnimation();
    } else {
        audio.play();
        playIcon.className = 'fas fa-pause';
        startWaveAnimation();
    }
    isPlaying = !isPlaying;
}

function startWaveAnimation() {
    let lastTime = 0;
    const animate = (time) => {
        if (time - lastTime > 100) {
            waveBars.forEach((bar, index) => {
                const randomHeight = Math.random() * 20 + 5;
                bar.style.height = `${randomHeight}px`;
                bar.style.animation = `wave ${Math.random() * 0.5 + 0.3}s infinite alternate`;
                bar.style.animationDelay = `${index * 0.1}s`;
            });
            lastTime = time;
        }
        animationFrameId = requestAnimationFrame(animate);
    };
    animationFrameId = requestAnimationFrame(animate);
}

function stopWaveAnimation() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    waveBars.forEach(bar => {
        bar.style.height = '10px';
        bar.style.animation = 'none';
    });
}

function setProgress() {
    audio.currentTime = progressBar.value;
    currentTimeDisplay.textContent = formatTime(audio.currentTime);
}

function setVolume() {
    audio.volume = volumeBar.value;
    if (volumeBar.value == 0) {
        volumeIcon.className = 'fas fa-volume-mute';
    } else {
        volumeIcon.className = 'fas fa-volume-up';
    }
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

// Dropdown functions
function toggleDropdown() {
    dropdownContent.classList.toggle('show');
}

function downloadAudio() {
    if (audio.src) {
        const link = document.createElement('a');
        link.href = audio.src;
        link.download = `${searchedWordDisplay.textContent}.mp3`;
        link.click();
    }
}

function changePlaybackSpeed() {
    playbackRate = playbackRate === 1 ? 1.5 : playbackRate === 1.5 ? 2 : 0.5;
    audio.playbackRate = playbackRate;
    speedBtn.textContent = `Playback Speed: ${playbackRate}x`;
}

// History functions
function saveToHistory() {
    const word = searchedWordDisplay.textContent;
    if (!word) return;
    
    let history = JSON.parse(localStorage.getItem('dictionaryHistory')) || [];
    
    if (!history.includes(word.toLowerCase())) {
        history.unshift(word.toLowerCase());
        if (history.length > 20) history.pop(); // Limit to 20 items
        localStorage.setItem('dictionaryHistory', JSON.stringify(history));
        showToast('Word saved to history!');
        loadHistory();
    } else {
        showToast('Word already in history!');
    }
}

function loadHistory() {
    const history = JSON.parse(localStorage.getItem('dictionaryHistory')) || [];
    historyList.innerHTML = '';
    
    if (history.length === 0) {
        historyList.innerHTML = '<p>No saved words yet.</p>';
        return;
    }
    
    history.forEach(word => {
        const wordBtn = document.createElement('button');
        wordBtn.textContent = word;
        wordBtn.addEventListener('click', () => {
            searchedWordInput.value = word;
            fetchDictionaryData();
        });
        historyList.appendChild(wordBtn);
    });
}

function toggleHistory() {
    if (historyContainer.style.display === 'block') {
        historyContainer.style.display = 'none';
        loadHistoryBtn.innerHTML = '<i class="fas fa-history"></i> Show History';
    } else {
        historyContainer.style.display = 'block';
        loadHistoryBtn.innerHTML = '<i class="fas fa-history"></i> Hide History';
        loadHistory();
    }
}

function clearHistory() {
    localStorage.removeItem('dictionaryHistory');
    loadHistory();
    showToast('History cleared!');
}

function clearSearch() {
    searchedWordInput.value = '';
    searchedWordInput.focus();
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Error handling
function showError(message) {
    errorDiv.style.display = 'flex';
    document.getElementById('error-text').textContent = message;
    resultDiv.style.display = 'none';
    historyContainer.style.display = 'none';
}