let socket = io();

function createRoom() {
  console.log('Creating room...');
  socket.emit('createRoom', {
    userId: '1234',
    userName: 'TestCreate User',
    roomName: 'Test Room',
  });
}

function joinRoom(roomId) {
  console.log(`Joining room with ID: ${roomId}`);
  socket.emit('joinRoom', {
    roomId,
    userId: '12345',
    userName: 'TestJoin User',
  });
}

function fetchRooms() {
  console.log('Fetching rooms...');
  socket.emit('getRooms');
}

function leaveRoom(roomId) {
  console.log(`Leaving room with ID: ${roomId}`);
  socket.emit('leaveRoom', roomId);
}

//TODO: handle error emitters
socket.on('connect', () => {
  console.log('Connected to server');

  fetchRooms();

  socket.on('roomsList', (rooms) => {
    console.log('Received rooms list:', rooms);

    const roomList = document.getElementById('room-list');

    if (!roomList) {
      console.error('Room list element not found in the DOM');
      return;
    }

    roomList.innerHTML = '';

    rooms.forEach((room) => {
      const li = document.createElement('li');
      console.log(
        `<button onclick="joinRoom('${room.id}')">Join Room: ${room.id}, ${room.users.length || 0}/${room.maxUsers}</button>`,
      );
      li.innerHTML = `<button onclick="joinRoom('${room.id}')">Join Room: ${room.id}, ${room.users.length || 0}/${room.maxUsers}</button>`;
      roomList.appendChild(li);
    });
  });

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
      li.innerHTML = `<button onclick="joinRoom('${room.id}')">Join Room: ${room.id}, ${room.users.length || 0}/${room.maxUsers}</button>`;
      roomList.appendChild(li);
    });
  });

  socket.on('roomCreated', (room) => {
    console.log('Room created with ID:', room.id);

    const roomDom = document.getElementById('room');

    if (!roomDom) {
      console.error('Room element not found in the DOM');
      return;
    }

    roomDom.innerHTML = '';

    const redTeamUsers = room.users.filter((user) => user.team === 'RED');
    const blueTeamUsers = room.users.filter((user) => user.team === 'BLUE');
    const noneTeamUsers = room.users.filter((user) => user.team === 'NONE');

    const isHost = room.users.some(
      (user) => user.socketId === socket.id && user.isHost,
    );

    roomDom.innerHTML = `
    <h2>Room: ${room.name}</h2>
    ${isHost ? '<p>You are the host</p>' : ''}
    <button onclick="joinTeam('${room.id}', 'RED')">Join Red</button>
    <button onclick="joinTeam('${room.id}', 'BLUE')">Join Blue</button>
    <button onclick="leaveRoom('${room.id}')">Leave</button>
    <h3>Users:</h3>
    <h4>RED Team</h4>
    <ul>
      ${redTeamUsers.map((user) => `<li>${user.name}</li>`).join('')}
    </ul>
    <h4>BLUE Team</h4>
    <ul>
      ${blueTeamUsers.map((user) => `<li>${user.name}</li>`).join('')}
    </ul>
    <h4>NONE Team</h4>
    <ul>
      ${noneTeamUsers.map((user) => `<li>${user.name}</li>`).join('')}
    </ul>
  `;

    // alert(`Room created with ID: ${room.id}`);
    // window.location.href = `/room/${room.id}`;
  });

  socket.on('roomJoined', (room) => {
    console.log('Joined room with ID:', room.id);

    const roomDom = document.getElementById('room');

    if (!roomDom) {
      console.error('Room element not found in the DOM');
      return;
    }

    roomDom.innerHTML = '';

    const redTeamUsers = room.users.filter((user) => user.team === 'RED');
    const blueTeamUsers = room.users.filter((user) => user.team === 'BLUE');
    const noneTeamUsers = room.users.filter((user) => user.team === 'NONE');

    const isHost = room.users.some(
      (user) => user.socketId === socket.id && user.isHost,
    );

    roomDom.innerHTML = `
    <h2>Room: ${room.name}</h2>
    ${isHost ? '<p>You are the host</p>' : ''}
    <button onclick="joinTeam('${room.id}', 'RED')">Join Red</button>
    <button onclick="joinTeam('${room.id}', 'BLUE')">Join Blue</button>
    <button onclick="leaveRoom('${room.id}')">Leave</button>
    <h3>Users:</h3>
    <h4>RED Team</h4>
    <ul>
      ${redTeamUsers.map((user) => `<li>${user.name}</li>`).join('')}
    </ul>
    <h4>BLUE Team</h4>
    <ul>
      ${blueTeamUsers.map((user) => `<li>${user.name}</li>`).join('')}
    </ul>
    <h4>NONE Team</h4>
    <ul>
      ${noneTeamUsers.map((user) => `<li>${user.name}</li>`).join('')}
    </ul>
  `;

    //   console.log('Joined room with ID:', roomId);
    //   window.location.href = `/room/${roomId}`;
  });

  socket.on('roomLeft', (roomId) => {
    console.log('Left room with ID:', roomId);

    const roomDom = document.getElementById('room');

    if (!roomDom) {
      console.error('Room element not found in the DOM');
      return;
    }

    roomDom.innerHTML = '';
  });

  socket.on('updateRoom', (room) => {
    console.log('Room updated:', room);

    console.log('Joined room with ID:', room.id);

    const roomDom = document.getElementById('room');

    if (!roomDom) {
      console.error('Room element not found in the DOM');
      return;
    }

    roomDom.innerHTML = '';

    const redTeamUsers = room.users.filter((user) => user.team === 'RED');
    const blueTeamUsers = room.users.filter((user) => user.team === 'BLUE');
    const noneTeamUsers = room.users.filter((user) => user.team === 'NONE');

    const isHost = room.users.some(
      (user) => user.socketId === socket.id && user.isHost,
    );

    roomDom.innerHTML = `
    <h2>Room: ${room.name}</h2>
    ${isHost ? '<p>You are the host</p>' : ''}
    <button onclick="joinTeam('${room.id}', 'RED')">Join Red</button>
    <button onclick="joinTeam('${room.id}', 'BLUE')">Join Blue</button>
    <button onclick="leaveRoom('${room.id}')">Leave</button>
    <h3>Users:</h3>
    <h4>RED Team</h4>
    <ul>
      ${redTeamUsers.map((user) => `<li>${user.name}</li>`).join('')}
    </ul>
    <h4>BLUE Team</h4>
    <ul>
      ${blueTeamUsers.map((user) => `<li>${user.name}</li>`).join('')}
    </ul>
    <h4>NONE Team</h4>
    <ul>
      ${noneTeamUsers.map((user) => `<li>${user.name}</li>`).join('')}
    </ul>
  `;
  });
});
