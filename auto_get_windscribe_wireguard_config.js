(async () => {
    // === 使用者設定區 ===
    const TARGET_PORT = "65142"; // 請在此處替換成你的公鑰值
    const TARGET_PUB_KEY = "YOUR_PUBLIC_KEY_HERE"; 
    const DOWNLOAD_DELAY = 1000; // 下載間隔 (毫秒)
    // =================

    const locationSelect = document.getElementById('location');
    const portSelect = document.getElementById('port');
    const pubKeySelect = document.getElementById('pub_key');
    const downloadBtn = document.getElementById('get_config');

    // 取得所有具有 value 的選項 (排除標題 "Location")
    const options = Array.from(locationSelect.options).filter(opt => opt.value && opt.value !== "Location");

    console.log(`開始下載任務，總計地點：${options.length}`);

    for (const option of options) {
        try {
            // 1. 設定 Location
            locationSelect.value = option.value;
            locationSelect.dispatchEvent(new Event('change', { bubbles: true }));

            // 2. 設定 Port
            portSelect.value = TARGET_PORT;
            portSelect.dispatchEvent(new Event('change', { bubbles: true }));

            // 3. 設定 Public Key
            pubKeySelect.value = TARGET_PUB_KEY;
            pubKeySelect.dispatchEvent(new Event('change', { bubbles: true }));

            console.log(`正在處理: ${option.text}`);

            // 4. 觸發點擊
            downloadBtn.click();

            // 5. 等待一段時間，避免瀏覽器崩潰
            await new Promise(resolve => setTimeout(resolve, DOWNLOAD_DELAY));
        } catch (err) {
            console.error(`處理 ${option.text} 時發生錯誤:`, err);
        }
    }

    console.log("任務執行完畢！");
})();