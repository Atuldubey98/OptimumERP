import {
  Avatar,
  Box,
  Flex,
  Grid,
  Heading,
  IconButton,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import React, { useContext } from "react";
import { AiFillEdit } from "react-icons/ai";
import useAuth from "../../hooks/useAuth";
import useProfileForm from "../../hooks/useProfileForm";
import MainLayout from "../common/main-layout";
import CardWrapper from "./CardWrapper";
import ChangePasswordForm from "./ChangePasswordForm";
import FormModalWrapper from "./FormModalWrapper";
import ProfileForm from "./ProfileForm";
import SettingContext from "../../contexts/SettingContext";

function ProfileInfo(props) {
  const settingContext = useContext(SettingContext);
  const role = settingContext?.role || "";
  return (
    <CardWrapper
      title={"Profile info"}
      subtitle={"Manage your personnel information below."}
      footer={
        <Flex w={"100%"} alignItems={"center"} justifyContent={"flex-end"}>
          <IconButton isRound icon={<AiFillEdit />} onClick={props.onOpen} />
        </Flex>
      }
    >
      <Stack spacing={1}>
        <Flex justifyContent={"flex-start"} alignItems={"center"} gap={8}>
          <Text fontSize={"xs"}>Name</Text> <Text>{props.user?.name}</Text>
        </Flex>
        <Flex justifyContent={"flex-start"} alignItems={"center"} gap={8}>
          <Text fontSize={"xs"}>Email</Text> <Text>{props.user?.email}</Text>
        </Flex>
        <Flex justifyContent={"flex-start"} alignItems={"center"} gap={8}>
          <Text fontSize={"xs"}>Role</Text>{" "}
          <Text textTransform={"capitalize"}>{role}</Text>
        </Flex>
      </Stack>
    </CardWrapper>
  );
}

export default function ProfileSettingsPage() {
  const { user, activePlan } = useAuth();
  const currentPlan = user?.currentPlan ? user?.currentPlan.plan : "free";
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { formik } = useProfileForm({ closeForm: onClose });

  return (
    <MainLayout>
      <Box p={5}>
        <Flex
          w={"100%"}
          maxW={"xl"}
          justifyContent={"center"}
          flexDir={"column"}
          alignItems={"center"}
          m={"auto"}
          gap={5}
        >
          <Avatar name={user ? user.name : ""} size={"xl"} />
          <Grid w={"100%"} gap={3}>
            <Heading fontSize={"2xl"} textAlign={"center"}>
              Welcome, {user ? user.name : ""}
            </Heading>
            <Text textAlign={"center"} fontSize={"sm"}>
              Here you can manage your personnel information.
            </Text>
          </Grid>
          <ProfileInfo user={user} onOpen={onOpen} />

          <CardWrapper
            title={"Password"}
            subtitle={"Here you can change your password"}
          >
            <ChangePasswordForm />
          </CardWrapper>
        </Flex>
        <FormModalWrapper
          isSubmitting={formik.isSubmitting}
          isOpen={isOpen}
          heading="Profile"
          onClose={onClose}
          handleSubmit={formik.handleSubmit}
        >
          <ProfileForm formik={formik} />
        </FormModalWrapper>
      </Box>
    </MainLayout>
  );
}
