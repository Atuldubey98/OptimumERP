import { useFormik } from "formik";
import moment from "moment";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import instance from "../instance";
export default function useReceiptForm() {
  const formik = useFormik({
    initialValues: {
      party: "",
      poNo: "",
      poDate: "",
      dueDate: "",
      description: "",
      terms: "",
      items: [],
      date: moment().format("YYYY-MM-DD"),
      status: "draft",
    },
    validateOnChange: false,
  });

  const { type, id, orgId } = useParams();
  const [status, setStatus] = useState("loading");
  const getReceiptById = async () => {
    try {
      setStatus("loading");
      const { data } = await instance.get(
        `/api/v1/organizations/${orgId}/${type}/${id}`
      );
      formik.resetForm(data.data);
      setStatus("idle");
    } catch (error) {
      setStatus("notfound");
    }
  };
  const getNextSequence = async () => {
    try {
      setStatus("loading");
      const { data } = await instance.get(
        `/api/v1/organizations/${orgId}/${type}/nextSequence`
      );
      formik.setFieldValue("sequence", data.data);
      setStatus("success");
    } catch (error) {
      setStatus("error");
    }
  };

  useEffect(() => {
    if (id) getReceiptById();
    else if (type !== "purchases") getNextSequence();
  }, [id]);
  return { formik, status };
}
