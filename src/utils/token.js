const jwt = require("jsonwebtoken")
const crypto = require('crypto')
const RefreshToken = require("../models/refreshToken")
require('dotenv').config()


module.exports = {
    generateAccessToken(id) {
      return jwt.sign({ id }, process.env.TOKEN_SECRET, { expiresIn: '60m' }) // 60 minutes expiration
    },
    generateRefreshToken(id, ip_address) {
      return new RefreshToken({
        user_id: id,
        token: crypto.randomBytes(40).toString('hex'),
        expires: new Date(Date.now() + 200*24*60*60*1000), // 200 days valid (Date.now() + 200)
        createdByIp: ip_address
      })
    },
    // Verify the quantity of refresh tokens and delete them if greater then 24
    async refreshTokensManagement(id) {
        const quantity = await RefreshToken.find({ user_id: id }).countDocuments()

        if (quantity >= 25) await RefreshToken.deleteMany({ user_id: id })
    }
}