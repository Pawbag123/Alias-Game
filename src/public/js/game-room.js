let socket;

const gameRoomId = window.location.pathname.split('/').pop();

let gameRoomTemplateHbs =
  "<body> <h1>Game Room:{{name}}</h1> <div style='display: flex; justify-content:space-around;'> <div> <h2>Red Team</h2> <button id='join-red-team-button' onclick='joinRedTeam()'>Join Red Team</button> <ul id='red-team'>{{#each redTeam}}<li>{{this}}</li>{{/each}}</ul> </div> <div> <h2>Blue Team</h2> <button id='join-blue-team-button' onclick='joinBlueTeam()'>Join Blue Team</button> <ul id='blue-team'>{{#each blueTeam}}<li>{{this}}</li>{{/each}}</ul> </div> <div> <h2>No Team</h2> <ul id='no-team'>{{#each noTeam}}<li>{{this}}</li>{{/each}}</ul> </div> </div> <button id='leave-game-button' onclick='leaveRoom()'>Leave Game</button>{{#if isHost}}<button id='start-game-button'>Start Game</button>{{/if}} </body>";

let errorTemplateHbs = '<body> <h1>Error</h1> <p>{{errorMessage}}</p> </body>';
let loadingTemplateHbs = '<body> <h1>Loading...</h1> </body>';

function getUserInfo() {
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName');
  return { userId, userName };
}

function leaveRoom() {
  const userId = localStorage.getItem('userId');
  socket.emit('game-room:leave', { userId, gameId: gameRoomId });
  console.log('leaving room');
}

function joinRedTeam() {
  const userId = localStorage.getItem('userId');
  socket.emit('game-room:join:red', { userId, gameId: gameRoomId });
  console.log('joining red team');
}

function joinBlueTeam() {
  const userId = localStorage.getItem('userId');
  socket.emit('game-room:join:blue', { userId, gameId: gameRoomId });
  console.log('joining blue team');
}

const errorTemplate = Handlebars.compile(
  //   document.getElementById('error-template').innerHTML,
  errorTemplateHbs,
);

// const renderError = (message) => {
//   const contentDiv = document.getElementById('content');
//   contentDiv.innerHTML = errorTemplate({ errorMessage: message });
// };

const renderError = (message) => {
  console.log('Error Message: ', message); // Add this for debugging
  const contentDiv = document.getElementById('content');
  contentDiv.innerHTML = errorTemplate({ errorMessage: message });
};

const loadingTemplate = Handlebars.compile(
  //   document.getElementById('loading-template').innerHTML,
  loadingTemplateHbs,
);

const renderLoading = () => {
  const contentDiv = document.getElementById('content');
  contentDiv.innerHTML = loadingTemplate();
};

const gameRoomTemplate = Handlebars.compile(
  //   document.getElementById('game-room-template').innerHTML,
  gameRoomTemplateHbs,
);

const renderGameRoom = (gameRoom) => {
  const isHost = gameRoom.host === localStorage.getItem('userId');
  const contentDiv = document.getElementById('content');
  contentDiv.innerHTML = '';
  console.log('Game Room: ', gameRoom);
  contentDiv.innerHTML = gameRoomTemplate({ ...gameRoom, isHost });
};

const initGameRoom = () => {
  renderLoading();
  const { userId, userName } = getUserInfo();

  if (userId && userName) {
    startGameRoom(userId, userName);
    // renderGameRoom({
    //   gameRoomName: 'The Beatles',
    //   blueTeam: ['john', 'paul'],
    //   redTeam: ['george', 'ringo'],
    // });
  } else {
    renderError('User info not found');
  }
};

const startGameRoom = (userId, userName) => {
  socket = io('/game-room', {
    query: { userId, gameId: gameRoomId },
  });
  socket.on('connect', () => {
    console.log(`Connected as ${userName} (ID: ${userId})`);

    socket.on('game-room:updated', (gameRoom) => {
      console.log('Game Room updated:', gameRoom);
      renderGameRoom(gameRoom);
    });

    socket.on('game-room:left', () => {
      console.log('Left game room');
      // Redirect to the lobby
      window.location.href = '/';
    });

    socket.on('game-room:join:error', (error) => {
      console.error('Error joining game room:', error);
      renderError(error);
    });

    socket.on('game-room:leave:error', (error) => {
      console.error('Error leaving game room:', error);
    });

    socket.on('game-room:start:error', (error) => {
      console.error('Error starting game room:', error);
    });
  });
};

window.onload = initGameRoom;
