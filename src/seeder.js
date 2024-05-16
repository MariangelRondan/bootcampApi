const dotenv = require('dotenv')
const fs = require('fs')
const mongoose = require('mongoose')

//Load env variables
dotenv.config({path: './src/config/config.env'})


//Load models
const BootcampModel = require('../src/models/BootcampModel');
const CourseModel = require('../src/models/CourseModel');
const UserModel = require('./models/UserModel');
const ReviewModel = require('./models/ReviewModel');


//Connect to DB
mongoose.connect(
 process.env.MONGO_URL  )

//Read JSON files
const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8'))

const courses = JSON.parse(fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8'))

const users = JSON.parse(fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8'))

const reviews = JSON.parse(fs.readFileSync(`${__dirname}/_data/reviews.json`, 'utf-8'))

// Import data into DB
const importData = async () => {
    try {
        await BootcampModel.create(bootcamps);
        await CourseModel.create(courses);
        await UserModel.create(users);
        await ReviewModel.create(reviews);
        console.log('Data imported successfully')
    } catch (error) {
        console.error(error)
    }
}

const destroyData = async ()=> {
    try {
        await BootcampModel.deleteMany();
        await CourseModel.deleteMany();
        await UserModel.deleteMany();
        await ReviewModel.deleteMany();
        console.log('Data has been destroyed')
    } catch (error) {
        console.error(error)
    }
}

if(process.argv[2] === '-i'){
importData();
} else if(process.argv[2] === '-d'){
    destroyData()
}

//Eso significa que si en la terminal ejecuto este archivo con -i o -d al final se van a ejecutar esas fn
// node src/seeder -i  para que se importen los bootcamps en la DB