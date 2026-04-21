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
  placeholder = "",
  max ,
  precision,
  step,
}) {
  return (
    <NumberInput
      precision={precision}
      step={step}
      min={min}
      max={max}
      isRequired
      value={formik.values[name]}
      onChange={(value) => {
        if (onlyInt) {
          const currentValue = isNaN(parseInt(value)) ? min : parseInt(value);
          formik.setFieldValue(name, currentValue);
        } else {
          if (precision !== undefined && value.includes('.')) {
            if (precision === 0) return;
            const decPart = value.split('.')[1] || '';
            if (decPart.length > precision) return;
          }
          formik.setFieldValue(name, value);
        }
      }}
    >
      <NumberInputField placeholder={placeholder} />
      <NumberInputStepper>
        <NumberIncrementStepper />
        <NumberDecrementStepper />
      </NumberInputStepper>
    </NumberInput>
  );
}
