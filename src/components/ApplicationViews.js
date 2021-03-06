import React from "react"
import { Route } from "react-router-dom"
import { MovieProvider } from "./movie/MovieProvider"
import { MovieBrowser} from './movie/MovieBrowser'
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
                    <MovieBrowser />
                </Route>
            </MovieProvider>

            <MovieProvider>
                <UserProvider>
                    <Route exact path="/OurQueue">
                        <MovieQueue />
                    </Route>
                </UserProvider>
            </MovieProvider>

            <MovieProvider>
                <UserProvider>
                    <Route exact path="/myqueue">
                        <MovieLikes />
                    </Route>
                </UserProvider>
            </MovieProvider>

            <MovieProvider>
                <UserProvider>
                    <Route exact path="/watched">
                        <MovieWatched />
                    </Route>
                </UserProvider>
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