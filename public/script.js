const socket = io();
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
myVideo.muted = true;

var peer = new Peer(undefined, {
	path: "/peerjs",
	host: "/",
	port: "443",
});

var myVideoStream;
navigator.mediaDevices
	.getUserMedia({
		video: true,
		audio: true,
	})
	.then((stream) => {
		myVideoStream = stream;
		addVideoStream(myVideo, stream);

		peer.on("call", (call) => {
			call.answer(stream);
			const video = document.createElement("video");
			call.on("stream", (userVideoStream) => {
				addVideoStream(video, userVideoStream);
			});
		});

		socket.on("user-connected", (userId) => {
			connectToNewUser(userId, stream);
		});
	});

peer.on("open", (id) => {
	socket.emit("join-room", RoomId, id);
});

// connection to new user using id
const connectToNewUser = (userId, stream) => {
	const call = peer.call(userId, stream);
	const video = document.createElement("video");
	call.on("stream", (userVideoStream) => {
		addVideoStream(video, userVideoStream);
	});
};

const addVideoStream = (video, stream) => {
	video.srcObject = stream;
	video.addEventListener("loadedmetadata", () => {
		video.play();
	});
	videoGrid.append(video);
};

// sending message to chat window
let text = document.querySelector("input");
const html = document.querySelector("html");
html.addEventListener("keydown", (e) => {
	if (e.code == "Enter" && text.value.length !== 0) {
		socket.emit("message", text.value);
		text.value = "";
	}
});

socket.on("createMessage", (message) => {
	let li = document.createElement("li");
	li.innerHTML = `<b>User</b> <br/> ${message}`;
	document.querySelector("ul").appendChild(li);
});

// ṃute our video
const muteUnmute = () => {
	const enabled = myVideoStream.getAudioTracks()[0].enabled;
	if (enabled) {
		myVideoStream.getAudioTracks()[0].enabled = false;
		setMuteButton();
	} else {
		setUnuteButton();
		myVideoStream.getAudioTracks()[0].enabled = true;
	}
};

// mute and unmute functions
const setUnmuteButton = () => {
	const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
    `;
	document.querySelector(".main__mute--button").innerHTML = html;
};

const setMuteButton = () => {
	const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span class="unmute">Unmute</span>
    `;
	document.querySelector(".main__mute--button").innerHTML = html;
};

// stop our video
const playStop = () => {
	let enabled = myVideoStream.getVideoTracks()[0].enabled;
	if (enabled) {
		myVideoStream.getVideoTracks()[0].enabled = false;
		setPlayVideo();
	} else {
		setStopVideo();
		myVideoStream.getVideoTracks()[0].enabled = true;
	}
};

// play and stop functions
const setStopVideo = () => {
	const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
    `;
	document.querySelector(".main__video--button").innerHTML = html;
};

const setPlayVideo = () => {
	const html = `
    <i class="stop fas fa-video-slash"></i>
    <span class="stop">Play Video</span>
    `;
	document.querySelector(".main__video--button").innerHTML = html;
};
