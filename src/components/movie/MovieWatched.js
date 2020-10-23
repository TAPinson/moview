import React, { useContext, useEffect } from "react"
import { MovieContext } from "./MovieProvider"
import { WatchedCard } from "./Views/WatchedCard"
import "./Movie.css"

export const MovieWatched = () => {
    const { movies, MyLikes } = useContext(MovieContext)
    
    useEffect(() => {
        MyLikes()	
    }, [])
    // Get the ID of the logged in user
    const loggedInUser = parseInt(localStorage.getItem("user"))
    // Get an array of movies selected by the user
    const myMovies = movies.filter((movie) => {
        return movie.userId === loggedInUser && movie.watched === true
    })
    // Map over the users movies and display each with WatchedCard
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