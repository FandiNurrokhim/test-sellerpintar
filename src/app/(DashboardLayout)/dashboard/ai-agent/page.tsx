"use client";

import React from "react";
import { TabGroup } from "@/components/organisms/Tab/TabGroup";

import HeaderTitlePage from "@/components/templates/HeaderTitlePage";

import AssistantPage from "@/app/(DashboardLayout)/dashboard/ai-agent/pages/assistant";
import DocumentPage from "@/app/(DashboardLayout)/dashboard/ai-agent/pages/document";

export default function AiAgentPage() {
  const tabs = [{ label: "Assistants" }, { label: "Document Stores" }];
  return (
    <>
      <HeaderTitlePage
        title="AI Agent Management"
        description="Manage your AI assistants and their configurations."
      />

      <TabGroup tabs={tabs}>
        <AssistantPage />
        <DocumentPage />
      </TabGroup>
    </>
  );
}
