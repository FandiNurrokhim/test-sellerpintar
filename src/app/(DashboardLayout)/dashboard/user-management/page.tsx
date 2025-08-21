"use client";

import React from "react";
import HeaderTitlePage from "@/components/templates/HeaderTitlePage";
import { TabGroup } from "@/components/organisms/Tab/TabGroup";
import UserPage from "@/app/(DashboardLayout)/dashboard/user-management/pages/user";
import RolesPage from "@/app/(DashboardLayout)/dashboard/user-management/pages/role";
import BranchPage from "@/app/(DashboardLayout)/dashboard/user-management/pages/branch";
import BranchRolesPage from "@/app/(DashboardLayout)/dashboard/user-management/pages/branch-roles";

export default function UserManagementPage() {
  const tabs = [{ label: "Users" }, { label: "Roles" }, { label: "Branches" }, { label: "Roles" }];

  return (
    <>
      <HeaderTitlePage
        title="User Management"
        description="Manage your users, roles, and branches efficiently."
      />
      <TabGroup tabs={tabs}>
        <UserPage />
        <RolesPage />
        <BranchPage />
        <BranchRolesPage />
      </TabGroup>
    </>
  );
}
