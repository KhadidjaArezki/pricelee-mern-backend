const jwt = require("jsonwebtoken")
require("dotenv").config()

const getTokenFrom = (request) => {
  const authorization = request.get("authorization")
  if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
    return authorization.substring(7)
  }
  return null
}

const generateAllTokens = (user) => {
  /* Tokens are created by encrypting two user */
  /* fields - username, id - and a secret */
  const userForToken = {
    id: user.id,
    username: user.username,
  }

  /* Access token expires every 5 minutes while */
  /* the refresh token has no expiration date.   */
  const token = jwt.sign(userForToken, process.env.SECRET, { expiresIn: "5m" })

  const refreshToken = jwt.sign(userForToken, process.env.SECRET)

  return {
    token,
    refreshToken,
  }
}

module.exports = {
  getTokenFrom,
  generateAllTokens,
}
