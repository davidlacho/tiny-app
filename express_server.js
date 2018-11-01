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
  b2xVn2: {
    longURL: 'http://www.lighthouselabs.ca',
    userID: '1234',
  },
  '9sm5xK': {
    longURL: 'http://www.google.com',
    userID: '1234',
  },
};

const users = {
  1234: {
    id: '1234',
    email: 'user@example.com',
    password: '1234',
  },
};

app.get('/', (req, res) => {
  res.redirect('/urls/new');
});


app.post('/logout', (req, res) => {
  res.clearCookie('id');
  res.redirect(req.get('referer'));
});


app.get('/urls', (req, res) => {
  const cookieId = req.cookies.id;
  const templateVars = {
    urls: urlDatabase,
    user: users[cookieId],
  };

  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const cookieId = req.cookies.id;
  const currentUser = users[cookieId];
  if (currentUser) {
    const templateVars = {
      urls: urlDatabase,
      user: currentUser,
    };
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

app.get('/u/:shortURL', (req, res) => {
  const {
    shortURL,
  } = req.params;
  const longURL = urlDatabase[shortURL].longURL;
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.redirect('/');
  }
});

app.get('/urls/:id', (req, res) => {
  const cookieId = req.cookies.id;
  const templateVars = {
    shortURL: req.params.id,
    urls: urlDatabase,
    user: users[cookieId],
  };

  res.render('urls_show', templateVars);
});

// Creating a new URL
app.post('/urls', (req, res) => {
  const {
    longURL,
  } = req.body;
  const random = generateRandomString();
  urlDatabase[random].longURL = longURL;
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

app.get('/register', (req, res) => {
  if (req.cookies.id) {
    res.redirect('/');
  }
  const cookieId = req.cookies.id;
  const templateVars = {
    shortURL: req.params.id,
    urls: urlDatabase,
    user: users[cookieId],
  };

  res.render('urls_register', templateVars);
});

app.post('/register', (req, res) => {
  const randomID = generateRandomString();
  if (!req.body.email || !req.body.password) {
    res.status(400);
    res.send('Error. Needs Email & Password Fields.');
  } else {
    let userExists = false;
    for (user in users) {
      if (req.body.email === users[user].email) {
        userExists = true;
        break;
      };
    }
    if (userExists) {
      res.status(400);
      res.send('You seem to already be registered. Perhaps login?');
    } else {
      users[randomID] = {
        id: randomID,
        email: req.body.email,
        password: req.body.password,
      };
      res.cookie('id', randomID);
      res.redirect('/urls');
    }
  }
});

app.get('/login', (req, res) => {
  const cookieId = req.cookies.id;
  const currentUser = users[cookieId];
  if (currentUser) {res.redirect('/');
  } else {
    const templateVars = {
      shortURL: req.params.id,
      urls: urlDatabase,
      user: users[cookieId],
    };
    res.render('urls_login', templateVars);
  }
});

app.post('/login', (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400);
    res.send('Error. Needs Email & Password Fields.');
  } else {
    let userExists = false;
    let userRecord;
    for (user in users) {
      if (req.body.email === users[user].email) {
        userExists = true;
        userRecord = users[user];
        break;
      };
    }
    if (!userExists) {
      res.status(403);
      res.send('No account. Perhaps register?');
    } else if (req.body.password === userRecord.password) {
      res.cookie('id', userRecord.id);
      res.redirect('/');
    } else {
      res.status(403);
      res.send('Incorrect password.');
    }
  }
});

app.listen(PORT, () => {
  console.clear();
  console.log(`App is listening on port ${PORT}`);
});
