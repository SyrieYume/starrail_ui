const fs = require("fs")
const path = require("path")

const bubblesPath = path.dirname(__dirname).replace(/\\/g, "/") + "/res/bubbles"

const bubbles = JSON.parse(fs.readFileSync(`${bubblesPath}/bubbles.json`))

bubbles.forEach(bubble => {
    bubble.imgPath = `${bubblesPath}/${bubble.imgPath}`
});

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
        margin-right: -2px;
        margin-top: 0px;
        color: #f0f0f0;
        ${bubble.css}
    `)
}

module.exports = {
    bubbles,
    applyBubbleStyle
}