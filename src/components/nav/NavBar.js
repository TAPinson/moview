import React from "react"
import { Link } from "react-router-dom"
import "./NavBar.css"

export const NavBar = (props) => {
    return (
        <ul className="navbar">
            <li className="navbar__item">
                <Link className="navbar__link" to="/">Home</Link>
            </li>
            <li className="navbar__item">
                <Link className="navbar__link" to="/ourqueue">Our Queue</Link>
            </li>
            <li className="navbar__item">
                <Link className="navbar__link" to="/myqueue">My Queue</Link>
            </li>
            <li className="navbar__item">
                <Link className="navbar__link" to="/watched">My Watched</Link>
            </li>
            <li className="navbar__item">
                <Link className="navbar__link" to="/browse">Browse Movies</Link>
            </li>
            <li className="navbar__item">
                <Link className="navbar__link" to="/account">My Account</Link>
            </li>
            <li className="navbar__item">
                <Link className="navbar__link" to="/logout">Logout</Link>
            </li>
        </ul>
    )
}