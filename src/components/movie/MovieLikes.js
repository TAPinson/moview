import React, { useContext, useEffect } from "react"
import { MovieContext } from "./MovieProvider"
import { MovieCard } from "./Views/MovieCard"
import "./styles/Movie.css"

export const MovieLikes = () => {
    const { movies, MyLikes } = useContext(MovieContext)
    useEffect(() => {
        MyLikes()
    }, [])
    // Get the ID of the logged in user
    const loggedInUser = parseInt(localStorage.getItem("user"))
    // Parse movies and return only the ones not marked watched and selected by the logged in user
    const myMovies = movies.filter((movie) => {
        return movie.userId === loggedInUser && movie.watched === false
    })
    // Render the following, mapping myMovies with a MovieCard for each element
    return (	
        <>
        <div className="queueMovieBox">
		<div className="movies">
        {   
			myMovies.map(movie => {
				return <MovieCard key={movie.id} movie={movie} />
			})
        }
        </div>
        </div>
        </>
    )}