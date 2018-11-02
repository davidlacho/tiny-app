// Stretch work:
// Figure out how to track unique session logins

const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const moment = require('moment');
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
    date: 1541126988418,
    visitNumber: 0,
  },
  '9sm5xK': {
    longURL: 'http://www.google.com',
    userID: '1234',
    date: 1541126988618,
    visitNumber: 0,
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
  const cookieId = req.cookies.id;
  const currentUser = users[cookieId];
  if (currentUser) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});


app.post('/logout', (req, res) => {
  res.clearCookie('id');
  res.redirect(('/'));
});

const urlsForUser = (id) => {
  newObj = {};
  for (url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      newObj[url] = urlDatabase[url];
    }
  }
  return newObj;
}

app.get('/urls', (req, res) => {
  const cookieId = req.cookies.id;
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
  const {
    longURL
  } = urlDatabase[shortURL];

  const numberOfVisits = urlDatabase[shortURL].visitNumber;
  urlDatabase[shortURL].visitNumber = numberOfVisits + 1;
  console.log(urlDatabase[shortURL]);
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.redirect('/');
  }
});

app.get('/urls/:id', (req, res) => {
  const cookieId = req.cookies.id;
  if (urlDatabase[req.params.id].userID === cookieId) {
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
    return;
  }

});


// Creating a new URL
app.post('/urls', (req, res) => {
  const cookieId = req.cookies.id;
  const currentUser = users[cookieId];
  if (currentUser) {
    const {
      longURL,
    } = req.body;
    const random = generateRandomString();
    urlDatabase[random] = {
      longURL : longURL,
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

app.post('/urls/:id/delete', (req, res) => {
  const cookieId = req.cookies.id;
  if (urlDatabase[req.params.id].userID === cookieId) {
    delete urlDatabase[req.params.id];
  }
  res.redirect('/urls/');
});

app.post('/urls/:id', (req, res) => {
  urlDatabase[req.params.id].longURL = req.body.newURL;
  res.redirect(req.get('referer'));
});

app.get('/register', (req, res) => {
  const cookieId = req.cookies.id;
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
      res.cookie('id', randomID);
      res.redirect('/urls');
    }
  }
});

app.get('/login', (req, res) => {
  const cookieId = req.cookies.id;
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
