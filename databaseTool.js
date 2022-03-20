const axios = require('axios')
const { response } = require('express')
const MoviesModel = require('./models/Movies')
const mongoose = require('mongoose')
const uri =
  'mongodb+srv://perryneal11:mongodb@cluster0.hkdld.mongodb.net/WatchMatch?retryWrites=true&w=majority'

mongoose.connect(uri, { useNewUrlParser: true }, (err, db) => {
  if (err) {
    return console.error(err)
  } else {
    console.log('connected')
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

async function getNewMoviesFromNetflix () {
  options.url = 'https://streaming-availability.p.rapidapi.com/changes'
  options.params.change_type = 'new'
  options.params.type = 'movie'
  options.params.service = 'netflix'
  await axios.request(options).then(async function (response) {
    // console.log(response.data.results.map(e => e.title))
    postToDatabase(response.data.results)
  })
}

async function getNewShowsFromNetflix () {
  options.url = 'https://streaming-availability.p.rapidapi.com/changes'
  options.params.change_type = 'new'
  options.params.type = 'series'
  options.params.service = 'netflix'
  await axios.request(options).then(async function (response) {
    // console.log(response.data.results.map(e => e.title))
    postToDatabase(response.data.results)
  })
}

async function getNewMoviesFromHulu () {
  options.url = 'https://streaming-availability.p.rapidapi.com/changes'
  options.params.change_type = 'new'
  options.params.type = 'movie'
  options.params.service = 'hulu'
  await axios.request(options).then(async function (response) {
    // console.log(response.data.results.map(e => e.title))
    postToDatabase(response.data.results)
  })
}
async function getNewShowsFromHulu () {
  options.url = 'https://streaming-availability.p.rapidapi.com/changes'
  options.params.change_type = 'new'
  options.params.type = 'series'
  options.params.service = 'hulu'
  await axios.request(options).then(async function (response) {
    // console.log(response.data.results.map(e => e.title))
    postToDatabase(response.data.results)
  })
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

readline.question(
  '1 for pop?\n2 for new \n 3 for deleted\n',
  async (response) => {
    if (response == '1') {
      console.log('sync data')
    } else if (response == '2') {
      await getNewMoviesFromNetflix()
        .then(async function () {
          getNewShowsFromNetflix()
        })
        .then(async function () {
          getNewMoviesFromHulu()
        })
        .then(async function () {
          getNewShowsFromHulu()
        })
    } else if (response == '3') {
      console.log('delete goes here')
    }
    readline.close()
  }
)
