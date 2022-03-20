const express = require('express')
const app = express()
const mongoose = require('mongoose')
const uri =
  'mongodb+srv://perryneal11:mongodb@cluster0.hkdld.mongodb.net/WatchMatch?retryWrites=true&w=majority'
const MoviesModel = require('./models/Movies')
const axios = require('axios')

const cors = require('cors')
const { response } = require('express')
app.use(cors())

function sleep (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

app.use(express.json())
mongoose.connect(uri, { useNewUrlParser: true }, (err, db) => {
  console.log('connected')
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






app.get('/syncMovies', async (req, res) => {
  const options = {
    method: 'GET',
    url: 'https://streaming-availability.p.rapidapi.com/search/basic',
    params: {
      country: 'us',
      service: 'netflix',
      type: 'movie',
      genre: '18',
      page: '1',
      output_language: 'en',
      language: 'en'
    },
    headers: {
      'x-rapidapi-host': 'streaming-availability.p.rapidapi.com',
      'x-rapidapi-key': 'db460db4c2msha835e81c42d874ep1c1433jsnb1e93e0e6758'
    }
  }

  axios
    .request(options)
    .then(async function (response) {
      // how many pages do we get from the first request
      const numOfPages = response.data.total_pages
      let moviesToAdd = response.data.results
      console.log('starting movies length', moviesToAdd.length)
      console.log('pages', numOfPages)
      for (let x = 1; x < 2; x++) {
        await sleep(1000).then(() => {
          console.log('changing pages to ', x)
          options.params.page = x
          axios
            .request(options)
            .then(function (response) {
              // how many pages do we get from the first request
              // const numOfPages = response.data.total_pages
              console.log(
                'new movie list ',
                response.data.results.map((e) => e.title)
              )
              console.log('type', typeof moviesToAdd)
              moviesToAdd = moviesToAdd.concat(response.data.results)
              console.log('length of movies NOW ', moviesToAdd.length)
              console.log(
                'annnnd movies:',
                moviesToAdd.map((e) => e.title)
              )
              return moviesToAdd
            })
            .then(async function (response) {
              console.log(
                'received movies to post:',
                response.map((e) => e.title)
              )

              const newMovie = new MoviesModel(response)
              await newMovie.collection.deleteMany({})
              await newMovie.collection.insertMany(
                response,
                function (err, docs) {
                  if (err) {
                    return console.error(err)
                  } else {
                    console.log('inserted multiple')
                  }
                }
              )
              console.log('DONE')
            })
            .catch(function (error) {
              console.error(error)
            })
        })
      }
    })
    .then()
    .catch(function (error) {
      console.error(error)
    })
})

app.listen(3001, () => {
  console.log('server running')
})
