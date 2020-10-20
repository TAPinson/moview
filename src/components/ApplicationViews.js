import React from "react"
import { Route } from "react-router-dom"
import { MovieProvider } from "./movie/MovieProvider"
import { MovieList} from './movie/MovieList'
import { MovieFinder } from "./movie/MovieFinder"
import { MovieQueue } from "./movie/MovieQueue"
import { MovieLikes } from "./movie/MovieLikes"
import { MovieWatched } from "./movie/MovieWatched"
import { ViewerAccount } from "./account/ViewerAccount"
import { Logout } from "./auth/Logout"
import { UserProvider } from './account/UserProvider'


export const ApplicationViews = (props) => {
    return (
        <>
            

            <MovieProvider>
                <Route exact path="/">
                    <MovieFinder />
                </Route>
            </MovieProvider>

            <MovieProvider>
                <Route exact path="/browse">
                    <MovieList />
                </Route>
            </MovieProvider>

            <MovieProvider>
                <UserProvider>
                    <Route exact path="/queue">
                        <MovieQueue />
                    </Route>
                </UserProvider>
            </MovieProvider>

            <MovieProvider>
                <Route exact path="/likes">
                    <MovieLikes />
                </Route>
            </MovieProvider>

            <MovieProvider>
                <Route exact path="/watched">
                    <MovieWatched />
                </Route>
            </MovieProvider>

            <UserProvider>
            <Route exact path="/account">
                <ViewerAccount />
            </Route>
            </UserProvider>

            <Route exact path="/logout">
                <Logout />
            </Route>
    
        </>
    )
}