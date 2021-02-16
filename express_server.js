const express = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

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

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

function generateRandomString(length) {
  let result = '';
  let char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  let charLength = char.length
  for ( let i = 0; i < length; i++) {
    result += char.charAt(Math.floor(Math.random() * charLength));
  }
  return result;
}



app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
 const shortURL = generateRandomString(6);
 urlDatabase[shortURL] = "http://www." + req.body.longURL;
 res.redirect(`/urls/${shortURL}`)
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});