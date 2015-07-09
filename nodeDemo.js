var io = require('socket.io')();
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var username = 'bee7bot@outlook.com';
var password = 'NLALDkX5ZOiw';
if (!username || !password){
    throw new Error('Username and password should be provided as commandline arguments!');
}
var getIP = require('external-ip')();
var externalIP = null;
var isSilent = false;
getIP(function (err, ip) {
	externalIP = ip;
});

var socketCache = null;
var commands = {
	'!love': function(data) {
		return ['I love you,', data.message.displayNameOverride, '(heart)!'].join(' ');
        },
	'!igor': function() {
		return 'Get back to work™';
	},
	'!info': function(data) {
		return ['POST request to:', 'http://' + externalIP + '/deploy\n',
			'JSON payload: {"conversationId": "' + data.conversationId + '", "conversationMessage": "bzzzz"}'].join(' ');
	},
	'!ping': function(data) {
		return isSilent ? 'M MM mmm mmmmm mmmmm mmmmmmm mmm' : 'I AM the droid you\'re looking for.';
        },
	'!silence': function(data) {
		isSilent = !isSilent;
		return 'Not a word.';
	},
	'!kajpamajodonc': function(data){
		return 'http://www.casanostra.si/olka/dnevna-ponudba \nhttp://www.casanostra.si/san-martino/dnevna-ponudba';
	},
	'!soon': function(data){
		return 'https://dl.dropboxusercontent.com/u/3732332/random/guize.png';
	}
};
io.on('connection', function (socket) {
    console.log('a user connected');
    socketCache = socket;
    socket.on('initialized', function () {
        console.log('Everything is initialized now. We can send and receive messages.');
        socket.on('message', function (data) {
	    //console.log('got message:', data.message.info);
            if(commands[data.message.info.text]) {
		if(isSilent && !(data.message.info.text === '!silence' || data.message.info.text === '!ping')) {
			return;
		}
		socket.emit('message', JSON.stringify({
			conversationId: data.conversationId,
			text: commands[data.message.info.text].call(this, data)
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
});


    //---App config
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());


app.post('/deploy', function (req, res) {
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
