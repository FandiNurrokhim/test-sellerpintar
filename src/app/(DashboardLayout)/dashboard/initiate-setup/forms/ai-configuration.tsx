"use client";

import React, { forwardRef, useImperativeHandle } from "react";

import { AssistantForm } from "./assistant-form";
import { DocumentForm } from "./document-form";
import { TabGroup } from "@/components/organisms/Tab/TabGroup";

export interface AssistantPageRef {
  submitAll: () => Promise<boolean>;
  fetchAllPrev: () => Promise<void>;
}

export interface AssistantRef {
  submitForm: () => Promise<boolean>;
  isLoading: boolean;
  fetchPrevItem?: () => Promise<void>;
}

export interface DocumentFormRef {
  submitForm: () => Promise<boolean>;
  isLoading: boolean;
  fetchPrevItem?: () => Promise<void>;
}

interface AssistantProps {
  onSubmitSuccess?: () => void;
}

export const AssistantPage = forwardRef<AssistantPageRef, AssistantProps>(
  ({ onSubmitSuccess }, ref) => {
    const assistantRef = React.useRef<AssistantRef>(null);
    const documentRef = React.useRef<DocumentFormRef>(null);

    useImperativeHandle(ref, () => ({
      submitAll: async () => {
        const results = await Promise.all([
          assistantRef.current?.submitForm(),
          documentRef.current?.submitForm(),
        ]);
        return results.filter((r) => r !== undefined).every((r) => r === true);
      },

      fetchAllPrev: async () => {
        await Promise.all([
          assistantRef.current?.fetchPrevItem?.(),
          documentRef.current?.fetchPrevItem?.(),
        ]);
      },
    }));

    const tabs = [{ label: "Assistants" }, { label: "Document Stores" }];

    return (
      <TabGroup tabs={tabs}>
        <AssistantForm ref={assistantRef} onSubmitSuccess={onSubmitSuccess} />
        <DocumentForm ref={documentRef} onSubmitSuccess={onSubmitSuccess} />
      </TabGroup>
    );
  }
);

AssistantPage.displayName = "AssistantPage";
