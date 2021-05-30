require('dotenv').config()

const port = process.env.PORT


module.exports = {
    connection: function(app, mongoose, uri) {
        mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        })
        .then(() => app.listen(port))
        .catch(err => console.log("[[Error connecting to database]]: ", err))
    }
}