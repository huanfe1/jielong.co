const cookieDataDiv = document.getElementById('cookieData');
// 从 chrome.storage.sync 中获取保存的 cookie 数据
chrome.storage.sync.get('token', ({ token }) => {
    const info = parseJWT(token);
    document.querySelector('#start').textContent = info.start;
    document.querySelector('#end').textContent = info.end;
});

function parseJWT(token) {
    const parts = token.replace('Bearer ', '').split('.');
    if (parts.length !== 3) {
        throw new Error('Invalid JWT: JWT must contain three parts separated by dot');
    }
    const payload = parts[1];
    const decodedPayload = JSON.parse(atob(payload));
    return {
        start: new Date(decodedPayload.iat * 1000).toLocaleString(),
        end: new Date(decodedPayload.exp * 1000).toLocaleString(),
    };
}

chrome.runtime.sendMessage({ action: 'trigger' }, () => {});
