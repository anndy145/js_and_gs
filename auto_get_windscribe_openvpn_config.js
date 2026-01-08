(async () => {
    // === 設定區 ===
    const TARGET_PROTOCOL = "tcp";   // 選項：udp, tcp
    const TARGET_PORT = "54783";     // 你指定的 Port
    const DOWNLOAD_DELAY = 1000;     // 每次下載間隔 (1秒)
    // =============

    const locSelect = document.getElementById('openvpn-location');
    const protoSelect = document.getElementById('openvpn-protocol');
    const portSelect = document.getElementById('openvpn-port');
    const downloadBtn = document.getElementById('openvpn-download');

    if (!locSelect || !protoSelect || !portSelect || !downloadBtn) {
        console.error("找不到必要的元素，請確保你目前在 'Config Generator' 的 'OpenVPN' 分頁。");
        return;
    }

    // 取得所有具有 value 的地點選項 (排除提示字串)
    const options = Array.from(locSelect.options).filter(opt => opt.value !== "");

    console.log(`開始 OpenVPN 下載任務，地點總數：${options.length}`);

    for (const option of options) {
        try {
            // 1. 選擇地點
            locSelect.value = option.value;
            locSelect.dispatchEvent(new Event('change', { bubbles: true }));

            // 2. 選擇 Protocol (TCP)
            protoSelect.value = TARGET_PROTOCOL;
            protoSelect.dispatchEvent(new Event('change', { bubbles: true }));

            // 3. 選擇 Port (54783)
            portSelect.value = TARGET_PORT;
            portSelect.dispatchEvent(new Event('change', { bubbles: true }));

            console.log(`正在下載: ${option.text} (TCP:${TARGET_PORT})`);

            // 4. 點擊下載按鈕
            downloadBtn.click();

            // 5. 等待延遲
            await new Promise(resolve => setTimeout(resolve, DOWNLOAD_DELAY));
        } catch (err) {
            console.error(`處理 ${option.text} 時出錯:`, err);
        }
    }

    console.log("所有下載請求已發送完畢！");
})();