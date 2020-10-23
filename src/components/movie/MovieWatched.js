import React, { useContext, useEffect } from "react"
import { MovieContext } from "./MovieProvider"
import { WatchedCard } from "./Views/WatchedCard"
import "./Movie.css"

export const MovieWatched = () => {
   // This state changes when `getMovies()` is invoked below
    const { movies, MyLikes } = useContext(MovieContext)
    
	//useEffect - reach out to the world for something
    useEffect(() => {
        MyLikes()
		
    }, [])
    const loggedInUser = parseInt(localStorage.getItem("user"))
    const myMovies = movies.filter((movie) => {
        return movie.userId === loggedInUser && movie.watched === true
    })
    return (	
        <>
		<div className="movies">
        {   
			myMovies.map(movie => {
				return <WatchedCard key={movie.id} movie={movie} />
			})
        }
        </div>
        </>
    )}