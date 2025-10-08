const express = require("express");
const router = express.Router();
const participacaoController = require("../controllers/participacaoController");

router.post("/", participacaoController.createParticipacao);
router.get("/", participacaoController.getParticipacoes);
router.get("/:id", participacaoController.getParticipacaoById);
router.put("/:id", participacaoController.updateParticipacao);
router.delete("/:id", participacaoController.deleteParticipacao);

module.exports = router;
