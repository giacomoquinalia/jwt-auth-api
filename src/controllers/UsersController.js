const User = require('../models/user')
const RefreshToken = require('../models/refreshToken')
const { validationResult } = require('express-validator')
const bcrypt = require('bcrypt')
const { 
    generateAccessToken, 
    generateRefreshToken, 
    refreshTokensManagement 
} = require('../utils/token')
require('dotenv').config()


module.exports = {
    async authenticate(req, res) {
        const errors = validationResult(req)
 
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                auth: false, 
                message: "Parameters error.", 
                error: errors.array()
            })
        }
        
        const { username, password } = req.body
        const ip_address = req.ip || null

        const user = await User.findOne({ username: username })

        if (!user || !user.is_active || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ auth: false, user: null })
        }

        // To control refresh tokens quantity
        await refreshTokensManagement(user._id)

        const token = generateAccessToken(user._id)
        const refresh_token = generateRefreshToken(user._id, ip_address)

        await refresh_token.save()

        return res.json({ 
            auth: true, 
            user: user, 
            token: token,
            refresh_token: refresh_token.token
        })
    },


    async refreshToken(req, res) {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                auth: false, 
                message: "Parameters error.", 
                error: errors.array()
            })
        }

        const refresh_token_request = req.body.refresh_token
        const ip_address = req.ip || null

        const refresh_token = await RefreshToken.findOne({ token: refresh_token_request }).populate('user_id')
        
        if (!refresh_token || !refresh_token.isActive) {
            return res.status(401).json({ auth: false, message: 'Invalid refresh token' })
        }

        const user_id = refresh_token.user_id._id
        
        // Check if user is active
        const user = await User.findById(user_id)

        if (!user.is_active) {
            return res.status(401).json({ auth: false, message: "Authentication failed" })
        }      

        // replacing old refresh token with a new one and save
        const new_refresh_token = generateRefreshToken(user_id, ip_address)
        
        refresh_token.revoked = Date.now()
        refresh_token.revokedByIp = ip_address
        refresh_token.replacedByToken = new_refresh_token.token

        // Save old refresh token data
        await refresh_token.save()
        // To control refresh tokens quantity
        await refreshTokensManagement(user_id)
        // Save new refresh token
        await new_refresh_token.save()
    
        // generate new jwt
        const new_token = generateAccessToken(user_id)
    
        return res.json({
            auth: true,
            user_id: user_id,
            token: new_token,
            refresh_token: new_refresh_token.token
        })
    },


    async revokeToken(req, res) {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                auth: false, 
                message: "Parameters error.", 
                error: errors.array()
            })
        }

        const token = req.body.refresh_token
        const ip_address = req.ip || null

        const refresh_token = await RefreshToken.findOne({ token }).populate('user_id')
        if (!refresh_token || !refresh_token.isActive) {
            return res.status(401).json({ success: false, message: 'Failed to revoke token' })
        }
    
        // revoke token and save
        refresh_token.revoked = Date.now()
        refresh_token.revokedByIp = ip_address

        await refresh_token.save()

        return res.json({ success: true, message: 'Token revoked' })
    },


    async getRefreshTokens(req, res) {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                auth: false, 
                message: "Parameters error.", 
                error: errors.array()
            })
        }

        const id = req.params.id
        
        // check that user exists
        const user = await User.findOne({_id: id})

        if (!user) {
            return res.status(401).json({ success: false, refresh_tokens: null })
        }

        // return refresh tokens for user
        const refreshTokens = await RefreshToken.find({ user_id: user._id })
        
        return res.status(401).json({ 
            success: true,
            refresh_tokens: refreshTokens 
        })
    },


    register(req, res) {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                auth: false, 
                message: "Parameters error.", 
                error: errors.array()
            })
        }

        const { username, password, email, mobile, company } = req.body || null

        const saltRounds = 12
        const hash = bcrypt.hashSync(password, saltRounds)

        const newUser = new User({
            username: username,
            password: hash,
            email: email,
            mobile: mobile,
            company: company,
            is_active: true
        })

        newUser.save()
            .then(user => {
                return res.status(200).json({ success: true, message: 'User added successfully.', user: user })
            })
            .catch(error => {
                return res.status(500).json({ success: false, message: 'Error on inserting user on database.', user: null, error: error })
            })
    },


    async getUser(req, res) {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                auth: false, 
                message: "Parameters error.", 
                error: errors.array()
            })
        }
        
        const { id } = req.params

        try {
            const data_retrieve = 'username company'
            const user = await User.findById(id, data_retrieve)

            return res.json({ success: true, user: user, error: null })
        } catch(error) {
            return res.json({ success: false, user: null, error: error })
        }
    },

    
    async update(req, res) {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                message: "Parameters error.", 
                errors: errors.array() 
            })
        }

        const { id } = req.params
        const { username, password, email, mobile, company } = req.body || null

        let user = {
            username: username,
            password: password,
            email: email,
            mobile: mobile,
            company: company
        }

        // Verify which data will be updated
        for (const [key, value] of Object.entries(user)) { if (!value) delete user[key] }

        // In case update password generate a new hash of it
        if ('password' in user) {
            const saltRounds = 12
            const hash = bcrypt.hashSync(user.password, saltRounds) 
            user.password = hash
        }

        try {
            await User.updateOne({_id: id}, user)

            const data_retrieve = 'username company'
            const updated_user = await User.findById(id, data_retrieve)

            return res.json({ success: true, user: updated_user, error: null })
        } catch(error) {
            return res.status(500).json({ success: false, user: null, error: error })
        }

        // User.findOneAndUpdate({ _id: id }, user, { new: true })
        //     .then(updated_user => {
        //         const user = {
        //             _id: updated_user._id,
        //             username: updated_user.username,
        //             company: updated_user.company
        //         }
        //         return res.json({ success: true, message: "User updated successfully.", user: user })
        //     })
        //     .catch(err => {
        //         return res.status(500).json({ success: false, message: "Error on update user on database", error: err })
        //     })
    },


    inactivate(req, res) {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                auth: false, 
                message: "Parameters error.", 
                error: errors.array()
            })
        }

        const { id } = req.params

        User.findOneAndUpdate({ _id: id }, { is_active: false }, { new: true })
            .then(inactive_user => {
                return res.json({ success: true, message: "User inatctivated successfully", user: inactive_user }) 
            })
            .catch(err => {
                return res.status(500).json({ success: false, message: "Error on inactivate user on database", error: err })
            })
    },


    async delete(req, res) {
        const errors = validationResult(req)

        if (!errors.isEmpty()) return res.status(400).json({ success: false, message: "Parameters error", errors: errors.array() })

        const { id } = req.params

        try {
            const result = await User.deleteOne({ _id: id })

            return res.json({ success: true, message: "User deleted successfully", result: result })
        } catch(error) {
            return res.status(500).json({ success: false, message: "Error on deleteting user", error: error })
        }
    }
}