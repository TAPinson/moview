import React, {useContext, useEffect, useState} from "react"
import { MovieContext } from "./MovieProvider"

import "./Movie.css"

export const MovieFinder = () => {
    const { movies, getMovies, getRandomMovies, addSelection } = useContext(MovieContext)
    const [ movie , setMovie] = useState({})
    useEffect(() => {
        getRandomMovies()
    }, [])
    let results = []
    const movieResults = movies.results
    if (movieResults) {
        movieResults.map((each) => {
            results.push(each)
        })
        let token = Math.floor(Math.random() * (20 - 0 + 1)) + 0; // returns a random integer from 1 to 20
        let movie = results[token]
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