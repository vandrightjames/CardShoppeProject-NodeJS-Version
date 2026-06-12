const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const ejs = require('ejs');
const express = require('express');
const bodyParser = require('body-parser');
const csv = require("csv-parse/sync");
const { tmpdir } = require("os");
const app = express();
const port = 3000;

const ua = "GameShoppeUpdater/0.0.1";

const game_list_csv = path.join(__dirname, 'game_list.csv');

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
app.get('/PriceChecker', async (req,res)=>{

    let game_list = [];

    if(fs.existsSync(game_list_csv)){
        file_data = fs.readFileSync(game_list_csv);
        game_list = csv.parse(file_data, {columns:true});
        console.log(game_list)
    }
    else{
        csv_writer = fs.createWriteStream('game_list.csv');
        csv_writer.on("open",()=>{
            fetch("https://tcgcsv.com/tcgplayer/categories",{headers:{"User-Agent":ua}})
            .then(res => res.json())
            .then(json =>{
                csv_writer.write("id,name\n");
                for(let g = 0;g <json["results"].length;g++){
                    game_list.push({id:json["results"][g]["categoryId"], name:json["results"][g]["name"]});
                    csv_writer.write(`${json["results"][g]["categoryId"]},${json["results"][g]["name"]}\n`);
                }
            });
        });
    }
    console.log('done')
    res.render('priceChecker.ejs', {title:"Price Checker", links:access_points, games:game_list});
});

//this data changes often enough to not warrant saving a copy, unlike the games list.
app.get('/PriceChecker/Game/:categoryId/Set', (req,res)=>{
    let set_list = "";

    let category_id = Number(req.params.categoryId);

    let file_data = fs.readFileSync(game_list_csv);
    let game_list = csv.parse(file_data, {columns:true});//verifcation that the id given goes somewhere.

    if(game_list.find((e)=>e.id == category_id) !== undefined){
        fetch(`https://tcgcsv.com/tcgplayer/${req.params.categoryId}/groups`,{headers:{"User-Agent":ua}})
        .then(res => res.json())
        .then(json =>{
            for(let g = 0;g <json["results"].length;g++){
                set_list += `<option data-setId="${json["results"][g]["groupId"]}" value="${json["results"][g]["name"]}"> ${json["results"][g]["name"]} (${json["results"][g]["abbreviation"]})`
            }
        })
        .finally(()=>{
            res.send(set_list)
        });
    }
    else{
        res.send('Could not find a game category with that ID!');
    }
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