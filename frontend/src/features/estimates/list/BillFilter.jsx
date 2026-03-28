import { Box, Divider, Grid } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import SearchItem from "../../common/table-layout/SearchItem";
import DateFilter from "./DateFilter";

export default function BillFilter({ dateFilter, onChangeDateFilter }) {
  const { t } = useTranslation("common");
  return (
    <Grid gap={2}>
      <Divider />
      <Box>
        <SearchItem placeholder={t("common_ui.search.by_description")} />
      </Box>
      <Grid gap={5} gridTemplateColumns={"1fr 1fr"}>
        <DateFilter
          dateFilter={dateFilter}
          onChangeDateFilter={onChangeDateFilter}
        />
      </Grid>
      <Divider />
    </Grid>
  );
}
