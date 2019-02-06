// Authors: Scott Reese & Jon Taylor

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const multer = require('multer')
const express = require('express')
const pug = require('pug')
const port = 4000
const paths = require("path")
const cors = require('cors')
const fs = require('fs')
const app = express()
const publicFolderPath = paths.join(__dirname, "public")
let rawData = fs.readFileSync('comments.json')
let data = JSON.parse(rawData)
let bodyParser = require('body-parser')

const path = './public/uploads'

app.set('views', './views')
app.set('view engine', 'pug')
app.use(express.static(path))
app.use(cors())
app.use(express.json())
app.use(express.static(publicFolderPath))
app.use(bodyParser.urlencoded({ extended: false }))

const storage = multer.diskStorage({
    destination: './public/uploads',
    filename: function (req, file, cb) {
        cb(null, Date.now() + paths.extname(file.originalname));
    }
});

app.listen(port, () => console.log('Example app listening on port: ' + port))

const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 },
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb)
    }
}).single('myImage')

const template = `<h1>KenzieGram</h1>`

function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/
    // Check ext
    const extname = filetypes.test(paths.extname(file.originalname).toLowerCase())
    // Check mime
    const mimetype = filetypes.test(file.mimetype)

    if (mimetype && extname) {
        return cb(null, true)
    } else {
        cb('Error: Images Only!')
    }
}

app.get("/", (req, res) => {
    // Object.keys(data).forEach(object => console.log(data[object].comments[0].name))
    fs.readdir(path, function (err, items) {
        fs.readdir('./public/portrait', (err, portrait) => {
            console.log(items)
            res.render('index', { imageArray: items, imageData: data, myPortrait: portrait[0] })
        })
    })

})

app.post('/latest', (req, res) => {
    if (req.url === '/latest') {
        fs.readdir(path, function (err, items) {
            let newImages = []
            items.forEach(image => {
                let lastModified = fs.statSync(path + "/" + image).mtimeMs
                if (lastModified > req.body.updated) {
                    newImages.push(image)
                }
            })

            if (newImages.length > 0) {
                res.send({ images: newImages, status: 200 })
                console.log('New images sent.')
            } else {
                res.statusMessage = 'No content'
                res.send({ status: 204 })
            }
        })
    }
})



app.post('/upload', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            console.log(err)
        } else {
            if (req.file == undefined) {

            } else {
                data[req.file.filename] = {
                    comments: []
                }
                fs.writeFile('comments.json', JSON.stringify(data), err => {
                    if (err) throw err
                    console.log('File saved.')
                })
                res.render('uploadSuccessful', { uploadedImage: req.file.filename })
            }
        }
    })
})

app.post('/:imageName/comments', (req, res) => {
    data[req.params.imageName].comments.push({ name: "Dan", comment: req.body.entry })
    fs.writeFile('comments.json', JSON.stringify(data), err => {
        if (err) throw err
        console.log('File saved.')
    })
    res.send(201)
})

app.get('/:imageName/comments', (req, res) => {
    console.log(req.params.imageName)
    console.log(data[req.params.imageName])
    res.send(data[req.params.imageName])
})

// more rubric details for self-paced students:
//  - comments for images should persist across server restarts. this means that you will need to properly read from and write to a `comments.json` 
//    file in your project directory, using the `fs` module from node.
//  - your express server should have two new endpoints. `GET /:imageName/comments` and `POST /:imageName/comments`
//  - `GET /:imageName/comments` should send back an HTML string that will display the image name, the image itself, a back button, 
//     a list of comments, and a form to submit a new comment
//  - `POST /:imageName/comments` should send back the same HTML string as `GET /:imageName/comments`, however, 
//    don't forget to save the new comment on your server before sending back the response (edited) 