import React, { useContext, useEffect } from "react"
import { MovieContext } from "./MovieProvider"
import { MovieCard } from "./MovieCard"
import "./Movie.css"

export const MovieLikes = () => {
   // This state changes when `getMovies()` is invoked below
    const { movies, getMovies, getRandomMovies, myLikes } = useContext(MovieContext)
    
	//useEffect - reach out to the world for something
    useEffect(() => {
		//console.log("MovieList: useEffect - getMovies")
        myLikes()
		
    }, [])
    console.log(movies)
    const loggedInUser = parseInt(localStorage.getItem("user"))
    const myMovies = movies.filter((movie) => {
        return movie.userId === loggedInUser
    })
    return (	
        <>
        
		<div className="movies">
		    {console.log("MovieList: Render")}
        {   
			myMovies.map(movie => {
				return <MovieCard key={movie.id} movie={movie} />
			})
        }
        </div>
        </>
    )}