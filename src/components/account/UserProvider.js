import React, { useState, createContext } from "react"

export const UserContext = createContext()

export const UserProvider = (props) => {
    const loggedId = localStorage.getItem("user")
    const [user, setUser] = useState([])

    const getUser = () => {
        // Fetch popular movies from 2019
        return fetch(`http://localhost:8088/users?id=${loggedId}`)
        .then(res => res.json())
        .then(parsedUser => {
            let user = parsedUser[0]
            setUser(user)
        })
        //.then(setUser)
        
    }



    // Add needed functionality to context
    return (
        <UserContext.Provider value={{
            user, getUser
        }}>
            {props.children}
        </UserContext.Provider>
    )

}