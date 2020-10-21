import React, {useContext, useEffect} from "react"
import { MovieContext } from "./MovieProvider"
import { UserContext } from '../account/UserProvider'
import "./Movie.css"

const loggedInUser = parseInt(localStorage.getItem("user"))

// This is used to display movies not yet selected by the user and retrieved from the API
export const MovieBrowse = ({ movie }) => {
    const { addSelection } = useContext(MovieContext)
    
    const imgURL = `http://image.tmdb.org/t/p/w185//${movie.poster_path}`
    
    return (
        <section className="movieBox">
            <h3 className="movie__name">{movie.title}</h3>
            <div className="movie__overview">{movie.overview}</div>
            <div className="movie__release"><strong>Released:</strong> {movie.release_date}</div>
            <img className="moviePoster" src={imgURL} alt="movie poster"></img>
            <div>
                <button className="likedMark" onClick={() => {
                    const selection = {
                        userId: loggedInUser,
                        watched: false,
                        tmdbObject: movie
                        }
                    addSelection(selection)
                    }}>Add to Queue
                </button>
            </div>
        </section>
)}















// This is used to display movies already selected by the user and being retrieved from JSON Server
export const MovieCard = ({ movie }) => {
 
    const { deleteSelection, MyLikes, updateSelection, addComment } = useContext(MovieContext)
    const { users, getUsers } = useContext(UserContext)
    const imgURL = `http://image.tmdb.org/t/p/w185//${movie.tmdbObject.poster_path}`

    useEffect(() => {
        MyLikes()
        .then(getUsers())
    }, [])

    let commentInput = ""
    const handleControlledInput = (event) => {
        commentInput = event.target.value
    }

   

    const constructNewComment = (input) => {
        const userId = parseInt(localStorage.getItem("user"))
        const newComment = {
            selectionId: movie.id,
            userId: userId,
            comment: input
        }
        console.log(newComment)
        addComment(newComment)
        .then(MyLikes())
    }
    // Create some data to use if there are no comments on a movie
    if (movie.comments[0] === undefined){
        movie.comments = [{}]
        movie.comments[0].comment = "No Comments Yet"
        movie.comments[0].id = 0
    }
    // Get the array of movie comments
    let movieComments = movie.comments

    // We will call this to get usernames from the comment ID's
    const findUser = (id) => {
        const foundUser = users.find((oneUser) => {
            return oneUser.id === id
        })
        if (foundUser !== undefined){
            return foundUser.username
        }
    }

    // return the HTML to dsplay each comment
    const commentCard = movieComments.map((held) => {
        return <div className="movieComment"key={held.id}>
                    "{held.comment}"
                    <div>
                        ~<i>{findUser(held.userId)}</i>
                    </div>
              </div>
    })

    return (
        <section className="movieBox">
            <h3 className="movie__name">{movie.tmdbObject.title}</h3>
            <div className="movie__overview"><strong></strong> {movie.tmdbObject.overview}</div>
            <div className="movie__release"><strong>Released:</strong> {movie.tmdbObject.release_date}</div>
            
            <img className="moviePoster" src={imgURL} alt="movie poster" />
            
            <div>
                <button className="likedDelete"onClick={() => {
                    deleteSelection(movie.id)
                    .then(() => {
                        MyLikes()
                    })
                    }}>Delete
                </button>
                <button className="likedMark" onClick={() => {
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
                <div>{commentCard}</div>
            </div>
                <form className="commentForm">
                    <fieldset>
                        <input type="text"
                                id="commentTextInput"
                                name="comment"
                                required
                                placeholder="Add a comment..."
                                onChange={handleControlledInput} />
                        <button className="submitComment" onClick={evt  => {
                            evt.preventDefault()
                            //console.log("click")
                            constructNewComment(commentInput)
                    }}>Comment
                </button>
                    </fieldset>
                </form>
            
        </section>
)}














export const QueueCard = ({ movie }) => {
    const { deleteSelection, MyLikes, updateSelection } = useContext(MovieContext)
    const imgURL = `http://image.tmdb.org/t/p/w185//${movie.tmdbObject.poster_path}`
    useEffect(() => {
        MyLikes()
		
    }, [])
    return (
        <section className="movieBox">
            <h3 className="movie__name">{movie.tmdbObject.title}</h3>
            <div className="movie__overview">{movie.tmdbObject.overview}</div>
            <div className="movie__release"><strong>Released:</strong> {movie.tmdbObject.release_date}</div>
            <img className="moviePoster" src={imgURL} alt="movie poster"></img>
        </section>
)}

// This is used to display movies already selected by the user and being retrieved from JSON Server
export const WatchedCard = ({ movie }) => {
 
    const { deleteSelection, MyLikes, updateSelection } = useContext(MovieContext)
    const imgURL = `http://image.tmdb.org/t/p/w185//${movie.tmdbObject.poster_path}`

    useEffect(() => {
        MyLikes()
		
    }, [])

    return (
        <section className="movieBox">
            <h3 className="movie__name">{movie.tmdbObject.title}</h3>
            <div className="movie__overview">{movie.tmdbObject.overview}</div>
            <div className="movie__release"><strong>Released:</strong> {movie.tmdbObject.release_date}</div>
            <img className="moviePoster" src={imgURL} alt="movie poster"></img>
            <div>
                <button className="likedDelete" onClick={() => {
                    deleteSelection(movie.id)
                    .then(() => {
                        MyLikes()
                    })
                    }}>Delete
                </button>
                <button className="likedMark"onClick={() => {
                    const watchedMovie = {
                        userId: loggedInUser,
                        watched: false,
                        tmdbObject: movie.tmdbObject,
                        id: movie.id
                    }
                    updateSelection(watchedMovie)
                    .then(() => {
                        MyLikes()
                    })
                    }}>Watch Again
                </button>
            </div>
        </section>
)}