/*
 * ========================================
 * VARIABLE DECLARATION
 * ========================================
 */

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
// const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const moment = require('moment');
const cookieSession = require('cookie-session');
const methodOverride = require('method-override');

const {
  generateRandomString,
} = require('./generate-random-string');

const urlDatabase = {};

const users = {};


/*
 * ========================================
 * EXPRESS CONFIG & MIDDLEWARE
 * ========================================
 */

const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
  extended: true,
}));

app.use(cookieSession({
  name: 'session',
  secret: process.env.SESSION_KEY,
}));

app.use(methodOverride('_method'));

/*
 * ========================================
 * Helper Functions
 * ========================================
 */

const urlsForUser = (id) => {
  newObj = {};
  for (url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      newObj[url] = urlDatabase[url];
    }
  }
  return newObj;
}

/*
 * ========================================
 * GET ROUTES
 * ========================================
 */

app.get('/', (req, res) => {
  const cookieId = req.session.id;
  const currentUser = users[cookieId];
  console.log(cookieId);
  if (currentUser) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

app.get('/urls', (req, res) => {
  const cookieId = req.session.id;
  const currentUser = users[cookieId];
  if (currentUser) {
    const templateVars = {
      urls: urlsForUser(cookieId),
      user: users[cookieId],
    };

    res.render('urls_index', templateVars);
  } else {
    res.send('You must be logged in to view the page');
  }
});


app.get('/urls/new', (req, res) => {
  const cookieId = req.session.id;
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
  let longURL = urlDatabase[shortURL].longURL;
  const numberOfVisits = urlDatabase[shortURL].visitNumber;
  urlDatabase[shortURL].visitNumber = numberOfVisits + 1;
  if (!/^(f|ht)tp?:\/\//i.test(longURL)) {
    longURL = `http://${longURL}`;
  }
  if (longURL) {
    res.status(301).redirect(longURL);
  } else {
    res.status(400).redirect('/');
  }
});

app.get('/urls/:id', (req, res) => {
  const cookieId = req.session.id;

  const requestedTinyURL = urlDatabase[req.params.id];

  if (requestedTinyURL) {
    if (requestedTinyURL.userID === cookieId) {
      const templateVars = {
        shortURL: req.params.id,
        urls: urlDatabase,
        user: users[cookieId],
      };

      res.render('urls_show', templateVars);
    } else {
      if (!cookieId) {
        res.send('You must be logged in.');
      } else {
        res.send(`The URL ${req.params.id} does not belong to you.`);
      }
    }
  } else {
    res.send('Tiny URL does not exist!');
  }
});

app.get('/register', (req, res) => {
  const cookieId = req.session.id;
  const currentUser = users[cookieId];
  if (currentUser) {
    res.redirect('/');
  }
  const templateVars = {
    shortURL: req.params.id,
    urls: urlDatabase,
    user: users[cookieId],
  };

  res.render('urls_register', templateVars);
});


app.get('/login', (req, res) => {
  const cookieId = req.session.id;
  const currentUser = users[cookieId];

  if (currentUser) {
    res.redirect('/');
  } else {
    const templateVars = {
      shortURL: req.params.id,
      urls: urlDatabase,
      user: users[cookieId],
    };
    res.render('urls_login', templateVars);
  }
});

/*
 * ========================================
 * POST ROUTES
 * ========================================
 */

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.post('/urls', (req, res) => {
  const cookieId = req.session.id;
  const currentUser = users[cookieId];
  if (currentUser) {
    const {
      longURL,
    } = req.body;
    const random = generateRandomString();
    urlDatabase[random] = {
      longURL: longURL,
      userID: cookieId,
      date: moment().format('MMMM Do YYYY, h:mm:ss a'),
      visitNumber: 0,
    };

    res.status = 302;
    res.redirect(`/urls/${random}`);
  } else {
    res.send('must be logged in to submit a url');
  }
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
        password: bcrypt.hashSync(req.body.password, 10),
      };
      req.session.id = randomID;
      res.redirect('/urls');
    }
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
    } else if (bcrypt.compareSync(req.body.password, userRecord.password)) {
      req.session.id = userRecord.id;
      res.redirect('/');
    } else {
      res.status(403);
      res.send('Incorrect password.');
    }
  }
});

/*
 * ========================================
 * PUT ROUTES
 * ========================================
 */

app.put('/urls/:id', (req, res) => {
  const cookieId = req.session.id;
  const currentUser = users[cookieId];
  if (urlDatabase[req.params.id].userID === currentUser.id) {
    urlDatabase[req.params.id].longURL = req.body.newURL;
    res.redirect(`/urls/${req.params.id}`);
  } else {
    res.send('You do not have permission to change this URL.');
  }
});

/*
 * ========================================
 * DELETE ROUTES
 * ========================================
 */

app.delete('/urls/:id/delete', (req, res) => {
  const cookieId = req.session.id;
  if (urlDatabase[req.params.id].userID === cookieId) {
    delete urlDatabase[req.params.id];
  } else {
    res.send('This url does not blelong to you. Cannot delete.');
  }
  res.redirect('/urls');
});

/*
 * ========================================
 * SERVER CONFIG
 * ========================================
 */

app.listen(PORT, () => {
  console.clear();
  console.log(`App is listening on port ${PORT}`);
});
