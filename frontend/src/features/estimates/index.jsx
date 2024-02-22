import { Button, Flex } from "@chakra-ui/react";
import MainLayout from "../common/main-layout";
import { useNavigate } from "react-router-dom";

export default function EstimatesPage() {
  const navigate = useNavigate();
  const onClickAddNewQuote = () => {
    navigate(`create`);
  };
  return <MainLayout></MainLayout>;
}
