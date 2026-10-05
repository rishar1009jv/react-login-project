const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      default: ""
    },

    date: {
      type: String,
      required: true
    },

    time: {
      type: String,
      default: ""
    },

    priority: {
      type: String,
      default: "Medium"
    },

    category: {
      type: String,
      default: "Personal"
    },

    completed: {
      type: Boolean,
      default: false
    },

    // Image stored permanently in MongoDB
    image: {
      data: {
        type: Buffer,
        default: null
      },
      contentType: {
        type: String,
        default: ""
      }
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Task", taskSchema);