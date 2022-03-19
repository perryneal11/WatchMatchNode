import logo from './logo.svg';
import './App.css';
import {useState, useEffect } from 'react';
import Axios from 'axios'



function App() {
  const mernURI = "http://localhost:3001/getMovies"
  const rapidURI = 'https://streaming-availability.p.rapidapi.com/search/basic?country=us&service=netflix&type=movie&output_language=en&language=en'
  const config = {
    headers:{
      'x-rapidapi-host': 'streaming-availability.p.rapidapi.com',
      'x-rapidapi-key': 'db460db4c2msha835e81c42d874ep1c1433jsnb1e93e0e6758'
    }
  };


  const [listOfMovies, setListOMovies] = useState([{  
    "_id": "0",
    "overview": "dummy",
    "imdbID": "tt99999"
  }])

  const [loading, setLoading] = useState(false);


const syncDatabase = async () => {

  const response = await Axios.get(mernURI).then((response)=> {
    setLoading(true);
    const newMovies = response.data
    setListOMovies(newMovies)
  })

  console.log(listOfMovies)
  console.log('synced')
  setLoading(false);
}


  useEffect(()=> {
    Axios.get(mernURI).then((response)=> {
      //setListOMovies(response.data)
    })
      console.log(listOfMovies)
  
  }, [])
  





  return (
    <div className="App">
      <header className="App-header">

        {loading && <div>Loading</div>}
        <table >
        {!loading && (listOfMovies.map((movie, index) => {
          return(
            <tbody key = {index}>
              <tr key={movie._id}>
                <th key={movie.title}>{movie.title}</th>
                <th key={movie.overview}>{movie.overview}</th>
                <th key={movie.backdropPath}>{movie.backdropPath}</th>
                <th key={movie.video}>{movie.video}</th>
                <th key={movie.imdbID}>{movie.imdbID}</th>
              </tr>
              </tbody>
          )})

        )

}
        </table>

        <button  onClick={syncDatabase}>sync database</button>


      </header>
    </div>
  );
}

export default App;
