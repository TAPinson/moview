import React from "react"
import { Route } from "react-router-dom"
import { MovieProvider } from "./movie/MovieProvider"
import { MovieList} from './movie/MovieList'

export const ApplicationViews = (props) => {
    return (
        <>
            <MovieProvider>
                <Route exact path="/">
                    <MovieList />
                </Route>
            </MovieProvider>
        </>
    )
}