import React, {useContext, useEffect} from "react"
import { MovieContext } from "./MovieProvider"
import "./Movie.css"
import { MovieLikes } from "./MovieLikes"
import { useHistory, useParams } from 'react-router-dom';

const loggedInUser = parseInt(localStorage.getItem("user"))

// This is used to display movies not yet selected by the user and retrieved from the API
export const MovieBrowse = ({ movie }) => {
    const { addSelection, deleteSelection } = useContext(MovieContext)
    
    console.log(movie)
    
    const imgURL = `http://image.tmdb.org/t/p/w185//${movie.poster_path}`
    
    return (
        <section className="movieBox">
            <h3 className="movie__name">{movie.title}</h3>
            <div className="movie__overview"><strong>Overview:</strong> {movie.overview}</div>
            <div className="movie__release"><strong>Released:</strong> {movie.release_date}</div>
            <img className="moviePoster" src={imgURL} alt="movie poster"></img>
            <button onClick={() => {
                        const selection = {
                            userId: loggedInUser,
                            watched: false,
                            tmdbObject: movie
                        }
                        addSelection(selection)
                        //getRandomMovies()
                        }}>Like
                    </button>
        </section>
)}

// This is used to display movies already selected by the user and being retrieved from JSON Server
export const MovieCard = ({ movie }) => {
 
    const { deleteSelection, MyLikes, updateSelection } = useContext(MovieContext)
    const imgURL = `http://image.tmdb.org/t/p/w185//${movie.tmdbObject.poster_path}`

    useEffect(() => {
        MyLikes()
		
    }, [])

    return (
        <section className="movieBox">
            <h3 className="movie__name">{movie.tmdbObject.title}</h3>
            <div className="movie__overview"><strong>Overview:</strong> {movie.tmdbObject.overview}</div>
            <div className="movie__release"><strong>Released:</strong> {movie.tmdbObject.release_date}</div>
            <img className="moviePoster" src={imgURL} alt="movie poster"></img>
            <button onClick={() => {
                deleteSelection(movie.id)
                .then(() => {
                    MyLikes()
                    })
                }}>Delete
            </button>
            <button onClick={() => {
                const watchedMovie = {
                    userId: loggedInUser,
                    watched: true,
                    tmdbObject: movie.tmdbObject,
                    id: movie.id
                }
                updateSelection(watchedMovie)
                .then(() => {
                    MyLikes()
                })
                }}>Mark Watched
            </button>
        </section>
)}