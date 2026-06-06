import { useEffect, useState } from "react";
import { useToast, useDisclosure } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useFormik } from "formik";
import * as Yup from "yup";
import instance from "../instance";

const templateSchema = Yup.object().shape({
  name: Yup.string()
    .max(20, "Name must be 20 characters or less")
    .required("Name is required"),
  type: Yup.string()
    .oneOf(["term", "email"], "Invalid type")
    .required("Type is required"),
  content: Yup.string().required("Content is required"),
});

const initialValues = { name: "", type: "term", content: "" };

export default function useTemplateTasks({ organization }) {
  const { t } = useTranslation("admin");
  const toast = useToast();

  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [hasReachedLimit, setHasReachedLimit] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const { data } = await instance.get(
        `/api/v1/organizations/${organization}/settings/templates`
      );
      setTemplates(data.data || []);
      setHasReachedLimit(data.hasUserReachedLimit || false);
    } catch (error) {
      toast({
        title: t("toasts.error_title"),
        description:
          error.response?.data?.message || "Failed to fetch templates",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (organization) {
      fetchTemplates();
    }
  }, [organization]);

  const formik = useFormik({
    initialValues,
    validationSchema: templateSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        if (editingTemplate) {
          const { data } = await instance.patch(
            `/api/v1/organizations/${organization}/settings/templates/${editingTemplate._id}`,
            values
          );
          toast({
            title: t("toasts.success_title"),
            description: data.message || "Template updated successfully",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        } else {
          const { data } = await instance.post(
            `/api/v1/organizations/${organization}/settings/templates`,
            values
          );
          toast({
            title: t("toasts.success_title"),
            description: data.message || "Template created successfully",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        }
        handleCloseModal();
        fetchTemplates();
      } catch (error) {
        toast({
          title: t("toasts.error_title"),
          description:
            error.response?.data?.message || "Failed to save template",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleEdit = (template) => {
    setEditingTemplate(template);
    formik.setValues({
      name: template.name,
      type: template.type,
      content: template.content,
    });
    onOpen();
  };

  const handleAddNew = () => {
    setEditingTemplate(null);
    formik.resetForm();
    onOpen();
  };

  const handleCloseModal = () => {
    onClose();
    setEditingTemplate(null);
    formik.resetForm();
  };

  const [deletingTemplateId, setDeletingTemplateId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openDeleteConfirm = (templateId) => {
    setDeletingTemplateId(templateId);
  };

  const closeDeleteConfirm = () => {
    setDeletingTemplateId(null);
  };

  const confirmDelete = async () => {
    if (!deletingTemplateId) return;
    setIsDeleting(true);
    try {
      const { data } = await instance.delete(
        `/api/v1/organizations/${organization}/settings/templates/${deletingTemplateId}`
      );
      toast({
        title: t("toasts.success_title"),
        description: data.message || "Template deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchTemplates();
    } catch (error) {
      toast({
        title: t("toasts.error_title"),
        description:
          error.response?.data?.message || "Failed to delete template",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
      setDeletingTemplateId(null);
    }
  };

  const handleSetDefault = async (templateId, type) => {
    try {
      const { data } = await instance.patch(
        `/api/v1/organizations/${organization}/settings/templates/default`,
        { id: templateId, type }
      );
      toast({
        title: t("toasts.success_title"),
        description: data.message || "Default template set successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchTemplates();
    } catch (error) {
      toast({
        title: t("toasts.error_title"),
        description:
          error.response?.data?.message || "Failed to set default template",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  return {
    templates,
    isLoading,
    editingTemplate,
    hasReachedLimit,
    formik,
    isModalOpen: isOpen,
    handleEdit,
    handleAddNew,
    handleCloseModal,
    openDeleteConfirm,
    closeDeleteConfirm,
    confirmDelete,
    isDeleteConfirmOpen: !!deletingTemplateId,
    isDeleting,
    handleSetDefault,
  };
}
