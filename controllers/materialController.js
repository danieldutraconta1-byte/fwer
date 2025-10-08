const Material = require("../models/Material");

exports.createMaterial = async (req, res) => {
  try {
    const newMaterial = new Material(req.body);
    const material = await newMaterial.save();
    res.status(201).json(material);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getMateriais = async (req, res) => {
  try {
    const materiais = await Material.find().populate("sala");
    res.json(materiais);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMaterialById = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id).populate("sala");
    if (!material) return res.status(404).json({ message: "Material not found" });
    res.json(material);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateMaterial = async (req, res) => {
  try {
    const material = await Material.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!material) return res.status(404).json({ message: "Material not found" });
    res.json(material);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findByIdAndDelete(req.params.id);
    if (!material) return res.status(404).json({ message: "Material not found" });
    res.json({ message: "Material deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

