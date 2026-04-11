import {
    Box,
    Text
} from "@chakra-ui/react";
import useProperty from "../../../hooks/useProperty";
import moment from "moment";
import useCurrentOrgCurrency from "../../../hooks/useCurrentOrgCurrency";
import { useTranslation } from "react-i18next";
export default function ReceiptPayment(props) {
  const { t } = useTranslation("common");
  const { getAmountWithSymbol } = useCurrentOrgCurrency();
  const {value : paymentMethods = []} = useProperty("PAYMENT_METHODS");
  const label = paymentMethods.find(
    (method) => method?.value === props.payment?.paymentMode
  )?.label;
  return (
    <Box>
      <Text>
        <strong>{t("common_ui.receipt.payment")}</strong> : {t(
          "common_ui.receipt.paid_on_through",
          {
            amount: getAmountWithSymbol(props.payment.amount),
            date: moment(props.payment.date).format("LL"),
            method: label,
          }
        )}
      </Text>
    </Box>
  );
}
