const {Schema,  mongoose} = require('mongoose');
const  slugify  = require('slugify');
const geocoder = require('../utils/geocoder');


const BootcampSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characteres']
    },
    slug: String, //para la url
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [500, 'Name cannot be more than 500 characteres']
    },
    website: {
        type: String,
        match : [/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/, 'Please use a valid url with HTTP or HTTPS']
    },
    phone: {
        type: String,
        maxlength: [20, 'Phone number cannot be longer than 20']
    },
    email: {
        type: String,
        match: [/^\S+@\S+\.\S+$/, 'Enter a valid email']
    },
    address: {
        type: String,
        required: [true, 'Please add an address']
    },
    location: {
        //GeoJSON form
        type: {
            type: String,
            enum: ['Point'],
            
        }, 
        coordenates: {
            type: [Number],
          
            index: '2dsphere'
        },
        formattedAddress: String,
        street: String,
        city: String,
        state: String,
        zipcode: String,
        country: String
    },
    careers: {
        type: [String],
        required: true,
        enum: [
            "Web Development",
            "Mobile Development",
            "UI/UX",
            "Data Science",
            "Business",
            "Other"
        ]
    },
    averageRating: {
        type: Number,
        min: [1, 'Rating must be at least 1'],
        max: [10, 'Rating cannot be more than 10']
    },
    averageCost: Number,
    photo:{
        type: String,
        default: 'no-photo.jpg'
    },
    housing: {
        type: Boolean,
        default: false
    },
    jobAssistance: {
        type: Boolean,
        default:false
    },
    jobGuarantee: {
        type: Boolean,
        default: false
    },
    acceptGi:{
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }, 
    user: {
        type: Schema.ObjectId,
        ref: 'User',
        required: true,
    }
}, 
{ toJSON: {  virtuals:true   } },
{ toObject: {virtuals: true}
});

//create bootcamp slug from the name
BootcampSchema.pre('save', function(next){
    this.slug = slugify(this.name, {lower: true}); //npm i slugify
    next()
})

//Create location field and Geocoder  
BootcampSchema.pre('save', async function(next){
    const data = await geocoder.geocode(this.address);

    if (data && data.length > 0) {
        this.location = {
            type: 'Point',
            coordenates: [ data[0].longitude,data[0].latitude],
            formattedAddress: data[0].formatted,
            street: data[0].streetName,
            city: data[0].city,
            state: data[0].state,
            zipcode: data[0].zipcode,
            country: data[0].countryCode
        };

     //Delete adress from the database as we now have the location path
     this.address= undefined;
    } else {
        console.error('No se encontraron datos de geocodificación para la dirección:', this.address);
    }

    next();
});

//Cascade delete courses when a bootcamp is deleted
BootcampSchema.pre('deleteOne', async function(next){
    console.log(`Courses being removed from bootcamp ${this._id}`)
await this.model('Course').deleteMany({bootcamp: this._id});
next();
})

//Reverse populate with virtuals. Para agregar el .populate en el controller de bootcamp para que se muestre el course.
BootcampSchema.virtual('courses',{
    ref: 'Course',
    localField: '_id',
    foreignField: 'bootcamp',
    justOne: false
})



module.exports = mongoose.model('Bootcamp', BootcampSchema)