const express = require('express')
const app = express()
const mongoose = require('mongoose')
const uri =
  'mongodb+srv://perryneal11:mongodb@cluster0.hkdld.mongodb.net/WatchMatch?retryWrites=true&w=majority'
const MoviesModel = require('./models/Movies')

const cors = require('cors')
const { response } = require('express')
app.use(cors())

app.use(express.json())
mongoose.connect(uri, { useNewUrlParser: true }, (err, db) => {
  if (err) {
    return console.error(err)
  } else {
    console.log('connected')
  }
})

app.get('/getMovies', (req, res) => {
  MoviesModel.find({}, (err, result) => {
    if (err) {
      res.json(err)
    } else {
      res.json(result)
    }
  })
})

app.listen(process.env.PORT || 5000, () => {
  console.log('server running')
})
