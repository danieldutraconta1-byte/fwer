const express = require("express");
const router = express.Router();
const presencaController = require("../controllers/presencaController");

router.post("/", presencaController.createPresenca);
router.get("/", presencaController.getPresencas);
router.get("/:id", presencaController.getPresencaById);
router.put("/:id", presencaController.updatePresenca);
router.delete("/:id", presencaController.deletePresenca);

module.exports = router;
