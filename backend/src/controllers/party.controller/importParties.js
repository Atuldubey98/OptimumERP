const JobModel = require("../../models/job.model");

const importParties = async (req, res) => {
  const file = req.file;
  if (!file) throw new Error(req.t("common:api.no_file_uploaded"));
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
  return res.status(202).json({
    data: job._id,
    message: req.t("common:api.import_job_created"),
  });
};

module.exports = importParties;
