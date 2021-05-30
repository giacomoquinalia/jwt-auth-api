const { body, param } = require('express-validator')


module.exports = {
    validate(method) {
        switch (method) { 
            // Users
            case 'authenticate': {
                return [
                    body('username', 'Error in parameter <username>: must be string').isString(),
                    body('password', 'Error in parameter <password>: does not exists').exists()
                ]
                break
            }
            case 'register': {
                return [
                    body('username', 'Error in parameter <username>: must be string').isString(),
                    body('password', 'Error in parameter <password>: does not exists').exists(),
                    body('company', 'Error in parameter <company>: must be string').isString()                  
                ]
                break
            }
            case 'get_user': {
                return [
                    param('id', 'Error in parameter <id>: must exists').exists()
                ]
                break
            }
            case 'update_user': {
                return [
                    param('id', 'Error in parameter <id>: must exists').exists()
                ]
                break
            }
            case 'inactivate_user': {
                return [
                    param('id', 'Error in parameter <id>: must exists').exists(),
                    param('username', 'Error in parameter <username>: must exists').isString(),
                    param('password', 'Error in parameter <password>: must exists').exists()
                ]
                break
            }
            case 'delete_user': {
                return [
                    param('id', 'Error in parameter <id>: must exists').exists()
                ]
                break
            }
            case 'get_refresh_tokens': {
                return [
                    param('id', 'Error in parameter <id>: must exists').exists()
                ]
                break
            }
            case 'have_refresh_token': {
                return [
                    body('refresh_token', 'Error in parameter <refresh_token>: must exists').exists()
                ]
                break
            }
        }
    }
}