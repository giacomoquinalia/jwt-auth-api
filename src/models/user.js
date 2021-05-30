const mongoose = require('mongoose')
const Schema = mongoose.Schema


const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String
    },
    mobile: {
        type: String
    },
    company: {
        type: String
    },
    is_active: {
        type: Boolean,
        required: true
    }
}, { timestamps: true })


userSchema.set('toJSON', {
    versionKey: false,
    transform: function (doc, ret) {
        // remove these props when object is serialized
        delete ret.password
        delete ret.is_active
        delete ret.createdAt
        delete ret.updatedAt
    }
})

const User = mongoose.model('User', userSchema)

module.exports = User