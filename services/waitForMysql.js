const net = require('net')
let numRetry = 10
let timeOut = 6000

let doRetry = (err) => {
    numRetry = numRetry - 1
    if (!numRetry) {
        console.log("Unable to connect to port")
        process.exit(1)
    } else {
        console.log("Retrying connection after error: ", err ? err.message : '')
        setTimeout(doCheck, timeOut)
    }
}

let doCheck = () => {
    net.connect({host: '127.0.0.1',port: '3306'}, err => {   
    // net.connect(3306, "database", err => {
        if(!err) {
            console.log("Connection successful")
            //Wait for a few more seconds to ensure handshake will be successful
            // setTimeout(() => {
                process.exit(0)
            // }, 2000)
        } else {
            doRetry()
        }
    }).on('error', err => {
        doRetry(err)
    })
}

doCheck()
