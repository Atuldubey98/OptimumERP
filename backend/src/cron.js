require("dotenv").config({
  path: process.env.NODE_ENV === "development" ? "../.env.development" : "../.env",
});

const { CronJob } = require("cron");
const JobModel = require("./models/job.model");
const csvParser = require("csv-parser");
const dbService = require("./services/db.service");
const partyService = require("./services/party.service");
const productService = require("./services/product.service");
const umService = require("./services/um.service");
const { Readable } = require("stream");
const logger = require("./logger");
const settingService = require("./services/setting.service");
const { moneyUtils } = require("./utils");
const notificationService = require("./services/notification.service")
const { executeMongoDbTransaction } = require("./services/crud.service");

let isImportRunning = false;
let dbConnection = null;

if (!process.env.IMPORT_CRON_SCHEDULE) {
  logger.warn("IMPORT_CRON_SCHEDULE not set. Import cron job will not run.");
}

const ensureDbConnection = async () => {
  if (!dbConnection) {
    dbConnection = await dbService.connectDatabase(process.env.MONGO_URI);
  }
};

const importCron = new CronJob(
  process.env.IMPORT_CRON_SCHEDULE || "0 * * * *",
  async function () {
    if (!process.env.IMPORT_CRON_SCHEDULE || isImportRunning) return;
    isImportRunning = true;

    try {
      await ensureDbConnection();

      const jobs = await JobModel.find({
        type: "bulk_upload",
        status: "pending",
      });

      for (const jobDoc of jobs) {
        jobDoc.status = "in_progress";
        await jobDoc.save();

        const { entity, fileBuffer } = jobDoc.metadata;

        let cachedUms = [];
        const setting = await settingService.getDisplaySettingForOrg(jobDoc.org);
        const currencyConfig = await moneyUtils.getCurrencyConfigByCode(setting.currency || "INR");
        const decimalDigits = currencyConfig?.decimal_digits || 2;

        if (entity === "product") {
          cachedUms = await umService.getUmListForOrg(jobDoc.org);
        }


        const entityCreationFns = {
          party: {
            mapper: (data) => ({
              name: data["Name"],
              billingAddress: data["Billing Address"],
              shippingAddress: data["Shipping Address"],
              gstNo: data["GST No"],
              panNo: data["PAN No"],
              createdBy: jobDoc.createdBy,
              org: jobDoc.org,
            }),
            frontendTitle: "Parties upload Results",
            frontendListing: `${process.env.VITE_APP_URL}/${jobDoc.org}/parties`,
            create: async (data) => partyService.create(data),
          },
          product: {
            frontendTitle: "Products upload Results",
            frontendListing: `${process.env.VITE_APP_URL}/${jobDoc.org}/products`,
            mapper: (data) => {
              const umName = data["Unit"] || data["UM"];
              const matchedUm = cachedUms.find(u =>
                u.name.toLowerCase() === umName?.toLowerCase() ||
                u.unit.toLowerCase() === umName?.toLowerCase()
              );

              return {
                name: data["Name"],
                code: data["Code"] || data["SKU"],
                type: (data["Type"] || "goods").toLowerCase(),
                costPrice: moneyUtils.toSmallestUnit(data["Cost Price"] || 0, decimalDigits),
                sellingPrice: moneyUtils.toSmallestUnit(data["Selling Price"] || 0, decimalDigits),
                description: data["Description"] || "",
                um: matchedUm?._id || cachedUms[0]?._id,
                createdBy: jobDoc.createdBy,
                org: jobDoc.org,
              };
            },
            create: async (data) => productService.create(data),
          },
        };

        const { mapper, create, frontendListing, frontendTitle } = entityCreationFns[entity];
        let successCount = 0;
        let failureCount = 0;

        await executeMongoDbTransaction(async (session) => {
          try {
            const stream = Readable.from(fileBuffer.buffer).pipe(csvParser());

            for await (const row of stream) {
              try {
                row.createdBy = jobDoc.createdBy;
                row.org = jobDoc.org;
                const mappedData = await mapper(row);
                await create(mappedData, session);
                successCount++;
              } catch (error) {
                failureCount++;
                logger.error("Row error:", error);
              }
            }

            jobDoc.metadata.successCount = successCount;
            jobDoc.metadata.failureCount = failureCount;
            jobDoc.status = "completed";
            jobDoc.markModified("metadata");
            await jobDoc.save({ session });
          } catch (streamErr) {
            logger.error("Stream error:", streamErr);
            jobDoc.status = "failed";
            await jobDoc.save({ session });
          } finally {
            await notificationService.create({
              org: jobDoc.org,
              title: frontendTitle,
              message: `Bulk Upload completed with ${successCount} success and ${failureCount} failed`,
              user: jobDoc.createdBy,
              data: {
                event: "link_to",
                data: frontendListing
              },
              type: "info",
            }, session)
          }
        });
      }
    } catch (error) {
      logger.error("Import cron error:", error);
    } finally {
      isImportRunning = false;
    }
  },
  null,
  false,
  "UTC"
);

if (process.env.IMPORT_CRON_SCHEDULE) {
  importCron.start();
  logger.info(`Import cron started with schedule: ${process.env.IMPORT_CRON_SCHEDULE}`);
}