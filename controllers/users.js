const bcrypt = require("bcrypt")
const usersRouter = require("express").Router()
const User = require("../models/user")
const { generateAllTokens } = require("../utils/helpers")

usersRouter.get("/", async (_, response) => {
  const users = await User.find({}).populate("alerts", { desired_price: 1 })

  response.json(users)
})

usersRouter.post("/", async (request, response) => {
  const { username, password } = request.body
  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username: username,
    passwordHash,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })

  await user.save()

  const { token, refreshToken } = generateAllTokens(user)
  /* Update token and refresh token in user document */
  const userToUpdate = {
    refreshToken,
  }
  const updatedUser = await User.findByIdAndUpdate(
    user.id,
    {
      ...userToUpdate,
    },
    { new: true }
  )

  response.status(200).json({
    username: updatedUser.username,
    refreshToken: updatedUser.refreshToken,
    token,
  })
})

module.exports = usersRouter
