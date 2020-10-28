import React, { useState, createContext } from "react"

export const UserContext = createContext()

export const UserProvider = (props) => {
    const loggedId = localStorage.getItem("user")
    const [user, setUser] = useState([])
    const [users, setUsers] = useState([])
    const getUser = () => {
        // Fetch popular movies from 2019
        return fetch(`http://localhost:8088/users?id=${loggedId}`)
        .then(res => res.json())
        .then(parsedUser => {
            let user = parsedUser[0]
            setUser(user)
        })
    }
    const getUsers = () => {
        return fetch(`http://localhost:8088/users`)
        .then(res => res.json())
        .then(parsedUser => {
            let users = parsedUser
            setUsers(users)
        })
    }
    const updateUser = user => {
        return fetch(`http://localhost:8088/users/${user.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(user)
        })
        .then(setUser(user))
    }
    // Add needed functionality to context
    return (
        <UserContext.Provider value={{
            user, getUser, users, getUsers, updateUser
        }}>
            {props.children}
        </UserContext.Provider>
    )
}