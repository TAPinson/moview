import React, { useContext, useEffect } from "react"
import { MovieContext } from "./MovieProvider"
import { MovieBrowse } from "./Views/MovieBrowse"
import "./styles/Movie.css"

// This are the genres from the movie database API. I could technically make this call to the API to get this, but it seems a redundant fetch for so little information
export const genres = [
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
    const { movies, getRandomMovies, searchByGenre, getNowPlaying, liked, getLiked } = useContext(MovieContext)
    useEffect(() => {
        getRandomMovies()
        .then(() => {
          getLiked()
        })
    }, [])
    // This will be the array of results we map over
    const movieResults = movies.results
    // Initialize genreId so it is in scope of the return
    let genreId;
    // Change the value of genreId to the ID selected in genreSelect
    const genreFinder = (event) => {
        genreId = event.target.value
        searchByGenre(genreId)
    }
    // Get logged in user ID
    const loggedInUser = parseInt(localStorage.getItem("user"))
    // Get all of logged in users movies
    const myQueue = liked.filter((like) => {
        return like.userId === loggedInUser
    })
    // Array to hold IDs of liked movies
    let likeIds = []
    // Push the ID of each liked movie to the array
    myQueue.map((queueObj) => {
      likeIds.push(queueObj.tmdbObject.id)
    })
    if (movieResults !== undefined){
        return (	
            <>
            <div className="genreSelectBox"><h2 className="genreSelectHead">Browse by:</h2>
                <select className="genreSelect"onChange={genreFinder}>
                <option key='0' value="">Browse By Genre...</option>
                    {genres.map((genre) => {
                        return <option key={genre.id} value={genre.id}>{genre.name}</option>
                            }
                        )}
                </select>
                <button className="singleMovieFindBtn" onClick={() => {
                    getNowPlaying()
                    }
                    }>Now Playing
                </button>
            </div>
            <div className="movies"> 
            {   // We will only map movies that have not already been liked
                movieResults.map(movie => {
                    if (likeIds.includes(movie.id) === false) {
                      return <MovieBrowse key={movie.id} movie={movie} />

                    }
                })
            }
            </div>
            </>
        )
    }
    return (<>Rendering...</>)
}