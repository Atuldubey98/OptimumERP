import { FormControl, FormLabel, Select } from "@chakra-ui/react";
import { statusList } from "./data";

export default function SelectStatus({ formik }) {
  return (
    <FormControl
      isRequired
      isInvalid={formik.errors.date && formik.touched.date}
    >
      <FormLabel>Status</FormLabel>
      <Select name="status">
        {statusList.map((status) => (
          <option key={status.type} value={status.type}>
            {status.label}
          </option>
        ))}
      </Select>
    </FormControl>
  );
}
