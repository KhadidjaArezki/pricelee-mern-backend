require("dotenv").config()
const jwt = require("jsonwebtoken")
const User = require("../models/user")
const tokensRouter = require("express").Router()

// Get a new auth token by sending a refresh token
tokensRouter.post("/", async (request, response) => {
  const refreshToken = request.body.refreshToken

  /* use the stored secret to validate the token */
  const decodedRefreshToken = jwt.verify(refreshToken, process.env.SECRET)

  if (!decodedRefreshToken.id) {
    return response.status(401).json({
      error: "Refresh token missing or invalid",
    })
  }

  /* Check the db for an id that corresponds the id in the refresh token */
  const user = await User.findById(decodedRefreshToken.id)
  /* Also make sure that the refresh token is an exact match to        */
  /* minimize security risks, since tokens are replaced on every login */
  if (!user || user.refreshToken !== refreshToken) {
    return response.status(401).json({
      error: "Access Denied!",
    })
  }

  const userForToken = {
    id: user.id,
    username: user.username,
  }

  /* Access token is created by encrypting two user fields */
  /* - id, username - and a secret. Expires in 5 minutes    */
  const token = jwt.sign(userForToken, process.env.SECRET, {
    expiresIn: 60 * 5,
  })

  response.status(200).send(token)
})

/* Controller to delete user's refresh token on logout */
tokensRouter.delete("/:id", async (request, response) => {
  const user = await User.findById(request.params.id)
  if (!user) {
    return response.status(404).end()
  }

  user.refreshToken = ""
  await user.save()
  response.status(200).end()
})

module.exports = tokensRouter
