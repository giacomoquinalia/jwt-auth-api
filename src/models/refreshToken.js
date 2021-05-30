const mongoose = require('mongoose')
const Schema = mongoose.Schema


const refreshTokenSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    token: String,
    expires: Date,
    created: { type: Date, default: Date.now },
    createdByIp: String,
    revoked: Date,
    revokedByIp: String,
    replacedByToken: String 
})


refreshTokenSchema.virtual('isExpired').get(function () {
    return Date.now() >= this.expires
})

refreshTokenSchema.virtual('isActive').get(function () {
    return !this.revoked && !this.isExpired
})

refreshTokenSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        // remove these props when object is serialized
        delete ret._id
        delete ret.id
        delete ret.user_id
    }
})

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema)


module.exports = RefreshToken