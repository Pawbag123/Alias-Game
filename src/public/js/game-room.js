let socket;

const gameRoomId = window.location.pathname.split('/').pop();

// handlebars templates, compilation and render functions
const gameRoomTemplateHbs = `<body> 
  <h1>Game Room:{{name}}</h1>
  <div style='display: flex; justify-content:space-around;'>
    <div> 
      <h2>Red Team</h2> 
      <button id='join-red-team-button' onclick='joinRedTeam()'>Join Red Team</button>
      <ul id='red-team'>
        {{#each redTeam}}
        <li>
          {{this}}
        </li>
        {{/each}}
      </ul> 
    </div> 
    <div> 
      <h2>Blue Team</h2> 
      <button id='join-blue-team-button' onclick='joinBlueTeam()'>Join Blue Team</button> 
      <ul id='blue-team'>
        {{#each blueTeam}}
        <li>
          {{this}}
        </li>
        {{/each}}
      </ul> 
    </div> 
    <div> 
      <h2>No Team</h2>
      <ul id='no-team'>
        {{#each noTeam}}
        <li>
          {{this}}
        </li>
        {{/each}}
      </ul> 
    </div> 
  </div> 
  <button id='leave-game-button' onclick='leaveRoom()'>Leave Game</button>
  {{#if isHost}}<button id='start-game-button' onclick='startGame()'>Start Game</button>{{/if}} 
  </body>`;

const errorTemplateHbs =
  '<body> <h1>Error</h1> <p>{{errorMessage}}</p> </body>';
const loadingTemplateHbs = '<body> <h1>Loading...</h1> </body>';

const startedGameRoomTemplateHbs = `<body>
  <h1>Game Room:{{name}}, gameStarted</h1>
  <div style='display: flex; justify-content:space-around;'>
    <div>
      <h2>Red Team</h2>
      <ul id='red-team'>
        {{#each redTeam}}
        <li style='color: {{#if this.[1]}}black{{else}}red{{/if}}'>
          {{this.[0]}}
        </li>
        {{/each}}
      </ul>
    </div>
    <div>
      <h2>Blue Team</h2>
      <ul id='blue-team'>
        {{#each blueTeam}}
        <li style='color: {{#if this.[1]}}black{{else}}red{{/if}}'>
          {{this.[0]}}
        </li>
        {{/each}}
      </ul>
    </div>
  </div>
  <button id='end-game-button' onclick='sendMessageToTeam()'>SendMessageToTeam</button>
  {{#if isHost}}<button id='end-game-button'>End Game</button>{{/if}}
  </body>`;

const errorTemplate = Handlebars.compile(errorTemplateHbs);
const loadingTemplate = Handlebars.compile(loadingTemplateHbs);
const gameRoomTemplate = Handlebars.compile(gameRoomTemplateHbs);
const startedGameRoomTemplate = Handlebars.compile(startedGameRoomTemplateHbs);

const renderError = (message) => {
  console.log('Error Message: ', message);
  const contentDiv = document.getElementById('content');
  contentDiv.innerHTML = errorTemplate({ errorMessage: message });
};

const renderLoading = () => {
  const contentDiv = document.getElementById('content');
  contentDiv.innerHTML = loadingTemplate();
};

const renderGameRoom = (gameRoom) => {
  const isHost = gameRoom.host === localStorage.getItem('userId');
  const contentDiv = document.getElementById('content');
  contentDiv.innerHTML = '';
  console.log('Game Room: ', gameRoom);
  contentDiv.innerHTML = gameRoomTemplate({ ...gameRoom, isHost });
};

const renderStartedGameRoom = (gameRoom) => {
  const isHost = gameRoom.host === localStorage.getItem('userId');
  const contentDiv = document.getElementById('content');
  contentDiv.innerHTML = '';
  console.log('started Game Room: ', gameRoom);
  contentDiv.innerHTML = startedGameRoomTemplate({ ...gameRoom, isHost });
};

function getUserInfo() {
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName');
  return { userId, userName };
}

function leaveRoom() {
  socket.emit('game-room:leave');
  console.log('leaving room');
}

function joinRedTeam() {
  socket.emit('game-room:join:red');
  console.log('joining red team');
}

function joinBlueTeam() {
  socket.emit('game-room:join:blue');
  console.log('joining blue team');
}

function startGame() {
  socket.emit('game-room:start');
  console.log('starting game');
}

function sendMessageToTeam() {
  socket.emit('game-started:send-message');
  console.log('sending message to team');
}

// Socket.io connection and event handling
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

    socket.on('game-started:updated', (gameRoom) => {
      console.log('Game started:', gameRoom);
      renderStartedGameRoom(gameRoom);
    });
    
    

    socket.on('game-started:message-received', (message) => {
      console.log(`Message from ${message.sender}: ${message.text}`);
    });
  });
};

const initGameRoom = () => {
  renderLoading();
  const { userId, userName } = getUserInfo();

  if (userId && userName) {
    startGameRoom(userId, userName);
  } else {
    renderError('User info not found');
  }
};

window.onload = initGameRoom;
