import {
  Box,
  ButtonGroup,
  Divider,
  Flex,
  IconButton,
  Stack,
  Text,
  useColorModeValue,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { isAxiosError } from "axios";
import moment from "moment";
import React, { useState } from "react";
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
  const { type, orgId } = useParams();
  const navigate = useNavigate();
  const onDownloadReceipt = async () => {
    try {
      const templateName = localStorage.getItem("template") || "simple";
      const downloadBill = `/api/v1/organizations/${orgId}/${type}/${receipt._id}/download?template=${templateName}`;
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
        title: "Success",
        description: `${meta.label} Deleted`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setStatus("idle");
      navigateToReceiptList();
    } catch (error) {
      toast({
        title: isAxiosError(err) ? err.response?.data?.name : "Error",
        description: isAxiosError(err)
          ? err?.response?.data.message || "Network error occured"
          : "Network error occured",
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
      label: "Show",
      onClick: toggleReceiptModal,
      showForReceipts: [],
    },
    {
      colorScheme: "blue",
      icon: <CiSaveDown2 />,
      label: "Download",
      onClick: onDownloadReceipt,
      showForReceipts: [],
    },
    {
      colorScheme: "blue",
      icon: <CiMail />,
      label: "Mail",
      onClick: onOpen,
      showForReceipts: ["invoices"],
    },
    {
      colorScheme: "blue",
      icon: <CiEdit />,
      label: "Edit",
      onClick: () => {
        navigate(`/${orgId}${meta.receiptHomeAppUrl}/${receipt._id}/edit`);
      },
      showForReceipts: [],
    },
    {
      colorScheme: "blue",
      icon: <MdDeleteOutline />,
      label: "Delete",
      onClick: toggleDeleteModal,
      showForReceipts: [],
    },
  ];
  const bg = useColorModeValue("gray.50", "gray.700");
  const tableHeader = useColorModeValue("gray.100", "gray.800");

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
          body={`Do you want to delete ${meta.label.toLowerCase()} ?`}
          header={`Delete ${meta.label}`}
          isOpen={isDeleteModalOpen}
          onClose={toggleDeleteModal}
          onConfirm={onDeleteReceipt}
          buttonLabel="Delete"
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
            <strong>Converted to invoice on : </strong>
            {moment(receipt.converted.date).format("LL")}
          </Text>
          <Text>
            <strong>Invoice : </strong>
            <Link to={`/${orgId}/receipt/invoices/${receipt.converted._id}`}>
              {receipt.converted.num}
            </Link>
          </Text>
        </Box>
      ) : null}
    </Stack>
  );
}
