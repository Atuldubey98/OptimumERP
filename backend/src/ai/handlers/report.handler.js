const reportDataByType = require("../../constants/reportDataByType");

const reportHandler = {
  download_report: async (params) => {
    try {
      const { type, startDate, endDate, org } = params;
      const validReports = Object.keys(reportDataByType);
      const normalizedType = type?.toLowerCase();

      if (!normalizedType || !validReports.includes(normalizedType)) {
        return {
          message: "Invalid report type",
          aiResponse: `Please provide a valid report type. The valid report types are: ${validReports.join(", ")}.`,
        };
      }

      const downloadUrl = `/api/v1/organizations/${org}/reports/${normalizedType}/download?startDate=${startDate}&endDate=${endDate}`;

      return {
        message: `I have generated the  ${type} report for you from ${startDate} to ${endDate}.`,
        aiResponse: `The ${type} report for the period ${startDate} to ${endDate} has been generated successfully. Please do not include the download link in your response text, as I will provide a dedicated download button for it.`,
        downloads: [
          {
            name: `${type.charAt(0).toUpperCase() + type.slice(1)}_Report_${startDate}_${endDate}.xlsx`,
            url: downloadUrl,
            type: "file",
          }
        ]
      };
    } catch (error) {
      throw error;
    }
  },
};

module.exports = reportHandler;
