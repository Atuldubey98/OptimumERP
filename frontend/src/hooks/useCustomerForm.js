import { useFormik } from "formik";
import { useParams } from "react-router-dom";
import * as Yup from "yup";
import { createCustomer, updateCustomer } from "../api/customer";
import useAsyncCall from "./useAsyncCall";

const customerDto = Yup.object({
  name: Yup.string()
    .min(2, "Cannot be less than 2")
    .max(80, "Cannot be greater than 80")
    .required("Please give customer name")
    .label("Name"),
  shippingAddress: Yup.string()
    .max(80, "Cannot be greater than 80")
    .label("Shipping address")
    .optional(),
  billingAddress: Yup.string()
    .min(2)
    .max(80, "Cannot be greater than 80")
    .label("Billing address"),
  gstNo: Yup.string().label("GST Number"),
  panNo: Yup.string().label("PAN Number"),
});
export default function useCustomerForm(onAddedFetch, onCloseDrawer) {
  const { requestAsyncHandler } = useAsyncCall();
  const { orgId = "" } = useParams();
  const formik = useFormik({
    initialValues: {
      name: "",
      billingAddress: "",
      gstNo: "",
      panNo: "",
      shippingAddress: "",
    },
    validationSchema: customerDto,
    onSubmit: requestAsyncHandler(async (values, { setSubmitting }) => {
      const { name, shippingAddress, billingAddress, gstNo, panNo, _id } =
        values;
      const customer = {
        name,
        shippingAddress,
        billingAddress,
        gstNo,
        org: orgId,
        panNo,
        _id,
      };
      if (customer._id) await updateCustomer(customer, orgId);
      else await createCustomer(customer, orgId);
      setSubmitting(false);
      onCloseDrawer();
      formik.resetForm();
      onAddedFetch();
    }),
  });
  return { formik };
}
