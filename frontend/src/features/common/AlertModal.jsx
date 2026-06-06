import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

export default function AlertModal({
  isOpen,
  onClose,
  confirmDisable = false,
  header,
  body,
  onConfirm,
  buttonLabel,
  colorScheme,
}) {
  const { t } = useTranslation("common");
  const resolvedButtonLabel = buttonLabel || t("common_ui.actions.delete");
  const resolvedColorScheme =
    colorScheme ||
    (resolvedButtonLabel === t("common_ui.actions.delete") ? "red" : "blue");

  return (
    <AlertDialog isOpen={isOpen} onClose={onClose}>
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            {header}
          </AlertDialogHeader>

          <AlertDialogBody>{body}</AlertDialogBody>

          <AlertDialogFooter>
            <Button onClick={onClose}>{t("common_ui.actions.cancel")}</Button>
            <Button
              isLoading={confirmDisable}
              colorScheme={resolvedColorScheme}
              onClick={onConfirm}
              ml={3}
            >
              {resolvedButtonLabel}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}
