const express = require("express");
const cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080;




function generateRandomString(length) {
  let result = '';
  let char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  let charLength = char.length
  for ( let i = 0; i < length; i++) {
    result += char.charAt(Math.floor(Math.random() * charLength));
  }
  return result;
}



const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "a@a.ca", 
    password: "1234"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "b@b.ca", 
    password: "abcd"
  }
}

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())




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
  const user = users[req.cookies['user_id']]
  const templateVars = {
    user,
  }
  res.render("urls_new", templateVars);
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies['user_id']]};
  res.render("urls_index", templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies['user_id']] };
  res.render("urls_show", templateVars);
});


app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});


////////////////////////////////////////////////////////

function checkEmailExists(email){
  for (let key in users) {  
    if ((email === users[key].email)) {
      return key;
    }
  }
  return null;
 }

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
    if ((users[key].password !== passwordSubmitted)){

      console.log('passwordsubmited', passwordSubmitted)
      console.log('users at key at password', users[key].password)
      console.log('users at key', users[key].id)

      return res.status(403).send("The password does not match the email entered.")
    }

  
  
  res.cookie("user_id", key);

  
  res.redirect('/urls');

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

  } else{
    // create a user object
    const user = {
      id,
      email,
      password
    };
    // add user object to user database
  
    users[id] = user;
    res.cookie('user_id', id)
    res.redirect('/urls');
  }
  
});



 app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = "http://www." + req.body.longURL;
  res.redirect(`/urls/${shortURL}`)
 });
 

 app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
 });


// Delete  POST /urls/:shortURL/delete
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];

  res.redirect('/urls');
});


// EDIT/UPDATES POST /urls/:id
app.post('/urls/:shortURL', (req, res) => {
  const newURL = req.body.longURL;
  urlDatabase[req.params.shortURL] = newURL 
  res.redirect(`/urls/${req.params.shortURL}`);
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});