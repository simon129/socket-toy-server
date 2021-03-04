// https://www.websocket.org/echo.html
// ws://localhost:9999

const TCP_PORT = process.env.TCP_PORT || 8888;
const WS_PORT = process.env.WS_PORT || 9999;

var id = 0;

// https://nodejs.org/api/net.html#net_net_createserver_options_connectionlistener
const net = require('net');
const clients = [];
net.createServer()
    .listen(TCP_PORT, function () {
        console.log('TCP server starts at', TCP_PORT);
    })
    .on('connection', function (client) {
        client._id = id++;

        clients.push(client);
        console.log('clients.length', clients.length);
        broadcast(client._id, 'join');

        // 收到訊息broadcast 給所有人
        client.on('data', function (data) {
            console.log('socket收到訊息', client._id, data.toString('utf8'));
            broadcast(client._id, data.toString('utf8'));
        });

        // 斷線
        client.on('close', function () {
            var index = clients.indexOf(client);
            if (index > -1) {
                clients.splice(index, 1);
            } else {
                console.error('找不到client');
            }

            console.log('socket斷線, client id', client._id);
            broadcast(client._id, 'leave');
        });
    });


// https://github.com/websockets/ws
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: WS_PORT }, function () {
    console.log('WS server starts at', WS_PORT);
});

wss.on('connection', function connection(ws) {
    ws._id = id++;

    console.log('wss.clients.size', wss.clients.size);
    broadcast(ws._id, 'join');

    // 收到訊息broadcast 給所有人
    ws.on('message', function incoming(msg) {
        console.log('ws收到訊息', ws._id, msg);
        broadcast(ws._id, msg);
    });

    // 斷線
    ws.on('close', function close() {
        console.log('ws斷線, client id', ws._id);
        broadcast(ws._id, 'leave');
    });
});

function broadcast(senderId, msg) {
    var str = JSON.stringify({ senderId, msg });

    wss.clients.forEach(function (c) {
        if (c.readyState === WebSocket.OPEN) {
            c.send(str);
        }
    });

    // socket 需要補 \n 在每個訊息的後面
    clients.forEach(c => {
        c.write(str + '\n', function clientReceiveCallback() {
            // console.log('確認收到訊息', c._id, data);
        });
    });
}