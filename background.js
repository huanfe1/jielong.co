chrome.runtime.onInstalled.addListener(async () => {
    await chrome.storage.sync.clear();
    await chrome.storage.sync.set({ time: new Date().getTime() });
    await checkCookies();
});

chrome.runtime.onStartup.addListener(() => {
    checkCookies();
});

chrome.alarms.create('period-job', { periodInMinutes: 1, delayInMinutes: 1 });

// 监控 cookies 变化
chrome.cookies.onChanged.addListener(data => {
    if (data.cookie.name !== 'token') return;
    checkCookies();
});

// 监听点击插件图标
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    checkCookies();
    sendResponse({ result: 'Function executed successfully' });
});

chrome.alarms.onAlarm.addListener(async alarm => {
    if (alarm.name !== 'period-job') return;
    console.log(Date(), 'period job');
    const { time } = await chrome.storage.sync.get('time');
    if (new Date().getTime() < time + 1000 * 60 * 30) return;
    chrome.storage.sync.set({ time: new Date().getTime() });
    console.log(Date(), 'checkCookies');
    checkCookies();
});

// 处理 Cookies 并发送 Token
async function checkCookies() {
    const url = 'https://jielong.co/';
    const cookies = await chrome.cookies.getAll({ url: url, name: 'token' });
    if (cookies.length === 0) {
        notifications();
        return;
    }
    const token = decodeURIComponent(cookies[0].value)?.replace('Bearer ', '');
    if (Date.now() > parseJWTEndTime(token)) {
        notifications();
        return;
    }
    chrome.storage.sync.set({ token });
    // 更新 Cookies 到云端
    fetch();
}

function parseJWTEndTime(token) {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid JWT: JWT must contain three parts separated by dot');
    const payload = parts[1];
    const decodedPayload = JSON.parse(atob(payload));
    return decodedPayload.exp * 1000;
}

const notification = chrome.notifications;
notification.onClicked.addListener(() => {
    chrome.tabs.create({ url: 'https://jielong.co/qrlogin' });
});

function notifications() {
    notification.create({
        type: 'basic',
        iconUrl: 'icon.png',
        title: '请扫码登录',
        message: 'Jielong.co 的 Token 已过期, 请扫码登录',
    });
}
