var usersDict = {};

//userId is a string
function storeNewUser(userId, accessToken) {
  usersDict[userId] = accessToken;
}

function removeUser(userId) {
  delete usersDict[userId];
}

function getUserAccessToken(userId) {
  return usersDict[userId];
}

module.exports = { storeNewUser, removeUser, getUserAccessToken };
