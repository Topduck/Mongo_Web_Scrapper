const axios = require('axios');
const cheerio = require("cheerio");
const mongoose = require("mongoose");
// Require all models
const db = require("../models");

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.connect(MONGODB_URI);

module.exports = function(app) {
    //goes to home page of app
    app.get('/',function(req,res) {
        db.Article.find({saved:false}, function(err, data){
            res.render('home', {home:true, article: data});
        })
    });
    //gets saved articles
    app.get('/saved', function(req,res) {
        db.Article.find({saved:true}, function(err, data){
            res.render('saved', {home: false, article:data});
        })
    });
    // saves article to mongo db by chaning the value of the saved field to true
    app.put("/api/headlines/:id", function(req,res){
        var saved = req.body.saved == 'true'
        //why cant it just be the boolean true?
        if(saved){
            db.Article.updateOne({_id: req.body._id},{$set: {saved:true}}, function(err, resul){
                if(err){
                    console.log(`you got this error: ${err}`)
                } else {
                    return res.send(true)
                }
            });
        }
    });

    //delete article from the mongo database
    app.delete("/api/headlines/:id", function(req, res){
        console.log("reqbody:"+JSON.stringify(req.params.id))
        db.Article.deleteOne({_id: req.params.id}, function(eff, result){
            if (err) {
                console.log(`you got this error: ${err}`)
            } else {
                return res.send(true)
            }
        });
    });

    //scraping get requests
    //using a get route for scraping.  First fet the entire body of the html with axios
    app.get("/api/fetch", function(req, res){
        axios.get("https://www.nytimes.com/").then(function(response){
            //saving the response into cheerio, and using the $ for a shorthand selector for later
            const $ =cheerio.load(response.data);
            //accecssing each article tag in the axios html grab, via the cheerio selector $
            $("article").each(function(i, element){
                //actual scrape of h2 elements into emptry results object
                //first set up empty results object
                var result = {};
                //next set up headline, url, and summary object keys and values
                result.headline = $(element).find("h2").text().trim();
                result.url = "https://www.nytimes.com" + $(element).find("a").attr("href");
                result.summary = $(element).find("p").text().trim();
                // check to make sure scrape worked correctly
                if (result.headline !== "" && result.summary !==""){
                    // if true, search for article in db, if null (to avoid dups) add(create) record in db/
                    db.Article.findOne({headline: result.headline}, function(err, data){
                        if(err){
                            console.log(`you got this error: ${err} while trying to search your db for potential dup of incoming article`)
                        }
                        else {
                            if (data === null){
                                db.Article.create(result)
                                .then(function(dbArticle){
                                    console.log(`this article was added to the db ${dbArticle}`)
                                })
                                .catch(function(err) {
                                    console.log(`you got this error: ${err} while trying to add article to db`)
                                });
                            }
                            console.log(data)
                        }
                    });
                }
            });
            // if the scrape and save of a new article(s) occurs, send a message to the user saying so
            res.send("Article scrape complete!")
        });
    });
    //now getting all the notes back on a given article 
    app.get("/api/notes/:id", function(req, res){
        db.Article.findOne({_id: req.params.id})
    .populate("note")
    .then(function(dbArticle){
      console.log(dbArticle.note)
      res.json(dbArticle.note)
    })
    .catch(function(err){
      res.json(err)
    })
  });
  //adding a note to an article
  app.post("/api/notes", function(req, res){
    console.log(req.body)
    db.Note.create({ noteText: req.body.noteText })
    .then(function(dbNote){
      console.log('dbNote:' + dbNote)
      return db.Article.findOneAndUpdate({ _id:req.body._headlineId}, 
      { $push: {note: dbNote._id} }, 
      {new: true})
    })
    .then(function(dbArticle){
      console.log('dbArticle:'+dbArticle)
      res.json(dbArticle)
    })
    .catch(function(err){
      res.json(err);
    })
  });
  // delete note form article
  app.delete("/api/notes/:id", function(req, res){
    console.log('reqbody:' + JSON.stringify(req.params.id))
    db.Note.deleteOne({_id: req.params.id}, function(err, result){
      if (err) {
        console.log(err)
      } else {
        return res.send(true)
      }
    });
  });
  // clear all articles from database
  app.get("/api/clear", function(req, res){
    console.log(req.body)
    db.Article.deleteMany({}, function(err, result){
      if (err) {
        console.log(err)
      } else {
        console.log(result)
        res.send(true)
      }
    })
  });
}