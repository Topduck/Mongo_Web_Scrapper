var mongoose = require("mongoose");

var Schema = mongoose.Schema;

//using mongoose schema construction were creating a NoteSchema object

var NoteSchema = new Schema({
    noteText: String
});
//create the model for note from the schema above, using the model method, and exporting it
var Note = mongoose.model("Note", NoteSchema);
module.exports = Note;