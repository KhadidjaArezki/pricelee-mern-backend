const bcrypt = require("bcrypt")
const loginRouter = require("express").Router()
const User = require("../models/user")
const { generateAllTokens } = require("../utils/helpers")

loginRouter.post("/", async (request, response) => {
  const cookies = request.cookies
  const { username, password } = request.body

  const foundUser = await User.findOne({ username: username }).exec()
  const passwordCorrect =
    foundUser === null
      ? false
      : await bcrypt.compare(password, foundUser.passwordHash)

  if (!(foundUser && passwordCorrect)) {
    return response.status(401).json({
      error: "invalid foundUser credentials",
    })
  }

  const { token, newRefreshToken } = generateAllTokens(foundUser)
  // If a cookie is sent with an rt, replace it with a new one
  let newRefreshTokenArray = !cookies?.jwt
    ? foundUser.refreshToken
    : foundUser.refreshToken.filter((rt) => rt !== cookies.jwt)

  if (cookies?.jwt) {
    /*
      1) User logs in but never uses RT and does not logout
      2) RT is stolen
      3) If 1 & 2, reuse detection is needed to clear all RTs when user logs in
    */
    const refreshToken = cookies.jwt
    const foundToken = await User.findOne({ refreshToken }).exec()

    // Detected refresh token reuse!
    if (!foundToken) {
      newRefreshTokenArray = []
    }
    response.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    })
  }

  // Saving refreshToken with current user
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

  response.status(200).json({
    username: foundUser.username,
    token,
  })

  /* Update token and refresh token in user document */
  // const userToUpdate = {
  //   refreshToken,
  // }
  // const updatedUser = await User.findByIdAndUpdate(
  //   foundUser.id,
  //   {
  //     ...userToUpdate,
  //     updatedAt: new Date().toISOString(),
  //   },
  //   { new: true }
  // )
})

module.exports = loginRouter
