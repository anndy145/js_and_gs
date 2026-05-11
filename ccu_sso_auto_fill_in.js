// ==UserScript==
// @name         中正大學單一入口自動化
// @namespace    1
// @version      2.0
// @description  支援自動填寫與登入，帳密儲存於本地擴充空間，避免代碼洩漏
// @author       Andy 
// @match        https://cas.ccu.edu.tw/login*
// @match        https://portal.ccu.edu.tw/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_registerMenuCommand
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    // ========== 核心設定 ==========
    const SETTINGS = {
        AUTO_LOGIN: 1,           // 1: 自動點擊登入, 0: 僅自動填寫
        START_DELAY: 500,        // 進入頁面延遲
        SUBMIT_DELAY: 1000,      // 填寫完後延遲點擊
        POLLING_INTERVAL: 800    // 檢查欄位頻率
    };

    // ========== 帳密管理功能 ==========

    // 註冊 Tampermonkey 右鍵選單：更新帳密
    GM_registerMenuCommand("更新/設定 帳號密碼", () => {
        const u = prompt("請輸入您的學號：", GM_getValue("ccu_user", ""));
        const p = prompt("請輸入您的密碼：", "");
        if (u !== null && p !== null) {
            GM_setValue("ccu_user", u);
            GM_setValue("ccu_pass", p);
            alert("帳密已安全儲存，頁面即將重新整理！");
            location.reload();
        }
    });

    // 註冊 Tampermonkey 右鍵選單：清除資料
    GM_registerMenuCommand("清除儲存的帳密", () => {
        if (confirm("確定要清除儲存的帳號密碼嗎？")) {
            GM_deleteValue("ccu_user");
            GM_deleteValue("ccu_pass");
            alert("資料已清除。");
            location.reload();
        }
    });

    // 取得當前存儲的憑證
    const getCredentials = () => ({
        user: GM_getValue("ccu_user", null),
        pass: GM_getValue("ccu_pass", null)
    });

    // ========== 執行邏輯 ==========

    function checkAutoJump() {
        if (window.location.hostname === 'portal.ccu.edu.tw') {
            const loginBtn = document.querySelector('.signin-btn a');
            if (loginBtn) {
                loginBtn.click();
                return true;
            }
        }
        return false;
    }

    function forceFill(element, value) {
        if (!element || !value) return false;
        element.value = value;
        ['input', 'change', 'blur', 'focus'].forEach(evtName => {
            element.dispatchEvent(new Event(evtName, { bubbles: true }));
        });
        return element.value === value;
    }

    function startProcess() {
        if (checkAutoJump()) return;

        const { user, pass } = getCredentials();

        // 若無資料，提示使用者設定
        if (!user || !pass) {
            console.log("尚未設定帳密，請透過 Tampermonkey 選單進行設定。");
            return;
        }

        let attempts = 0;
        const maxAttempts = 10;

        const timer = setInterval(() => {
            let userField, passField, submitBtn;
            const url = window.location.href;

            if (url.includes('cas.ccu.edu.tw')) {
                userField = document.getElementById('username');
                passField = document.getElementById('password');
                submitBtn = document.querySelector('button[name="submitBtn"]');
            }

            if (userField && passField) {
                const userDone = (userField.value === user) || forceFill(userField, user);
                const passDone = (passField.value === pass) || forceFill(passField, pass);

                if (userDone && passDone) {
                    clearInterval(timer);
                    console.log("填入完成");

                    if (SETTINGS.AUTO_LOGIN && submitBtn) {
                        setTimeout(() => {
                            submitBtn.click();
                        }, SETTINGS.SUBMIT_DELAY);
                    }
                }
            }

            if (attempts >= maxAttempts) clearInterval(timer);
            attempts++;
        }, SETTINGS.POLLING_INTERVAL);
    }

    setTimeout(startProcess, SETTINGS.START_DELAY);
})();