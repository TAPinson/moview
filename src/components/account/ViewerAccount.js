import React, { useState, useEffect, useContext } from "react"
import {UserContext} from './UserProvider'
import "./account.css"



export const ViewerAccount = () => {
    const { user, getUser, getUsers, users, updateUser } = useContext(UserContext)
    
    useEffect(() => {
        getUser()
        .then(getUsers)
        
    }, [])

    let searchTerms;
    const searchTermFinder = (event) => {
        searchTerms = event.target.value
    }

    const constructUser = (partner) => {
        const pairedPartner = users.filter((each) => {
            return each.username === partner
        })
        const partnerId = pairedPartner[0].id
        // Construct the updated user object to PUT
        const userWithPartner = {
            username: user.username,
            password: user.password,
            email: user.email,
            partnerId: partnerId,
            id: user.id
        }
        updateUser(userWithPartner)
    }

    //Use users partnerId to retrieve the whole object of the partner
    const partnerFinder = users.filter((each) =>{
        return each.id === user.partnerId
    })
    // An array is returned from filter, so we only need the 0th element of the returned array
    const partnerUser = partnerFinder[0]

    // If a valied partner has been found, render the following way
    if (partnerUser !== undefined) {
        return (
            <>
            <div className="userBox">
                <h1>This will be where you edit account details</h1>
                    <div>Username: {user.username}</div>
                    <div>Email: {user.email}</div>
                    <div>Partner: {user.partnerId}</div>
                    <form>
                        <fieldset>
                            <input type="text"
                                    id="partnerInput"
                                    name="partnerId"
                                    required
                                    className="form-control"
                                    defaultValue={partnerUser.username}
                                    onChange={searchTermFinder} 
                            />
                        </fieldset>
                        <button type="submit"
                                        onClick={evt => {
                                            evt.preventDefault() // Prevent browser from submitting the form
                                            constructUser(searchTerms)
                                        }}
                                        className="partnerSaveBtn">
                                         Save
                        </button>
                    </form>
            </div>
            </>
        )
    } else {
        return (
            <>
            <div className="userBox">
                <h1>This will be where you edit account details</h1>
                    <div>Username: {user.username}</div>
                    <div>Email: {user.email}</div>
                    <div>Partner: {user.partnerId}</div>
                    <form>
                        <fieldset>
                            <input type="text"
                                    id="partnerInput"
                                    name="partnerId"
                                    required
                                    className="form-control"
                                    onChange={searchTermFinder} 
                            />
                        </fieldset>
                        <button type="submit"
                                        onClick={evt => {
                                            evt.preventDefault() // Prevent browser from submitting the form
                                            constructUser(searchTerms)
                                        }}
                                        className="partnerSaveBtn">
                                         Save
                        </button>
                    </form>
            </div>
            </>
        )
    }
}