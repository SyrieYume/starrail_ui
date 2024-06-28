const { net } = require("electron")

// 防抖函数
function debounce(fn, time) {
    let timer = null
    return function (...args) {
        if(timer) clearTimeout(timer)
        timer = setTimeout(() => {
            fn.apply(this, args)
            timer = null
        }, time)
    }
}

// 比较两个版本的大小
// v1 > v2时返回1，等于时返回0，小于时返回-1
function compareVersions(v1, v2) {
    const parts1 = v1.split('.').map(Number)
    const parts2 = v2.split('.').map(Number)

    for (let i = 0; i < parts1.length; i++) {
        if (parts2.length === i) 
            return 1

        if (parts1[i] !== parts2[i])
            return parts1[i] > parts2[i] ? 1 : -1;
    }

    return parts1.length === parts2.length ? 0 : -1;
}

// 从网络获取数据
function fetchData(url) {
    return new Promise((resolve, reject) => {
        const request = net.request({
            method: 'GET',
            url: url,
            redirect: 'follow' // 处理重定向
        });

        request.on('response', (response) => {
            const finalUrl = response.headers.location || response.url;
            let data = '';

            response.on('data', (chunk) => {
                data += chunk;
            });

            response.on('end', () => {
                resolve({ url: finalUrl, content: data });
            });
        });

        request.on('error', (error) => {
            reject(error);
        });

        request.end();
    });
}


module.exports = {
    debounce,
    compareVersions,
    fetchData
}