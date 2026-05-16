import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { getAllNotes, createNote, getNoteById, updateNote, deleteNote, shareNote} from "../controllers/note.controller.js";

const router = Router();

router.use(protect);



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




export default router;