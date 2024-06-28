// Electron 主进程 与 渲染进程 交互的桥梁
const { contextBridge, ipcRenderer } = require("electron");

// 在window对象下导出只读对象
contextBridge.exposeInMainWorld("starrail_ui", {

    onUpdateStyle: (callback) => ipcRenderer.on(
        "starrail_ui.updateStyle",
        callback
    ),

    rendererReady: () => ipcRenderer.send(
        "starrail_ui.rendererReady"
    ),

    getConfig: () => ipcRenderer.invoke(
        "starrail_ui.getConfig"
    ),

    getSettingsView: () => ipcRenderer.invoke(
        "starrail_ui.getSettingsView"
    ),

    updateConfig: (newConfig) => ipcRenderer.send(
        "starrail_ui.updateConfig",
        newConfig
    ),

    getBubbles: () => ipcRenderer.invoke(
        "starrail_ui.getBubbles"
    ),
    
    getNewVersion: (nowVersion) => ipcRenderer.invoke(
        "starrail_ui.getNewVersion",
        nowVersion
    )
});