import React from "react";
import {
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
} from "@chakra-ui/react";
export default function NumberInputInteger({
  formik,
  name,
  onlyInt = false,
  min = 0,
}) {
  return (
    <NumberInput
      min={min}
      value={formik.values[name]}
      onChange={(value) => {
        if (onlyInt) {
          const currentValue = isNaN(parseInt(value)) ? min : parseInt(value);
          formik.setFieldValue(name, currentValue);
        } else {
          formik.setFieldValue(name, value);
        }
      }}
    >
      <NumberInputField />
      <NumberInputStepper>
        <NumberIncrementStepper />
        <NumberDecrementStepper />
      </NumberInputStepper>
    </NumberInput>
  );
}
