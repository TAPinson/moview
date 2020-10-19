import React, {useContext, useEffect} from "react"
import { MovieContext } from "./MovieProvider"

import "./Movie.css"

export const MovieFinder = () => {
    const { movies, getMovies, getRandomMovies } = useContext(MovieContext)
    //console.log(movies)
    
    //useEffect - reach out to the world for something
    useEffect(() => {
		//console.log("MovieList: useEffect - getMovies")
        getRandomMovies()
		
    }, [])

    let results = []
    const movieResults = movies.results
    if (movieResults) {
        movieResults.map((each) => {
            results.push(each)
        })
        const movie = results[0]
        const imgURL = `http://image.tmdb.org/t/p/w300//${movie.poster_path}`
        //console.log(results[0])
        return (
            <>
            <section className="finderContainer">
                <div className="finderViewer">
                    <h1>{movie.title}</h1>
                    <img classname="moviePoster" src={imgURL} alt="movie poster"></img>
                    <div className="movie__overview"><strong>Overview:</strong> {movie.overview}</div>
                    
                </div>
            </section>
            </>
        )


    } 
    

    return (
        <>
        <section className="finderContainer">
            <div className="finderViewer">
                <h1>Movie Display</h1>
            </div>
        </section>
        </>
    )}