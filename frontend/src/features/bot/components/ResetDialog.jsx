import React from "react";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
} from "@chakra-ui/react";

const ResetDialog = ({ isOpen, onClose, onConfirm, cancelRef, isClearing, widgetBg, widgetBorder }) => (
  <AlertDialog
    isOpen={isOpen}
    leastDestructiveRef={cancelRef}
    onClose={onClose}
    isCentered
  >
    <AlertDialogOverlay>
      <AlertDialogContent borderRadius="xl" mx={4} bg={widgetBg} border="1px solid" borderColor={widgetBorder}>
        <AlertDialogHeader fontSize="lg" fontWeight="bold">
          Reset Conversation
        </AlertDialogHeader>

        <AlertDialogBody fontSize="sm">
          Are you sure you want to clear all messages? This action cannot be undone.
        </AlertDialogBody>

        <AlertDialogFooter>
          <Button ref={cancelRef} onClick={onClose} size="sm" variant="ghost">
            Cancel
          </Button>
          <Button colorScheme="red" onClick={onConfirm} ml={3} size="sm" isLoading={isClearing}>
            Clear Chat
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialogOverlay>
  </AlertDialog>
);

export default ResetDialog;
