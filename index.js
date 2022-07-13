const express = require('express');

const app = express();

const expressWs = require('express-ws')(app)

var nextId = 0;

var waiting = [];
var chatting = [];

console.clear();

function updateDisp() {
    console.clear();
    console.log("Waiting :")

    waiting.forEach(element => {
        console.log(`[${element.username}](${element.id})`);
    });
    console.log("");

    console.log("Chatting :")
    chatting.forEach(element => {
        console.log(`[${element[0].username}](${element[0].id}) <==> [${element[1].username}](${element[1].id})`);
    });
}

function match(){
    for(var i = 0; i < waiting.length/2; i++){

        var pair = [];

        pair.push(waiting[i*2]);
        pair.push(waiting[(i*2)+1]);

        pair[0].ws.send(pair[1].username);       
        pair[1].ws.send(pair[0].username);


        pair[0].partener = pair[1];
        pair[0].state = "chatting"

        pair[1].partener = pair[0];
        pair[1].state = "chatting"
        

        chatting.push(pair)

        waiting.splice(i*2, 2)  
    }
}


app.ws('/', (ws, req) => {

    var user = {
        username: "",
        state: "no name",
        id: nextId,
        ws: ws,
        partener: null
    }

    nextId++;


    ws.on('close', () => {
        var i = 0;
        while (i < waiting.length) {
            if (waiting[i].id === user.id) {
                waiting.splice(i, 1);
            } else {
                i++;
            }
        }

        while (i < chatting.length) {
            if(chatting[i][0].id === user.id){
                chatting[i][1].ws.close();
                chatting.splice(i);
            }else if(chatting[i][1].id === user.id){
                chatting[i][0].ws.close();
                chatting.splice(i);
            }else{
                i++;
            }
        }

        updateDisp();
    })

    ws.on('message', (msg) => {

        switch (user.state) {
            case "no name":
                user.username = msg;
                waiting.push(user);
                state = 'waiting'

                if(waiting.length >= 2){
                    match();  
                }
                updateDisp();
                break;

            case "chatting":
                user.partener.ws.send(msg);
                break;
                
            default:
                console.log("Ignoring...");
                break;
        }

        handeler = (msg) => { console.log("Ignoring message...") }

    });

})

app.listen(8080);