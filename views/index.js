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
    if (event.keyCode === 13) {

        drawNewComment(element)
        let string = element.parentNode.parentNode.parentNode.firstChild.src.substring(22)
        string = string
        console.log(string)
        sendData(element)
        element.value = ''
    }
}

function drawNewComment(element) {

    const parentDiv = element.parentNode.parentNode.parentNode
    const refNode = element.parentNode.parentNode.previousSibling.previousSibling

    const commentSpan = document.createElement('span')
    const authorSpan = document.createElement('span')
    authorSpan.classList.add('commentString')
    authorSpan.style.fontWeight = 'bold'
    commentSpan.classList.add('commentString')

    const commentAuthor = "Dan "
    const commentString = element.value

    const authorNode = document.createTextNode(commentAuthor)
    const commentNode = document.createTextNode(commentString)

    authorSpan.appendChild(authorNode)
    commentSpan.appendChild(commentNode)
    commentSpan.appendChild(document.createElement('br'))

    parentDiv.insertBefore(authorSpan, refNode)
    parentDiv.insertBefore(commentSpan, refNode)
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

function renderOverlay(element, event) {
    disruptor = false
    event.preventDefault()

    if (element.classList[0] != "images") {
        element = element.parentNode.firstChild
    }

    const imageName = element.src.substring(22)
    console.log(imageName)

    const url = '/' + imageName + '/comments'
    fetch(url, {
        method: 'GET',
        action: '/' + imageName + '/comments',
        headers: { 'Content-Type': 'application/json' }
    })
        .then(promise => promise)
        .then(res.render)
        .catch(err => console.log(err))
}