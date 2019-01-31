function autoUpdate() {
    const messageBox = document.getElementById('message')
    const newImageBox = document.getElementById('images')
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
                        res.images.forEach(img => {
                            attempts = 0
                            let newImage = document.createElement('img')
                            newImage.src = img
                            newImage.classList.add("images")
                            newImageBox.prepend(newImage)
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