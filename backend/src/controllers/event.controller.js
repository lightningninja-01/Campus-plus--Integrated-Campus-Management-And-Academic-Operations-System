const Event = require("../models/Event");


// CREATE EVENT
exports.createEvent = async (req, res) => {

  try {

    const { title, description, location, date } = req.body;

    const event = await Event.create({
      title,
      description,
      location,
      date,
      createdBy: req.user.id
    });

    res.status(201).json({
      message: "Event created successfully",
      event
    });

  } catch (error) {

    res.status(500).json({
      message: "Server error"
    });

  }

};



// GET ALL EVENTS
exports.getEvents = async (req, res) => {

  try {

    const events = await Event.find()
      .populate("createdBy", "name email")
      .sort({ date: 1 });

    res.json(events);

  } catch (error) {

    res.status(500).json({
      message: "Server error"
    });

  }

};

exports.joinEvent = async (req, res) => {

  try {

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found"
      });
    }

    if (event.participants.includes(req.user.id)) {
      return res.status(400).json({
        message: "You already joined this event"
      });
    }

    event.participants.push(req.user.id);

    await event.save();

    res.json({
      message: "Joined event successfully",
      event
    });

  } catch (error) {

    res.status(500).json({
      message: "Server error"
    });

  }

};

// DELETE EVENT
exports.deleteEvent = async (req, res) => {

  try {

    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found"
      });
    }

    res.json({
      message: "Event deleted successfully"
    });

  } catch (error) {

    res.status(500).json({
      message: "Server error"
    });

  }

};