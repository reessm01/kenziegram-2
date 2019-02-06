let mainOverlayClicked = false
document.getElementById('overlayMain').addEventListener('click', () => {
    mainOverlayClicked = true
})

function autoUpdate() {
    const messageBox = document.getElementById('message')
    const commentImageBox = document.getElementById('imageBox')
    let lastUpdated = Date.now()
    let attempts = 0

    const fetchLatestImages = () => {

        setTimeout(() => {
            fetch('/latest', {
                method: 'POST',
                body: JSON.stringify({ updated: lastUpdated }),
                headers: { 'Content-Type': 'application/json' }
            })
                .then(promise => promise.json())
                .then(res => {
                    if (res.status === 204) {
                        attempts = 0
                        fetchLatestImages()
                    } else if (res.status === 200) {
                        lastUpdated = Date.now()
                        attempts = 0
                        res.images.forEach(img => {
                            let commentImage = document.createElement('img')
                            commentImage.src = img
                            console.log(img)
                            commentImage.classList.add("images")
                            commentImageBox.prepend(commentImage)
                            fetchLatestImages()
                        })
                    }
                })
                .catch(error => {
                    if (attempts < 1) {
                        attempts++
                        fetchLatestImages()
                    }
                    else {
                        const message = document.createTextNode("Status 444: No response.")
                        messageBox.appendChild(message)
                        console.log(error)
                    }
                })
        }, 5000)

    }


    fetchLatestImages()
}
autoUpdate()



function postComment(element, event) {
    event.preventDefault()
    console.log("hello")
    if (element.value != '') {
        if (event.keyCode === 13) {

            drawNewComment(element)
            let string = element.parentNode.parentNode.parentNode.firstChild.src.substring(22)
            sendData(string, element)
            element.value = ''
        }
    }
}

function postOverlayComment(element, event) {
    event.preventDefault()
    if (element.value != '') {
        if (event.keyCode === 13) {

            drawNewComment(element)
            console.log(element.parentNode.parentNode.parentNode)
            let string = element.parentNode.parentNode.parentNode.parentNode.firstChild.src.substring(22)
            sendData(string, element)
            element.value = ''
        }
    }
}

function drawNewComment(element) {
    let parentDiv = undefined
    const iteratableDiv = element.parentNode.parentNode.parentNode
    for (let index = 0; index < iteratableDiv.children.length; index++) {
        if (iteratableDiv.children[index].id == 'comments') {
            parentDiv = iteratableDiv.children[index].children[0]
        }
    }

    const tableRow = document.createElement('tr')

    const authorSpan = document.createElement('td')
    authorSpan.style.fontWeight = 'bold'
    authorSpan.style.width = '40px'

    const commentSpan = document.createElement('td')

    const commentAuthor = "Dan "
    const commentString = element.value

    const authorNode = document.createTextNode(commentAuthor)
    const commentNode = document.createTextNode(commentString)

    authorSpan.appendChild(authorNode)
    commentSpan.appendChild(commentNode)
    tableRow.appendChild(authorSpan)
    tableRow.appendChild(commentSpan)

    parentDiv.appendChild(tableRow)
}

function sendData(imageName, element) {
    const comment = element.value
    const url = '/' + imageName + '/comments'
    fetch(url, {
        method: 'POST',
        body: JSON.stringify({ entry: comment }),
        headers: { 'Content-Type': 'application/json' }
    })
}

function renderOverlay(element) {
    const overlay = document.getElementById('overlay')
    const imageFocus = document.getElementById('imageFocus')
    disruptor = false

    if (element.classList[0] != "images") {
        element = element.parentNode.firstChild
    }

    overlay.style.display = 'flex'
    const imageName = element.src.substring(22)
    const url = '/' + imageName + '/comments'

    fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })
        .then(promise => promise.json())
        .then(res => {
            console.log(res.comments)
            imageFocus.src = element.src
            renderComments(res.comments)
        })
        .catch(err => console.log(err))
}

function renderComments(commentArray) {
    const commentTable = document.getElementById('table')

    if (commentArray.length >= 1) {
        for (commentInfo of commentArray) {
            const tableRow = document.createElement('tr')

            const authorSpan = document.createElement('td')
            authorSpan.classList.add('authorString')
            authorSpan.style.fontWeight = 'bold'
            authorSpan.style.width = "15%"

            const commentSpan = document.createElement('td')
            commentSpan.classList.add('commentString')
            commentSpan.style.wordWrap = "break-word"
            commentSpan.style.width = "85%"

            const authorNode = document.createTextNode(commentInfo.name)
            const commentNode = document.createTextNode(commentInfo.comment)

            authorSpan.appendChild(authorNode)
            commentSpan.appendChild(commentNode)

            tableRow.appendChild(authorSpan)
            tableRow.appendChild(commentSpan)
            commentTable.appendChild(tableRow)
        }

    }
}

function overlayReset() {
    console.log(mainOverlayClicked)
    if (mainOverlayClicked == false) {

        const commentTable = document.getElementById('table')
        const overlay = document.getElementById('overlay')
        let index = 0
        while (commentTable.children.length !== 0) {
            let child = commentTable.children[index]
            commentTable.removeChild(child)
        }

        overlay.style.display = 'none'
    }
    let count = 0
    while (count != 100) {
        mainOverlayClicked = false
        count++
    }
}