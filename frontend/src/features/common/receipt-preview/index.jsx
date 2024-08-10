import React, { useEffect, useState } from "react";
import MainLayout from "../main-layout";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Box,
  ButtonGroup,
  Container,
  Divider,
  Flex,
  Grid,
  GridItem,
  Heading,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spinner,
  Stack,
  Stat,
  StatArrow,
  StatGroup,
  StatHelpText,
  StatLabel,
  StatNumber,
  Text,
  useColorModeValue,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { HiOutlineNewspaper } from "react-icons/hi";
import instance from "../../../instance";
import BackButtonHeader from "../table-layout/BackButtonHeader";
import { CiEdit, CiMail, CiSaveDown2 } from "react-icons/ci";
import ButtonIcon from "../table-layout/ButtonIcon";
import { AiFillCloseCircle } from "react-icons/ai";
import useCurrentOrgCurrency from "../../../hooks/useCurrentOrgCurrency";
import ShareBillModal from "../ShareBillModal";
import moment from "moment";
import { paymentMethods } from "../../../constants/invoice";
import { RxHamburgerMenu } from "react-icons/rx";
import { IoMdClose } from "react-icons/io";
import BillModal from "../../estimates/list/BillModal";
import { LiaEyeSolid } from "react-icons/lia";
import { MdDeleteOutline } from "react-icons/md";
import AlertModal from "../AlertModal";
import { isAxiosError } from "axios";

function InvalidReceipt({ heading }) {
  return (
    <Flex
      minH={"50svh"}
      gap={3}
      justifyContent={"center"}
      alignItems={"center"}
      flexDir={"column"}
    >
      <HiOutlineNewspaper size={80} color="lightgray" />
      <Heading color={"gray.300"} fontSize={"2xl"}>
        {heading}
      </Heading>
    </Flex>
  );
}

function ReceiptLoader() {
  return (
    <Flex justifyContent={"center"} alignItems={"center"}>
      <Spinner />
    </Flex>
  );
}

function StatAmount(props) {
  const { symbol } = useCurrentOrgCurrency();

  return (
    <Stat>
      <StatLabel>{props.label}</StatLabel>
      <StatNumber>
        {symbol} {props.total}
      </StatNumber>
    </Stat>
  );
}

function ReceiptMainAmounts(props) {
  return (
    <StatGroup>
      <StatAmount total={props.receipt.total} label="Total" />
      <StatAmount total={props.receipt.totalTax} label="Total Tax" />
      <StatAmount
        total={props.receipt.total + props.receipt.totalTax}
        label="GrandTotal"
      />
      {props.receipt.payment ? (
        <StatAmount total={props.receipt.payment?.amount} label="Paid" />
      ) : null}
    </StatGroup>
  );
}

function PartyDisplayReceipt(props) {
  return (
    <Box marginBlock={3}>
      <Text>
        <strong>{props.partyNameLabel}</strong> :{" "}
        <Link
          to={`/${props.receipt.org._id}/parties/${props.receipt.party._id}/transactions`}
        >
          {props.receipt.party?.name}
        </Link>
      </Text>
      <Text>
        <strong>Billing address</strong> : {props.receipt.party?.billingAddress}
      </Text>
      <Text>
        <strong>Shipping address</strong> :{" "}
        {props.receipt.party?.shippingAddress}
      </Text>
      <Text>
        <strong>GST</strong> : {props.receipt.party?.gst}
      </Text>
      <Text>
        <strong>PAN</strong> : {props.receipt.party?.pan}
      </Text>
    </Box>
  );
}

function ReceiptItem(props) {
  return (
    <Grid p={3} gap={2} templateColumns={"4fr 1fr 1fr 1fr 1fr"}>
      <GridItem>
        <Text>{props.item.name}</Text>
        <Text>{props.item.code}</Text>
      </GridItem>
      <GridItem>
        <Text textAlign={"right"}>{props.item.quantity}</Text>
      </GridItem>
      <GridItem>
        <Text textAlign={"right"}>{props.item.price}</Text>
      </GridItem>
      <GridItem>
        <Text textAlign={"right"}>{props.item.tax.name}</Text>
      </GridItem>
      <GridItem>
        <Text textAlign={"right"}>
          {props.item.price * props.item.quantity}
        </Text>
      </GridItem>
    </Grid>
  );
}

function ReceiptPayment(props) {
  const { symbol } = useCurrentOrgCurrency();
  const label = paymentMethods.find(
    (method) => method.value === props.payment.paymentMode
  ).label;
  return (
    <Box>
      <Text>
        <strong>Payment</strong> : Paid {`${symbol} ${props.payment.amount}`} on{" "}
        {moment(props.payment.date).format("LL")} through {label}
      </Text>
    </Box>
  );
}

function ReceiptMenu(props) {
  return (
    <Menu>
      <MenuButton
        size={"sm"}
        as={IconButton}
        aria-label="Options"
        icon={<RxHamburgerMenu />}
        variant="outline"
      />
      <MenuList>
        {props.headerButtons.map((headerButton, index) => (
          <MenuItem
            key={index}
            onClick={headerButton.onClick}
            icon={headerButton.icon}
          >
            {headerButton.label}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
}

function ReceiptItemsHeading(props) {
  return (
    <Grid
      fontWeight={"bold"}
      gap={2}
      bg={props.tableHeader}
      p={5}
      templateColumns={"4fr 1fr 1fr 1fr 1fr"}
    >
      <GridItem>
        <Text textAlign={"center"}>Product</Text>
      </GridItem>
      <GridItem>
        <Text textAlign={"center"}>Quantity</Text>
      </GridItem>
      <GridItem>
        <Text textAlign={"center"}>Price</Text>
      </GridItem>
      <GridItem>
        <Text textAlign={"center"}>Tax</Text>
      </GridItem>
      <GridItem>
        <Text textAlign={"center"}>Total</Text>
      </GridItem>
    </Grid>
  );
}

function ReceiptDisplay({ receipt, meta }) {
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

export default function ReceiptPreview() {
  const { type, id, orgId } = useParams();
  const receiptMetas = {
    invoices: {
      label: "Invoice",
      partyNameLabel: "Bill To",
      receiptHomeAppUrl: `/invoices`,
    },
    quotes: {
      label: "Quotation",
      partyNameLabel: "Quotation To",
      receiptHomeAppUrl: `/estimates`,
    },
    purchaseOrders: {
      label: "Purchase order",
      partyNameLabel: "Order To",
      receiptHomeAppUrl: `/purchaseOrders`,
    },
    proformaInvoices: {
      label: "Proforma Invoice",
      partyNameLabel: "Bill To",
      receiptHomeAppUrl: `/proformaInvoices`,
    },
    purchases: {
      label: "Purchase Invoice",
      partyNameLabel: "Bill From",
      receiptHomeAppUrl: `/purchases`,
    },
  };
  const currentReceiptMeta = receiptMetas[type];
  const [status, setStatus] = useState("loading");
  const [receipt, setReceipt] = useState(null);
  const getReceiptById = async () => {
    try {
      setStatus("loading");
      const { data } = await instance.get(
        `/api/v1/organizations/${orgId}/${type}/${id}`
      );
      setReceipt(data.data);
      setStatus("idle");
    } catch (error) {
      setStatus("notfound");
    }
  };
  useEffect(() => {
    if (!id) {
      setStatus("notfound");
      return;
    }
    getReceiptById();
  }, [id]);
  const isReceiptNotFound = status === "notfound";
  const isLoading = status === "loading";

  return (
    <MainLayout>
      <Box p={4}>
        {isLoading ? (
          <ReceiptLoader />
        ) : currentReceiptMeta ? (
          <Flex justifyContent={"center"} alignItems={"center"}>
            {isReceiptNotFound ? (
              <InvalidReceipt heading={"Not found"} />
            ) : receipt ? (
              <ReceiptDisplay receipt={receipt} meta={currentReceiptMeta} />
            ) : null}
          </Flex>
        ) : (
          <InvalidReceipt heading={"Invalid Type"} />
        )}
      </Box>
    </MainLayout>
  );
}
