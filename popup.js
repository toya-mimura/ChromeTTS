document.addEventListener('DOMContentLoaded', () => {
  // HTML要素にローカライズされたテキストを適用する関数
  function localizeHtmlPage() {
    const elements = document.querySelectorAll('[data-i18n]');
    for (const element of elements) {
      const key = element.getAttribute('data-i18n');
      element.textContent = chrome.i18n.getMessage(key);
    }
    
    // ボタンなどの特定要素
    document.getElementById("saveBtn").textContent = chrome.i18n.getMessage("saveButton");
    document.getElementById("testBtn").textContent = chrome.i18n.getMessage("testButton");
    
    // プレースホルダーなどの他の属性
    // document.getElementById("someInput").placeholder = chrome.i18n.getMessage("somePlaceholder");
  }

  // 設定を読み込み
  chrome.storage.sync.get([
    "ttsMode", "webApiUrl", "webApiKey", "voice", "rate", "pitch", "language",
    "japaneseRate", "englishRate", "defaultRate",
    "japaneseVoice", "englishVoice"
  ], (settings) => {
    // 既存の設定
    document.getElementById("ttsMode").value = settings.ttsMode;
    document.getElementById("webApiUrl").value = settings.webApiUrl;
    document.getElementById("webApiKey").value = settings.webApiKey;
    document.getElementById("rate").value = settings.rate;
    document.getElementById("pitch").value = settings.pitch;
    document.getElementById("rateValue").textContent = settings.rate;
    document.getElementById("pitchValue").textContent = settings.pitch;
    
    // 言語ごとの速度設定
    if (settings.japaneseRate) {
      document.getElementById("japaneseRate").value = settings.japaneseRate;
      document.getElementById("japaneseRateValue").textContent = settings.japaneseRate;
    }
    
    if (settings.englishRate) {
      document.getElementById("englishRate").value = settings.englishRate;
      document.getElementById("englishRateValue").textContent = settings.englishRate;
    }
    
    if (settings.defaultRate) {
      document.getElementById("defaultRate").value = settings.defaultRate;
      document.getElementById("defaultRateValue").textContent = settings.defaultRate;
    }

    if (settings.japaneseVoice) {
      document.getElementById("japaneseVoice").value = settings.japaneseVoice;
    }
    
    if (settings.englishVoice) {
      document.getElementById("englishVoice").value = settings.englishVoice;
    }
    
    // 言語設定
    if (settings.language) {
      document.getElementById("language").value = settings.language;
    }

    // ページのローカライズ
    localizeHtmlPage();

    // モードに応じて表示/非表示を切り替え
    toggleApiSettings(settings.ttsMode);
    
    // 利用可能な音声をロード
  if (chrome.tts) {
    chrome.tts.getVoices((voices) => {
      const voiceSelect = document.getElementById("voice");
      const jpVoiceSelect = document.getElementById("japaneseVoice");
      const enVoiceSelect = document.getElementById("englishVoice");
      
      // 既存のオプションをクリア（デフォルトは残す）
      while (voiceSelect.options.length > 1) {
        voiceSelect.remove(1);
      }
      while (jpVoiceSelect.options.length > 1) {
        jpVoiceSelect.remove(1);
      }
      while (enVoiceSelect.options.length > 1) {
        enVoiceSelect.remove(1);
      }
      
      // 音声オプションを追加
      voices.forEach(voice => {
        // メイン音声セレクト
        const option1 = document.createElement("option");
        option1.value = voice.voiceName;
        option1.textContent = `${voice.voiceName} (${voice.lang})`;
        voiceSelect.appendChild(option1);
        
        // 日本語音声セレクト（日本語らしき音声は別途マーク）
        const option2 = document.createElement("option");
        option2.value = voice.voiceName;
        option2.textContent = `${voice.voiceName} (${voice.lang})`;
        if (voice.lang && (voice.lang.startsWith('ja') || voice.lang.includes('Japanese'))) {
          option2.textContent = `⭐ ${option2.textContent}`;
        }
        jpVoiceSelect.appendChild(option2);
        
        // 英語音声セレクト（英語らしき音声は別途マーク）
        const option3 = document.createElement("option");
        option3.value = voice.voiceName;
        option3.textContent = `${voice.voiceName} (${voice.lang})`;
        if (voice.lang && (voice.lang.startsWith('en') || voice.lang.includes('English'))) {
          option3.textContent = `⭐ ${option3.textContent}`;
        }
        enVoiceSelect.appendChild(option3);
      });
      
      // 保存された音声を選択
      if (settings.voice !== "default") {
        voiceSelect.value = settings.voice;
      }
      if (settings.japaneseVoice !== "default") {
        jpVoiceSelect.value = settings.japaneseVoice;
      }
      if (settings.englishVoice !== "default") {
        enVoiceSelect.value = settings.englishVoice;
      }
    });
  }
});
  
  // TTSモード変更時の動作
  document.getElementById("ttsMode").addEventListener("change", (e) => {
    toggleApiSettings(e.target.value);
  });
  
  // スライダー値の表示を更新
  document.getElementById("rate").addEventListener("input", (e) => {
    document.getElementById("rateValue").textContent = e.target.value;
  });
  
  document.getElementById("pitch").addEventListener("input", (e) => {
    document.getElementById("pitchValue").textContent = e.target.value;
  });
  
  // 言語速度のスライダー値の表示を更新
  document.getElementById("japaneseRate").addEventListener("input", (e) => {
    document.getElementById("japaneseRateValue").textContent = e.target.value;
  });
  
  document.getElementById("englishRate").addEventListener("input", (e) => {
    document.getElementById("englishRateValue").textContent = e.target.value;
  });
  
  document.getElementById("defaultRate").addEventListener("input", (e) => {
    document.getElementById("defaultRateValue").textContent = e.target.value;
  });
  
  // 保存ボタン
  document.getElementById("saveBtn").addEventListener("click", () => {
    const settings = {
      ttsMode: document.getElementById("ttsMode").value,
      webApiUrl: document.getElementById("webApiUrl").value,
      webApiKey: document.getElementById("webApiKey").value,
      voice: document.getElementById("voice").value,
      rate: parseFloat(document.getElementById("rate").value),
      pitch: parseFloat(document.getElementById("pitch").value),
      language: document.getElementById("language").value,
      // 言語ごとの速度を追加
      japaneseRate: parseFloat(document.getElementById("japaneseRate").value),
      englishRate: parseFloat(document.getElementById("englishRate").value),
      defaultRate: parseFloat(document.getElementById("defaultRate").value),
      japaneseVoice: document.getElementById("japaneseVoice").value,
      englishVoice: document.getElementById("englishVoice").value
    };
    
    chrome.storage.sync.set(settings, () => {
      alert(chrome.i18n.getMessage("settingsSaved"));
    });
  });
  
  // テストボタン
  document.getElementById("testBtn").addEventListener("click", () => {
    const testText = chrome.i18n.getMessage("testMessage");
    const settings = {
      ttsMode: document.getElementById("ttsMode").value,
      webApiUrl: document.getElementById("webApiUrl").value,
      webApiKey: document.getElementById("webApiKey").value,
      voice: document.getElementById("voice").value,
      rate: parseFloat(document.getElementById("rate").value),
      pitch: parseFloat(document.getElementById("pitch").value)
    };
    
    if (settings.ttsMode === "builtin") {
      chrome.tts.speak(testText, {
        rate: settings.rate,
        pitch: settings.pitch,
        voiceName: settings.voice !== "default" ? settings.voice : undefined
      });
    } else {
      // この例では簡単にするため、外部APIテストは省略
      alert(chrome.i18n.getMessage("apiTestNotAvailable"));
    }
  });
  
  // 設定の表示/非表示を切り替える関数
  function toggleApiSettings(mode) {
    if (mode === "webapi") {
      document.getElementById("apiSettings").style.display = "block";
      document.getElementById("builtinSettings").style.display = "none";
    } else {
      document.getElementById("apiSettings").style.display = "none";
      document.getElementById("builtinSettings").style.display = "block";
    }
  }
});