import React, {useContext, useEffect, useState} from "react"
import { MovieContext } from "../MovieProvider"
import { UserContext } from '../../account/UserProvider'
import "../Movie.css"

export const QueueCard = ({ movie }) => {
    const { MyLikes } = useContext(MovieContext)
    const { users } = useContext(UserContext)
    const imgURL = `http://image.tmdb.org/t/p/w185//${movie.tmdbObject.poster_path}`
    useEffect(() => {
        MyLikes()
    }, [])

    // We will call this to get usernames from the comment ID's
    const findUser = (id) => {
        const foundUser = users.find((oneUser) => {
            return oneUser.id === id
        })
        if (foundUser !== undefined){
            return foundUser.username
        }
    }

    // Get the array of movie comments
    let movieComments = movie.comments

    // return the HTML to dsplay each comment
    const commentCard2 = movieComments.map((held) => {
        return <div className="movieComment"key={held.id}>
                    "{held.comment}"
                    <div className="movieCommentAuthor">
                        ~<i></i>{findUser(held.userId)}
                    </div>
              </div>
    })

    const commentCard = movieComments.map((held) => {
        return <div key={held.id}>
                    <div className="movieComment"key={held.id}>
                        <div className="movieCommentAuthor"><strong>{findUser(held.userId)}:</strong></div>
                        <div className="queueComment"><i>"{held.comment}"</i></div>
                    </div>
              </div>
    })

    return (
        <section className="movieBox">
            <h3 className="movie__name">{movie.tmdbObject.title}</h3>
            <div className="movie__overview">{movie.tmdbObject.overview}</div>
            <div className="movie__release"><strong>Released:</strong> {movie.tmdbObject.release_date}</div>
            <div className="moviePoster"><img className="moviePoster" src={imgURL} alt="movie poster"></img></div>
            <div>{commentCard}</div>
        </section>
)}