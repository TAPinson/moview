import React, { useContext, useEffect, useState } from "react"
import { MovieContext } from "./MovieProvider"
import { genres } from './MovieBrowser'
import "./styles/Movie.css"

export const MovieFinder = () => {
    const { movies, liked, getRandomMovies, addSelection, searchByTitle, searchByGenre, getNowPlaying, getRecommendations, getLiked } = useContext(MovieContext)
    useEffect(() => {
        // Start the application off with a selection of random movies
        getRandomMovies()
            .then(() => {
                getLiked()
            })
    }, [])
    // Bring the results of the random movies into variable
    const movieResults = movies.results
    // Logic below is to prevent duplicate movie adds
    const userId = parseInt(localStorage.getItem("user"))
    const likedCheck = (addingId) => {
        const alreadyLiked = liked.filter((each) => {
            if (each.userId === userId) {
                return each.tmdbObject.id === addingId
            }
        })
        if (alreadyLiked.length > 0) {
            return true
        } else {
            return false
        }
    }
    // Initialize variable outside of function so it is available later
    let searchTerms = ""
    // Keep value of input box as variable "searchTerms"
    const searchTermFinder = (event) => {
        searchTerms = event.target.value
    }
    // Initialize variable outide of map so it is available later
    let results = []
    // Push all of the result objects in the movies object to the results array
    if (movieResults) {
        movieResults.map((each) => {
            results.push(each)
        })
        if (movies.found === false) {
            // Get a random number between 1 and 19 - Object 20 would be element 19
            let token = Math.floor(Math.random() * 20);
            // Use the token to display a random movie
            let movie = results[token]
            return (
                <>
                    <section className="finderContainer">
                        <div className="finderViewer">
                            <h1 className="finderTitle">{movie.title}</h1>
                            <img className="moviePoster" src={`http://image.tmdb.org/t/p/w300//` + movie.poster_path} alt="movie poster"></img>
                            <div className="movie__overview">{movie.overview}</div>
                            <button onClick={() => {
                                const selection = {
                                    userId,
                                    watched: false,
                                    tmdbObject: movie
                                }
                                if (likedCheck(movie.id) === false) {
                                    addSelection(selection)
                                        .then(() => {
                                            getRandomMovies()
                                        })
                                } else {
                                    alert("You've already added this!")
                                }
                            }}>Add to Queue
                        </button>
                            <button className="passBtn" onClick={() => {
                                getRandomMovies()
                            }}>Pass
                        </button>
                            <button className="anotherLikeThis" onClick={() => {
                                getRecommendations(movie.id)
                            }}>Another Like This
                        </button>
                            <form className="titleSearchForm">
                                <fieldset className="titleSearchField">
                                    <input type="text"
                                        id="titleSearchInput"
                                        name="terms"
                                        required
                                        className="form-control"
                                        onChange={searchTermFinder}
                                    />
                                </fieldset>
                                <button type="submit"
                                    onClick={evt => {
                                        evt.preventDefault() // Prevent browser from submitting the form
                                        searchByTitle(searchTerms)
                                        document.getElementById("titleSearchInput").value = ""
                                    }}
                                    className="titleSearchBtn">
                                    Search
                            </button>
                            </form>
                        </div>
                        <aside className="finderGenreButtons">
                            {
                                genres.map((genre) => {
                                    return (
                                        <button key={genre.id} className="singleMovieFindBtn" onClick={() => {
                                            searchByGenre(genre.id)
                                        }
                                        }>{genre.name}
                                        </button>
                                    )
                                })
                            }
                            <button className="singleMovieFindBtn" onClick={() => {
                                getNowPlaying()
                            }
                            }>Now Playing
                        </button>
                        </aside>
                    </section>
                </>
            )
        }
        else if (movies.found === true) {
            // Select the first result, as it is the closest match
            let movie = results[0]
            if (movie !== undefined) {
                const imgURL = `http://image.tmdb.org/t/p/w300//${movie.poster_path}`
                return (
                    <>
                        <section className="finderContainer">
                            <div className="finderViewer">
                                <h1>{movie.title}</h1>
                                <img className="moviePoster" src={`http://image.tmdb.org/t/p/w300//` + movie.poster_path} alt="movie poster"></img>
                                <div className="movie__overview">{movie.overview}</div>
                                <button onClick={() => {
                                    const selection = {
                                        userId,
                                        watched: false,
                                        tmdbObject: movie
                                    }
                                    if (likedCheck(movie.id) === false) {
                                        addSelection(selection)
                                            .then(() => {
                                                getRandomMovies()
                                            })
                                    } else {
                                        alert("You've already added this!")
                                    }
                                }}>Add to Queue
                        </button>
                                <button className="passBtn" onClick={() => {
                                    getRandomMovies()
                                }}>Pass
                        </button>
                                <button className="anotherLikeThis" onClick={() => {
                                    getRecommendations(movie.id)
                                }}>Another Like This
                        </button>
                                <form className="titleSearchForm">
                                    <fieldset className="titleSearchField">
                                        <input type="text"
                                            id="titleSearchInput"
                                            name="terms"
                                            required
                                            className="form-control"
                                            onChange={searchTermFinder}
                                        />
                                    </fieldset>
                                    <button type="submit"
                                        onClick={evt => {
                                            evt.preventDefault() // Prevent browser from submitting the form
                                            searchByTitle(searchTerms)
                                            document.getElementById("titleSearchInput").value = ""
                                        }}
                                        className="titleSearchBtn">
                                        Search
                            </button>
                                </form>
                            </div>
                            <aside className="finderGenreButtons">
                                {
                                    genres.map((genre) => {
                                        return (
                                            <button key={genre.id} className="singleMovieFindBtn" onClick={() => {
                                                searchByGenre(genre.id)
                                            }
                                            }>Show {genre.name}
                                            </button>
                                        )
                                    })
                                }
                                <button className="singleMovieFindBtn" onClick={() => {
                                    getNowPlaying()
                                }
                                }>Now Playing
                        </button>
                            </aside>
                        </section>
                    </>
                )
            }
            else {
                alert("No Recommendations available for this film...")
                getRandomMovies()
            }
        }
    }
    return (
        <>
            <section className="finderContainer">
                <div className="finderViewer">
                    <h1>Movie Display</h1>
                </div>
            </section>
        </>
    )
}