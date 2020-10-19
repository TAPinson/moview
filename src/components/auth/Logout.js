import React from "react"
import { useHistory, useParams } from 'react-router-dom';



export const Logout = () => {
    const history = useHistory()
    localStorage.removeItem("user")
    history.push("/")
  

    return (
        <>
        <div>
            <h1>Logging out current user</h1>
        </div>
        </>
    )}