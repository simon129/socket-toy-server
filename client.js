const TCP_PORT = process.env.TCP_PORT || 8888;

// https://bonze.tw/-e4-bd-bf-e7-94-a8-node-js--e5-bb-ba-e6-a7-8b-tcp-server/

var net = require('net');

var client = net.connect({ port: TCP_PORT }, function () {
    console.log('client端：向 server端 請求連線');
});

// connect event : 與 server端 連線成功時的事件
client.on('connect', function (data) {
    console.log('client端：與 server端 連線成功，可以開始傳輸資料');
});

// write event: 傳輸資料的事件
client.write('hello！', function () {
    console.log('client端：開始傳輸資料，傳輸的資料為 hello!');
});

// data event： 到收到資料傳輸時觸發事件 ， argument 為對象傳輸的物件
client.on('data', function (data) {
    console.log('client端：收到 server端 傳輸資料為 ' + data.toString());

    // 結束 client 端 連線
    // client.end();
});