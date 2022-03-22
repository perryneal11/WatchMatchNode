const axios = require('axios')
const { response } = require('express')
const MoviesModel = require('./models/Movies')
const mongoose = require('mongoose')
const uri =
  'mongodb+srv://perryneal11:mongodb@cluster0.hkdld.mongodb.net/WatchMatch?retryWrites=true&w=majority'
const changesURL = 'https://streaming-availability.p.rapidapi.com/changes'
const getURL = 'https://streaming-availability.p.rapidapi.com/search/basic'

function sleep (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

mongoose.connect(uri, { useNewUrlParser: true }, (err, db) => {
  if (err) {
    return console.error(err)
  } else {
    console.log('connected ')
  }
})

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
})

const options = {
  method: 'GET',
  url: 'https://streaming-availability.p.rapidapi.com/search/basic',
  params: {
    country: 'us',
    output_language: 'en',
    language: 'en'
  },
  headers: {
    'x-rapidapi-host': 'streaming-availability.p.rapidapi.com',
    'x-rapidapi-key': 'db460db4c2msha835e81c42d874ep1c1433jsnb1e93e0e6758'
  }
}

async function getFromRapidApi (url, changeType, type, service, action) {
  options.url = 'https://streaming-availability.p.rapidapi.com/changes'
  options.params.change_type = changeType
  options.params.type = type
  options.params.service = service
  await axios.request(options).then(async function (response) {
    // console.log(response.data.results.map(e => e.title))
    if (action == 'post') {
      postToDatabase(response.data.results)
    } else if (action == 'delete') {
      removeFromDatabase(response.data.results)
    }
  })
}

function mule () {
  const newMovie = new MoviesModel()
  const query = { title: 'Shrek 2' }
  const queryResults = newMovie.collection.find(query)
  console.log('query results', queryResults)
}

async function getEverything (service, type) {
  console.log('getting', type, 'from', service)
  options.url = 'https://streaming-availability.p.rapidapi.com/search/basic'
  options.params.service = service
  options.params.type = type
  options.params.page = 1
  axios
    .request(options)
    .then(async function (response) {
      // how many pages do we get from the first request
      const numOfPages = response.data.total_pages
      let moviesToAdd = response.data.results
      console.log('starting movies length', moviesToAdd.length)
      console.log('pages', numOfPages)
      postToDatabase(moviesToAdd)
      for (let x = 2; x < 2; x++) {
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
              moviesToAdd = response.data.results
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
              // await newMovie.collection.deleteMany({})
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
}

async function deleteEverything () {
  const newMovie = new MoviesModel(response)
  await newMovie.collection.deleteMany({}).then(console.log('deleted everything'))
}

async function postToDatabase (movies) {
  console.log(
    'received movies to post:',
    movies.map((e) => e.title)
  )

  const newMovie = new MoviesModel(movies)
  await newMovie.collection.insertMany(movies, function (err, docs) {
    if (err) {
      return console.error(err)
    } else {
      console.log('inserted multiple')
    }
  })
  console.log('DONE')
}

async function removeFromDatabase (movies) {
  console.log(
    'received movies to delete:',
    movies.map((e) => e.title)
  )
  const newMovie = new MoviesModel(movies)
  const query = { title: movies.map((e) => e.title) }
  const queryResults = newMovie.collection.find(query)
  console.log('query results', queryResults.toArray)

  await newMovie.collection.deleteMany(query, function (err, docs) {
    if (err) {
      return console.error(err)
    } else {
      console.log('deleted multiple')
    }
  })
  console.log('DONE')
}

readline.question(
  '1 for pop?\n2 for new \n3 for deleted\n4 delete everything\n5 mule \n',
  async (response) => {
    if (response == '1') {
      // Movies from netflix
      await getEverything('netflix', 'movie').then(async function () {
        // Shows from netflix
        await getEverything('netflix', 'series')
      })
        .then(async function () {
        // Movies from hulu
          await getEverything('hulu', 'movie')
        })
        .then(async function () {
        // Shows from hulu
          await getEverything('hulu', 'series')
        })
    } else if (response == '2') {
      // Movies from netflix
      await getFromRapidApi(changesURL, 'new', 'movie', 'netflix', 'post')
        .then(async function () {
          // Shows from netflix
          await getFromRapidApi(changesURL, 'new', 'series', 'netflix', 'post')
        })
        .then(async function () {
          // Movies from hulu
          await getFromRapidApi(changesURL, 'new', 'movie', 'hulu', 'post')
        })
        .then(async function () {
          // Shows from hulu
          await getFromRapidApi(changesURL, 'new', 'series', 'hulu', 'post')
        })
    } else if (response == '3') {
      // Removed from netflix
      await getFromRapidApi(changesURL, 'removed', 'movie', 'netflix', 'delete')
      // Removed from hulu
      await getFromRapidApi(changesURL, 'removed', 'movie', 'hulu', 'delete')
    } else if (response == '4') {
      deleteEverything()
    } else if (response == '5') {
      mule()
    }

    readline.close()
  }
)
