const express = require('express');
const bodyParser = require('body-parser');
const {
  generateRandomString,
} = require('./generate-random-string');

const app = express();
const PORT = 8080;


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true,
}));

const urlDatabase = {
  b2xVn2: 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
};

app.get('/', (req, res) => {
  res.redirect('/urls/new');
});

app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
  };
  res.render('urls_index', templateVars);
});


app.get('/urls/new', (req, res) => {
  res.render('urls_new');
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
  };
  res.render('urls_show', templateVars);
});

app.post('/urls', (req, res) => {
  const {
    longURL,
  } = req.body;
  const random = generateRandomString();
  urlDatabase[random] = longURL;
  res.status = 302;
  res.redirect(`/urls/${random}`);
});

app.listen(PORT, () => {
  console.clear();
  console.log(`App is listening on port ${PORT}`);
});
