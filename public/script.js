document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const subaxBtn = document.getElementById('subaxBtn');
  const galabBtn = document.getElementById('galabBtn');
  const adhkarContainer = document.getElementById('adhkarContainer');
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsMenu = document.getElementById('settingsMenu');
  const closeSettings = document.getElementById('closeSettings');
  const overlay = document.getElementById('overlay');
  const fontSizeSelect = document.getElementById('fontSizeSelect');
  const themeSelect = document.getElementById('themeSelect');
  const languageSelect = document.getElementById('languageSelect');
  const languageModal = document.getElementById('languageModal');
  const languageSwitcher = document.getElementById('languageSwitcher');
  const currentLang = document.getElementById('currentLang');
  
  // Text elements for translation
  const textElements = {
    appTitle: document.getElementById('appTitle'),
    introText: document.getElementById('introText'),
    loadingText: document.getElementById('loadingText'),
    settingsTitle: document.getElementById('settingsTitle'),
    fontSizeLabel: document.getElementById('fontSizeLabel'),
    fontSmall: document.getElementById('fontSmall'),
    fontMedium: document.getElementById('fontMedium'),
    fontLarge: document.getElementById('fontLarge'),
    themeLabel: document.getElementById('themeLabel'),
    themeLight: document.getElementById('themeLight'),
    themeDark: document.getElementById('themeDark'),
    languageLabel: document.getElementById('languageLabel'),
    langSo: document.getElementById('langSo'),
    langEn: document.getElementById('langEn'),
    langAr: document.getElementById('langAr'),
    subaxBtn: document.getElementById('subaxBtn'),
    galabBtn: document.getElementById('galabBtn')
  };
  
  // State
  let currentTime = 'subax';
  let adhkarData = null;
  let completedDhikr = JSON.parse(localStorage.getItem('completedDhikr')) || {};
  let lastResetDate = localStorage.getItem('lastResetDate') || '';
  let currentLanguage = localStorage.getItem('language') || 'so';
  let translations = {};
  
  // Initialize app
  initializeApp();
  
  // Event Listeners
  subaxBtn.addEventListener('click', () => switchTime('subax'));
  galabBtn.addEventListener('click', () => switchTime('galab'));
  settingsBtn.addEventListener('click', openSettings);
  closeSettings.addEventListener('click', closeSettingsMenu);
  overlay.addEventListener('click', closeSettingsMenu);
  
  fontSizeSelect.addEventListener('change', function() {
    document.querySelectorAll('.dhikr-arabic').forEach(el => {
      el.style.fontSize = this.value;
    });
    localStorage.setItem('fontSize', this.value);
  });
  
  themeSelect.addEventListener('change', function() {
    if (this.value === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', this.value);
  });
  
  languageSelect.addEventListener('change', function() {
    changeLanguage(this.value);
  });
  
  languageSwitcher.addEventListener('click', function() {
    openLanguageModal();
  });
  
  // Language modal event listeners
  document.querySelectorAll('.language-option').forEach(button => {
    button.addEventListener('click', function() {
      const lang = this.getAttribute('data-lang');
      changeLanguage(lang);
      closeLanguageModal();
    });
  });
  
  // Functions
  async function initializeApp() {
    // Check if language is already set
    const languageSet = localStorage.getItem('languageSet');
    if (!languageSet) {
      openLanguageModal();
    } else {
      // Load saved language
      await loadTranslations(currentLanguage);
      applyTranslations();
    }
    
    // Load other settings and data
    loadSettings();
    fetchAdhkar();
    checkForReset();
    setInterval(checkForReset, 60000);
  }
  
  async function loadTranslations(lang) {
    try {
      const response = await fetch(`${lang}.json`);
      translations = await response.json();
      currentLanguage = lang;
      localStorage.setItem('language', lang);
      localStorage.setItem('languageSet', 'true');
    } catch (error) {
      console.error('Error loading translations:', error);
      // Fallback to Somali
      if (lang !== 'so') {
        await loadTranslations('so');
      }
    }
  }
  
  function applyTranslations() {
    // Update text elements
    if (textElements.appTitle) textElements.appTitle.textContent = translations.app.title;
    if (textElements.introText) textElements.introText.textContent = translations.content.intro;
    if (textElements.loadingText) textElements.loadingText.textContent = translations.content.loading;
    if (textElements.settingsTitle) textElements.settingsTitle.textContent = translations.settings.title;
    if (textElements.fontSizeLabel) textElements.fontSizeLabel.textContent = translations.settings.font_size;
    if (textElements.fontSmall) textElements.fontSmall.textContent = translations.settings.font_small;
    if (textElements.fontMedium) textElements.fontMedium.textContent = translations.settings.font_medium;
    if (textElements.fontLarge) textElements.fontLarge.textContent = translations.settings.font_large;
    if (textElements.themeLabel) textElements.themeLabel.textContent = translations.settings.theme;
    if (textElements.themeLight) textElements.themeLight.textContent = translations.settings.theme_light;
    if (textElements.themeDark) textElements.themeDark.textContent = translations.settings.theme_dark;
    if (textElements.languageLabel) textElements.languageLabel.textContent = translations.settings.language || 'Language';
    if (textElements.subaxBtn) textElements.subaxBtn.textContent = translations.navigation.morning;
    if (textElements.galabBtn) textElements.galabBtn.textContent = translations.navigation.evening;
    
    // Update language select options
    if (languageSelect) languageSelect.value = currentLanguage;
    
    // Update current lang display
    if (currentLang) currentLang.textContent = currentLanguage.toUpperCase();
    
    // Update HTML direction for RTL languages
    if (currentLanguage === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
    }
    
    // Update page title
    document.title = translations.app.title;
  }
  
  async function changeLanguage(lang) {
    await loadTranslations(lang);
    applyTranslations();
    renderAdhkar(currentTime); // Re-render to update counter text
  }
  
  function openLanguageModal() {
    languageModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
  
  function closeLanguageModal() {
    languageModal.style.display = 'none';
    document.body.style.overflow = '';
  }
  
  function loadSettings() {
    // Load font size
    if (localStorage.getItem('fontSize')) {
      fontSizeSelect.value = localStorage.getItem('fontSize');
      document.querySelectorAll('.dhikr-arabic').forEach(el => {
        el.style.fontSize = localStorage.getItem('fontSize');
      });
    }
    
    // Load theme
    if (localStorage.getItem('theme')) {
      themeSelect.value = localStorage.getItem('theme');
      if (localStorage.getItem('theme') === 'dark') {
        document.documentElement.classList.add('dark');
      }
    }
    
    // Load language
    if (localStorage.getItem('language')) {
      languageSelect.value = localStorage.getItem('language');
    }
  }
  
  function checkForReset() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const today = now.toDateString();
    
    // Check if it's 3:00 PM (15:00) or 4:00 AM (4:00)
    const shouldResetMorning = (currentHour === 4 && currentMinute === 0);
    const shouldResetEvening = (currentHour === 15 && currentMinute === 0);
    
    if ((shouldResetMorning || shouldResetEvening) && lastResetDate !== today) {
      resetAllCounts();
      lastResetDate = today;
      localStorage.setItem('lastResetDate', today);
    }
  }
  
  function resetAllCounts() {
    completedDhikr = {};
    localStorage.setItem('completedDhikr', JSON.stringify(completedDhikr));
    renderAdhkar(currentTime);
  }
  
  function fetchAdhkar() {
    fetch('data.json')
      .then(response => response.json())
      .then(data => {
        adhkarData = data.xuska;
        renderAdhkar(currentTime);
      })
      .catch(error => {
        console.error('Error fetching adhkar:', error);
        const errorText = translations.content.error || 'Khalad ka dhacay soo dejinta xuska. Fadlan isku day mar kale.';
        adhkarContainer.innerHTML = `<div class="loading"><p>${errorText}</p></div>`;
      });
  }
  
  function switchTime(time) {
    currentTime = time;
    
    if (time === 'subax') {
      subaxBtn.classList.add('active');
      galabBtn.classList.remove('active');
    } else {
      subaxBtn.classList.remove('active');
      galabBtn.classList.add('active');
    }
    
    renderAdhkar(time);
  }
  
  function renderAdhkar(time) {
    if (!adhkarData) return;
    
    const adhkarList = adhkarData[time];
    let html = '';
    
    adhkarList.forEach((dhikr, index) => {
      const dhikrId = `${time}-${index}`;
      const currentCount = completedDhikr[dhikrId] || 0;
      const targetCount = parseInt(dhikr.tiro) || 1;
      const isCompleted = currentCount >= targetCount;
      const resetText = translations.counter.reset || 'Dib u bilow';
      const completedText = translations.counter.completed || 'Dhamaaday';
      
      html += `
        <div class="dhikr-card" data-id="${dhikrId}">
          ${dhikr.bilow ? `<p class="dhikr-arabic">${dhikr.bilow}</p>` : ''}
          <p class="dhikr-arabic">${dhikr.duco}</p>
          <div class="counter-controls">
            <button class="counter-btn" onclick="resetCount('${dhikrId}')" title="${resetText}">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M5 18c4.667 4.667 12 1.833 12-4.042h-3l5-6 5 6h-3c-1.125 7.98-11.594 11.104-16 4.042zm14-11.984c-4.667-4.667-12-1.834-12 4.041h3l-5 6-5-6h3c1.125-7.979 11.594-11.104 16-4.041z"/></svg>
            </button>
            <div class="counter-display">${currentCount}/${targetCount}</div>
            ${isCompleted ? `<span class="completed" title="${completedText}"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></span>` : ''}
            <button class="counter-btn plus-btn" onclick="incrementCount('${dhikrId}')">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          </div>
        </div>
      `;
    });
    
    adhkarContainer.innerHTML = html;
    
    // Apply saved font settings to newly rendered elements
    if (localStorage.getItem('fontSize')) {
      document.querySelectorAll('.dhikr-arabic').forEach(el => {
        el.style.fontSize = localStorage.getItem('fontSize');
      });
    }
  }
  
  function openSettings() {
    settingsMenu.classList.add('open');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  
  function closeSettingsMenu() {
    settingsMenu.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
  
  // Make these functions available globally for the buttons in the HTML
  window.incrementCount = function(dhikrId) {
    if (!completedDhikr[dhikrId]) {
      completedDhikr[dhikrId] = 0;
    }
    
    const targetCount = parseInt(adhkarData[dhikrId.split('-')[0]][parseInt(dhikrId.split('-')[1])].tiro) || 1;
    
    if (completedDhikr[dhikrId] < targetCount) {
      completedDhikr[dhikrId]++;
      localStorage.setItem('completedDhikr', JSON.stringify(completedDhikr));
      updateCounterDisplay(dhikrId);
    }
  };
  
  window.resetCount = function(dhikrId) {
    if (completedDhikr[dhikrId] && completedDhikr[dhikrId] > 0) {
      completedDhikr[dhikrId] = 0;
      localStorage.setItem('completedDhikr', JSON.stringify(completedDhikr));
      updateCounterDisplay(dhikrId);
    }
  };
  
  function updateCounterDisplay(dhikrId) {
    const card = document.querySelector(`.dhikr-card[data-id="${dhikrId}"]`);
    if (!card) return;
    
    const currentCount = completedDhikr[dhikrId] || 0;
    const targetCount = parseInt(adhkarData[dhikrId.split('-')[0]][parseInt(dhikrId.split('-')[1])].tiro) || 1;
    const isCompleted = currentCount >= targetCount;
    
    const counterDisplay = card.querySelector('.counter-display');
    const completedSpan = card.querySelector('.completed');
    
    if (counterDisplay) {
      counterDisplay.textContent = `${currentCount}/${targetCount}`;
    }
    
    if (isCompleted) {
      if (!completedSpan) {
        const newSpan = document.createElement('span');
        newSpan.className = 'completed';
        newSpan.title = translations.counter.completed || 'Dhamaaday';
        newSpan.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        counterDisplay.insertAdjacentElement('afterend', newSpan);
        if('vibrate' in navigator) {
          navigator.vibrate([100, 30, 100, 30, 100, 30, 200, 30, 200, 30, 200, 30, 100, 30, 100, 30, 100]);
        }
      }
    } else {
      if (completedSpan) {
        completedSpan.remove();
      }
    }
  }
});

window.addEventListener('pageshow', () => {
  const time = new URLSearchParams(window.location.search).get('time');
  if(time) {
    switchTime(time)
  }
});