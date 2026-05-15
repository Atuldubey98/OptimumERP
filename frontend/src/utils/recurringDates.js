import moment from "moment";

export const calculateRecurringDates = ({
  startDate,
  endDate,
  interval,
  dateOfEveryMonth,
  dayOfEveryWeek,
}) => {
  if (!startDate || !interval) return [];
  const start = moment(startDate).startOf("day");
  const end = endDate ? moment(endDate).endOf("day") : moment().add(1, "year").endOf("day");
  const dates = [];
  
  let current = start.clone();
  

  if (interval === "weekly" && dayOfEveryWeek) {
    const targetDay = moment().day(dayOfEveryWeek).day();
    if (current.day() > targetDay) {
      current.add(1, "week").day(targetDay);
    } else {
      current.day(targetDay);
    }
  }


  if (["monthly", "quarterly", "half_yearly", "yearly"].includes(interval) && dateOfEveryMonth) {
    current.date(dateOfEveryMonth);
    if (current.isBefore(start, "day")) {
      current.add(1, "month").date(dateOfEveryMonth);
    }
  }

  while (current.isSameOrBefore(end, "day")) {
    if (current.isSameOrAfter(start, "day")) {
      dates.push(current.format("YYYY-MM-DD"));
    }
    
    switch (interval) {
      case "daily":
        current.add(1, "day");
        break;
      case "weekly":
        current.add(1, "week");
        break;
      case "monthly":
        current.add(1, "month");
        break;
      case "quarterly":
        current.add(3, "month");
        break;
      case "half_yearly":
        current.add(6, "month");
        break;
      case "yearly":
        current.add(1, "year");
        break;
      default:
        return dates;
    }
    
    if (dates.length > 365) break; 
  }
  
  return dates;
};
