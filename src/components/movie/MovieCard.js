import React, {useContext, useEffect} from "react"
import { MovieContext } from "./MovieProvider"
import "./Movie.css"
import { MovieLikes } from "./MovieLikes"
import { useHistory, useParams } from 'react-router-dom';

export const MovieBrowse = ({ movie }) => {
    const { addSelection, deleteSelection } = useContext(MovieContext)
    
    console.log(movie)
    const loggedInUser = parseInt(localStorage.getItem("user"))
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

export const MovieCard = ({ movie }) => {
 
    const { deleteSelection, MyLikes } = useContext(MovieContext)
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
        </section>
)}