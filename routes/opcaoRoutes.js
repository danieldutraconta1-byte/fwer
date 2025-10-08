const express = require("express");
const router = express.Router();
const opcaoController = require("../controllers/opcaoController");

router.post("/", opcaoController.createOpcao);
router.get("/", opcaoController.getOpcoes);
router.get("/:id", opcaoController.getOpcaoById);
router.put("/:id", opcaoController.updateOpcao);
router.delete("/:id", opcaoController.deleteOpcao);

module.exports = router;
