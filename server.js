const { combineLatestInit } = require('rxjs/internal/observable/combineLatest');
const WebSocket = require('ws');
const ws = new WebSocket.Server({port : 8008}); //? 포트번호를 넘긴다? 

let user_id = 0; //? 클라이언트에게 부여되는 고유된 값
const ALL_ws = []; //? 전체 유저들을 통제할 수 있도록 각 유저에 대한 websocket , user_id 저장

ws.on("connection" , function connect(ws , req){ //? 웹소켓에 특정 클라이언트가 연결되었을때 실헹됨

    ws.on('error' , (err)=>{ //? 에러발생시 
        console.error(err);
    })

    ws.on('close',()=>{ //? 접속해제 
        console.log('클라이언트 접속해제');
    })
    
    ws.on('message' , function incoming(message){ //? 클라이언트에서 온 데이터가 있다면 실행되면서 message를 출력함
        console.log(JSON.parse(message));
    })

    console.log(req.socket.remoteAddress); //? 접속된 사용자의 IP를 알아낸다.
    user_id++;
    console.log("New User Connect" +user_id);
    ALL_ws.push({"ws" : ws , "user_id" : user_id}); //? 전체 클라이언트 목록에 넣어준다. 
    sendUserId(ws , user_id); //? 연결된 웹소켓 과 user_id를 넘긴다.
}) 

const sendUserId = (ws , user_id)=>{
    ws.send(JSON.stringify({code : 'my_user_id' , msg : user_id}));  //?클라이언트에서 code이용해서 데이터를 처리할 수 있게끔 보내준다. JSON형태로
}