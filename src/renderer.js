
// 添加样式
const element = document.createElement("style")
element.class = "starrail_ui"
document.body.appendChild(element)

starrail_ui.onUpdateStyle((event, styleData) => {
    element.textContent = styleData
})

starrail_ui.rendererReady()

let config = await starrail_ui.getConfig()

// 监听添加元素事件
if(config["displayNickname"]){
const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
            const addedNodes = Array.from(mutation.addedNodes)
            addedNodes.forEach(node => {
                if (node.className == "ml-item") {
                    const msgContainer = node.querySelector(".message-container")
                    if(msgContainer && !msgContainer.querySelector(".user-name")){
                        const nicknameDiv = document.createElement('div')
                        nicknameDiv.classList.add("user-name", "no-copy", "text-ellipsis")
                        const span = document.createElement('span')
                        span.classList.add("text-ellipsis")
                        const nickname = msgContainer.querySelector(".avatar-span").getAttribute("aria-label")
                        if(nickname)
                            span.textContent = nickname
                        nicknameDiv.appendChild(span)
                        msgContainer.appendChild(nicknameDiv)
                    }
                    
                }
            })
        }
    })
})
  
// 监控整个文档
observer.observe(document.body, { childList: true, subtree: true });
}



// 打开设置界面时触发
export const onSettingWindowCreated = async view => {
    // view 为 Element 对象，修改将同步到插件设置界面
    view.innerHTML = await starrail_ui.getSettingsView()

    // 选择背景图片
    const text_bgPath = view.querySelector("#text_bgPath")
    text_bgPath.textContent = config.background_img

    view.querySelector("#input_selectBg").addEventListener("change", (event) => {
        const path = event.target.files[0].path.replace(/\\/g, "/")
        config["background_img"] = path
        text_bgPath.textContent = path
        starrail_ui.updateConfig(config)
    })

    // 设置背景模糊
    const input_setBgBlur = view.querySelector("#input_setBgBlur")
    input_setBgBlur.value = config["background_blur"]
    input_setBgBlur.addEventListener("change", (event) => {
        config["background_blur"] = event.target.value
        starrail_ui.updateConfig(config)
    })

    // 设置背景亮度
    const input_setBgBrightness = view.querySelector("#input_setBgBrightness")
    input_setBgBrightness.value = config["background_brightness"]
    input_setBgBrightness.addEventListener("change", (event) => {
        config["background_brightness"] = event.target.value
        starrail_ui.updateConfig(config)
    })

    // 设置聊天窗口不透明度
    const input_setChatWindowOpacity = view.querySelector("#input_setChatWindowOpacity")
    input_setChatWindowOpacity.value = config["chatWindow_Opacity"]
    input_setChatWindowOpacity.addEventListener("change", (event) => {
        config["chatWindow_Opacity"] = event.target.value
        starrail_ui.updateConfig(config)
    })

    // 选择气泡框
    let bubbles = await starrail_ui.getBubbles()

    const bubblesList = view.querySelector("#bubblesList")
    const defaultBubble = view.querySelector("#defaultBubble")
    defaultBubble.value = 0

    let selectedBubble = defaultBubble
    
    const selectBubble = (bubbleView) => {
        bubbleView.classList.add("select")
        selectedBubble.classList.remove("select")
        selectedBubble = bubbleView
    }

    const onBubbleClicked = (event) => {
        selectBubble(event.target)
        config.bubble = event.target.value
        starrail_ui.updateConfig(config)
    }

    defaultBubble.addEventListener("click", onBubbleClicked)
    
    for(let i = 0; i< bubbles.length; i++){
        const bubbleContainerDiv = document.createElement("div")
        bubbleContainerDiv.classList.add("bubbleContainer")
        bubbleContainerDiv.value = i + 1
        if( (i+1) == config.bubble )
            selectBubble(bubbleContainerDiv)
        bubbleContainerDiv.addEventListener("click", onBubbleClicked)

        const bubbleDiv = document.createElement("div")
        bubbleDiv.classList.add("bubble")
        bubbleDiv.style = bubbles[i].css
        bubbleDiv.style.borderImage = `url("appimg://${bubbles[i].imgPath}")`
        bubbleDiv.textContent = "你好"

        const bubbleName = document.createElement("b")
        bubbleName.classList.add("bubbleName")
        bubbleName.textContent = bubbles[i].name

        bubbleContainerDiv.appendChild(bubbleDiv)
        bubbleContainerDiv.appendChild(bubbleName)
        bubblesList.appendChild(bubbleContainerDiv)
    }

    // 检查更新
    const versionText = view.querySelector("#versionText")
    const checkVersionBtn = view.querySelector("#checkVersionBtn")
    const updateBtn = view.querySelector("#updateBtn")

    const nowVersion = LiteLoader.plugins["starrail_ui"].manifest.version
    versionText.textContent = nowVersion

    updateBtn.addEventListener("click", (event) => {
        plugininstaller.updateBySlug("starrail_ui")
    })

    checkVersionBtn.addEventListener("click", async (event) => {
        versionText.textContent = `正在检查更新中...`
        const newVersion = await starrail_ui.getNewVersion(nowVersion)
        versionText.textContent = `${nowVersion} (${newVersion.tip})`
        
        // 判断 plugininstaller 插件是否存在并启用
        if(newVersion.hasNewVersion && LiteLoader.plugins["plugininstaller"] && !LiteLoader.plugins["plugininstaller"].disabled){
            updateBtn.style.display = "inline-block"
            checkVersionBtn.style.display = "none"
        }
            
    })

    // 前往github仓库
    view.querySelector("#gotoGithub").addEventListener("click", (event) => {
        LiteLoader.api.openExternal("https://github.com/SyrieYume/starrail_ui")
    })

    // 是否在私聊中显示昵称
    const displayNicknameSwitch = view.querySelector("#displayNickname")
    if(config.displayNickname)
        displayNicknameSwitch.setAttribute("is-active", "")
    displayNicknameSwitch.addEventListener("click", (event) => {
        config.displayNickname = !config.displayNickname
        if(config.displayNickname)
            displayNicknameSwitch.setAttribute("is-active", "")
        else
            displayNicknameSwitch.removeAttribute("is-active")
        starrail_ui.updateConfig(config)
    })
}