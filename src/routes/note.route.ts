import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { getAllNotes, createNote, getNoteById, updateNote, deleteNote, shareNote, togglePin, searchNotes} from "../controllers/note.controller.js";

const router = Router();

router.use(protect);

router.get("/search", searchNotes);

router.get("/", getAllNotes);
 
// POST /notes
router.post("/", createNote);

// GET  /notes/:id
router.get("/:id", getNoteById);

// PUT  /notes/:id
router.put("/:id", updateNote);

// DELETE /notes/:id
router.delete("/:id", deleteNote);

// POST /notes/:id/share
router.post("/:id/share", shareNote);

// PATCH /notes/:id/pin 
router.patch("/:id/pin", togglePin);



export default router;