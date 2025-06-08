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
const volumeIcon = document.getElementById('volume-icon');
const volumeBar = document.getElementById('volume-bar');
const settingsBtn = document.getElementById('settings-btn');
const dropdownContent = document.getElementById('dropdown-content');
const downloadBtn = document.getElementById('download-btn');
const speedBtn = document.getElementById('speed-btn');
const partOfSpeechDisplay = document.getElementById('part-of-speech');
const definitionDisplay = document.getElementById('definition');
const synonymsList = document.getElementById('synonyms-list');
const antonymsList = document.getElementById('antonyms-list');
const saveBtn = document.getElementById('save-btn');
const loadHistoryBtn = document.getElementById('load-history-btn');
const historyContainer = document.getElementById('history-container');
const historyList = document.getElementById('history-list');
const clearHistoryBtn = document.getElementById('clear-history-btn');
const themeToggle = document.getElementById('theme-toggle');
const notification = document.getElementById('notification');
const closeNotification = document.getElementById('close-notification');
const dailyWordText = document.getElementById('daily-word-text');
const searchInsights = document.getElementById('search-insights');
const recentSearches = document.getElementById('recent-searches');
const gameBtn = document.getElementById('game-btn');
const gameContainer = document.getElementById('game-container');
const gameQuestionNumber = document.getElementById('game-question-number');
const gameDefinition = document.getElementById('game-definition');
const gameGuess = document.getElementById('game-guess');
const gameSubmit = document.getElementById('game-submit');
const gameFeedback = document.getElementById('game-feedback');
const gameResults = document.getElementById('game-results');
const gameResultsList = document.getElementById('game-results-list');
const playAgainBtn = document.getElementById('play-again-btn');
const toast = document.getElementById('toast');

// Audio variables
let audio = new Audio();
let isPlaying = false;
let playbackRate = 1;
let animationFrameId = null;

// Game variables
let gameState = {
    currentQuestion: 0,
    questions: [],
    userAnswers: [],
    score: 0,
    inProgress: false
};

const gameWords = [
    { word: 'dictionary', definition: 'A book or electronic resource that lists the words of a language and gives their meaning' },
    { word: 'serendipity', definition: 'The occurrence of events by chance in a happy or beneficial way' },
    { word: 'ephemeral', definition: 'Lasting for a very short time' },
    { word: 'ubiquitous', definition: 'Present, appearing, or found everywhere' },
    { word: 'eloquent', definition: 'Fluent or persuasive in speaking or writing' },
    { word: 'resilient', definition: 'Able to withstand or recover quickly from difficult conditions' },
    { word: 'ambiguous', definition: 'Open to more than one interpretation' },
    { word: 'benevolent', definition: 'Well meaning and kindly' },
    { word: 'capricious', definition: 'Given to sudden and unaccountable changes of mood or behavior' },
    { word: 'diligent', definition: 'Having or showing care and conscientiousness in one\'s work or duties' },
    { word: 'ebullient', definition: 'Full of energy and enthusiasm' },
    { word: 'fastidious', definition: 'Very attentive to and concerned about accuracy and detail' },
    { word: 'gregarious', definition: 'Fond of company; sociable' },
    { word: 'hackneyed', definition: 'Lacking significance through having been overused' },
    { word: 'iconoclast', definition: 'A person who attacks cherished beliefs or institutions' },
    { word: 'juxtapose', definition: 'To place things side by side for comparison' },
    { word: 'kaleidoscope', definition: 'A constantly changing pattern or sequence of elements' },
    { word: 'languid', definition: 'Slow, relaxed, or lacking energy' },
    { word: 'mellifluous', definition: 'Pleasant-sounding; sweet or musical' },
    { word: 'nefarious', definition: 'Wicked or criminal' }
];

// Daily word
const dailyWords = [
    { word: 'serendipity', definition: 'The occurrence of events by chance in a happy or beneficial way' },
    { word: 'ephemeral', definition: 'Lasting for a very short time' },
    { word: 'ubiquitous', definition: 'Present, appearing, or found everywhere' },
    { word: 'eloquent', definition: 'Fluent or persuasive in speaking or writing' },
    { word: 'resilient', definition: 'Able to withstand or recover quickly from difficult conditions' }
];

let recentSearchWords = [];

// Initialize with default word
window.addEventListener('DOMContentLoaded', () => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeToggle(savedTheme);
    
    // Set up default audio
    audio.src = "https://api.dictionaryapi.dev/media/pronunciations/en/dictionary-us.mp3";
    audio.load();
    
    audio.addEventListener('ended', () => {
        playIcon.className = 'fas fa-play';
        isPlaying = false;
        stopWaveAnimation();
    });
    
    // Set up event listeners
    setupEventListeners();
    
    // Load history if any exists
    loadHistory();
    
    // Show daily word notification
    showDailyWord();
    
    // Load recent searches
    loadRecentSearches();
});

function setupEventListeners() {
    searchBtn.addEventListener('click', fetchDictionaryData);
    clearBtn.addEventListener('click', clearSearch);
    searchedWordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') fetchDictionaryData();
    });
    playBtn.addEventListener('click', togglePlay);
    volumeBar.addEventListener('input', setVolume);
    settingsBtn.addEventListener('click', toggleDropdown);
    downloadBtn.addEventListener('click', downloadAudio);
    speedBtn.addEventListener('click', changePlaybackSpeed);
    saveBtn.addEventListener('click', saveToHistory);
    loadHistoryBtn.addEventListener('click', toggleHistory);
    clearHistoryBtn.addEventListener('click', clearHistory);
    themeToggle.addEventListener('click', toggleTheme);
    closeNotification.addEventListener('click', closeDailyNotification);
    gameBtn.addEventListener('click', toggleGame);
    gameSubmit.addEventListener('click', checkGameAnswer);
    gameGuess.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkGameAnswer();
    });
    playAgainBtn.addEventListener('click', startNewGame);
    
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
    updateThemeToggle(newTheme);
}

function updateThemeToggle(theme) {
    const themeText = document.querySelector('.theme-toggle-text');
    const themeIcon = document.querySelector('#theme-toggle i');
    
    if (theme === 'dark') {
        themeText.textContent = 'Light Mode';
        themeIcon.className = 'fas fa-sun';
    } else {
        themeText.textContent = 'Dark Mode';
        themeIcon.className = 'fas fa-moon';
    }
}

// Daily word notification
function showDailyWord() {
    const lastShownDate = localStorage.getItem('lastDailyWordDate');
    const today = new Date().toDateString();
    
    if (lastShownDate !== today) {
        const randomWord = dailyWords[Math.floor(Math.random() * dailyWords.length)];
        dailyWordText.innerHTML = `Today's word: <strong>${randomWord.word}</strong>`;
        notification.style.display = 'flex';
        localStorage.setItem('lastDailyWordDate', today);
        localStorage.setItem('dailyWord', randomWord.word);
    }
}

function closeDailyNotification() {
    notification.style.display = 'none';
}

// Recent searches
function loadRecentSearches() {
    recentSearchWords = JSON.parse(localStorage.getItem('recentSearches')) || ['dictionary', 'book', 'language'];
    updateRecentSearchesDisplay();
}

function updateRecentSearches() {
    const word = searchedWordDisplay.textContent.toLowerCase();
    if (!recentSearchWords.includes(word)) {
        recentSearchWords.unshift(word);
        if (recentSearchWords.length > 5) recentSearchWords.pop();
        localStorage.setItem('recentSearches', JSON.stringify(recentSearchWords));
        updateRecentSearchesDisplay();
    }
}

function updateRecentSearchesDisplay() {
    recentSearches.textContent = recentSearchWords.join(', ');
}

// Fetch dictionary data
const API_ENDPOINT = "https://ko3xb7nbeg.execute-api.us-east-1.amazonaws.com/Prod/lookup"; 

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
        
        // Updated fetch call to use your Lambda
        const response = await fetch(`${API_ENDPOINT}?word=${encodeURIComponent(word)}`);
        
        if (!response.ok) {
            throw new Error(await response.text().then(text => {
                try {
                    return JSON.parse(text).error || 'Word not found';
                } catch {
                    return 'Word not found';
                }
            }));
        }
        
        const data = await response.json();
        displayResult(data[0]);
        updateRecentSearches();
        
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
    
    // Display synonyms and antonyms
    synonymsList.innerHTML = '';
    antonymsList.innerHTML = '';
    
    if (data.meanings && data.meanings.length > 0) {
        const firstMeaning = data.meanings[0];
        
        // Display synonyms
        if (firstMeaning.synonyms && firstMeaning.synonyms.length > 0) {
            firstMeaning.synonyms.slice(0, 5).forEach(synonym => {
                const span = document.createElement('span');
                span.textContent = synonym;
                span.addEventListener('click', () => {
                    searchedWordInput.value = synonym;
                    fetchDictionaryData();
                });
                synonymsList.appendChild(span);
            });
        } else {
            synonymsList.innerHTML = '<span>No synonyms found</span>';
        }
        
        // Display antonyms
        if (firstMeaning.antonyms && firstMeaning.antonyms.length > 0) {
            firstMeaning.antonyms.slice(0, 5).forEach(antonym => {
                const span = document.createElement('span');
                span.textContent = antonym;
                span.addEventListener('click', () => {
                    searchedWordInput.value = antonym;
                    fetchDictionaryData();
                });
                antonymsList.appendChild(span);
            });
        } else {
            antonymsList.innerHTML = '<span>No antonyms found</span>';
        }
    }
    
    // Show the result and hide error
    resultDiv.style.display = 'block';
    errorDiv.style.display = 'none';
    historyContainer.style.display = 'none';
    gameContainer.style.display = 'none';
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

function setVolume() {
    audio.volume = volumeBar.value;
    if (volumeBar.value == 0) {
        volumeIcon.className = 'fas fa-volume-mute';
    } else {
        volumeIcon.className = 'fas fa-volume-up';
    }
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
        if (history.length > 20) history.pop();
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
        gameContainer.style.display = 'none';
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

// Word Game functions
function toggleGame() {
    if (gameContainer.style.display === 'block') {
        gameContainer.style.display = 'none';
        gameBtn.innerHTML = '<i class="fas fa-gamepad"></i> Word Game';
        gameState.inProgress = false;
    } else {
        startNewGame();
        gameContainer.style.display = 'block';
        gameBtn.innerHTML = '<i class="fas fa-gamepad"></i> Hide Game';
        historyContainer.style.display = 'none';
        loadHistoryBtn.innerHTML = '<i class="fas fa-history"></i> Show History';
    }
}

function startNewGame() {
    // Reset game state
    gameState = {
        currentQuestion: 0,
        questions: [],
        userAnswers: [],
        score: 0,
        inProgress: true
    };

    // Select 10 random questions without duplicates
    const shuffled = [...gameWords].sort(() => 0.5 - Math.random());
    gameState.questions = shuffled.slice(0, 10);
    
    // Reset UI elements
    gameResults.style.display = 'none';
    gameGuess.style.display = 'block';
    gameSubmit.style.display = 'block';
    gameFeedback.style.display = 'block';
    gameFeedback.textContent = '';
    gameGuess.value = '';
    
    // Setup first question
    setupGameQuestion();
}

function setupGameQuestion() {
    if (gameState.currentQuestion >= gameState.questions.length) {
        endGame();
        return;
    }

    const current = gameState.questions[gameState.currentQuestion];
    gameQuestionNumber.textContent = gameState.currentQuestion + 1;
    gameDefinition.textContent = current.definition;
    gameGuess.value = '';
    gameFeedback.textContent = '';
    gameFeedback.style.color = '';
    gameSubmit.disabled = false;
}

function checkGameAnswer() {
    const userGuess = gameGuess.value.trim().toLowerCase();
    const correctAnswer = gameState.questions[gameState.currentQuestion].word.toLowerCase();
    
    if (!userGuess) {
        gameFeedback.textContent = 'Please enter your guess';
        gameFeedback.style.color = 'var(--error-color)';
        return;
    }
    
    // Store the user's answer
    const isCorrect = userGuess === correctAnswer;
    gameState.userAnswers.push({
        question: gameState.questions[gameState.currentQuestion],
        userAnswer: userGuess,
        isCorrect: isCorrect
    });
    
    if (isCorrect) {
        gameState.score++;
        gameFeedback.textContent = 'Correct!';
        gameFeedback.style.color = 'var(--notification-color)';
    } else {
        gameFeedback.textContent = 'Incorrect! Try the next question.';
        gameFeedback.style.color = 'var(--error-color)';
    }
    
    gameSubmit.disabled = true;
    
    // Move to next question after a short delay
    setTimeout(() => {
        gameState.currentQuestion++;
        if (gameState.currentQuestion < gameState.questions.length) {
            setupGameQuestion();
        } else {
            endGame();
        }
    }, 1500);
}

function endGame() {
    gameState.inProgress = false;
    
    // Generate results HTML
    let resultsHTML = `<div class="game-score">Your score: <span>${gameState.score}/${gameState.questions.length}</span></div>`;
    
    gameState.userAnswers.forEach((answer, index) => {
        resultsHTML += `
            <div class="game-result-item ${answer.isCorrect ? 'correct' : 'incorrect'}">
                <p><strong>Question ${index + 1}:</strong> ${answer.question.definition}</p>
                <p><strong>Your answer:</strong> ${answer.userAnswer}</p>
                <p><strong>Correct answer:</strong> ${answer.question.word}</p>
                ${answer.isCorrect ? 
                    '<p class="result-correct"><i class="fas fa-check"></i> Correct</p>' : 
                    '<p class="result-incorrect"><i class="fas fa-times"></i> Incorrect</p>'}
            </div>
        `;
    });
    
    gameResultsList.innerHTML = resultsHTML;
    
    // Show results and hide question elements
    gameDefinition.style.display = 'none';
    gameGuess.style.display = 'none';
    gameSubmit.style.display = 'none';
    gameFeedback.style.display = 'none';
    gameResults.style.display = 'block';
}

// Toast notification
function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Error handling
function showError(message) {
    errorDiv.style.display = 'flex';
    document.getElementById('error-text').textContent = message;
    resultDiv.style.display = 'none';
    historyContainer.style.display = 'none';
    gameContainer.style.display = 'none';
}