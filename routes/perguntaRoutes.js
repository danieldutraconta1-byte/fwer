const express = require("express");
const router = express.Router();
const perguntaController = require("../controllers/perguntaController");

router.post("/", perguntaController.createPergunta);
router.get("/", perguntaController.getPerguntas);
router.get("/:id", perguntaController.getPerguntaById);
router.put("/:id", perguntaController.updatePergunta);
router.delete("/:id", perguntaController.deletePergunta);

module.exports = router;
