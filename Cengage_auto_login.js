// ==UserScript==
// @name         自動填入帳號密碼並登入 (Cengage/Okta) - 安全強化版
// @namespace    1
// @version      1.3
// @description  支援兩階段登入，憑證存於本地儲存空間，避免洩漏
// @author       Andy
// @match        https://account.cengage.com/login*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_registerMenuCommand
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    // ========== 1. 管理功能：右鍵選單設定 ==========

    GM_registerMenuCommand("設定/更新 Cengage 帳密", () => {
        const e = prompt("請輸入 Email：", GM_getValue("ce_email", ""));
        const p = prompt("請輸入密碼：", "");
        if (e !== null && p !== null) {
            GM_setValue("ce_email", e);
            GM_setValue("ce_password", p);
            alert("帳密已加密儲存於本地！");
            location.reload();
        }
    });

    GM_registerMenuCommand("清除 Cengage 儲存資料", () => {
        if (confirm("確定要清除儲存的帳密嗎？")) {
            GM_deleteValue("ce_email");
            GM_deleteValue("ce_password");
            alert("資料已清除。");
            location.reload();
        }
    });

    // ========== 2. 核心邏輯與設定 ==========

    const config = {
        email: GM_getValue("ce_email", null),
        password: GM_getValue("ce_password", null),
        checkInterval: 500,
        clickDelay: 500
    };

    const loginLogic = setInterval(() => {
        // 如果還沒設定過帳密，停止執行並在控制台提示
        if (!config.email || !config.password) {
            console.warn("Cengage 腳本：尚未設定帳密，請使用 Tampermonkey 選單進行設定。");
            return;
        }

        // --- 第一階段：填入 Email 並按下一步 ---
        const usernameField = document.getElementById('idp-discovery-username');
        const nextBtn = document.getElementById('idp-discovery-submit');
        const passwordFieldPresent = document.getElementById('okta-signin-password');

        if (usernameField && nextBtn && !passwordFieldPresent) {
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
        const loginBtn = document.getElementById('okta-signin-submit');

        if (passwordField) {
            if (passwordField.value !== config.password) {
                passwordField.value = config.password;
                passwordField.dispatchEvent(new Event('input', { bubbles: true }));
                passwordField.dispatchEvent(new Event('change', { bubbles: true }));

                console.log("已自動填入密碼");

                setTimeout(() => {
                    const finalSubmit = loginBtn || document.querySelector('input[type="submit"].button-primary');
                    if (finalSubmit) {
                        finalSubmit.click();
                        console.log("已點擊登入按鈕");
                        clearInterval(loginLogic); // 成功後停止
                    }
                }, config.clickDelay);
            }
        }
    }, config.checkInterval);

    // 20 秒安全保護，避免腳本死循環
    setTimeout(() => clearInterval(loginLogic), 20000);

})();