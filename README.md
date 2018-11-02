# TinyApp Project

## Description
TinyApp is a full stack web application built with Node and Express that allows users to short

## Final Product

## Dependencies

* bcrypt:
* body-parser
* cookie-session
* dotenv
* ejs
* express
* method-override
* moment
* morgan
* nodemon

## Getting started

### Installation

Clone this repository to your local disk:
```
https://github.com/fiveache/tiny-app.git
```

Install all dependencies (using the `npm install` command).

Create a `.env` file in the root of the TinyApp project by running `touch .env`.

Create a variable called `SESSION_KEY` in your `.env` file. Key will be used by the `cookie-session` dependency.:

```
SESSION_KEY = '<KEY>';
```

Run the development web server using the `npm start` command (which will start nodemon).
