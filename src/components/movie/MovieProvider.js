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

    

    // Add needed functionality to context
    return (
        <MovieContext.Provider value={{
            movies, getMovies
        }}>
            {props.children}
        </MovieContext.Provider>
    )
}