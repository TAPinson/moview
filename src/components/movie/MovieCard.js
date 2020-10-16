import React from "react"
import "./Movie.css"

export const MovieCard = ({ movie }) => {
    const imgURL = `http://image.tmdb.org/t/p/w185//${movie.poster_path}`
    return (
        <section className="movie">
            <h3 className="movie__name">{movie.title}</h3>
            <div className="movie__overview">{movie.overview}</div>
            <img src={imgURL} alt="movie poster"></img>
        </section>
)}