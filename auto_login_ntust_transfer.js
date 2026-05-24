// ==UserScript==
// @name         台科大招生系統自動填入登入資料
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  支援自動填寫與驗證後自動登入，帳密儲存於本地擴充空間
// @match        https://entrance.ntust.edu.tw/15entryR4/Login.aspx*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_registerMenuCommand
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // ========== 帳密管理功能 ==========
    GM_registerMenuCommand("更新/設定 登入資料", () => {
        const u = prompt("請輸入您的身分證字號：", GM_getValue("ntust_idNo", ""));
        const p = prompt("請輸入您的密碼：", "");
        if (u !== null && p !== null) {
            GM_setValue("ntust_idNo", u);
            GM_setValue("ntust_pass", p);
            alert("登入資料已安全儲存，頁面即將重新整理！");
            location.reload();
        }
    });

    GM_registerMenuCommand("清除儲存的登入資料", () => {
        if (confirm("確定要清除儲存的身分證字號與密碼嗎？")) {
            GM_deleteValue("ntust_idNo");
            GM_deleteValue("ntust_pass");
            alert("資料已清除。");
            location.reload();
        }
    });

    // 取得存儲的憑證
    const getCredentials = () => ({
        idNo: GM_getValue("ntust_idNo", null),
        pass: GM_getValue("ntust_pass", null)
    });


    setTimeout(function() {
        const { idNo, pass } = getCredentials();

        // 若無資料，終止執行並提示
        if (!idNo || !pass) {
            console.log("尚未設定台科大登入資料，請點擊 Tampermonkey 圖示 -> 點選「更新/設定 登入資料」來進行設定。");
            return;
        }

        const idInput = document.getElementById('ctl00_ContentPlaceHolder1_txtIdNo');
        const passwordInput = document.getElementById('ctl00_ContentPlaceHolder1_txtPassword');

        // 1. 自動填入帳號密碼
        if (idInput) {
            idInput.value = idNo;
            idInput.dispatchEvent(new Event('input', { bubbles: true }));
        }

        if (passwordInput) {
            passwordInput.value = pass;
            passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
        }

        // 2. 監聽驗證碼狀態
        let checkInterval = setInterval(() => {
            let captchaSolved = false;

            // 檢查 Cloudflare Turnstile 驗證結果
            const turnstileResponse = document.querySelector('[name="cf-turnstile-response"]');
            if (turnstileResponse && turnstileResponse.value.trim() !== '') {
                captchaSolved = true;
            }

            // 檢查 hCaptcha 驗證結果 (如果瀏覽器是 Safari 會走到這個)
            const hcaptchaResponse = document.querySelector('[name="h-captcha-response"]');
            const recaptchaResponse = document.querySelector('[name="g-recaptcha-response"]');
            if ((hcaptchaResponse && hcaptchaResponse.value.trim() !== '') ||
                (recaptchaResponse && recaptchaResponse.value.trim() !== '')) {
                captchaSolved = true;
            }

            // 如果偵測到驗證成功
            if (captchaSolved) {
                clearInterval(checkInterval); // 停止監聽，避免重複點擊

                const submitBtn = document.getElementById('ctl00_ContentPlaceHolder1_btnSubmit');
                if (submitBtn) {
                    console.log("驗證通過，準備自動點擊登入！");
                    // 稍微延遲 0.5 秒再點擊，讓網頁動畫或後台狀態更新完畢，避免報錯
                    setTimeout(() => {
                        submitBtn.click();
                    }, 500);
                }
            }
        }, 500); // 每 500 毫秒檢查一次驗證碼狀態

    }, 500); // 等待網頁初始載入
})();