let socket;

// Initialize Handlebars templates
const userInfoTemplate = Handlebars.compile(
  document.getElementById('user-info-template').innerHTML,
);
const lobbyTemplate = Handlebars.compile(
  document.getElementById('lobby-template').innerHTML,
);

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

// Function to start the lobby and initialize the socket
function startLobby(userId, userName) {
  const contentDiv = document.getElementById('content');
  contentDiv.innerHTML = lobbyTemplate(); // Render the lobby content using Handlebars

  // Initialize socket connection, passing user info
  socket = io('/lobby', {
    query: { userId, userName },
  });

  // Socket events for game actions can be handled here
  socket.on('connect', () => {
    console.log(`Connected as ${userName} (ID: ${userId})`);

    socket.on('games:updated', (games) => {
      console.log('Games updated:', games);
      renderGames(games);
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

    socket.on('game:join:error', (error) => {
      console.error('Error joining game:', error);
    });

    socket.on('game:create:error', (error) => {
      console.error('Error creating game:', error);
    });
  });
}

function joinGame(gameId) {
  console.log(`Joining game with ID: ${gameId}`);
  const { userId, userName } = getUserInfo();
  socket.emit('game:join', {
    userId,
    userName,
    gameId,
  });
}

function createGame() {
  console.log('Creating a new game...');
  const { userId, userName } = getUserInfo();
  socket.emit('game:create', {
    userId,
    userName,
    gameName: `${userName}'s Game`,
  });
}

function redirectToGame(gameId) {
  window.location.href = `/game/${gameId}`;
}

function renderGames(games) {
  const gamesList = document.getElementById('game-list');
  gamesList.innerHTML = '';
  const createGameButton = document.createElement('button');
  createGameButton.innerText = 'Create Game';
  createGameButton.onclick = createGame;
  gamesList.appendChild(createGameButton);

  games.forEach((game) => {
    const gameElement = document.createElement('li');
    gameElement.innerText = `${game.name}, Players: ${game.players}/${game.maxPlayers}`;

    const disabled = game.players >= game.maxPlayers || game.started;

    const joinButton = document.createElement('button');
    joinButton.innerText = 'Join';
    joinButton.disabled = disabled;
    joinButton.onclick = () => joinGame(game.id);

    gameElement.appendChild(joinButton);
    gamesList.appendChild(gameElement);
  });
}

// Function to render the user info form
function renderUserInfoForm() {
  const contentDiv = document.getElementById('content');
  contentDiv.innerHTML = userInfoTemplate(); // Render the form using Handlebars
}

// Run the init function on page load
window.onload = initLobby;
