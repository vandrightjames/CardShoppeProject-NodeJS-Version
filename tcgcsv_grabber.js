const fs = require("fs");
const fetch = require("node-fetch");
const csv = require("csv-parser");

let user_agent = {};

function saveGameData(){

    /*
        design choice, going to send a copy of the data written back to the caller, instead of having the caller re-attempt a read at the csv.
        under normal circumstances, the data is the exact same, so no reason to re-read what's already being confirmed.
    */
    data_written = [];

    let csv_writer = fs.createWriteStream('game_list.csv');
    csv_writer.on("open",()=>{
        fetch("https://tcgcsv.com/tcgplayer/categories",{headers:{"User-Agent":user_agent}})
        .then(res => res.json())
        .then(json =>{
            console.log('yippee')
            csv_writer.write("id,name\n");
            for(let g = 0;g <json["results"].length;g++){
                data_written.push({id:json["results"][g]["categoryId"], name:json["results"][g]["name"]});
                csv_writer.write(`${json["results"][g]["categoryId"]},${json["results"][g]["name"]}\n`);
            }
            console.log('no more forloop')
        }).finally(()=>csv_writer.end());
    });

    return data_written;
}

module.exports.saveGameData = saveGameData;