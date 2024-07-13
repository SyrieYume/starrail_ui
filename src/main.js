const fs = require("fs")
const path = require("path")
const { BrowserWindow, ipcMain } = require("electron")
const { debounce, compareVersions, fetchData } = require("./utils.js")
let { config, saveConfigFile, applyConfig } = require("./config.js")
let { bubbles, applyBubbleStyle } = require("./bubble.js")



// 更新样式
function updateStyle(webContents) {
    if(/^app:\/\/\.\/renderer\/index\.html.+\/main\/message$/.test(webContents.getURL())){
        console.log("[starrail_ui] updateStyle")
        let styleData = fs.readFileSync(path.join(__dirname, "style.css"), "utf-8")
        styleData = applyConfig(styleData)
        styleData = applyBubbleStyle(config.bubble, styleData)
        webContents.send("starrail_ui.updateStyle", styleData)
        return true
    }
    return false
}

// 更新配置
function updateConfig(webContents, newConfig) {
    Object.assign(config, newConfig)
    updateStyle(webContents)
    saveConfig()
}

// 监听文件修改，方便开发时调试
function watchFileChange(webContents) {
    fs.watch(path.join(__dirname, "style.css"), "utf-8", 
        debounce(() => {
            updateStyle(webContents)
        }, 400)
    )
}

// 保存配置文件(限制每秒最多只能写入一次)
const saveConfig = debounce(saveConfigFile, 1000)

// 监听渲染进程的事件
ipcMain.on("starrail_ui.rendererReady", async (event, message) => {
    let count = 0
    let intervalId = setInterval(() => {
        const window = BrowserWindow.fromWebContents(event.sender)
        console.log(window.webContents.getURL() + " rendererReady count = " + count)
        if((count++) > 10 || updateStyle(window.webContents)) 
            clearInterval(intervalId)
    }, 1000)
})

ipcMain.handle("starrail_ui.getConfig", (event, message) => {
    return config
})

ipcMain.handle("starrail_ui.getBubbles", (event, message) => {
    return bubbles
})

ipcMain.handle("starrail_ui.getSettingsView", (event, message) => {
    return fs.readFileSync(`${config.plugin_path}/src/settings.html`, "utf-8")
})

ipcMain.handle("starrail_ui.getNewVersion", async (event, nowVersion) => {
    let githubReleaseWeb
    try{
        githubReleaseWeb = await fetchData("https://github.com/SyrieYume/starrail_ui/releases/latest")
    }
    catch(error){
        return { hasNewVersion: false, tip: `网络不佳，检查更新失败，${error}` }
    }

    const versionMatch = githubReleaseWeb.content.match(/\/releases\/tag\/v(\d+\.\d+\.\d+)/)
    
    if(versionMatch){
        const version = versionMatch[1]
        if(compareVersions(version, nowVersion) > 0)
            return { hasNewVersion: true, tip: `新版本 ${version} 已发布` }
        else
            return { hasNewVersion: false, tip: `当前已是最新版本` }
    }

    return { hasNewVersion: false, tip: "检查更新失败" }
})


// 创建窗口时触发
module.exports.onBrowserWindowCreated = window => {
    // window 为 Electron 的 BrowserWindow 实例

    window.on("ready-to-show", () => {
        const url = window.webContents.getURL()
        if (url.startsWith("app://./renderer/index.html")) 
            // 监听配置更新            
            ipcMain.on("starrail_ui.updateConfig", 
                debounce((event, newConfig) => {
                    updateConfig(window.webContents, newConfig)
            }, 400))

            // watchFileChange(window.webContents)
    });
}
