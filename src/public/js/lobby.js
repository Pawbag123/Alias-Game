let socket = io();

function createRoom() {
  console.log('Creating room...');
  socket.emit('createRoom');
}

function joinRoom(roomId) {
  console.log(`Joining room with ID: ${roomId}`);
  socket.emit('joinRoom', roomId);
}

function fetchRooms() {
  console.log('Fetching rooms...');
  socket.emit('getRooms');
}

socket.on('updateRooms', (rooms) => {
  console.log('Received updated rooms list:', rooms);

  const roomList = document.getElementById('room-list');

  if (!roomList) {
    console.error('Room list element not found in the DOM');
    return;
  }

  roomList.innerHTML = '';

  rooms.forEach((room) => {
    const li = document.createElement('li');
    li.innerHTML = `<button onclick="joinRoom('${room.id}')">Join Room: ${room.id}</button>`;
    roomList.appendChild(li);
  });
});

socket.on('roomCreated', (room) => {
  console.log('Room created with ID:', room.id);
  alert(`Room created with ID: ${room.id}`);
  window.location.href = `/room/${room.id}`;
});

socket.on('roomJoined', (roomId) => {
  console.log('Joined room with ID:', roomId);
  window.location.href = `/room/${roomId}`;
});
