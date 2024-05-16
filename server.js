const express = require('express');
const dotenv = require('dotenv');
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const hpp = require('hpp')
//Routes
const bootcampRoutes = require('./src/routes/bootcamp.routes');
const courseRoutes = require('./src/routes/courses.routes')
const authRoutes = require('./src/routes/auth.routes')
const userRoutes = require('./src/routes/user.routes')
const reviewRoutes = require('./src/routes/review.routes')


const logger = require('./src/middlewere/logger');
const morgan = require('morgan');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middlewere/error');
const fileUpload = require('express-fileupload');
const path = require('path');
const cookieParser = require('cookie-parser')

dotenv.config({path: './src/config/config.env'})
const PORT= process.env.PORT || 5000;

const app = express();

//Body parser
app.use(express.json())

//Cookie parser
app.use(cookieParser())

if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}

//Sanitize data
app.use(mongoSanitize())

//Set security headers
app.use(helmet())

//Prevent XSS attacks
app.use(xss())

//Rate limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, //10 minutes
    max: 100
})
app.use(limiter)

//Prevent http param pollution
app.use(hpp())

//Enable cors
app.use(cors())

// File uploading
app.use(fileUpload());

//set static folder
app.use(express.static(path.join(__dirname, 'src/public')));
//si voy a http://localhost:3000/uploads/photo_5d725a1b7b292f5f8ceff788.png puedo acceder a la foto desde el front

//connect to DB
connectDB();

//Routes
app.use('/api/v1/bootcamps', bootcampRoutes)
app.use('/api/v1/courses', courseRoutes)
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/users', userRoutes)
app.use('/api/v1/reviews', reviewRoutes)

app.use(errorHandler) //route error

const server =
app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} on PORT ${PORT}`));


//Handle promises rejections
process.on('unhandledRejection', (err, promise)=>{
    console.log(`Error: ${err.message}`);
    //Close server and exit process
    server.close(()=> process.exit(1))
})
