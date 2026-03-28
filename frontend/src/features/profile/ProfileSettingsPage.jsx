import {
  Avatar,
  Box,
  Flex,
  Grid,
  Heading,
  IconButton,
  Input,
  Stack,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import React, { useContext, useRef, useState } from "react";
import { AiFillEdit } from "react-icons/ai";
import useAuth from "../../hooks/useAuth";
import useProfileForm from "../../hooks/useProfileForm";
import MainLayout from "../common/main-layout";
import CardWrapper from "./CardWrapper";
import ChangePasswordForm from "./ChangePasswordForm";
import FormModalWrapper from "./FormModalWrapper";
import ProfileForm from "./ProfileForm";
import SettingContext from "../../contexts/SettingContext";
import { MdDelete, MdOutlineFileUpload } from "react-icons/md";
import instance from "../../instance";
import { isAxiosError } from "axios";
import useStorageUtil from "../../hooks/useStorageUtil";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation } from "react-i18next";

function ProfileInfo(props) {
  const settingContext = useContext(SettingContext);
  const auth = useAuth();
  const plan = auth?.user?.currentPlan?.plan;
  const role = settingContext?.role || "";
  const { t } = useTranslation("user");
  return (
    <CardWrapper
      title={t("user_ui.profile.profile_info_title")}
      subtitle={t("user_ui.profile.profile_info_subtitle")}
      footer={
        <Flex w={"100%"} alignItems={"center"} justifyContent={"flex-end"}>
          <IconButton isRound icon={<AiFillEdit />} onClick={props.onOpen} />
        </Flex>
      }
    >
      <Stack spacing={1}>
        <Flex justifyContent={"flex-start"} alignItems={"center"} gap={8}>
          <Text fontSize={"xs"}>{t("user_ui.profile.field_name")}</Text> <Text>{props.user?.name}</Text>
        </Flex>
        <Flex justifyContent={"flex-start"} alignItems={"center"} gap={8}>
          <Text fontSize={"xs"}>{t("user_ui.profile.field_email")}</Text> <Text>{props.user?.email}</Text>
        </Flex>
        <Flex justifyContent={"flex-start"} alignItems={"center"} gap={8}>
          <Text fontSize={"xs"}>{t("user_ui.profile.field_role")}</Text>{" "}
          <Text textTransform={"capitalize"}>{role}</Text>
        </Flex>
        <Flex justifyContent={"flex-start"} alignItems={"center"} gap={8}>
          <Text fontSize={"xs"}>{t("user_ui.profile.field_plan")}</Text>{" "}
          <Text textTransform={"capitalize"}>{plan}</Text>
        </Flex>
      </Stack>
    </CardWrapper>
  );
}

export default function ProfileSettingsPage() {
  const { t } = useTranslation("user");
  const { user, fetchUserDetails } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { formik } = useProfileForm({ closeForm: onClose });
  const profileLogoRef = useRef(null);
  const toast = useToast();
  const [status, setStatus] = useState("idle");
  const onUploadFile = async (e) => {
    try {
      setStatus("uploading");
      const file = e.currentTarget.files[0];
      if (!file) return;
      const form = new FormData();
      form.append("avatar", file);
      await instance.post("/api/v1/users/avatar", form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      await fetchUserDetails();
      toast({
        title: t("user_ui.profile.toast_upload_title"),
        description: t("user_ui.profile.toast_upload_description"),
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: t("user_ui.profile.toast_error_title"),
        description: isAxiosError(error)
          ? error?.response?.data?.message
          : t("user_ui.profile.toast_error_fallback"),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setStatus("idle");
    }
  };
  const { getFileUrl } = useStorageUtil();
  const avatar = getFileUrl(user?.avatar);
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
          <Avatar name={user?.name} src={avatar} size={"xl"} />
          <Grid w={"100%"} gap={3}>
            <Heading fontSize={"2xl"} textAlign={"center"}>
              {t("user_ui.profile.page_heading", { name: user ? user.name : "" })}
            </Heading>
            <Text textAlign={"center"} fontSize={"sm"}>
              {t("user_ui.profile.page_subtitle")}
            </Text>
          </Grid>
          <ProfileInfo user={user} onOpen={onOpen} />
          <CardWrapper
            title={t("user_ui.profile.language_title")}
            subtitle={t("user_ui.profile.language_subtitle")}
          >
            <LanguageSwitcher />
          </CardWrapper>

          <CardWrapper
            title={t("user_ui.profile.password_title")}
            subtitle={t("user_ui.profile.password_subtitle")}
          >
            <ChangePasswordForm />
          </CardWrapper>
        </Flex>
        <FormModalWrapper
          isSubmitting={formik.isSubmitting}
          isOpen={isOpen}
          heading={t("user_ui.profile.modal_heading")}
          onClose={onClose}
          handleSubmit={formik.handleSubmit}
        >
          <Flex
            gap={2}
            justifyContent={"center"}
            alignItems={"center"}
            flexDir={"column"}
            margin={"auto"}
          >
            <Avatar
              margin={"auto"}
              size={"2xl"}
              name={user?.name}
              src={avatar}
            />
            <Flex gap={3} justifyContent={"center"} alignItems={"center"}>
              <Input
                ref={profileLogoRef}
                type="file"
                accept="image/*"
                display={"none"}
                onChange={onUploadFile}
              />
              <IconButton
                size={"sm"}
                isLoading={status === "uploading"}
                colorScheme="yellow"
                icon={<MdOutlineFileUpload />}
                onClick={() => profileLogoRef.current.click()}
              />
              {user?.avatar && (
                <IconButton
                  size={"sm"}
                  isLoading={status === "removing"}
                  colorScheme="red"
                  variant={"outline"}
                  icon={<MdDelete />}
                  onClick={async () => {
                    try {
                      setStatus("removing");
                      await instance.delete("/api/v1/users/avatar");
                      await fetchUserDetails();
                    } catch (error) {
                      toast({
                        title: t("user_ui.profile.toast_error_title"),
                        description: isAxiosError(error)
                          ? error?.response?.data?.message
                          : t("user_ui.profile.toast_error_fallback"),
                        status: "error",
                        duration: 3000,
                        isClosable: true,
                      });
                    } finally {
                      setStatus("idle");
                    }
                  }}
                />
              )}
            </Flex>
          </Flex>

          <ProfileForm formik={formik} />
        </FormModalWrapper>
      </Box>
    </MainLayout>
  );
}
