const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const { title } = require('process');
const MongoClient = require('mongodb').MongoClient

var db, collection;

const url = "mongodb+srv://T-A-U:qeoft4RRJB5oIzsj@cluster0.htcpnep.mongodb.net/?appName=Cluster0";
const dbName = "OwnDemoGames";

app.listen(3000, () => {
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
        if(error) {
            throw error;
        }
        db = client.db(dbName);
        console.log("Connected to `" + dbName + "`!");
    });
});

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(express.static('public')) // what we put in the public folder we don't need  route it, this line handles it.
//justin figured out how to push the titles and helped with setting up the structures of the database collection. He also 
app.get('/', (req, res) => {
  db.collection('RandomGames').find().toArray((err, result) => {
    if (err) return console.log(err)
    let titles = []
    result.forEach((e,i) => {
      titles.push(result[i]['title'])
    })
    
    res.render('index.ejs', {messages: result})
  })
})

app.post('/messages', (req, res) => {
  db.collection('RandomGames').insertOne({name: req.body.name, msg: req.body.msg, thumbUp: 0, thumbDown:0},
    // upsert: true  
    (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database')
    res.redirect('/')
  })
})

app.put('/messages', (req, res) => {
  console.log(req.body)
  let thumbLogic //added variable for thumbLogic
  // if( req.body.thumbDown){
  if(Object.keys(req.body)[2] == 'thumbDown'){//previous version didnt work, changed to object.keys
    thumbLogic = req.body.thumbDown -1
    //conditional for the put for thumbUp and thumbDown
  // }else if (req.body.thumbUp){
  }else if(Object.keys(req.body)[2]=='thumbUp'){//previous version didnt work, changed to object.keys
    thumbLogic =req.body.thumbUp +1 //plus 1 for thumb up in dom
  }
  db.collection('RandomGames')
  .findOneAndUpdate({title: req.body.title}, {
    $set: {
      // thumbUp:req.body.thumbUp + 1
      //changing previous line by commenting it out
      thumbUp : thumbLogic
    }
  }, {
    sort: {_id: -1},
    upsert: true
  }, (err, result) => {
    if (err) return res.send(err)
    res.send(result)
  })
})

app.delete('/messages', (req, res) => {
  db.collection('RandomGames').findOneAndDelete({name: req.body.name, msg: req.body.msg}, (err, result) => {
    if (err) return res.send(500, err)
    res.send('Message deleted!')
  })
})

//working with team at house hayden lead by Justin
//Nov 3rd Justin helped again