//jshint esversion:6

// DEFINE THE REQUIRED MODULES

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

// DEFINE THE APP

const app = express();

// SET VIEW ENGINE SO WE CAN PASS VARIABLES BACK TO THE VIEWS

app.set('view engine', 'ejs');

// INITIATE BODY PARSER TO GET INTPUTS SUBMITTED FROM VIEWS

app.use(bodyParser.urlencoded({extended: true}));

// ALLOWS US TO USE THE PUBLIC FOLDER FOR THINGS LIKE CSS & IMAGES

app.use(express.static("public"));

// CONNECT TO OUR DB

// mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true});

mongoose.connect("mongodb+srv://admin_ok:Test123@cluster0-chit9.mongodb.net/todolistDB", {useNewUrlParser: true});


// CREATE NEW SCHEMA OR TABLE

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model('Item', itemsSchema);

// CREATE NEW SCHEMA OR TABLE

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model('List', listSchema);

// GET ROOT ROUTE

app.get("/", function(req, res) {

  // FIND ALL ITEMS

  Item.find({},  function(err, foundItems) {
    if(err) {
      console.log(err);
    } else {

      // PASS ITEMS THAT ARE FOUND BACK TO THE VIEW
      res.render("list", {listTitle: "Today", newListItems: foundItems});

    }
  });


});

// GET CUSTOME ROUTE NAME.

app.get("/:customListName", function(req,res){

  // CAPITALISE FIRST LETTER OF THE ROUTE VARIABLE.

  const customListName = _.capitalize(req.params.customListName);

  // FIND ONE LIST ITEM WHERE LIST NAME = ROUTE VARIABLE.

  List.findOne({name: customListName},  function(err, foundList){

    // IF ONE IS FOUND.

    if(foundList) {

    // RETURN THIS LIST AND RELATIONAL ITEMS TO THE VIEW.
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});

    } else {

      // IF NO LIST WHERE LIST NAME = ROUTE VARIABLE THEN CREATE NEW LIST.

      const list = new List({
        name: customListName,
        items: []
      });

      list.save();
      res.redirect("/"+customListName);

    }

  });

});

// POST REQUEST TO ROOT ROUTE - CREATE NEW ITEM

app.post("/", function(req, res){

  // GET INPUTS FROM VIEW

  const itemName = req.body.newItem;
  const listName = req.body.list;

  // CREATE THE ITEM FOR DB

  const item = new Item({
    name: itemName
  });



  if ( listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }


});

app.post("/delete", function(req, res){

  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if ( listName === "Today") {

    Item.findByIdAndDelete(checkedItemId, function (err) {
      if(err) {
        console.log(err);
      } else {
        res.redirect("/");
      }
    });

  } else {

    List.findOneAndUpdate({name: listName}, {$pull: {items:{_id: checkedItemId} }}, function(err, foundList){
      if(!err) {
        res.redirect("/" + listName);
      }
    });

  }




});


app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started...");
});
