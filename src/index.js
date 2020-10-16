import React from "react"
import ReactDOM from "react-dom"
import { BrowserRouter as Router } from "react-router-dom"
import { Moview } from "./components/Moview.js"
import "./index.css"

ReactDOM.render(
    <React.StrictMode>
        <Router>
            <Moview />
        </Router>
    </React.StrictMode>,
    document.getElementById("root")
)