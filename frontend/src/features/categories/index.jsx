import React from "react";
import MainLayout from "../common/main-layout";
import ExpenseCategories from "./ExpenseCategories";
import ItemCategories from "./ItemCategories";
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";

export default function CategoriesPage() {
  const tabs = [
    { label: "Expense", value: "expense", children: <ExpenseCategories /> },
    { label: "Items", value: "product", children: <ItemCategories /> },
  ];
  const navigate = useNavigate();
  const { orgId, type } = useParams();
  const currentIndex = tabs.map((tab) => tab.value).indexOf(type);
  const tabIndex = currentIndex < 0 ? 0 : currentIndex;
  return (
    <MainLayout>
      <Tabs isLazy index={tabIndex}>
        <TabList>
          {tabs.map((tab) => (
            <Tab
              onClick={() => navigate(`/${orgId}/categories/${tab.value}`)}
              key={tab.value}
            >
              {tab.label}
            </Tab>
          ))}
        </TabList>
        <TabPanels>
          {tabs.map((tab) => (
            <TabPanel key={tab.value}>{tab.children}</TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </MainLayout>
  );
}
