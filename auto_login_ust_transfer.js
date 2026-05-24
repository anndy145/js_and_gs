// ==UserScript==
// @name         台聯大轉學考自動填入登入資料
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  支援自動填寫與自動登入，帳密儲存於本地擴充空間
// @match        https://reg.nycu.edu.tw/tran_exam/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_registerMenuCommand
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // ========== 帳密管理功能 ==========

    // 註冊 Tampermonkey 右鍵選單：更新帳密
    GM_registerMenuCommand("更新/設定 登入資料", () => {
        const u = prompt("請輸入您的「報名序號」：", GM_getValue("nycu_serial", ""));
        const p = prompt("請輸入您的「密碼」：", "");
        if (u !== null && p !== null) {
            GM_setValue("nycu_serial", u);
            GM_setValue("nycu_pass", p);
            alert("登入資料已安全儲存，頁面即將重新整理！");
            location.reload();
        }
    });

    // 註冊 Tampermonkey 右鍵選單：清除資料
    GM_registerMenuCommand("清除儲存的登入資料", () => {
        if (confirm("確定要清除儲存的報名序號與密碼嗎？")) {
            GM_deleteValue("nycu_serial");
            GM_deleteValue("nycu_pass");
            alert("資料已清除。");
            location.reload();
        }
    });

    // 取得當前存儲的憑證
    const getCredentials = () => ({
        serial: GM_getValue("nycu_serial", null),
        pass: GM_getValue("nycu_pass", null)
    });

    // ========== 執行邏輯 ==========

    setTimeout(function() {
        const { serial, pass } = getCredentials();

        // 若無資料，終止執行並提示
        if (!serial || !pass) {
            console.log("尚未設定台聯大轉學考登入資料，請點擊 Tampermonkey 圖示 -> 點選「更新/設定 登入資料」來進行設定。");
            return;
        }

        // 利用 HTML 中的 name 屬性來抓取輸入框
        const serialInput = document.querySelector('input[name="Serial_No"]');
        const passwordInput = document.querySelector('input[name="Passwd"]');
        const submitBtn = document.querySelector('input[name="submit"][type="submit"]');

        let isFilled = false;

        // 1. 自動填入報名序號與密碼
        if (serialInput) {
            serialInput.value = serial;
            serialInput.dispatchEvent(new Event('input', { bubbles: true }));
            isFilled = true;
        }

        if (passwordInput) {
            passwordInput.value = pass;
            passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
            isFilled = true;
        }

        // 2. 填寫完畢後自動點擊登入
        if (isFilled && submitBtn) {
            console.log("資料已填寫，準備自動登入！");
            // 延遲 0.5 秒再點擊，確保網頁讀取穩定
            setTimeout(() => {
                submitBtn.click();
            }, 500); 
        }

    }, 500); // 等待網頁初始載入
})();