var bodyParser = require("body-parser");
var express = require("express");
var exphbs = require("express-handlebars");
var logger = require("morgan");
var mongoose = require("mongoose");
// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var cheerio = require("cheerio");
var axios = require("axios");
// Require all models
var db = require("./models");

var PORT = process.env.PORT|| 3000;

// Initialize Express
var app = express();

//file requirements
require('./routes/apiRoutes.js')(app)
//require('./routes/htmlRoutes.js')(app)

// Use morgan logger for logging requests
app.use(logger("dev"));

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static('public'))

//Handlebars set up
//app.set('views', '/views')
app.engine("handlebars",exphbs({defaultLayout: "main"}));
app.set("view engine", "handlebars")

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/Articles", { useNewUrlParser: true });

// Start the server

app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
