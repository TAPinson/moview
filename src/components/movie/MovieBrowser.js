import React, { useContext, useEffect } from "react"
import { MovieContext } from "./MovieProvider"
import { MovieBrowse } from "./Views/MovieBrowse"
import "./Movie.css"

// This are the genres from the movie database API. I could technically make this call to the API to get this, but it seems a redundant fetch for so little information
const genres = [
    {
      "id": 28,
      "name": "Action"
    },
    {
      "id": 12,
      "name": "Adventure"
    },
    {
      "id": 16,
      "name": "Animation"
    },
    {
      "id": 35,
      "name": "Comedy"
    },
    {
      "id": 80,
      "name": "Crime"
    },
    {
      "id": 99,
      "name": "Documentary"
    },
    {
      "id": 18,
      "name": "Drama"
    },
    {
      "id": 10751,
      "name": "Family"
    },
    {
      "id": 14,
      "name": "Fantasy"
    },
    {
      "id": 36,
      "name": "History"
    },
    {
      "id": 27,
      "name": "Horror"
    },
    {
      "id": 10402,
      "name": "Music"
    },
    {
      "id": 9648,
      "name": "Mystery"
    },
    {
      "id": 10749,
      "name": "Romance"
    },
    {
      "id": 878,
      "name": "Science Fiction"
    },
    {
      "id": 10770,
      "name": "TV Movie"
    },
    {
      "id": 53,
      "name": "Thriller"
    },
    {
      "id": 10752,
      "name": "War"
    },
    {
      "id": 37,
      "name": "Western"
    }
  ]

export const MovieBrowser = () => {
    const { movies, getRandomMovies, searchByGenre } = useContext(MovieContext)
    useEffect(() => {
        getRandomMovies()
    }, [])

    const movieResults = movies.results
    let results = []
    if (movieResults) {
        movieResults.map((each) => {
            results.push(each)
        })
    }

    // Initialize genreId so it is in scope of the return
    let genreId;
    // Change the value of genreId to the ID selected in genreSelect
    const genreFinder = (event) => {
        genreId = event.target.value
        searchByGenre(genreId)
    }
    return (	
        <>
        <div className="genreSelectBox"><h2>Browse by Genre:</h2>
            <select className="genreSelect"onChange={genreFinder}>
            <option key='0' value="">Select a Genre...</option>
                {genres.map((genre) => {
                    return <option key={genre.id} value={genre.id}>{genre.name}</option>
                        }
                    )}
            </select>
        </div>
		<div className="movies">
        {   
			results.map(movie => {
				return <MovieBrowse key={movie.id} movie={movie} />
			})
        }
        </div>
        </>
    )
}