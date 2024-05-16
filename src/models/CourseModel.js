
const { Schema, default: mongoose } = require("mongoose");


const CourseSchema = new Schema({
    title: {
        type:String,
        trim: true,
        required: [true, 'Please add a course title']
    },
    description: {
        type: String,
        required: [true, 'Please add a course description']
    },
    weeks: {
        type: String,
        required: [true, 'Please add a number of weeks']
    },
    tuition: {
        type: Number,
        required: [true, 'Please add a tuition cost']
    },
    minimumSkill: {
        type: String,
        required: [true, 'Please add a minimum skill'],
        enum: ['beginner', 'intermediate', 'advanced']
    },
    scholarshipAvailable: {
        type: Boolean,
       default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    bootcamp: {
        type: Schema.ObjectId,
        ref: 'Bootcamp',
        required: true,
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User',
        required: true,
    }
});

// Static method for av cost of tuition
CourseSchema.statics.getAverageCost = async function(bootcampId) {
    const obj = await this.aggregate([
        {
            $match: { bootcamp: bootcampId}
        },{
        $group: {
            _id: '$bootcamp',
            averageCost: { $avg: '$tuition'}
        }}
    ])

   // console.log(obj) // se ejecuta cuando agrego un nuevo curso a un bootcamp /bootcamps/:bootcampId/course
    //devuelve [{_id: id del bootcamp.., averageCost: cost...}]
    try{
        await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
            averageCost: Math.ceil(obj[0].averageCost / 10) * 10
        })
    }catch(err){
        console.error(err)
    }


}

//Cuando agregue nuevos cursos a los bootcamps, se actualiza el valor 

//Call getAverageCost After save
CourseSchema.post('save', function(){
    this.constructor.getAverageCost(this.bootcamp); //le paso el id de bootcamp

})

//Call getAverageCost before remove
CourseSchema.pre('deleteOne', function(){
this.constructor.getAverageCost(this.bootcamp);
})

module.exports = mongoose.model('Course', CourseSchema);

