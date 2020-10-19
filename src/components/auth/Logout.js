import React from "react"
import { useHistory, useParams } from 'react-router-dom';



export const Logout = () => {
    const history = useHistory()
    localStorage.removeItem("user")
    history.push("/")
  

    return (
        <>
        <div>
            <h1>This will be where you logout of your account</h1>
        </div>
        </>
    )}