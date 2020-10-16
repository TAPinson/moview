import React from "react"
import "./Movie.css"

export const MovieCard = ({ movie }) => (
    <section className="movie">
        <h3 className="movie__name">{movie.title}</h3>
        <div className="movie__overview">{movie.overview}</div>
    </section>
)