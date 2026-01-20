const JobModel = require("../../models/job.model");

const importParties = async (req, res) => {
  const file = req.file;
  if (!file) throw new Error("No file uploaded");
  const buffer = file.buffer;

  const job = await JobModel.create({
    type: "bulk_upload",
    org: req.params.orgId,
    createdBy: req.session?.user?._id,
    metadata: {
      entity: "party",
      fileBuffer: buffer,
      fileName: file.originalname,
      mimeType: file.mimetype,
    },
  });
  return res.status(202).json({ data: job._id, message: "Import job created" });
};

module.exports = importParties;
