Below is my proposed wireframe:
![Image of wireframe](/planning/wireframe.jpg)

Below is my proposed ERD:
![Image of ERD](/planning/ApprovedERD.png)


## Requirements
The recommended browser for Moview is Google Chrome.

You will need Node.js installed to continue this process.
[https://nodejs.org/en/]

## Installation
Via the terminal, you will need to navigate to the project root directory and run the command "npm install"

You will need to go to [https://www.themoviedb.org/] and register. Then copy your API key and continue with the directions below:

Inside /src/components you will need to create a file "Settings.js"
The only thing in this file should be:

export default {
    tmdbKey: "YOUR-TMDB-KEY-HERE"
}


## Start the Application
Via the termina, you will need to naviate to the project root directory and run the command "npm start"

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.


## Created with React
This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).