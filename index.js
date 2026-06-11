const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const ejs = require('ejs');
const express = require('express');
const bodyParser = require('body-parser');
const csv = require("csv-parser");
const tcg_grabber = require("./tcgcsv_grabber");

const app = express();
const port = 3000;

const ua = "GameShoppeUpdater/0.0.1";

tcg_grabber.user_agent = ua;

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(express.static('styles'));

app.set('view engine', 'ejs');

access_points = [{page:"index",name:"Index"}, {page:"calculator",name:"Calculator"}, {page:"PriceChecker", name:"Price Checker"}];


app.get(['/','/index'], (req, res) => {
    res.render("start.ejs", {title:"Index", links: access_points});
})

app.get('/calculator', (req,res)=>{
    res.render('calculator.ejs', {title:"Calculator",links: access_points});
});

//When user enters, load the game list
//then they will select a game -> load sets -> select set -> load sealed products -> select sealed to be watched.
app.get('/PriceChecker',async (req,res)=>{

    let game_list = [];

    stream = fs.createReadStream(path.join(__dirname, 'game_list.csv'));
    stream.on('error',(err)=>{
        game_list = tcg_grabber.saveGameData();
    })
    .pipe(csv())
    .on('data', (data)=>{
        console.log(data);
        game_list.push(data);
    })
    .on('end',()=>res.render('priceChecker.ejs', {title:"Price Checker", links:access_points, games:game_list}));
    
});

app.get('/PriceChecker/Sets', (req,res)=>{
    res.send('');
});

app.post('/EditWatchList',(req,res)=>{
    res.send('');
});

app.post('/PriceData',(req,res)=>{
    console.log(req.body);
    
    for(var key in req.body){
        setTimeout(function(){
            productId = req.body[key];
            http.get("http://tcgcsv.com/tcgplayer/1/541084/")
        }, 1000);
    }

    res.send("yippee");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})