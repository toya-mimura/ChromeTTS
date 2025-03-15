chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "readSelectedText",
    title: chrome.i18n.getMessage("contextMenuTitle"),
    contexts: ["selection"]
  });

  // デフォルト設定を保存
  chrome.storage.sync.set({
    ttsMode: "builtin", // "builtin" または "webapi"
    webApiUrl: "https://api.example.com/tts", // 外部APIのURL
    webApiKey: "", // APIキー
    voice: "default",
    rate: 1.0,
    pitch: 1.0,
    language: chrome.i18n.getUILanguage(), // ブラウザのUI言語を取得
    japaneseRate: 1.7, // 日本語読み上げ速度
    englishRate: 1.0,  // 英語読み上げ速度
    defaultRate: 1.0,  // その他の言語読み上げ速度
    japaneseVoice: "default", // 日本語用音声
    englishVoice: "default"   // 英語用音声
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "readSelectedText") {
    const selectedText = info.selectionText;
    
    chrome.storage.sync.get([
      "ttsMode", "webApiUrl", "webApiKey", "voice", "rate", "pitch",
      "japaneseRate", "englishRate", "defaultRate",
      "japaneseVoice", "englishVoice" // 言語ごとの音声設定を追加
    ], (settings) => {
      if (settings.ttsMode === "builtin") {
        // テキストの言語を検出して適切な速度と音声を設定
        let detectedRate = settings.rate; // デフォルト速度
        let detectedVoice = settings.voice; // デフォルト音声
        
        // 簡易的な言語検出
        const hasJapanese = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf]/.test(selectedText);
        const hasEnglish = /[a-zA-Z]/.test(selectedText);
        
        if (hasJapanese && !hasEnglish) {
          detectedRate = settings.japaneseRate || 1.7;
          detectedVoice = settings.japaneseVoice || settings.voice; // 日本語音声があれば使用
        } else if (hasEnglish && !hasJapanese) {
          detectedRate = settings.englishRate || 1.0;
          detectedVoice = settings.englishVoice || settings.voice; // 英語音声があれば使用
        } else {
          detectedRate = settings.defaultRate || 1.0;
        }
        
        // 「default」が選択されている場合は音声を自動選択
        // それ以外の場合は明示的に選択された音声を優先
        const voiceToUse = settings.voice === "default" ? detectedVoice : settings.voice;
        
        // 内蔵TTSを使用
        chrome.tts.speak(selectedText, {
          rate: detectedRate,
          pitch: settings.pitch,
          voiceName: voiceToUse !== "default" ? voiceToUse : undefined,
          onEvent: function(event) {
            console.log('TTS Event:', event.type);
          }
        });
      } else {
        // 外部APIにメッセージを送信（既存と同様）
        chrome.tabs.sendMessage(tab.id, {
          action: "readText",
          text: selectedText,
          settings: settings
        });
      }
    });
  }
});