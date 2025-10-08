const express = require("express");
const router = express.Router();
const perguntaAlunoController = require("../controllers/perguntaAlunoController");

router.post("/", perguntaAlunoController.createPerguntaAluno);
router.get("/", perguntaAlunoController.getPerguntasAluno);
router.get("/:id", perguntaAlunoController.getPerguntaAlunoById);
router.put("/:id", perguntaAlunoController.updatePerguntaAluno);
router.delete("/:id", perguntaAlunoController.deletePerguntaAluno);

module.exports = router;
