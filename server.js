
const { combineLatestInit } = require('rxjs/internal/observable/combineLatest');
const WebSocket = require('ws');
const ws = new WebSocket.Server({port : 8008}); //? 포트번호를 넘긴다? 

let ALL_ws = []; //? 전체 유저들을 통제할 수 있도록 각 유저에 대한 websocket , user_id 저장
let userPK = 0;

ws.on("connection" , function connect(ws , req){ //? 웹소켓에 특정 클라이언트가 연결되었을때 실헹됨
    ws.on('error' , (err)=>{ //? 에러발생시 핸들러
        console.error(err);
    })

    ws.on('close',()=>{ //? 접속해제시 핸들러 req.user에 클라이언트 정보가 담겨있음 ALL_ws에서 삭제시키면됨.
        ALL_ws = ALL_ws.filter((e)=> e.userNickName !== req.user.nickName ); //? 유저닉네임을 찾아서 삭제시킴.
        sendUserList(ws); //? 삭제되었으니 모든 클라이언트 동기화 시켜줌 
        console.log('클라이언트 접속해제');
    })
    
    ws.on('message' , function incoming(message){ //? 클라이언트에서 온 데이터가 있다면 실행되면서 message를 출력함
        const msg = JSON.parse(message);
        switch(msg.code){
            case "Chat_connect" : {//!사용자가 닉네임을 적고 챗팅에서 들어왔을때 실행
                req.user = {nickName : msg.nickName}; //? 클라이언트 req user정보 저장시킴 . 접속해제할때 필요
                chatConnect(ws , msg.nickName); //? 사용자가 닉네임을 적고 챗팅에서 들어왔을때 실행
                break;
            }
            case "ChatMsg" : { //? 여기서 클라이언트들 챗팅받음 
                sendChat(msg.nickName , msg.chatMsg); //?챗받으면 모든 클라이언트에게 뿌려줌
                break;
            }
        }
    })

    console.log(req.socket.remoteAddress); //? 접속된 사용자의 IP를 알아낸다.
}) 

const chatConnect = (ws , newNickName)=>{ //? 사용자의 닉네임과 ws를 저장
    ALL_ws.push({'ws' : ws , 'userNickName' : newNickName , 'userId' : ++userPK}); //? newUser정보 저장

    sendUserList(ws) //? 유저 목록을 보내준다. 
    sendUserId(ws , newNickName); //? 저장되면 클라이언트에 보냄
}

const sendUserList = (ws)=>{ //* 모든 클라이언트에게 실시간으로 유저목록 보내주기 (모든클라이언트 유저목록 동기화)
    const userNickNameList = ALL_ws.map((e)=>e.userNickName);
    ALL_ws.forEach((e)=>{ //? 접속된 유저들의 리스트를 모든 클라이언트에게 뿌림
        e.ws.send(JSON.stringify({code : 'user_list' , msg : userNickNameList}));
    })
}

const sendUserId = (ws , newNickName)=>{ //* 클라이언트에 연결된 사용자 보내주기
    ws.send(JSON.stringify({code : 'my_user_id' , msg : newNickName}));  //?클라이언트에서 code이용해서 데이터를 처리할 수 있게끔 보내준다. JSON형태로
}

const sendChat = (nickName , chatMsg)=>{
    ALL_ws.forEach((e)=>{ //? 접속된 유저들의 리스트를 모든 클라이언트에게 뿌림
        e.ws.send(JSON.stringify({code : 'chat_return' , msg : {nickName : nickName , chatMsg : chatMsg} })); //?챗받으면 모든 클라이언트에게 뿌려줌
    })
}