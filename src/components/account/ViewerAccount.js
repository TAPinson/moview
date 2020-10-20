import React, { useState, useEffect, useContext } from "react"
import {UserContext} from './UserProvider'
import "./account.css"



export const ViewerAccount = () => {
    const { user, getUser } = useContext(UserContext)
    

    //useEffect - reach out to the world for something
    useEffect(() => {
		//console.log("MovieList: useEffect - getMovies")
        getUser()
        
    }, [])

    
    let searchTerms;
    const searchTermFinder = (event) => {
        searchTerms = event.target.value
        console.log(searchTerms)
    }
    
    
    

    return (
        <>
        <div className="userBox">
            <h1>This will be where you edit account details</h1>
                <div>Username: {user.username}</div>
                <div>Email: {user.email}</div>
                <form>
                    <fieldset>
                        <input type="text"
                                id="partnerInput"
                                name="partnerId"
                                required
                                className="form-control"
                                placeholder={user.partnerId}
                                onChange={searchTermFinder} 
                        />
                    </fieldset>
                </form>

        </div>
        </>
    )}