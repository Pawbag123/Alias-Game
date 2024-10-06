let socket;

const loadingTemplateHbs = '<body> <h1>Loading...</h1> </body>';
const errorTemplateHbs = '<body> <h1>Error: {{errorMessage}}</h1> </body>';
const userInfoTemplateHbs = `
  <body> 
    <h2>Join the Alias Lobby</h2> 
    <div id="user-info-form" style="text-align: center; margin-top: 20px;">
      <label for="user-id" style="font-weight: bold;">Enter your ID:</label><br />
      <input type="text" id="user-id" placeholder="Your unique ID" required style="padding: 5px; margin: 10px 0;" /><br />
      
      <label for="user-name" style="font-weight: bold;">Enter your Name:</label><br />
      <input type="text" id="user-name" placeholder="Your name" required style="padding: 5px; margin: 10px 0;" /><br />
      
      <button style="padding: 10px 20px; font-size: 16px;" onclick="saveUserInfo()">Join Lobby</button>
    </div>
  </body>
`;
const lobbyTemplateHbs = `
  <body> 
    <h2>Available Games</h2> 
    <button id="create-game-button" onclick="createGame()">Create Game</button> 
    <ul id="game-list">
      {{#if hasGames}}
        {{#each games}}
        <li>
          <span>{{this.name}}, Players: {{this.players}}/{{this.maxPlayers}}</span>
          <button 
            {{#if this.started}}disabled{{/if}} 
            {{#if this.isFull}}disabled{{/if}} 
            onclick="joinGame('{{this.id}}')"
          >
            Join
          </button>
        </li>
        {{/each}}
      {{else}}
        <li>No rooms created</li>
      {{/if}}
    </ul> 
  </body>
`;

async function loadTemplate(templateName) {
  const response = await fetch(`src/views/${templateName}.hbs`);
  const templateHbs = await response.text();
  return Handlebars.compile(templateHbs);
}

// Initialize Handlebars templates
const loadingTemplate = Handlebars.compile(loadingTemplateHbs);
const userInfoTemplate = Handlebars.compile(userInfoTemplateHbs);
const lobbyTemplate = Handlebars.compile(lobbyTemplateHbs);

const renderLoading = () => {
  const contentDiv = document.getElementById('content');
  contentDiv.innerHTML = loadingTemplate();
};

function renderUserInfoForm() {
  const contentDiv = document.getElementById('content');
  contentDiv.innerHTML = userInfoTemplate(); // Render the form using Handlebars
}

function renderLobby(games = []) {
  const contentDiv = document.getElementById('content');
  const hasGames = games.length > 0;
  games.forEach((game) => {
    game.isFull = game.players >= game.maxPlayers;
  });
  contentDiv.innerHTML = lobbyTemplate({ games, hasGames });
}
// async function renderLobby(games = []) {
//   const contentDiv = document.getElementById('content');
//   const hasGames = games.length > 0;
//   games.forEach((game) => {
//     game.isFull = game.players >= game.maxPlayers;
//   });
//   const template = await loadTemplate('testlobby');
//   contentDiv.innerHTML = template({ games, hasGames });
// }

// Function to start the lobby and initialize the socket
function startLobby(userId, userName) {
  renderLoading();

  // Initialize socket connection, passing user info
  socket = io('/lobby', {
    query: { userId, userName },
  });

  // Socket events for game actions can be handled here
  socket.on('connect', () => {
    console.log(`Connected as ${userName} (ID: ${userId})`);

    socket.on('games:updated', (games) => {
      console.log('Games updated:', games);
      renderLobby(games);
    });

    socket.on('game:joined', (gameId) => {
      console.log('Joined game:', gameId);
      // Redirect to the game page
      redirectToGame(gameId);
    });

    socket.on('game:created', (gameId) => {
      console.log('Created game:', gameId);
      // Redirect to the game page
      redirectToGame(gameId);
    });

    socket.on('lobby:check', () => {
      console.log('Checking lobby');
    });

    socket.on('game-room:check', () => {
      console.log('Checking game room');
    });

    socket.on('game:join:error', (error) => {
      console.error('Error joining game:', error);
    });

    socket.on('game:create:error', (error) => {
      console.error('Error creating game:', error);
    });
  });
}

function getUserInfo() {
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName');
  return { userId, userName };
}

function setUserInfo(userId, userName) {
  localStorage.setItem('userId', userId);
  localStorage.setItem('userName', userName);
}

function deleteUserInfo() {
  localStorage.removeItem('userId');
  localStorage.removeItem('userName');
}

// Function to save user info and join the lobby
function saveUserInfo() {
  const userId = document.getElementById('user-id').value;
  const userName = document.getElementById('user-name').value;

  // Store user data in localStorage
  setUserInfo(userId, userName);

  // Start the lobby
  startLobby(userId, userName);
}

function joinGame(gameId) {
  console.log(`Joining game with ID: ${gameId}`);
  socket.emit('game:join', {
    gameId,
  });
}

function createGame() {
  console.log('Creating a new game...');
  const { userId, userName } = getUserInfo();
  socket.emit('game:create', {
    gameName: `${userName}'s Game`,
  });
}

function redirectToGame(gameId) {
  window.location.href = `/game/${gameId}`;
}

// Function to initialize the lobby
function initLobby() {
  // Check if user info is stored in localStorage
  const { userId, userName } = getUserInfo();

  if (userId && userName) {
    // If user info is found, initialize the socket and show the lobby
    startLobby(userId, userName);
  } else {
    // If no user info is found, render the form for input
    renderUserInfoForm();
  }
}

// Run the init function on page load
window.onload = initLobby;
