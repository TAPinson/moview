import React, { useContext, useEffect } from "react"
import {UserContext} from '../account/UserProvider'
import { MovieContext } from "./MovieProvider"
import { QueueCard } from './Views/QueueCard'
import "./styles/Movie.css"

export const MovieQueue = () => {
   // This state changes when `getMovies()` is invoked below
    const { movies, MyLikes } = useContext(MovieContext)
    const { users, getUsers  } = useContext(UserContext)
	//useEffect - reach out to the world for something
    useEffect(() => {
        getUsers()
        .then(MyLikes)
    }, [])

    // Get the ID of the logged in user
    const loggedInUserId = parseInt(localStorage.getItem("user"))
    // Get an array of logged in users selections
    const myMovies = movies.filter((movie) => {
        return movie.userId === loggedInUserId && movie.watched === false
    })
    // Get the full object of the logged in user
    const userObject = users.find((user) => {
        return user.id === loggedInUserId
    })
    // Get the full object of logged in users partner ID
    const partnerObject = users.find((user) => {
        return user.id ===userObject.partnerId
    })
    // If a partner has been selected, continue
    if (partnerObject !== undefined){
        // get the ID of the users partner
        const partnerId = partnerObject.id
        // Find matches by iterating movies and returning those that have been made by users partner AND are marked unwatched
        const partnerMovies = movies.filter((movie) => {
            return movie.userId === partnerId && movie.watched === false
        })
        // This is the function that attaches all comments to one of the movies, since there are 2 selection in play
        const queueMovies = myMovies.map((myMovie) => {
            for (const qMovie of partnerMovies) {
                if (qMovie.tmdbObject.id === myMovie.tmdbObject.id)  {
                    if (qMovie.comments.length > 0){
                        qMovie.comments.map((eachComment) => {
                            if (myMovie.comments.includes(eachComment) === false) {
                                myMovie.comments.push(eachComment)
                            }
                        })
                        return myMovie
                    } else {
                        return myMovie
                    }
                }
            }
        })

        // The logic below will count how many unique movies are in the shared queue.
        let individualIds = []
        queueMovies.map((unit) => {
            if (unit !== undefined) {
                if (individualIds.includes(unit.tmdbObject.id) === false) {
                    individualIds.push(unit.tmdbObject.id)
                }
            }
        })

        // Check to ensure that there are matched movies and if so, map them
        if (queueMovies.length > 0) {
            return (	
                <>
                <div className="myQueueCountBoxBox">
                    <div className="myQueueCountBox">
                        <h2 className="myQueueCount">Movies in your queue: {individualIds.length}</h2>
                    </div>
                </div>
                <div className="queueMovieBox">
                <div className="movies">
                {   queueMovies.map(movie => {
                        if (movie !== undefined) {
                            return <QueueCard key={movie.id} movie={movie} />
                        }
                    })
                }
                </div>
                </div>
                </>
            )
        }
        // If there are not matched movies, notify the user 
        else {
            return (
                <h1 className="queueFallback">No Matches Yet! Select more movies!</h1>
            )
        }
    } 
    // If a partner has not been selected, notify user they will need a partner
    if (partnerObject === undefined){
        return (	
            <>
            <h1 className="queueFallback">You'll have to select a partner to build a queue!</h1>
            
            </>
        )
    }
}