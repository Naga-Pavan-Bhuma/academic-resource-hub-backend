import Resource from "../models/Resource.js";

// Upload a new resource
export const uploadResource = async (req, res) => {
  try {
    const { title, subject, year, sem, unitNumber, tags } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "PDF file is required" });
    }

    const newResource = new Resource({
      title,
      subject,
      year,
      sem,
      unitNumber,
      file: "/uploads/" + req.file.filename, // path to the uploaded PDF
      uploadedBy: req.user.name,             // coming from auth middleware
      idNumber: req.user.idNumber,           // coming from auth middleware
      tags: tags ? tags.split(",").map(tag => tag.trim()) : [],
    });

    await newResource.save();
    res.status(201).json({ message: "Resource uploaded successfully", resource: newResource });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all resources
export const getResources = async (req, res) => {
  try {
    const resources = await Resource.find().sort({ createdAt: -1 });
    res.json(resources);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
