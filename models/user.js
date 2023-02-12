const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    minLength: [3, "username must be at least 3 characters long"],
    unique: true,
    required: [true, "username is required"],
  },
  passwordHash: {
    type: String,
    required: [true, "Password is required"],
  },
  alerts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Alert",
    },
  ],
  refreshToken: [String],
  createdAt: mongoose.Schema.Types.String,
  updatedAt: mongoose.Schema.Types.String,
})

userSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    // the passwordHash should not be revealed
    delete returnedObject.passwordHash
  },
})

const User = mongoose.model("User", userSchema)

module.exports = User
