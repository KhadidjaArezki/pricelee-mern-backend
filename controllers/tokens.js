require("dotenv").config()
const jwt = require("jsonwebtoken")
const User = require("../models/user")
const tokensRouter = require("express").Router()
const { generateAllTokens } = require("../utils/helpers")

/* Get a new auth token by sending a refresh
   token via an httpOnly secure cookie.
   Every refresh token is used once at most and
   then deleted and replaced in db and cookie.
*/
tokensRouter.get("/", async (request, response) => {
  const cookies = request.cookies
  if (!cookies?.jwt) {
    return response.sendStatus(401)
  }

  const refreshToken = cookies.jwt
  response.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "None",
    secure: true,
  })

  // Calling exec is not neccessary, but helps with debugging
  const foundUser = await User.findOne({ refreshToken }).exec()

  jwt.verify(refreshToken, process.env.SECRET, async (err, decoded) => {
    if (err?.name === "JsonWebTokenError") {
      return response.status(401).json({
        error: "Refresh token missing or invalid",
      })
    }
    // Detected refresh token reuse!
    if (!foundUser) {
      const hackedUser = await User.findOne({
        username: decoded.username,
      }).exec()
      hackedUser.refreshToken = []
      hackedUser.updatedAt = new Date().toISOString()
      await hackedUser.save()
      return response.sendStatus(403) //Forbidden
    }

    // Remove old rt token from user rt array
    const newRefreshTokenArray = foundUser.refreshToken.filter(
      (rt) => rt !== refreshToken
    )
    // remove expired refresh token from user's rt array
    if (err?.name === "TokenExpiredError") {
      foundUser.refreshToken = [...newRefreshTokenArray]
      foundUser.updatedAt = new Date().toISOString()
      await foundUser.save()
      return response.status(403).json({
        error: "Refresh token expired",
      })
    }
    // Check that rt corresponds to our user
    if (foundUser.username !== decoded.username) return response.sendStatus(403)

    // All is good
    const { token, newRefreshToken } = generateAllTokens(foundUser)
    foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken]
    foundUser.updatedAt = new Date().toISOString()
    await foundUser.save()

    // Creates Secure Cookie with refresh token
    response.cookie("jwt", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
    })
    response.status(200).json({ token })
  })
})

/* Controller to delete user's refresh token on logout */
tokensRouter.delete("/", async (request, response) => {
  const cookies = request.cookies
  if (!cookies?.jwt) return response.sendStatus(204) //No content
  const refreshToken = cookies.jwt

  // Is refreshToken in db?
  const foundUser = await User.findOne({ refreshToken }).exec()
  if (!foundUser) {
    response.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    })
    return response.sendStatus(204)
  }

  // Delete refreshToken in db
  foundUser.refreshToken = foundUser.refreshToken.filter(
    (rt) => rt !== refreshToken
  )
  foundUser.updatedAt = new Date().toISOString()
  await foundUser.save()

  response.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "None",
    secure: true,
  })
  response.sendStatus(204)
})

module.exports = tokensRouter
