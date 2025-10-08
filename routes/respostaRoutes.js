const express = require("express");
const router = express.Router();
const respostaController = require("../controllers/respostaController");

router.post("/", respostaController.createResposta);
router.get("/", respostaController.getRespostas);
router.get("/:id", respostaController.getRespostaById);
router.put("/:id", respostaController.updateResposta);
router.delete("/:id", respostaController.deleteResposta);

module.exports = router;
