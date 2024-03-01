const fs = require("fs");
const csv = require("csv-parser");
module.exports = async (filepath) => {
  const results = [];
  return new Promise((resolve) => {
    fs.createReadStream(filepath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => {
        resolve(results);
      });
  });
};
