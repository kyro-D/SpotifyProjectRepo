var sessionDict = {};

function storeNewSession(sessionId) {
  sessionDict[sessionId] = { accessToken: "", userId: "" };
}

//userId is a string
function storeNewUser(sessionId, userId, accessToken) {
  sessionDict[sessionId] = { accessToken: accessToken, userId: userId };
}

function removeUser(sessionId) {
  delete sessionDict[sessionId];
}

function getUserAccessToken(sessionId) {
  return sessionDict[sessionId]?.accessToken;
}

function getUserId(sessionId) {
  // TODO use helpper function isValidSession before and getter method
  return sessionDict[sessionId]?.userId;
}

function isValidSession(sessionId) {
  return Boolean(sessionDict[sessionId]);
}

module.exports = {
  storeNewUser,
  removeUser,
  getUserAccessToken,
  getUserId,
  storeNewSession,
  isValidSession,
};
