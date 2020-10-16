import React from "react"
import "./Movie.css"

export const MovieCard = ({ movie }) => {
    const imgURL = `http://image.tmdb.org/t/p/w185//${movie.poster_path}`
    return (
        <section className="movieBox">
            <h3 className="movie__name">{movie.title}</h3>
            <div className="movie__overview"><strong>Overview:</strong> {movie.overview}</div>
            <div className="movie__release"><strong>Released:</strong> {movie.release_date}</div>
            <img classname="moviePoster" src={imgURL} alt="movie poster"></img>
        </section>
)}