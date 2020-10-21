import React, { useContext, useEffect } from "react"
import { MovieContext } from "./MovieProvider"
import { MovieBrowse } from "./MovieCard"
import "./Movie.css"

export const MovieList = () => {
    const { movies, getRandomMovies } = useContext(MovieContext)
    
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
    
    return (	
        <>
		<div className="movies">
        {   
			results.map(movie => {
				return <MovieBrowse key={movie.id} movie={movie} />
			})
        }
        <div className="browseMoreMovies" onClick={() => {
                    getRandomMovies()
                    .then(window.scrollTo({
                        top: 0,
                        left: 0,
                        behavior: 'smooth'})
                        )
                    }
                    }><h1>Give Me More Movies!</h1>
        </div>
        </div>
        </>
    )
}