import {
  Box,
  ButtonGroup,
  Divider,
  Flex,
  IconButton,
  SimpleGrid,
  Stack,
  Text,
  useColorModeValue,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { isAxiosError } from "axios";
import moment from "moment";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { CiEdit, CiMail, CiSaveDown2 } from "react-icons/ci";
import { IoMdClose } from "react-icons/io";
import { LiaEyeSolid } from "react-icons/lia";
import { MdDeleteOutline } from "react-icons/md";
import { Link, useNavigate, useParams } from "react-router-dom";
import instance from "../../../instance";
import BillModal from "../../estimates/list/BillModal";
import AlertModal from "../AlertModal";
import ShareBillModal from "../ShareBillModal";
import BackButtonHeader from "../table-layout/BackButtonHeader";
import ReceiptItemsHeading from "./ReceiptItemsHeading";
import ReceiptItem from "./ReceiptItem";
import ReceiptMainAmounts from "./ReceiptMainAmounts";
import PartyDisplayReceipt from "./PartyDisplayReceipt";
import ReceiptMenu from "./ReceiptMenu";
import ReceiptPayment from "./ReceiptPayment";
export default function ReceiptDisplay({ receipt, meta }) {
  const { t, i18n } = useTranslation("common");
  const { type, orgId } = useParams();
  const navigate = useNavigate();
  const onDownloadReceipt = async () => {
    try {
      const templateName = localStorage.getItem("template") || "simple";
      const language = i18n.resolvedLanguage || i18n.language || "en";
      const downloadBill = `/api/v1/organizations/${orgId}/${type}/${receipt._id}/download?template=${templateName}&lng=${language}`;
      const { data } = await instance.get(downloadBill, {
        responseType: "blob",
      });
      const href = URL.createObjectURL(data);
      const link = document.createElement("a");
      link.setAttribute("download", `${meta.label}-${receipt.date}.pdf`);
      link.href = href;
      link.click();

      URL.revokeObjectURL(href);
    } catch (error) {
      console.log(error);
    }
  };
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { isOpen: isReceiptModalOpen, onToggle: toggleReceiptModal } =
    useDisclosure();
  const { isOpen: isDeleteModalOpen, onToggle: toggleDeleteModal } =
    useDisclosure();
  const toast = useToast();
  const navigateToReceiptList = () =>
    navigate(`/${orgId}${meta.receiptHomeAppUrl}`);
  const [status, setStatus] = useState("idle");

  const onDeleteReceipt = async () => {
    try {
      setStatus("deleting");
      const { data } = await instance.delete(
        `/api/v1/organizations/${orgId}/${type}/${receipt._id}`
      );
      toast({
        title: t("common_ui.toasts.success"),
        description: t("common_ui.receipt.deleted", { label: meta.label }),
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setStatus("idle");
      navigateToReceiptList();
    } catch (error) {
      toast({
        title: isAxiosError(error) ? error.response?.data?.name : t("common_ui.toasts.error"),
        description: isAxiosError(error)
          ? error?.response?.data.message || t("common_ui.toasts.network_error")
          : t("common_ui.toasts.network_error"),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const headerButtons = [
    {
      colorScheme: "blue",
      icon: <LiaEyeSolid />,
      label: t("common_ui.actions.show"),
      onClick: toggleReceiptModal,
      showForReceipts: [],
    },
    {
      colorScheme: "blue",
      icon: <CiSaveDown2 />,
      label: t("common_ui.actions.download"),
      onClick: onDownloadReceipt,
      showForReceipts: [],
    },
    {
      colorScheme: "blue",
      icon: <CiMail />,
      label: t("common_ui.actions.mail"),
      onClick: onOpen,
      showForReceipts: ["invoices"],
    },
    {
      colorScheme: "blue",
      icon: <CiEdit />,
      label: t("common_ui.actions.edit"),
      onClick: () => {
        navigate(`/${orgId}${meta.receiptHomeAppUrl}/${receipt._id}/edit`);
      },
      showForReceipts: [],
    },
    {
      colorScheme: "blue",
      icon: <MdDeleteOutline />,
      label: t("common_ui.actions.delete"),
      onClick: toggleDeleteModal,
      showForReceipts: [],
    },
  ];
  const bg = useColorModeValue("gray.50", "gray.700");
  const tableHeader = useColorModeValue("gray.100", "gray.800");
  const metaBg = useColorModeValue("white", "gray.800");

  const receiptMetaFields = [
    {
      key: "status",
      label: t("common_ui.receipt.status", { defaultValue: "Status" }),
      value: receipt.status,
    },
    {
      key: "poNo",
      label: t("common_ui.receipt.po_number", { defaultValue: "PO Number" }),
      value: receipt.poNo,
    },
    {
      key: "poDate",
      label: t("common_ui.receipt.po_date", { defaultValue: "PO Date" }),
      value: receipt.poDate ? moment(receipt.poDate).format("LL") : "",
    },
    {
      key: "dueDate",
      label: t("common_ui.receipt.due_date", { defaultValue: "Due Date" }),
      value: receipt.dueDate ? moment(receipt.dueDate).format("LL") : "",
    },
    {
      key: "createdBy",
      label: t("common_ui.receipt.created_by", { defaultValue: "Created By" }),
      value: receipt.createdBy?.name,
    },
    {
      key: "createdAt",
      label: t("common_ui.receipt.created_at", { defaultValue: "Created At" }),
      value: receipt.createdAt ? moment(receipt.createdAt).format("LLL") : "",
    },
  ].filter((field) => field.value);

  return (
    <Stack
      spacing={2}
      bg={bg}
      p={3}
      borderRadius={"md"}
      w={"100%"}
      maxW={"5xl"}
    >
      <Flex justifyContent={"space-between"} alignItems={"center"}>
        <BackButtonHeader heading={`${meta.label} #${receipt.num}`} />
        <ButtonGroup>
          <ReceiptMenu headerButtons={headerButtons} />
          <IconButton
            size={"sm"}
            icon={<IoMdClose />}
            isRound
            onClick={navigateToReceiptList}
          />
        </ButtonGroup>
      </Flex>
      <Text textAlign={"right"}>{moment(receipt.date).format("LL")}</Text>
      <PartyDisplayReceipt
        receipt={receipt}
        partyNameLabel={meta.partyNameLabel}
      />
      {receiptMetaFields.length ? (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
          {receiptMetaFields.map((field) => (
            <Box key={field.key} bg={metaBg} p={3} borderRadius={"md"}>
              <Text fontSize={"xs"} textTransform={"uppercase"} color={"gray.500"}>
                {field.label}
              </Text>
              <Text fontWeight={"semibold"}>{field.value}</Text>
            </Box>
          ))}
        </SimpleGrid>
      ) : null}
      <Divider />
      <Box fontSize={"sm"} marginBlock={2}>
        <ReceiptItemsHeading tableHeader={tableHeader} />
        <Stack spacing={2}>
          {receipt.items.map((item, index) => (
            <ReceiptItem key={index} item={item} />
          ))}
        </Stack>
        <Box marginBlock={2}>
          <ReceiptMainAmounts receipt={receipt} />
        </Box>
      </Box>
      {receipt.description ? (
        <Box bg={metaBg} p={3} borderRadius={"md"}>
          <Text fontSize={"xs"} textTransform={"uppercase"} color={"gray.500"}>
            {t("common_ui.receipt.description", { defaultValue: "Description" })}
          </Text>
          <Text>{receipt.description}</Text>
        </Box>
      ) : null}
      {receipt.terms ? (
        <Box bg={metaBg} p={3} borderRadius={"md"}>
          <Text fontSize={"xs"} textTransform={"uppercase"} color={"gray.500"}>
            {t("common_ui.receipt.terms", { defaultValue: "Terms and Conditions" })}
          </Text>
          <Text whiteSpace={"pre-wrap"}>{receipt.terms}</Text>
        </Box>
      ) : null}

      {isOpen ? (
        <ShareBillModal
          isOpen={isOpen}
          onClose={onClose}
          bill={receipt}
          billType={type}
        />
      ) : null}
      {receipt.payment ? <ReceiptPayment payment={receipt.payment} /> : null}
      {isDeleteModalOpen ? (
        <AlertModal
          body={t("common_ui.receipt.delete_body", {
            label: meta.label.toLowerCase(),
          })}
          header={t("common_ui.receipt.delete_header", { label: meta.label })}
          isOpen={isDeleteModalOpen}
          onClose={toggleDeleteModal}
          onConfirm={onDeleteReceipt}
          buttonLabel={t("common_ui.actions.delete")}
          confirmDisable={status === "deleting"}
        />
      ) : null}
      <BillModal
        isOpen={isReceiptModalOpen}
        bill={receipt}
        entity={type}
        heading={meta.label}
        onClose={toggleReceiptModal}
      />
      {receipt.converted ? (
        <Box>
          <Text>
            <strong>{t("common_ui.receipt.converted_to_invoice_on")}</strong>
            {moment(receipt.converted.date).format("LL")}
          </Text>
          <Text>
            <strong>{t("common_ui.receipt.invoice_label")}</strong>
            <Link to={`/${orgId}/receipt/invoices/${receipt.converted._id}`}>
              {receipt.converted.num}
            </Link>
          </Text>
        </Box>
      ) : null}
    </Stack>
  );
}
