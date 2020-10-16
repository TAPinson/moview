import React, { useContext, useEffect } from "react"
import { MovieContext } from "./MovieProvider"
import { MovieCard } from "./MovieCard"
import "./Movie.css"

export const MovieList = () => {
   // This state changes when `getMovies()` is invoked below
    const { movies, getMovies } = useContext(MovieContext)
    
	//useEffect - reach out to the world for something
    useEffect(() => {
		//console.log("MovieList: useEffect - getMovies")
        getMovies()
		
    }, [])

    const movieResults = movies.results
    let results = []
    if (movieResults) {
        movieResults.map((each) => {
            results.push(each)
        })
        console.log(results)
    }

    return (	
		<div className="movies">
		    {console.log("MovieList: Render")}
        {   
			results.map(movie => {
				return <MovieCard key={movie.id} movie={movie} />
			})
        }
        </div>
    )
}