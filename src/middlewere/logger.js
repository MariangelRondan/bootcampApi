const logger = (req, res, next) => {
    console.log(
        `${req.method} ${req.protocol}://${req.get('host')}${req.originalUrl}`
        //hace un console.log del met y la url de cada nueva req
    )
    next()
    }


    module.exports = logger;