import React, {useContext, useEffect, useState} from "react"
import { MovieContext } from "./MovieProvider"
import { genres } from './MovieBrowser'
import "./styles/Movie.css"

export const MovieFinder = () => {
     

    const { movies, getRandomMovies, addSelection, searchByTitle, searchByGenre } = useContext(MovieContext)
    useEffect(() => {
        // Start the application off with a selection of random movies
        getRandomMovies()
    }, [])
    
    // Bring the results of the random movies into variable
    const movieResults = movies.results

    // Initialize variable outside of function so it is available later
    let searchTerms = ""
    // Keep value of input box as variable "searchTerms"
    const searchTermFinder = (event) => {
        searchTerms = event.target.value
    }
    // Initialize variable outide of map so it is available later
    let results = []
    // Push all of the result objects in the movies object to the results array
    if (movieResults) {
        movieResults.map((each) => {
            results.push(each)
        })
        if (movies.found === false){
            // Get a random number between 1 and 19 - Object 20 never contains a movie
            let token = Math.floor(Math.random() * (19 - 0 + 1)) + 0; 
            // Use the token to display a random movie
            let movie = results[token]
            // Find the logged in user
            const userId = parseInt(localStorage.getItem("user"))
            return (
                <>
                <section className="finderContainer">
                    <div className="finderViewer">
                        <h1 className="finderTitle">{movie.title}</h1>
                        <img className="moviePoster" src={`http://image.tmdb.org/t/p/w300//` + movie.poster_path} alt="movie poster"></img>
                        <div className="movie__overview"><strong>Overview:</strong> {movie.overview}</div>
                        <button onClick={() => {
                            const selection = {
                                userId,
                                watched: false,
                                tmdbObject: movie
                            }
                            addSelection(selection)
                            .then(() =>{
                                getRandomMovies()
                            })
                            }}>Add to Queue
                        </button>
                        <button onClick={() => {
                            getRandomMovies()
                            }}>Pass
                        </button>
                        <form className="titleSearchForm">
                            <fieldset className="titleSearchField">
                                <input type="text"
                                        id="titleSearchInput"
                                        name="terms"
                                        required
                                        className="form-control"
                                        onChange={searchTermFinder}
                                       
                                         />
                            </fieldset>
                            <button type="submit"
                                    onClick={evt => {
                                        evt.preventDefault() // Prevent browser from submitting the form
                                        searchByTitle(searchTerms)
                                        document.getElementById("titleSearchInput").value = ""
                                    }}
                                    className="titleSearchBtn">
                                     Search
                            </button>
                        </form>
                    </div>
                    <div className="finderGenreButtons">
                        {
                            genres.map((genre) => {
                                return (
                                    <button key={genre.id} className="singleMovieFindBtn" onClick={() => {
                                        searchByGenre(genre.id)
                                        }
                                        }>Show {genre.name}
                                    </button>
                                )
                            })
                        }
                    </div>
                </section>
                </>
            )
        }
         else if (movies.found === true) {
            // Select the first result, as it is the closest match
            let movie = results[0]
            const imgURL = `http://image.tmdb.org/t/p/w300//${movie.poster_path}`
            const userId = parseInt(localStorage.getItem("user"))
            return (
                <>
                <section className="finderContainer">
                    <div className="finderViewer">
                        <h1>{movie.title}</h1>
                        <img className="moviePoster" src={`http://image.tmdb.org/t/p/w300//` + movie.poster_path} alt="movie poster"></img>
                        <div className="movie__overview"><strong>Overview:</strong> {movie.overview}</div>
                        <button onClick={() => {
                            const selection = {
                                userId,
                                watched: false,
                                tmdbObject: movie
                            }
                            addSelection(selection)
                            .then(() =>{
                                getRandomMovies()
                            })
                            }}>Add to Queue
                        </button>
                        <button onClick={() => {
                            getRandomMovies()
                            }}>Pass
                        </button>
                        <form className="titleSearchForm">
                            <fieldset className="titleSearchField">
                                <input type="text"
                                        id="titleSearchInput"
                                        name="terms"
                                        required
                                        className="form-control"
                                        defaultValue={movie.title}
                                        onChange={searchTermFinder}
                                        
                                         />
                            </fieldset>
                            <button type="submit"
                                    onClick={evt => {
                                        evt.preventDefault() // Prevent browser from submitting the form
                                        searchByTitle(searchTerms)
                                        document.getElementById("titleSearchInput").value = ""
                                    }}
                                    className="titleSearchBtn">
                                     Search
                            </button>
                        </form>
                    </div>
                    <div className="finderGenreButtons">
                        {
                                genres.map((genre) => {
                                    return (
                                        <button className="singleMovieFindBtn" onClick={() => {
                                            searchByGenre(genre.id)
                                            }
                                            }>Show {genre.name}
                                        </button>
                                    )
                                })
                            }
                    </div>
                </section>
                </>
            )
        }
    }
    return (
        <>
        <section className="finderContainer">
            <div className="finderViewer">
                <h1>Movie Display</h1>
            </div>
        </section>
        </>
    )
}