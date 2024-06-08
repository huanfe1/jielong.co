'use strict';
exports.main = () => {
    // 从云端获取 Token
    fetch('', { method: 'GET' })
        .then(res => res.json())
        .then(({ token }) => {
            token = token.replace('^Bearer ', '');
            const endTime = parseJWTEndTime(token);
            if (endTime < Date.now() + 86400000) {
                pushMsg('Token 将在下次签到前过期，请及时更换', 'Token 过期时间' + new Date(endTime).toLocaleString());
            }
            sign({ token });
        });
};

function sign({ token }) {
    fetch('https://h-api.jielong.co/api/CheckIn/EditRecord', {
        method: 'POST',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Content-Type': 'application/json; charset=utf-8',
            Authorization: `Bearer ${token}`,
            date: new Date().toUTCString(),
            host: 'h-api.jielong.co',
        },
        body: JSON.stringify({
            Id: 0,
            ThreadId: 134560216,
            Number: '',
            Signature: '张伟',
            RecordValues: [],
            DateTarget: '',
            IsNeedManualAudit: false,
            MinuteTarget: -1,
            IsNameNumberComfirm: false,
            IsAllowInvisible: true,
            IsCurrentUser: true,
        }),
    })
        .then(res => res.json())
        .then(res => {
            console.log(res);
            if (res['Type'] !== '000001') pushMsg('打卡失败', JSON.stringify(res));
        })
        .catch(err => {
            console.log(err);
        });
}

// 推送消息
function pushMsg(title, content) {
    const token = '';
    const url = 'https://cx.super4.cn/push_msg';
    fetch(`${url}?appkey=${token}&title=${title}&content=${content}`, { method: 'GET' });
}

function parseJWTEndTime(token) {
    const parts = token.replace('Bearer ', '').split('.');
    if (parts.length !== 3) throw new Error('Invalid JWT: JWT must contain three parts separated by dot');
    const payload = parts[1];
    const decodedPayload = JSON.parse(atob(payload));
    return decodedPayload.exp * 1000;
}
