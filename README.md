# TinyApp Project

## Description
TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLS.

## Final Product

## Dependencies

* bcrypt
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
git clone https://github.com/fiveache/tiny-app.git
```

change into directory `tiny-app`
```
cd tiny-app
```

Install all dependencies (using the `npm install` command).

Create a `.env` file in the root of the TinyApp project by running `touch .env`.
```
touch .env
```
Create a variable called `SESSION_KEY` in your `.env` file. Key will be used by the `cookie-session` dependency:
```
SESSION_KEY = '<KEY>';
```

For example,
```
SESSION_KEY = '12345';
```

Run the development web server using the `npm start` command (which will start nodemon).

Visit `localhost:8080` to view TinyApp.

## Screenshots
!["Screenshot of Login Page"](https://github.com/fiveache/tiny-app/blob/master/docs/loginpage.png?raw=true)
!["Screenshot of URLs Page"](https://github.com/fiveache/tiny-app/blob/master/docs/urlpage.png?raw=true)
!["Screenshot of new URL Page"](https://github.com/fiveache/tiny-app/blob/master/docs/newurl.png?raw=true)
!["Screenshot of URLs Edit Page"](https://github.com/fiveache/tiny-app/blob/master/docs/urlupdatepage.png?raw=true)
