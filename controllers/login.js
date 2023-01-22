const bcrypt = require("bcrypt")
const loginRouter = require("express").Router()
const User = require("../models/user")
const { generateAllTokens } = require("../utils/helpers")

loginRouter.post("/", async (request, response) => {
  const body = request.body

  const user = await User.findOne({ username: body.username })
  const passwordCorrect =
    user === null
      ? false
      : await bcrypt.compare(body.password, user.passwordHash)

  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: "invalid user credentials",
    })
  }

  const { token, refreshToken } = generateAllTokens(user)
  /* Update token and refresh token in user document */
  const userToUpdate = {
    refreshToken,
  }
  const updatedUser = await User.findByIdAndUpdate(
    user.id,
    {
      ...userToUpdate,
      updatedAt: new Date().toISOString(),
    },
    { new: true }
  )

  response.status(200).json({
    username: updatedUser.username,
    refreshToken: updatedUser.refreshToken,
    token,
  })

  // const userForToken = {
  //   username: user.username,
  //   id: user._id,
  // }

  // const token = jwt.sign(
  //   userForToken,
  //   process.env.SECRET,
  //   { expiresIn: 72*3600 }
  // )

  // response
  // .status(200)
  // .send({ token, username: user.username })
})

module.exports = loginRouter
