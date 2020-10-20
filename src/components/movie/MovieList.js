import React, { useContext, useEffect } from "react"
import { MovieContext } from "./MovieProvider"
import { MovieBrowse } from "./MovieCard"
import "./Movie.css"

export const MovieList = () => {
   // This state changes when `getMovies()` is invoked below
    const { movies, getRandomMovies } = useContext(MovieContext)
    
	//useEffect - reach out to the world for something
    useEffect(() => {
		//console.log("MovieList: useEffect - getMovies")
        getRandomMovies()
		
    }, [])

    const movieResults = movies.results
    let results = []
    if (movieResults) {
        movieResults.map((each) => {
            results.push(each)
        })
    }
    
    return (	
        <>
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