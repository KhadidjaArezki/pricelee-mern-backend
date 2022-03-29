const bcrypt = require('bcrypt')
require('dotenv').config()
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (_, response) => {
  const users = await User
    .find({})
    .populate('alerts', { desired_price: 1 })

  response.json(users)
})

usersRouter.post('/', async (request, response) => {
  const body = request.body
  const saltRounds = 10
  const passwordHash = await bcrypt.hash(body.password, saltRounds)

  const user = new User({
    username: body.username,
    passwordHash,
  })

  await user.save()
  response.status(201).redirect(307, process.env.BASE_LOGIN_URL)
})

module.exports = usersRouter