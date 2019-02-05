let disruptor = true

function autoUpdate() {
    const messageBox = document.getElementById('message')
    const commentImageBox = document.getElementById('images')
    let lastUpdated = Date.now()
    let attempts = 0

    const fetchLatestImages = () => {
        if (disruptor) {
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
                            res.images.forEach(img => {
                                attempts = 0
                                let commentImage = document.createElement('img')
                                commentImage.src = img
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
    }


    fetchLatestImages()
}
autoUpdate()



function postComment(element, event) {
    event.preventDefault()
    console.log(element.value == '')
    if (element.value != '') {
        if (event.keyCode === 13) {

            drawNewComment(element)
            console.log(element.parentNode.parentNode.previousSibling.previousSibling.children[0])
            let string = element.parentNode.parentNode.parentNode.firstChild.src.substring(22)
            string = string
            console.log(string)
            sendData(element)
            element.value = ''
        }
    }
}

function drawNewComment(element) {

    const parentDiv = element.parentNode.parentNode.previousSibling.previousSibling.children[0]

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

function sendData(element) {
    const imageName = element.parentNode.parentNode.parentNode.firstChild.src.substring(22)
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
    const commentTable = document.getElementById('table')
    console.log(commentTable.children.length)
    const overlay = document.getElementById('overlay')
    let index = 0
    while (commentTable.children.length !== 0) {
        let child = commentTable.children[index]
        commentTable.removeChild(child)
    }

    overlay.style.display = 'none'
}