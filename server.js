const express = require('express')
const http = require('http')
const Chatter = require('./utils/chatter')
const fs = require('fs')

//Security options, needed in case of a public certificate; sadly Chrome won't deal with self-signed certificates
// const options = {
//     key: fs.readFileSync('key_greg.key'),
//     cert: fs.readFileSync('cert_greg.cert'),
//     requestCert: true,
//     rejectUnauthorized: false
// };


//Initiating and setting up express
const app = express()
app.use(express.json({extended: false}))


// Uses frontend after bundle build
if(process.env.NODE_ENV === 'production') {
    
    app.use(express.static('client/build'))
    
    app.get('*', (req,res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
    })

}


const server = http.createServer(app)



//Initiating chat utils
const chatter = new Chatter(server)
const port = process.env.PORT || 4000;


//Starting the server
server.listen(port, () => {
    console.log(`Server started on port ${port}`)
})