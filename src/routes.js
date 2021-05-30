const express = require('express')
const routes = express.Router()
const { validate } = require('./middlewares/ValidatorMiddleware')
const { authenticateToken, superAdmin } = require('./middlewares/AuthMiddleware')
const UsersController = require('./controllers/UsersController')


// Aplication routes
routes
    .get('/users/:id', authenticateToken, validate('get_user'), UsersController.getUser)

    .post('/users/authenticate', validate('authenticate'), UsersController.authenticate)

    .post('/users/refresh_token', validate('have_refresh_token'), UsersController.refreshToken)

    .post('/users/revoke_token', authenticateToken, validate('have_refresh_token'), UsersController.revokeToken)

    .get('/users/refresh_tokens/:id', authenticateToken, validate('get_refresh_tokens'), UsersController.getRefreshTokens)

    .post('/users/register', superAdmin, validate('register'), UsersController.register)

    .put('/users/update/:id', authenticateToken, validate('update_user'), UsersController.update)

    .put('/users/inactivate/:id/:username/:password', superAdmin, validate('inactivate_user'), UsersController.inactivate)

    .delete('/users/delete/:id', superAdmin, validate('delete_user'), UsersController.delete)
    

module.exports = routes