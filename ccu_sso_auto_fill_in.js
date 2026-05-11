// ==UserScript==
// @name         中正大學單一入口自動化
// @namespace    1
// @version      1.6
// @description  支援單一入口與 CAS 自動跳轉登入
// @author       Andy
// @match        https://cas.ccu.edu.tw/login*
// @match        https://portal.ccu.edu.tw/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    // ========== 使用者設定區 ==========
    const CONFIG = {
        username: "您的學號",
        password: "您的密碼",
        AUTO_LOGIN: 0,         // 是否自動點擊登入
        START_DELAY: 500,         // 進入頁面後多久開始填寫
        SUBMIT_DELAY: 1000,       // 填寫完成後多久點擊登入
        POLLING_INTERVAL: 800     // 檢查欄位頻率
    };

    // 1. 處理各類頁面的自動跳轉點擊
    function checkAutoJump() {
        // A. 處理 Portal 入口
        if (window.location.hostname === 'portal.ccu.edu.tw') {
            const loginBtn = document.querySelector('.signin-btn a');
            if (loginBtn) {
                loginBtn.click();
                return true;
            }
        }
        return false;
    }

    // 強制填寫函數
    function forceFill(element, value) {
        if (!element) return false;
        element.value = value;
        ['input', 'change', 'blur', 'focus'].forEach(evtName => {
            element.dispatchEvent(new Event(evtName, { bubbles: true }));
        });
        return element.value === value;
    }

    function startProcess() {
        // 先檢查是否需要跳轉點擊
        if (checkAutoJump()) return;

        let attempts = 0;
        const maxAttempts = 10;

        const timer = setInterval(() => {
            let userField, passField, submitBtn;

            // --- 判斷頁面類型並抓取欄位 ---
            const url = window.location.href;
            if (url.includes('cas.ccu.edu.tw')) {
                userField = document.getElementById('username');
                passField = document.getElementById('password');
                submitBtn = document.querySelector('button[name="submitBtn"]');
            }

            // --- 執行填寫 ---
            if (userField && passField) {
                // 如果已經填寫過且內容正確，就準備點擊
                const userDone = (userField.value === CONFIG.username) || forceFill(userField, CONFIG.username);
                const passDone = (passField.value === CONFIG.password) || forceFill(passField, CONFIG.password);

                if (userDone && passDone) {
                    clearInterval(timer);
                    console.log("帳密填寫完成");

                    if (CONFIG.AUTO_LOGIN && submitBtn) {
                        setTimeout(() => {
                            submitBtn.click();
                        }, CONFIG.SUBMIT_DELAY);
                    }
                }
            }

            if (attempts >= maxAttempts) clearInterval(timer);
            attempts++;
        }, CONFIG.POLLING_INTERVAL);
    }

    setTimeout(startProcess, CONFIG.START_DELAY);
})();