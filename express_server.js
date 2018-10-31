const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const {
  generateRandomString,
} = require('./generate-random-string');

const app = express();
const PORT = 8080;


app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
  extended: true,
}));
app.use(cookieParser());

const urlDatabase = {
  b2xVn2: 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
};


app.get('/', (req, res) => {
  res.redirect('/urls/new');
});

app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/');
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect(req.get('referer'));
});


app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"],
  };
  console.log('cookies', req.cookies["username"])
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
  };
  res.render('urls_new', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const {
    shortURL,
  } = req.params;
  const longURL = urlDatabase[shortURL];
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.redirect('/');
  }
});

app.get('/urls/:id', (req, res) => {
  const templateVars = {
    shortURL: req.params.id,
    urls: urlDatabase,
    username: req.cookies["username"],
  };
  res.render('urls_show', templateVars);
});

// Creating a new URL
app.post('/urls', (req, res) => {
  const {
    longURL,
  } = req.body;
  const random = generateRandomString();
  urlDatabase[random] = longURL;
  res.status = 302;
  res.redirect(`/urls/${random}`);
});

app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls/');
});

app.post('/urls/:id', (req, res) => {
  urlDatabase[req.params.id] = req.body.newURL;
  res.redirect(req.get('referer'));
});

app.listen(PORT, () => {
  console.clear();
  console.log(`App is listening on port ${PORT}`);
});
