const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");

const {
  createEvent,
  getEvents,
  deleteEvent
} = require("../controllers/event.controller");


// CREATE EVENT
router.post("/", authMiddleware, createEvent);


// GET EVENTS
router.get("/", getEvents);


// DELETE EVENT
router.delete("/:id", authMiddleware, deleteEvent);


module.exports = router;