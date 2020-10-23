import React, { useState, createContext } from "react"
import defaultExport from '../Settings'

// The context is imported and used by individual components that need data
export const MovieContext = createContext()

// This component establishes what data can be used.
export const MovieProvider = (props) => {
    const [movies, setMovies] = useState([])
    // ***************************************** Movie Data Below ***************************************** //
    // Pull a random page of movies from the API
    const getRandomMovies = () => {
        let randomPage = Math.floor(Math.random() * 500) + 1; // returns a random integer from 1 to 500
        return fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${defaultExport.tmdbKey}&page=${randomPage}`)
        .then(res => res.json())
        .then(parsedMovies => {
            let movies = parsedMovies
            movies.found = false
            setMovies(movies)
        })
    }
    // Search for a movie by title
    const searchByTitle = terms => {
        const termsCleaned = terms.replace(/\s/g, '+')
        return fetch(`https://api.themoviedb.org/3/search/movie?api_key=${defaultExport.tmdbKey}&query=${termsCleaned}&include_adult=true`)
        .then(res => res.json())
        .then(parsedMovies => {
            let movies = parsedMovies
            // Search results are formatted differently than random movies, so we add this property to handle this later
            movies.found = true
            // We want to ensure that at least 1 result is returned, so this will handle that and then show a random Movie
            if (movies.results.length === 0){
                window.alert("No results with that criteria")
                getRandomMovies()
            } 
            // If we have a successful search, we will set movies to those results
            else {
                setMovies(movies)
            }
        })
    }
    const searchByGenre = (genre) => {
        let randomPage = Math.floor(Math.random() * 50) + 1; // returns a random integer from 1 to 100
        return fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${defaultExport.tmdbKey}&language=en-US&sort_by=popularity.desc&include_adult=false&&page=${randomPage}&with_genres=${genre}`)
        .then(res => res.json())
       
        .then(parsedMovies => {
            let movies = parsedMovies
            movies.found = false
            setMovies(movies)
        })
    }
    // ***************************************** Selection Data Below ***************************************** //
    // Add a selection to the database
    const addSelection = selection => {
        return fetch("http://localhost:8088/selections", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(selection)
        })
    }
    // Delete a selection using the message ID as a recerence
    const deleteSelection = selectionID => {
        return fetch(`http://localhost:8088/selections/${selectionID}`, {
            method: "DELETE"
        })
    }
    // Update an existing selection using the selection ID as a reference
    const updateSelection = selection => {
        return fetch(`http://localhost:8088/selections/${selection.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(selection)
        })
    }
    // Return the database of selectiions and embed the related comments
    const MyLikes = () => {
        return fetch(`http://localhost:8088/selections?_embed=comments`)
        .then(res => res.json())
        .then(setMovies)
    }
    // ***************************************** Comment Data Below ***************************************** //
    // Add a selection to the database
    const addComment = comment => {
        return fetch("http://localhost:8088/comments", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(comment)
        })
        // We will want to automatically refresh after a comment is added. This handles that
        .then(MyLikes())
    }
    // Update an existing selection using the selection ID as a reference
    const updateComment = comment => {
        return fetch(`http://localhost:8088/comments/${comment.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(comment)
        })
    }
    // Delete a selection using the message ID as a recerence
    const deleteComment = commentID => {
        return fetch(`http://localhost:8088/comments/${commentID}`, {
            method: "DELETE"
        })
    }
    // Add needed functionality to context
    return (
        <MovieContext.Provider value={{
            movies, getRandomMovies, addSelection, MyLikes, deleteSelection, updateSelection, searchByTitle, addComment, deleteComment, updateComment, searchByGenre
        }}>
            {props.children}
        </MovieContext.Provider>
    )
}