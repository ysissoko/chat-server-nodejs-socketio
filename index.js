const express = require('express');
const app = express();
var cors = require('cors');

const PORT= process.env.PORT || 8080;
let messages = [];
let connectedUsers = [];
let users = [];

app.use(cors())

// Create the http server from the expressa application
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
	cors:{
		origin: '*'
	}
});

io.on("connection", (socket) => {
	socket.on("newusr", (usr) => {
		console.log("New client connected");
		connectedUsers.push(socket);
		users.push(usr);
		connectedUsers.forEach(socket => {if (socket.id != usr.id) socket.emit('newusr', usr) })
	})

	socket.on("disconnect", () => {
		console.log("disconnected")

		connectedUsers = connectedUsers.filter(user => user.id !== socket.id)
		const disconnectedUsr = users.find(user => user.id === socket.id);

		if (disconnectedUsr)
		{
			connectedUsers.forEach(sock => sock.emit("disconnected", disconnectedUsr));
			users = users.filter(user => user.id !== socket.id);
		}
	});

	socket.on("newmsg", (msg) => {
		messages.push(msg)
		connectedUsers.forEach(socket => socket.emit('newmsg', msg))
	})
});

app.get('/messages', (req, res) => {
	res.json(messages)
})

app.get('/users', (req, res) => {
	res.json(users)
})


// Listen on PORT 9000
server.listen(PORT, () => {
	console.log(`Socket io server listening on port ${PORT}`)
});
