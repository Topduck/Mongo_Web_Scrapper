var mongoose = require("mongoose");

//saves a reference to the Schema
var Schema = mongoose.Schema;

var ArtSchema = new Schema({

  headline: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    required: true
  },
  //saved will be used a boolan
  saved: {
    type: Boolean,
    default: false
  },
  // note will stores an id from the Note table so that it can be tied to an article.  
  note:[
      {
          type: Schema.Types.ObjectId,
          ref: "Note"
      }
  ]
});

//Creating the model from the schema detailed above, using mongoose's handy model method.
var Article = mongoose.model("Artricle", ArtSchema);

//Exporting the model for use in other files
module.exports =Article;


