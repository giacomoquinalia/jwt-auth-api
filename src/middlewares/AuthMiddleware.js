const jwt = require("jsonwebtoken")
const User = require('../models/user')

// Utils
const bcrypt = require('bcrypt')
require('dotenv').config()


module.exports = {
    authenticateToken(req, res, next) {
        // Gather the jwt access token from the request header
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]

        if (!token) return res.status(401).json({ auth: false, message: 'Authentication failed: No token was provided.' }) // if there isn't any token
          
        jwt.verify(token, process.env.TOKEN_SECRET, (err, result) => {
          if (err) return res.status(403).json({ auth: false, error: err })
          
          next()
        })
    },
    superAdmin(req, res, next) {
    //   const { id, username, password, secret } = req.body || null

    //   if (!id || !username || !password || !secret) {
    //     return res.status(403).json({ message: 'You have no permission to access this route!' })
    //   }

    //   const user = await User.findOne({
    //     _id: id,
    //     username: username,
    //     secret: secret
    //   })

    //   if (!user || !bcrypt.compareSync(password, user.password)) {
    //     return res.status(403).json({ message: 'You have no permission to access this route!' })
    //   }
        
      return next()
    }
}