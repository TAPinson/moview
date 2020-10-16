import React from "react"
import { Link } from "react-router-dom"
import "./NavBar.css"

export const NavBar = (props) => {
    return (
        <ul className="navbar">
            <li className="navbar__item active">
                <Link className="navbar__link" to="/">Home</Link>
            </li>
            <li className="navbar__item">
                <Link className="navbar__link" to="/queue">Our Queue</Link>
            </li>
            <li className="navbar__item">
                <Link className="navbar__link" to="/likes">Likes</Link>
            </li>
            <li className="navbar__item">
                <Link className="navbar__link" to="/watched">My Watched</Link>
            </li>
            <li className="navbar__item">
                <Link className="navbar__link" to="/account">My Account</Link>
            </li>
            <li className="navbar__item">
                <Link className="navbar__link" to="/locout">Logout</Link>
            </li>
        </ul>
    )
}