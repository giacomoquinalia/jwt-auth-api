const express = require('express')
const cors = require('cors')
const routes = require('./routes')
const mongoose = require('mongoose')
const { connection } = require('./database/config')
const app = express()
require('dotenv').config()


// URI to connect to MongoDB Atlas
const uri = process.env.URI_MONGO_ATLAS


// Middlewares
app.use(cors())
app.use(express.json())
app.use(routes)
 

// Start database connection
// Also starts app.listen on port 3000
connection(app, mongoose, uri)
