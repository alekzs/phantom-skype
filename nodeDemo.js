var io = require('socket.io')();
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var username = 'xxx@xxx.com';
var password = 'xxx';
if (!username || !password){
    throw new Error('Username and password should be provided as commandline arguments!');
}
var socketCache = null;
io.on('connection', function (socket) {
    console.log('a user connected');
    socketCache = socket;
    socket.on('initialized', function () {
        console.log('Everything is initialized now. We can send and receive messages.');
        socket.on('message', function (data) {
            console.log(data);
            //socket.emit('message', JSON.stringify({ //sending back response
            //    conversationId: data.conversationId,
            //    text: data.message.info.text + ':' + data.message.sender.id
            //}));
            if(data.message.info.text === '!love') {
		socket.emit('message', JSON.stringify({
			conversationId: data.conversationId,
			text: 'I love you too! (heart)'
		}));
	    }
        });
    });
    socket.on('disconnect', function () {
        console.log('phantom disconnected');
    });

    socket.emit('initialize', JSON.stringify({username: username, password: password}));
});
io.listen(3000);

//starting child phantom process
var path = require('path');
var childProcess = require('child_process');

var childArgs = [
    path.join(__dirname, 'socketioIntegration.js'),
    'http://localhost:3000'
];
var child = childProcess.execFile('phantomjs', childArgs);
child.stdout.on('data', function (data) {
    console.log(data.toString());
});


    ///---MemoryStore
    //var MemoryStore = express.session.MemoryStore;

    //---App config
      app.use(bodyParser());


app.post('/deploy', function (req, res) {
  console.log(req.body.conversationId, req.body.conversationMessage);
  if(socketCache) {
    socketCache.emit('message', JSON.stringify({ //sending back response
                conversationId: req.body.conversationId,
                text: req.body.conversationMessage
            }));
  }
  res.send('POST request to the homepage');
});

var port = 80;
    app.listen(port);
