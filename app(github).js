//jshint esversion:6

const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose")
const _ = require("lodash");

const app = express();

// const items = [];
// const workItems = [];

// SETTING THE EJS //
app.set('view engine', 'ejs');

// SETTING THE APP TO RECEIVE DATA FROM FORM //
app.use(express.urlencoded());


// setting the express to recognize css local folder //

app.use(express.static("public"));

// connect mongoDB

mongoose.connect("mongodb+srv://@cluster0.2iymib5.mongodb.net/toDoListDB");

// Create a mongodb schema and model

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

// Creating new model items (documents)

const item1 = new Item ({
  name: "Welcome to your todoList!"
});

const item2 = new Item ({
  name: "Hit the + button to add a new item."
});

const item3 = new Item ({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


// 



// SETTING THE PAGE THAT APPEARS WHEN USER ACCESS //
app.get("/", function(req, res) {


Item.find(function(err, foundItems){
  if (foundItems.length === 0) {
    Item.insertMany (defaultItems, function(err){
        if (err) {
          console.log(err);
        } else {
          console.log("Succesfully saved default items to DB");
        }
      });
      res.redirect("/");
  } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      }); 
    }

  });
   
});
  

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if (!err){
      if(!foundList){
        //create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
      
        list.save();
        res.redirect("/" + customListName);
      } else {
        //show an existing list 
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });  
      } 
    }
    
  });

  

});
  

// GETTING USER INFORMATION FROM FORM POST ///
app.post("/", function(req, res){

  const itemName = req.body.newItem; 
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today"){
    item.save()

    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName)
    })
  }

  

});


app.post("/delete", function(req, res){

  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
  Item.findByIdAndRemove(checkedItemId, function(err){
    if (err) {
      console.log(err);
    } else {
      console.log("Succesfully removed the checked item!");
    }
    res.redirect("/");
  }); 
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, ){
      if (!err){
        res.redirect("/" + listName);
      }
    });
    }

});

app.get("/work", function(req, res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
})

app.get("/work", function(req, res){
  let item = req.body.newItem;
  workItems.push(item);
  res.redirect("/work")
})

app.get("/about", function(req, res){
  res.render("about");
})








// SETTING UP SERVER //
app.listen(process.env.PORT || 3000);
