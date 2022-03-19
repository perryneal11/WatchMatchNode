const mongoose  = require('mongoose')
const MoviesSchema = new mongoose.Schema({

    overview: {
         type: String,
         require: true,
    },
    imdbId: {
        type: String,
        require: true 
    },
    backdropPath: {
        type: String,
        require: true 
    },
    video: {
        type: String,
        require: true 
    },
    title: {
        type: String,
        require: true 
    },
    service: {
        type: String,
        require: true

    }



});

const MovieModel = mongoose.model("movies", MoviesSchema)
module.exports = MovieModel 
