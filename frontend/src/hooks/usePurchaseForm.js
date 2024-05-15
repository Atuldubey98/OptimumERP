import { useEffect, useState } from "react";
import useAsyncCall from "./useAsyncCall";
import * as Yup from "yup";
import { useToast } from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import instance from "../instance";
import { defaultInvoiceItem } from "../features/estimates/create/data";

export default function usePurchaseForm({ saveAndNew }) {
  const [status, setStatus] = useState("idle");
  const purchaseSchema = Yup.object().shape({
    purchaseNo: Yup.string().required("Purchase number is required"),
    billingAddress: Yup.string().required("Party Address is required"),
    party: Yup.string().required("Party is required"),
    date: Yup.date().required("Date is required"),
    status: Yup.string().required("Status is required"),
    items: Yup.array()
      .of(
        Yup.object().shape({
          name: Yup.string().required("Item name is required"),
          quantity: Yup.number()
            .required("Quantity is required")
            .min(1, "Quantity must be at least 1"),
          um: Yup.string().required("Unit of measure is required"),
          gst: Yup.string().required("GST is required"),
          price: Yup.number()
            .required("Price is required")
            .min(0, "Price must be a positive number"),
        })
      )
      .min(1),
    description: Yup.string(),
  });
  const { requestAsyncHandler } = useAsyncCall();
  const { orgId, purchaseId } = useParams();
  const toast = useToast();
  const navigate = useNavigate();
  const formik = useFormik({
    initialValues: {
      purchaseNo: "",
      billingAddress: "",
      date: new Date(Date.now()).toISOString().split("T")[0],
      status: "unpaid",
      items: [defaultInvoiceItem],
      autoItems: false,
      description: "",
      poNo: "",
      poDate: "",
    },
    validationSchema: purchaseSchema,
    validateOnChange: false,
    onSubmit: requestAsyncHandler(async (values, { setSubmitting }) => {
      const { _id, autoItems, ...purchase } = values;
      const items = values.items.map(({ _id, ...item }) => item);
      if (!_id && values.autoItems) {
        await instance.post(`/api/v1/organizations/${orgId}/products/many`, {
          items: items.map((item) => ({
            name: item.name,
            costPrice: item.price,
            sellingPrice: item.sellingPrice,
            description: "",
            um: item.um,
            type: "goods",
            code: item.code,
            category: null,
          })),
        });
      }
      await instance[_id ? "patch" : "post"](
        `/api/v1/organizations/${orgId}/purchases/${_id || ""}`,
        {
          ...purchase,
          items,
        }
      );
      toast({
        title: "Success",
        description: _id ? "Purchase updated" : "Purchase created",
        status: _id ? "info" : "success",
        duration: 3000,
        isClosable: true,
      });
      setSubmitting(false);
      if (saveAndNew)
        formik.resetForm({
          purchaseNo: "",
          billingAddress: "",
          date: new Date(Date.now()).toISOString().split("T")[0],
          status: "unpaid",
          items: [defaultInvoiceItem],
          description: "",
          poNo: "",
          poDate: "",
          party: undefined,
          partyDetails: undefined,
        });
      else navigate(`/${orgId}/purchases`);
    }),
  });
  useEffect(() => {
    (async () => {
      if (purchaseId) {
        requestAsyncHandler(async () => {
          setStatus("loading");
          const { data } = await instance.get(
            `/api/v1/organizations/${orgId}/purchases/${purchaseId}`
          );
          const {
            party,
            billingAddress = "",
            purchaseNo,
            date,
            status,
            items,
            description,
            poDate = "",
            poNo = "",
          } = data.data;
          formik.setValues({
            billingAddress,
            _id: data.data._id,
            party: party._id,
            partyDetails: party,
            purchaseNo,
            date: new Date(date).toISOString().split("T")[0],
            status,
            items,
            description,
            poDate: poDate ? poDate.split("T")[0] : "",
            poNo,
          });
          setStatus("success");
        })();
      }
    })();
  }, []);
  return { formik, status };
}
