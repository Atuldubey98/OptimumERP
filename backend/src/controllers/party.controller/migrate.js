const migrate = async (req, res) => {
  const file = req.file;
  return res.status(200).json({ message: 'File received', fileName: file.originalname });
}

module.exports = migrate;