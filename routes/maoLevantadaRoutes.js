const express = require("express");
const router = express.Router();
const maoLevantadaController = require("../controllers/maoLevantadaController");

router.post("/", maoLevantadaController.createMaoLevantada);
router.get("/", maoLevantadaController.getMaosLevantadas);
router.get("/:id", maoLevantadaController.getMaoLevantadaById);
router.put("/:id", maoLevantadaController.updateMaoLevantada);
router.delete("/:id", maoLevantadaController.deleteMaoLevantada);

module.exports = router;
