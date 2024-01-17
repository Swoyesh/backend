const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchuser");
const Note = require("../models/Note");
const { body, validationResult } = require("express-validator");

//Route 1: Get all the notes using: GET "/api/auth/fetchallnotes". Login required

router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id });
    res.send(notes);
  } catch (error) {
    res.status(500).send("Internal server error");
  }
});

//Route 2: Add a new note using: POST "/api/auth/addnote". Login required

router.post(
  "/addnote",
  fetchuser,
  [
    body("title", "Enter a valid title").isLength({ min: 3 }),
    body("description", "Description must be atleast 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    try {
      const { title, description, tag} = req.body;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const note = await Note.create({
        title,
        description,
        tag,
        user: req.user.id
      });
      
      res.send(note);
    } catch (error) {
      res.status(500).send("Internal server error");
    }
  }
);

//Route 3: Update an existing note using: PUT "/api/auth/updatenote". Login required

router.put("/updatenote/:id", fetchuser, async (req, res) => {
  const {title, description, tag} = req.body;
  try {
    const newNote = {};
    if (title) {
      newNote.title = title;
    }
    if (description) {
      newNote.description = description;
    }
    if (tag) {
      newNote.tag = tag;
    }
    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not found!!");
    }
    if (note.user.toString() !== req.user.id) {
      return res.status(404).send("Not allowed");
    }
    note = await Note.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    res.json(note);
  } catch (error) {
    res.status(500).send("Internal server error");
  }
});

//Route 4: Delete note using: DELETE "/api/auth/deletenode". Login required

router.delete("/deletenote/:id", fetchuser, async (req, res) => {
  try {
    //Find the note to be deleted and delete it
    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not Found");
    }
    //Allow deletion only if user owns this Note
    if (note.user.toString() !== req.user.id) {
      return res.status(404).send("Not allowed");
    }

    note = await Note.findByIdAndDelete(req.params.id);
    res.json({ Success: "Note has been successfully deleted", note: note });
  } catch (error) {
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
