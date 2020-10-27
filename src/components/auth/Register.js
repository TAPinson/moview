import React, { useRef } from "react"
import { useHistory } from 'react-router-dom'
import "./Login.css"

export const Register = (props) => {
    const email = useRef()
    const history = useHistory()
    const username = useRef()
    const existingUserCheck = () => {
        return fetch(`http://localhost:8088/users?email=${email.current.value}`)
            .then(_ => _.json())
            .then(user => !!user.length)
    }
    const handleRegister = (e) => {
        e.preventDefault()
            existingUserCheck()
            .then(() => {
                fetch("http://localhost:8088/users", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        username: username.current.value,
                        email: email.current.value,
                        partnerId: 0
                    })
                })
                    .then(_ => _.json())
                    .then(createdUser => {
                        if (createdUser.hasOwnProperty("id")) {
                            localStorage.setItem("user", createdUser.id)
                            history.push("/")
                        }
                    })
            })
    }
    return (
        <main style={{ textAlign: "center" }}>
            <form className="form--login" onSubmit={handleRegister}>
                <h1 className="h3 mb-3 font-weight-normal">Register for Moview</h1>
                <fieldset>
                    <label htmlFor="username"> Username: </label>
                    <input ref={username} type="text"
                        name="username"
                        className="form-control"
                        placeholder="Username"
                        required autoFocus />
                </fieldset>
                <fieldset>
                    <label htmlFor="inputEmail"> Email address </label>
                    <input ref={email} type="email"
                        name="email"
                        className="form-control"
                        placeholder="Email address"
                        required />
                </fieldset>
                <fieldset>
                    <button type="submit">
                        Sign in
                    </button>
                </fieldset>
            </form>
        </main>
    )
}

