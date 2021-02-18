const express = require("express");
//const cookieParser = require('cookie-parser')
const cookieSession = require('cookie-session')
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

//Helper Functions//////////////////////////////////////////////////
function generateRandomString(length) {
  let result = '';
  let char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  let charLength = char.length
  for ( let i = 0; i < length; i++) {
    result += char.charAt(Math.floor(Math.random() * charLength));
  }
  return result;
}

function checkEmailExists(email){
  for (let key in users) {  
    if ((email === users[key].email)) {
      return key;
    }
  }
  return null;
 }

//Databases/////////////////////////////////////////////////////////

const urlDatabase = {
  HiqAFr: { 
    longURL: "http://www.mcmaster.ca", 
    userID: "aJ48lW" 
  },
  aOkwnK: { 
    longURL: "http://www.redflagdeals.com", 
    userID: "aJ48lW" 
  }
};

const users = { 
  "'KJopgm'": {
    id: "'KJopgm'", 
    email: "c@c.ca", 
    password: "$2b$10$FrpYrfewhNKVcYVYP12kpu9zF8pKh7BKO.pKfCm1D018JLqVQobL6"
  },
 "OFXoHP": {
    id: "OFXoHP", 
    email: "a@a.ca", 
    password: "$2b$10$PDGFyPBjk3t4DEAcjSIAtum638A0lG4bM1UDuWIKkbt/v9.obHO22"
  }
}

//MIDDLEWARE////////////////////////////////////////////////////////

app.use(bodyParser.urlencoded({extended: true}));
//app.use(cookieParser())
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
}));

// GET//////////////////////////////////////////////////////////////

app.get("/", (req, res) => {
  res.send("Hello!");
});


app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


app.get('/register', (req, res) => {
  const templateVars = {
    user: null, 
  }
  res.render('register', templateVars);
});

app.get('/login', (req, res) => {
  const templateVars = {
    user: null, 
  }
  res.render('login', templateVars);
});


app.get("/urls/new", (req, res) => {
//don't want non-logged in users to visit this page

  const user = users[req.session.user_id]
  if(!user) {
    return res.redirect('/login');
  }
  const templateVars = {
    user,
  }
  res.render("urls_new", templateVars);
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});



function urlsForUser(id) {
  let filteredURLS = {}
  for (let url in urlDatabase) {
    userID = urlDatabase[url]['userID']
    if (userID === id) {
      filteredURLS[url] = urlDatabase[url];
    }
  } return filteredURLS;
}


// console.log('testing urls for user function', urlDatabase[url])
// console.log('testing 1234', urlDatabase[url].userID)
// console.log('testing cookies', users[req.cookies['user_id']])

app.get("/loginregister", (req, res) => {
  res.render('loginregister')
});


app.get("/urls", (req, res) => {
  //don't want non-logged in users to visit this page
  const user = users[req.session.user_id]
 console.log('user', user)
  if(!user) {
    res.redirect('/loginregister');
  }
 
  const urls = urlsForUser(user.id);

  const templateVars = { urls, user };
    
  res.render("urls_index", templateVars);
});
  



app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;

  
  if (!req.session.user_id) {
    res.redirect('/loginregister');
  }

  const user = users[req.session.user_id]
  const urls = urlsForUser(user.id);

  if (Object.keys(urls).includes(shortURL)) {
      const templateVars = { shortURL, 
      longURL: urlDatabase[shortURL]['longURL'], 
      user: users[req.session.user_id] };
      res.render("urls_show", templateVars);
  } else {
    res.redirect('/loginregister');
  }

});


app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});


// POST ////////////////////////////////////////////////////////



app.post("/login", (req, res) => {
  //1 get data from request body
  const emailSubmitted = req.body.email;
  const passwordSubmitted = req.body.password;
  const key = checkEmailExists(emailSubmitted);
  //2 to check for email and if not found send 403 status code
  
    if (!key) {
      return res.status(403).send("This email cannot be found.")
    } 

  //3 if email located then compare password given to existing, and if it doesn't match send 403 status code.
    // if ((users[key].password !== passwordSubmitted)){

    //   // console.log('passwordsubmited', passwordSubmitted)
    //   // console.log('users at key at password', users[key].password)
    //   // console.log('users at key', users[key].id)

    //   return res.status(403).send("The password does not match the email entered.")
    // }

    bcrypt.compare(passwordSubmitted, users[key].password, (err, result) => {
      if (!result) {
        return res.status(401).send('Password incorrect');
      }

  //res.cookie("user_id", key);
  req.session['user_id'] = key;
  res.redirect('/urls');
    });
 });
 

 app.post('/register', (req, res) => {
  //1. get data from request body
  const email = req.body.email;
  const password = req.body.password;
  const id = generateRandomString(6)
  

  //2. To check for the email and password should not be empty
  if(email==="" || password===""){
    return res.status(400).send('Please enter an email and password.');
  }
  //3. To check whether the email exists or not
  if(checkEmailExists(email)){
    return res.status(400).send("Email has already been taken. Please try with another one!")


    // add user object to user database
  } else { bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
    const user = {
                  id,
                  email,
                  password: hash
                  };
    console.log(user)
    users[id] = user;
    //res.cookie('user_id', id)
    req.session['user_id'] = user.id;
    res.redirect('/urls');
    });
  })

    
    // create a user object
    // const user = {
    //   id,
    //   email,
    //   password
    // };   
   
}
  
});



 app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6);
  const longURL = "http://www." +  req.body.longURL;
  urlDatabase[shortURL] = { 
    longURL: longURL, 
    userID: req.session['user_id']
  };
  // console.log('cookies', req.cookies)
  // console.log('urldb', urlDatabase)
  res.redirect(`/urls/${shortURL}`)
 });
 

 app.post("/logout", (req, res) => {
  req.session.user_id = null
  res.redirect('/urls');
 });


// Delete  POST /urls/:shortURL/delete
app.post('/urls/:shortURL/delete', (req, res) => {
  const id = req.session['user_id'];
  const shortURL = req.params.shortURL;
  const urlBelongUser = urlDatabase[shortURL].userID
  console.log('line 267 id', id)
  if (id === urlBelongUser) {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
    return;
  }  else {
    res.redirect('/login');
 }
});


// EDIT/UPDATES POST /urls/:id
app.post('/urls/:shortURL', (req, res) => {
  //console.log('line 273',req.cookies['user_id'])
  const id = req.session['user_id'];
  if(!id) {
    res.redirect('/loginregister');
  }

  const user = users[req.session['user_id']]
  const urls = urlsForUser(user.id);
  const shortURL = req.params.shortURL;
  const newURL = req.body.longURL;

  if (Object.keys(urls).includes(shortURL)) {
      urlDatabase[req.params.shortURL] =  { 
      longURL: newURL, 
      userID: req.session['user_id']
    };
    res.redirect(`/urls/${req.params.shortURL}`);

  }
  else {
    res.redirect('/loginregister');
  }

});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});