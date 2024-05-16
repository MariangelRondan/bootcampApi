
const { Schema, default: mongoose } = require("mongoose");


const ReviewSchema = new Schema({
    title: {
        type:String,
        trim: true,
        required: [true, 'Please add a review title'], 
        maxlength: 100
    },
    text: {
        type: String,
        required: [true, 'Please add text']
    },
    rating: {
        type: Number,
        min: 1,
        max: 10,
        required: [true, 'Please add a rating between 1 and 10']
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
//cada user solo puede dar una review por bootcamp
ReviewSchema.index({bootcamp: 1, user: 1}, {unique: true})


// Static method to get avg rating and save
ReviewSchema.statics.getAverageRating = async function(bootcampId) {
    const obj = await this.aggregate([
        {
            $match: { bootcamp: bootcampId }
        },
        {
            $group: {
                _id: '$bootcamp',
                averageRating: { $avg: '$rating' }
            }
        }
    ]);

    try {
        await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
            averageRating: obj[0] ? obj[0].averageRating : undefined
        });
    } catch (err) {
        console.error(err);
    }
};

// Call getAverageRating after save
ReviewSchema.post('save', function() {
    this.constructor.getAverageRating(this.bootcamp);
});

// Call getAverageRating before remove
ReviewSchema.pre('deleteOne', { document: true, query: false }, async function() {
    await this.constructor.getAverageRating(this.bootcamp);
});

module.exports = mongoose.model('Review', ReviewSchema);

