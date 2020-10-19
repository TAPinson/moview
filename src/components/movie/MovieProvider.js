import React, { useState, createContext } from "react"
import defaultExport from '../Settings'

// The context is imported and used by individual components that need data
export const MovieContext = createContext()

// This component establishes what data can be used.
export const MovieProvider = (props) => {
    const [movies, setMovies] = useState([])

    const getMovies = () => {
        // Fetch popular movies from 2019
        return fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${defaultExport.tmdbKey}&sort_by=popularity.desc&primary_release_year=2019`)
        .then(res => res.json())
        .then(setMovies)
    }

    // Pull a random page of movies from the API
    const getRandomMovies = () => {
        let randomPage = Math.floor(Math.random() * 500) + 1; // returns a random integer from 1 to 500
        return fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${defaultExport.tmdbKey}&page=${randomPage}`)
        .then(res => res.json())
        .then(setMovies)
    }

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

    // Return the database of selectiions
    const MyLikes = () => {
        return fetch(`http://localhost:8088/selections`)
        .then(res => res.json())
        .then(setMovies)
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

    const searchByTitle = terms => {

        const termsCleaned = terms.replace(/\s/g, '+')
        console.log(termsCleaned)
        return fetch(`https://api.themoviedb.org/3/search/movie?api_key=${defaultExport.tmdbKey}&query=${termsCleaned}`)
        .then(res => res.json())
        .then(parsedMovies => {
            let movies = parsedMovies
            console.log(movies)
            setMovies(movies)
        })
    }

    // Add needed functionality to context
    return (
        <MovieContext.Provider value={{
            movies, getMovies, getRandomMovies, addSelection, MyLikes, deleteSelection, updateSelection, searchByTitle
        }}>
            {props.children}
        </MovieContext.Provider>
    )
}