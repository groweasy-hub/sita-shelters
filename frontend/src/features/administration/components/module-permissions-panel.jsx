"use client";

import {
  Activity,
  ArrowLeftRight,
  BarChart3,
  Boxes,
  Building2,
  ClipboardList,
  LayoutDashboard,
  PackageCheck,
  PackageMinus,
  RotateCcw,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Users,
  Warehouse,
  Wrench,
} from "lucide-react";

import { PermissionGroup } from "@/components/shared/permission-state";
import { PERMISSION_MODULES } from "@/config/permissions";
import { resolvePermissionState } from "@/lib/access-resolution";

const moduleIcons = {
  dashboard: LayoutDashboard,
  projects: Building2,
  materials: Boxes,
  inventory: Warehouse,
  indents: ClipboardList,
  procurement: ShoppingCart,
  inward: PackageCheck,
  "quality-control": ShieldCheck,
  "material-issues": PackageMinus,
  consumption: Activity,
  returns: RotateCcw,
  "stock-transfers": ArrowLeftRight,
  vendors: Users,
  resources: Wrench,
  reports: BarChart3,
  administration: Settings,
};

export function ModulePermissionsPanel({ overrides, primaryRole, secondaryRoles }) {
  return (
    <div>
      {PERMISSION_MODULES.map((group, index) => {
        const states = group.permissions.map((permission) =>
          resolvePermissionState({ primaryRole, secondaryRoles, overrides }, permission),
        );
        const granted = states.filter(
          ({ state }) => state === "granted" || state === "inherited",
        ).length;
        return (
          <PermissionGroup
            group={group}
            granted={granted}
            icon={moduleIcons[group.id]}
            key={group.id}
            open={index === 0}
            resolvePermission={(permission) =>
              resolvePermissionState({ primaryRole, secondaryRoles, overrides }, permission)
            }
          />
        );
      })}
    </div>
  );
}
