import type { RequestHandler } from "express";
import { NoteModel } from "../models/notes.model.js"
import { UserModel } from "../models/user.model.js";

export const getAllNotes: RequestHandler = async (req, res) => {
  try {
    const userId = req.user!._id;

    const notes = await NoteModel.find({
      $or: [{ owner: userId }, { sharedWith: userId }],
    }).sort({ isPinned: -1, updatedAt: -1 });;

    const formatted = notes.map((note) => ({
      id: note._id,
      title: note.title,
      content: note.content,
      isPinned: note.isPinned,
      created_at: note.createdAt,
      updated_at: note.updatedAt,
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getNoteById: RequestHandler = async (req, res) => {
  try {
    const userId = req.user!._id;
    const { id } = req.params;

    const note = await NoteModel.findById(id);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    const isOwner = note.owner.toString() === userId.toString();
    const isShared = note.sharedWith.map((u) => u.toString()).includes(userId.toString());

    if (!isOwner && !isShared) {
      return res.status(403).json({ message: "You do not have access to this note" });
    }

    return res.status(200).json({
      id: note._id,
      title: note.title,
      content: note.content,
      isPinned: note.isPinned,
      created_at: note.createdAt,
      updated_at: note.updatedAt,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const createNote: RequestHandler = async (req, res) => {
  try {
    const userId = req.user!._id;
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const note = await NoteModel.create({ title, content, owner: userId });

    return res.status(201).json({
      id: note._id,
      title: note.title,
      content: note.content,
      isPinned: note.isPinned,
      created_at: note.createdAt,
      updated_at: note.updatedAt,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateNote: RequestHandler = async (req, res) => {
  try {
    const userId = req.user!._id;
    const { id } = req.params;
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const note = await NoteModel.findById(id);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    if (note.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You are not allowed to update this note" });
    }

    note.title = title;
    note.content = content;
    await note.save();

    return res.status(200).json({
      id: note._id,
      title: note.title,
      content: note.content,
      isPinned: note.isPinned,
      created_at: note.createdAt,
      updated_at: note.updatedAt,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const deleteNote: RequestHandler = async (req, res) => {
  try {
    const userId = req.user!._id;
    const { id } = req.params;

    const note = await NoteModel.findById(id);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }


    if (note.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You are not allowed to delete this note" });
    }

    await note.deleteOne();

    console.log("Deleted Successfully....")
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

/*========================Share Notes======================================*/
export const shareNote: RequestHandler = async (req, res) => {
  try {
    const userId = req.user!._id;
    const { id } = req.params;
    const { share_with_email } = req.body;

    if (!share_with_email) {
      return res.status(400).json({ message: "share_with_email is required" });
    }

    const note = await NoteModel.findById(id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }


    if (note.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You are not allowed to share this note" });
    }

    const targetUser = await UserModel.findOne({ email: share_with_email });
    if (!targetUser) {
      return res.status(404).json({ message: "No user found with that email" });
    }

    if (targetUser._id.toString() === userId.toString()) {
      return res.status(400).json({ message: "You cannot share a note with yourself" });
    }

    const alreadyShared = note.sharedWith.map((u) => u.toString()).includes(targetUser._id.toString());
    if (alreadyShared) {
      return res.status(409).json({ message: "Note is already shared with this user" });
    }

    note.sharedWith.push(targetUser._id);
    await note.save();

    return res.status(200).json({ message: "Note shared successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

