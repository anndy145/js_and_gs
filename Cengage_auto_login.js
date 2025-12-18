// ==UserScript==
// @name         自動填入帳號密碼並登入 (Cengage/Okta)
// @version      1.2
// @description  支援兩階段登入：自動填入 Email -> 下一步 -> 自動填入密碼 -> 登入
// @author       Andy
// @match        https://account.cengage.com/login*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // ======= 1. 請在此設定您的資訊 =======
    const config = {
        email: "your-email@example.com",
        password: "your-password-here",
        checkInterval: 500, // 每 0.5 秒偵測一次
        clickDelay: 500     // 填完後延遲多久點擊按鈕 (毫秒)
    };

    const loginLogic = setInterval(() => {
        // --- 第一階段：填入 Email 並按下一步 ---
        const usernameField = document.getElementById('idp-discovery-username');
        const nextBtn = document.getElementById('idp-discovery-submit');

        // 如果 Email 框存在且還沒被填過，且目前密碼框還沒出現
        if (usernameField && nextBtn && !document.getElementById('okta-signin-password')) {
            if (usernameField.value !== config.email) {
                usernameField.value = config.email;
                usernameField.dispatchEvent(new Event('input', { bubbles: true }));
                usernameField.dispatchEvent(new Event('change', { bubbles: true }));

                setTimeout(() => {
                    nextBtn.click();
                    console.log("已自動填入 Email 並點擊下一步");
                }, config.clickDelay);
            }
        }

        // --- 第二階段：填入密碼並登入 ---
        const passwordField = document.getElementById('okta-signin-password');
        const loginBtn = document.getElementById('okta-signin-submit'); // Okta 登入鈕通常是這個 ID

        if (passwordField) {
            // 停止監控，準備進行最後的登入動作
            if (passwordField.value !== config.password) {
                passwordField.value = config.password;
                passwordField.dispatchEvent(new Event('input', { bubbles: true }));
                passwordField.dispatchEvent(new Event('change', { bubbles: true }));

                console.log("已自動填入密碼");

                // 填完密碼後自動按「登入」
                setTimeout(() => {
                    const finalSubmit = loginBtn || document.querySelector('input[type="submit"].button-primary');
                    if (finalSubmit) {
                        finalSubmit.click();
                        console.log("已點擊登入按鈕");
                        clearInterval(loginLogic); // 完成任務，停止腳本
                    }
                }, config.clickDelay);
            }
        }
    }, config.checkInterval);

    // 20 秒後自動停止檢查，避免背景無限運作
    setTimeout(() => clearInterval(loginLogic), 20000);

})();