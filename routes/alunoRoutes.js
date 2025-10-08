const express = require("express");
const router = express.Router();
const alunoController = require("../controllers/alunoController");

router.post("/", alunoController.createAluno);
router.get("/", alunoController.getAlunos);
router.get("/:id", alunoController.getAlunoById);
router.put("/:id", alunoController.updateAluno);
router.delete("/:id", alunoController.deleteAluno);

module.exports = router;
