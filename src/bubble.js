const fs = require("fs")
const path = require("path")

const bubblesPath = path.dirname(__dirname).replace(/\\/g, "/") + "/res/bubbles"

const bubbles = JSON.parse(fs.readFileSync(`${bubblesPath}/bubbles.json`))

bubbles.forEach((bubble) => {
    bubble.imgPath = `${bubblesPath}/${bubble.imgPath}`

    bubble.css = bubble.css.replace(/\${bubblesPath}/g, bubblesPath).replace(/\${([^}]+)}/g, (match, key) => bubble[key])
    if("before" in bubble)
        bubble.before = bubble.before.replace(/\${bubblesPath}/g, bubblesPath).replace(/\${([^}]+)}/g, (match, key) => bubble[key])
})

function applyBubbleStyle(bubbleIndex, styleData){
    if(bubbleIndex <= 0 || bubbleIndex > bubbles.length)
        return styleData
    const bubble = bubbles[bubbleIndex - 1]

    return styleData.replace("/* Bubble Style */", `
            background: none;
            box-shadow: none;
            border: 10px solid transparent;
            border-radius: 0;

            border-image: url("appimg://${bubble.imgPath}");
            border-image-slice: 49% fill;
            border-image-width: 40px 48px;
            border-image-repeat: stretch;
            ${bubble.css}
        }
        .message-container--align-right .message-content__wrapper:has(.msg-content-container:not(.mix-message__container--market-face):not(.mix-message__container--pic)) {
            margin-right: -2px;
            margin-top: -10px;
        }

        .message-container--align-right .message-content, .reply-element--self {
            color: ${bubble.textColor} !important;
    ` + ("before" in bubble ? `}.container--self:not(.mix-message__container--market-face):not(.mix-message__container--pic)::before { ${bubble.before}`: "")
    )

}

module.exports = {
    bubbles,
    applyBubbleStyle
}