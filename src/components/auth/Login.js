import React, { useRef } from "react"
import { Link } from "react-router-dom";
import { useHistory } from 'react-router-dom'
import "./Login.css"


export const Login = props => {
    const username = useRef()
    const existDialog = useRef()
    const history = useHistory()
    const existingUserCheck = () => {
        return fetch(`http://localhost:8088/users?username=${username.current.value}`)
            .then(_ => _.json())
            .then(user => user.length ? user[0] : false)
    }
    const handleLogin = (e) => {
        e.preventDefault()
        existingUserCheck()
            .then(exists => {
                if (exists ) {
                    localStorage.setItem("user", exists.id)
                    history.push("/")
                } else if (!exists) {
                    existDialog.current.showModal()
                }
            })
    }
    return (
        <main className="container--login">
            <dialog className="dialog dialog--auth" ref={existDialog}>
                <div>User does not exist</div>
                <button className="button--close" onClick={e => existDialog.current.close()}>Close</button>
            </dialog>
            <section>
                <form className="form--login" onSubmit={handleLogin}>
                    <h1 className="loginWelcome">Welcome to Moview!</h1>
                    <h2>Please sign in</h2>
                    <fieldset>
                        <label htmlFor="inputUsername"> Username </label>
                        <input ref={username} type="username"
                            id="username"
                            className="form-control"
                            placeholder="Username"
                            required autoFocus />
                    </fieldset>
                    <fieldset>
                        <button type="submit">
                            Sign in
                        </button>
                    </fieldset>
                    <section className="link--register">
                        <Link to="/register">Not a member yet?</Link>
                    </section>
                </form>
                
            </section>
            
        </main>
    )
}