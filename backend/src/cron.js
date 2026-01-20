require("dotenv").config({
  path:
    process.env.NODE_ENV === "development" ? "../.env.development" : "../.env",
});

const { CronJob } = require("cron");
const JobModel = require("./models/job.model");
const csvParser = require("csv-parser");
const dbService = require("./services/db.service");
const partyService = require("./services/party.service");
const { Readable } = require("stream");
const logger = require("./logger");

let isRunning = false;
let dbConnection = null;

if (!process.env.IMPORT_CRON_SCHEDULE) {
  logger.warn("IMPORT_CRON_SCHEDULE not set. Cron job will not run.");
  process.exit(0);
}
logger.info("Starting cron job with schedule");
const importCron = new CronJob(
  process.env.IMPORT_CRON_SCHEDULE,
  async function () {
    if (isRunning) return;
    isRunning = true;
    
    try {
      if (!dbConnection) {
        dbConnection = await dbService.connectDatabase(process.env.MONGO_URI);
      }

      const jobs = await JobModel.find({
        type: "bulk_upload",
        status: "pending",
      });      
      for (const jobDoc of jobs) {
        jobDoc.status = "in_progress";
        await jobDoc.save();

        const { entity, fileBuffer } = jobDoc.metadata;

        const entityCreationFns = {
          party: {
            mapper: (data) => {
              const name = data["Name"];
              const billingAddress = data["Billing Address"];
              const shippingAddress = data["Shipping Address"];
              const gstNo = data["GST No"];
              const panNo = data["PAN No"];

              return {
                name,
                billingAddress,
                shippingAddress,
                gstNo,
                panNo,
                createdBy: jobDoc.createdBy,
                org: jobDoc.org,
              };
            },
            create: async (data) => partyService.create(data),
          },
        };

        const {mapper, create} = entityCreationFns[entity];

        const stream = Readable.from(fileBuffer.buffer);
        let successCount = 0;
        let failureCount = 0;
        stream
          .pipe(csvParser())
          .on("data", async (data) => {
            try {
              data.createdBy = jobDoc.createdBy;
              data.org = jobDoc.org;
              successCount++;
              const mappedData = mapper(data);
              await create(mappedData);
            } catch (error) {
              failureCount++;
              logger.error("Error creating entity:", error);
            }
          })
          .on("end", async () => {
            jobDoc.metadata.successCount = successCount;
            jobDoc.metadata.failureCount = failureCount;
            jobDoc.status = "completed";
            await jobDoc.save();
          })
          .on("error", async (err) => {
            logger.error("Error processing CSV:", err);
            jobDoc.status = "failed";
            await jobDoc.save();
          });
      }
    } catch (error) {
      logger.error(error);
    } finally {
      isRunning = false;
    }
  },
  null,
  false,
  "UTC",
);
importCron.start();
