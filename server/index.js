const express = require('express')
const app = express()
const mongoose = require('mongoose')
const uri = "mongodb+srv://perryneal11:mongodb@cluster0.hkdld.mongodb.net/WatchMatch?retryWrites=true&w=majority"
const MoviesModel = require('./models/Movies')

const cors = require('cors');
app.use(cors())



app.use(express.json());
mongoose.connect(uri, { useNewUrlParser: true }, (err, db) => {
    console.log("connected")
 });

 app.get('/getMovies', (req, res) => {
    MoviesModel.find({}, (err, result) => {
    if (err) {
        res.json(err);
    } else {
        res.json(result);
    }

})});

app.post('/postMovies', async (req, res) => {
    const movies = req.body
    console.log('received movies ', movies)

    const newMovie = new MoviesModel(movies)
    
    await newMovie.collection.insertMany(movies, function(err, docs){
        if(err){
            return console.error(err)
        }
        else{
            console.log("inserted multiple")
        }

    })


})


app.listen(3001, () => {
     console.log("server running")
});
