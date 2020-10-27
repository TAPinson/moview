import React, {useContext, useEffect, useState} from "react"
import { MovieContext } from "../MovieProvider"
import "../styles/Movie.css"

const loggedInUser = parseInt(localStorage.getItem("user"))

// This is used to display movies not yet selected by the user and retrieved from the API
export const MovieBrowse = ({ movie }) => {
    const { addSelection, getRecommendations } = useContext(MovieContext)
    const imgURL = `http://image.tmdb.org/t/p/w185//${movie.poster_path}`
    return (
        <section className="movieBox">
            <h3 className="movie__name">{movie.title}</h3>
            <div className="movie__overview">{movie.overview}</div>
            <div className="movie__release"><strong>Released:</strong> {movie.release_date}</div>
            <div className="moviePoster"><img className="" src={imgURL} alt="movie poster"></img></div>
            <div className="likeFromBrowse">
                <button onClick={() => {
                    const selection = {
                        userId: loggedInUser,
                        watched: false,
                        tmdbObject: movie
                        }
                    addSelection(selection)
                    }}>Add to Queue
                </button>
                <button className="anotherLikeThis" onClick={() => {
                    getRecommendations(movie.id)
                    }}>More Like This
                </button>
            </div>
        </section>
)}