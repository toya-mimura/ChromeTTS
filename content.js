chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "readText" && request.settings.ttsMode === "webapi") {
    // テキストの言語を検出して適切な速度を設定
    let detectedRate = request.settings.rate; // デフォルト速度
    
    // 簡易的な言語検出（より高度な検出方法も検討可能）
    const hasJapanese = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf]/.test(request.text);
    const hasEnglish = /[a-zA-Z]/.test(request.text);
    
    if (hasJapanese && !hasEnglish) {
      detectedRate = request.settings.japaneseRate || 1.7;
    } else if (hasEnglish && !hasJapanese) {
      detectedRate = request.settings.englishRate || 1.0;
    } else {
      detectedRate = request.settings.defaultRate || 1.0;
    }
    
    // 外部WebAPIを使用してテキストを読み上げる
    fetch(request.settings.webApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${request.settings.webApiKey}`
      },
      body: JSON.stringify({
        text: request.text,
        voice: request.settings.voice,
        rate: detectedRate, // 検出した言語に基づく速度を使用
        pitch: request.settings.pitch
      })
    })
    .then(response => response.blob())
    .then(audioBlob => {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
      
      // 音声再生が終了したらURLを解放
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };
    })
    .catch(error => {
      console.error('外部API呼び出しエラー:', error);
      // エラー時は内蔵TTSにフォールバック
      
      // 内蔵TTSも言語に応じた速度設定を使用
      chrome.tts.speak(request.text, {
        rate: detectedRate,
        pitch: request.settings.pitch,
        voiceName: request.settings.voice !== "default" ? request.settings.voice : undefined
      });
    });
    
    return true; // 非同期レスポンスを示す
  }
});