import React, {useContext, useEffect, useState} from "react"
import { MovieContext } from "../MovieProvider"
import { UserContext } from '../../account/UserProvider'
import "../styles/Movie.css"
import Modal from 'react-modal'

const loggedInUser = parseInt(localStorage.getItem("user"))

export const WatchedCard = ({ movie }) => {
    const { deleteSelection, MyLikes, updateSelection, addComment, deleteComment, updateComment } = useContext(MovieContext)
    const { users, getUsers } = useContext(UserContext)
    const [modalIsOpen, setModalIsOpen] = useState(false)
    Modal.setAppElement('#root')
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
        addComment(newComment)
        .then(MyLikes())
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
    let updateCommentInput = ""
    const handleCommentUpdate = (event) => {
        updateCommentInput = event.target.value
    }
    // return the HTML to dsplay each comment
    const commentCard = movieComments.map((held) => {
        return <div key={held.id}>
                    <div className="movieComment"key={held.id}>
                        <div className="movieCommentAuthor"><strong>{findUser(held.userId)}:</strong></div>
                        <div><i className="commentComment">"{held.comment}"</i></div>
                        <div className="commentControls">
                            <div className='App'>
                                <span className="commentDelete" role="img" aria-label="edit button" onClick={() => setModalIsOpen(true)}>
                                        ✏️
                                </span>
                                <Modal className="editModal" isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)}>
                                    <h2>Edit Message</h2>
                                    <input type="text" className="modalInput" onChange={handleCommentUpdate} defaultValue={held.comment}/>
                                    <button onClick={evt => {
                                        evt.preventDefault()
                                        commentEditor(held, updateCommentInput)
                                        setModalIsOpen(false)
                                        }}>Save
                                    </button>
                                    <div>
                                        <button className="modalClose"onClick={() => setModalIsOpen(false)}>Close</button>
                                    </div>
                                </Modal>
                            </div>
                            <span  role="img" aria-label="delete button"className="commentDelete" onClick={() => {
                                deleteComment(held.id)
                                .then(() => {
                                    MyLikes()
                                })
                                }}>❌
                            </span>
                        </div>
                    </div>
              </div>
    })
    const commentEditor = (held, comment) => {
        const newComment = {
            id: held.id,
            userId: held.userId,
            selectionId: held.selectionId,
            comment: comment
        }
        updateComment(newComment)
        .then(() => {
            MyLikes()
        })
    }
    return (
        <section className="movieBox">
            <h3 className="movie__name">{movie.tmdbObject.title}</h3>
            <div className="movie__overview"><strong></strong> {movie.tmdbObject.overview}</div>
            <div className="movie__release"><strong>Released:</strong> {movie.tmdbObject.release_date}</div>
            <div className="moviePoster"><img className="posterImage" src={imgURL} alt="movie poster" /></div>
            <div className="buttonBoxLikes">
                <button className="likedDelete"onClick={() => {
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
                <div>{commentCard}</div>
                <form className="commentForm">
                    <fieldset>
                        <input type="text"
                                className="commentTextInput"
                                name="comment"
                                required
                                placeholder="Add a comment..."
                                onChange={handleControlledInput} />
                        <button className="submitComment" onClick={evt  => {
                            evt.preventDefault()
                            constructNewComment(commentInput)
                    }}>Comment
                </button>
                    </fieldset>
                </form>
        </section>
)}