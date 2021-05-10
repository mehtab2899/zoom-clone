const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
const io = require("socket.io")(server);
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
	debug: true,
});

app.use("/peerjs", peerServer);

// setting public folder
app.use(express.static("public"));

// setting ejs engine
app.set("view engine", "ejs");

app.get("/", (req, res) => {
	res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
	res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
	socket.on("join-room", (roomId, userId) => {
		socket.join(roomId);
		io.to(roomId).emit("user-connected", userId);
		socket.on("message", (message) => {
			io.to(roomId).emit("createMessage", message);
		});
	});
});

// listening to port
server.listen(PORT, () => {
	console.log("server is listening to port 3000");
});
