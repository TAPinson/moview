import React, { useState, createContext } from "react"
import defaultExport from '../Settings'

// The context is imported and used by individual components that need data
export const MovieContext = createContext()

// This component establishes what data can be used.
export const MovieProvider = (props) => {
    const [movies, setMovies] = useState([])

    const getMovies = () => {
        console.log("fetch")
        // Fetch popular movies from 2019
        return fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${defaultExport.tmdbKey}&sort_by=popularity.desc&primary_release_year=2019`)
        .then(res => res.json())
        .then(setMovies)
    }

    const getRandomMovies = () => {
        let randomPage = Math.floor(Math.random() * 500) + 1; // returns a random integer from 1 to 500
        console.log("fetch")
        // Fetch 
        return fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${defaultExport.tmdbKey}&page=${randomPage}`)
        .then(res => res.json())
        .then(setMovies)
    }

    const addSelection = selection => {
        return fetch("http://localhost:8088/selections", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(selection)
        })
    }

    const myLikes = () => {
        return fetch(`http://localhost:8088/selections`)
        .then(res => res.json())
        .then(setMovies)
    }

    // Add needed functionality to context
    return (
        <MovieContext.Provider value={{
            movies, getMovies, getRandomMovies, addSelection, myLikes
        }}>
            {props.children}
        </MovieContext.Provider>
    )
}