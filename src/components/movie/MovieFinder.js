import React, {useContext, useEffect, useState} from "react"
import { MovieContext } from "./MovieProvider"

import "./Movie.css"

export const MovieFinder = () => {
    const { movies, getRandomMovies, addSelection, searchByTitle } = useContext(MovieContext)
    const [ movie , setMovie] = useState({})
    useEffect(() => {
        getRandomMovies()
    }, [])
    let results = []
    const movieResults = movies.results

    let searchTerms = ""
    const searchTermFinder = (event) => {
        searchTerms = event.target.value
        
    }

    if (movieResults) {
        movieResults.map((each) => {
            results.push(each)
        })
        // Somewhere below here I have to figure out the logic to discern between random movies and search results
        let token = Math.floor(Math.random() * (20 - 0 + 1)) + 0; // returns a random integer from 1 to 20
        let movie = results[0]
        // Somewhere above here I have to figure out the logic to discern between random movies and search results
        if (movie) {
            const imgURL = `http://image.tmdb.org/t/p/w300//${movie.poster_path}`
            const userId = parseInt(localStorage.getItem("user"))
            return (
                <>
                <section className="finderContainer">
                    <div className="finderViewer">
                        <h1>{movie.title}</h1>
                        <img className="moviePoster" src={imgURL} alt="movie poster"></img>
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
                            }}>Like
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
                                        placeholder="Search By Title"
                                        onChange={searchTermFinder}
                                        
                                         />
                                
                            </fieldset>
                            <button type="submit"
                                    onClick={evt => {
                                        evt.preventDefault() // Prevent browser from submitting the form
                                     
                                      
                                        searchByTitle(searchTerms)
                                       
                            
                                    }}
                                    className="titleSearchBtn">
                                     Search
                            </button>
                        </form>
                    </div>
                </section>
                </>
            )

        } else {
            getRandomMovies()
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