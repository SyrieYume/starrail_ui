const fs = require("fs")
const path = require("path")

const pluginPath = path.dirname(__dirname).replace(/\\/g, "/")
const configFilePath = `${pluginPath}/config.json`

const defaultConfig = {
    "plugin_path": pluginPath,
    "background_img" : `${pluginPath}/res/background.jpg`,
    "background_blur": 8,
    "background_brightness": 50,
    "chatWindow_Opacity": 95,
    "bubble": 0
}

const config = { ...defaultConfig }

function saveConfigFile() {
    fs.writeFileSync(configFilePath, JSON.stringify(config))
}

function applyConfig(styleData) {
    return styleData.replace(/\${([^}]+)}/g, (match, key) => config[key])
}

if(fs.existsSync(configFilePath)) {
    const savedConfig = fs.readFileSync(configFilePath, "utf-8")
    Object.assign(config, JSON.parse(savedConfig))
}else {
    saveConfigFile()
}

module.exports = { 
    config,
    saveConfigFile,
    applyConfig
}