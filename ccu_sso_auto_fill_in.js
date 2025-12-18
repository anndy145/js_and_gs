// ==UserScript==
// @name         中正大學單一入口自動填寫
// @namespace    1
// @version      1.0
// @description  自動填入 CCU SSO 帳號密碼
// @author       Andy
// @match        https://cas.ccu.edu.tw/login*
// @grant        none
// ==/UserScript==
(function () {
    'use strict';

    const USER_CONFIG = {
        username: "你的帳號",
        password: "你的密碼"
    };

    function forceFill(element, value) {
        if (!element) return false;

        // 1. 直接設定值
        element.value = value;

        // 2. 觸發一系列事件，確保 MDC 框架偵測到改變
        const events = ['input', 'change', 'blur', 'focus'];
        events.forEach(evtName => {
            element.dispatchEvent(new Event(evtName, { bubbles: true }));
        });

        return element.value === value;
    }

    // 使用輪詢 (Polling) 機制，直到確認框內有值為止
    let attempts = 0;
    const maxAttempts = 10; // 最多嘗試 10 次

    const timer = setInterval(() => {
        const userField = document.getElementById('username');
        const passField = document.getElementById('password');

        if (userField && passField) {
            const userDone = forceFill(userField, USER_CONFIG.username);
            const passDone = forceFill(passField, USER_CONFIG.password);

            if ((userDone && passDone) || attempts >= maxAttempts) {
                clearInterval(timer);
                console.log("填寫完成");
            }
        }
        attempts++;
    }, 500); // 每 0.5 秒檢查一次
})();