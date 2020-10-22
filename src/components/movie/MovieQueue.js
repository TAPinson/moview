import React, { useContext, useEffect } from "react"
import {UserContext} from '../account/UserProvider'
import { MovieContext } from "./MovieProvider"
import { MovieCard, QueueCard } from "./MovieCard"
import "./Movie.css"

export const MovieQueue = () => {
   // This state changes when `getMovies()` is invoked below
    const { movies, MyLikes } = useContext(MovieContext)
    const { users, getUsers  } = useContext(UserContext)
	//useEffect - reach out to the world for something
    useEffect(() => {
        getUsers()
        .then(MyLikes)
    }, [])
    const loggedInUserId = parseInt(localStorage.getItem("user"))
    const myMovies = movies.filter((movie) => {
        return movie.userId === loggedInUserId && movie.watched === false
    })
    const userObject = users.find((user) => {
        return user.id === loggedInUserId
    })
    if (userObject !== undefined){
        const partnerId = userObject.partnerId
        const partnerMovies = movies.filter((movie) => {
            return movie.userId === partnerId && movie.watched === false
        })
        const queueMovies = myMovies.map((myMovie) => {
            for (const qMovie of partnerMovies) {
                if (qMovie.tmdbObject.id === myMovie.tmdbObject.id)  {
                    if (qMovie.comments.length > 0){
                        qMovie.comments.map((eachComment) => {
                            //eachComment.id = eachComment.id + 1000
                            if (myMovie.comments.includes(eachComment) === false) {
                                myMovie.comments.push(eachComment)
                            }
                        })
                        return myMovie
                    } 
                }
            }
        })
        return (	
            <>
            <div className="movies">
                {/*{console.log("MovieList: Render")}*/}
            {   //console.log(queueMovies),
                queueMovies.map(movie => {
                    if (movie !== undefined) {
                        return <QueueCard key={movie.id} movie={movie} />
                    }
                })
            }
            </div>
            </>
        )
    } 
    if (userObject === undefined){
        return (	
            <>
            <h1>No Movies</h1>
            <div className="movies">
            {   
                myMovies.map(movie => {
                    return <MovieCard key={movie.id} movie={movie} />
                })
            }
            </div>
            </>
        )
    }
}