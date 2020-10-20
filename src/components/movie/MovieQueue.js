import React, { useContext, useEffect } from "react"
import {UserContext} from '../account/UserProvider'
import { MovieContext } from "./MovieProvider"
import { MovieCard } from "./MovieCard"
import "./Movie.css"

export const MovieQueue = () => {
   // This state changes when `getMovies()` is invoked below
    const { movies, MyLikes } = useContext(MovieContext)
    const { users, getUsers  } = useContext(UserContext)
    const { user, setUser  } = useContext(UserContext)

	//useEffect - reach out to the world for something
    useEffect(() => {
        getUsers()
        .then(MyLikes)
    }, [])

    const loggedInUserId = parseInt(localStorage.getItem("user"))
    const myMovies = movies.filter((movie) => {
        return movie.userId === loggedInUserId && movie.watched === false
    })

    const userObject = users.find((user) => {
        return user.id === loggedInUserId
    })

    if (userObject !== undefined){
        const partnerId = userObject.partnerId
        const partnerMovies = movies.filter((movie) => {
            return movie.userId === partnerId && movie.watched === false
        })

        const queueMovies = partnerMovies.filter((qmovie) => {
            for (const myMovie of myMovies) {
                if (qmovie.tmdbObject.id === myMovie.tmdbObject.id)
                return myMovie
            }
        })
        return (	
            <>
            
            <div className="movies">
                {/*{console.log("MovieList: Render")}*/}
            {   
                queueMovies.map(movie => {
                    return <MovieCard key={movie.id} movie={movie} />
                })
            }
            </div>
            </>
        )
    }
    return (	
        <>
		<div className="movies">
        {   
			myMovies.map(movie => {
				return <MovieCard key={movie.id} movie={movie} />
			})
        }
        </div>
        </>
    )}