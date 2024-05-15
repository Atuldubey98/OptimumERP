import { FormControl, FormLabel, Switch } from "@chakra-ui/react";
import React from "react";

export default function EnabledField({ formik }) {
  return (
    <FormControl display="flex" alignItems="center">
      <FormLabel htmlFor="enabled" mb="0">
        Enabled
      </FormLabel>
      <Switch
        isChecked={formik.values.enabled}
        id="enabled"
        onChange={(e) => {
          formik.setFieldValue("enabled", e.currentTarget.checked);
        }}
        name="enabled"
      />
    </FormControl>
  );
}
