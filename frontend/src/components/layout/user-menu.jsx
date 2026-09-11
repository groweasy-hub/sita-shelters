"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Settings, ShieldCheck, UserRound } from "lucide-react";
import styled from "styled-components";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { focusRing } from "@/components/ui/internal-styles";
import { getRequiredAccessForPath } from "@/config/navigation";
import { meetsAccessRequirement } from "@/config/permissions";
import { useCurrentUser } from "@/features/profile";
import { formatInitials } from "@/lib/formatters";

const accessModuleRequirement = getRequiredAccessForPath("/access/users");

const Avatar = styled.button`
  ${focusRing} display: flex;
  width: 2rem;
  height: 2rem;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.primaryForeground};
  font-size: 0.75rem;
  font-weight: 650;
  cursor: pointer;
  &:hover {
    opacity: 0.9;
  }
`;
const MenuContent = styled(DropdownMenuContent)`
  width: 15rem;
`;
const PersonName = styled.span`
  display: block;
  font-size: 0.875rem;
`;
const Role = styled.span`
  display: block;
  margin-top: 0.125rem;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-weight: 400;
`;

export function UserMenu() {
  const user = useCurrentUser();
  const router = useRouter();
  const canAccessAccessModule =
    Boolean(user) &&
    (!accessModuleRequirement ||
      meetsAccessRequirement(user.role, accessModuleRequirement));

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar aria-label="Open user menu" type="button">
          {user ? formatInitials(user.name) : ""}
        </Avatar>
      </DropdownMenuTrigger>
      <MenuContent align="end">
        <DropdownMenuLabel>
          <PersonName>{user?.name}</PersonName>
          <Role>{user?.designation}</Role>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <UserRound aria-hidden="true" />
            Profile
          </Link>
        </DropdownMenuItem>
        {canAccessAccessModule ? (
          <DropdownMenuItem asChild>
            <Link href="/access/users">
              <ShieldCheck aria-hidden="true" />
              Access &amp; permissions
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem asChild>
          <Link href="/preferences">
            <Settings aria-hidden="true" />
            Preferences
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleSignOut} variant="destructive">
          <LogOut aria-hidden="true" />
          Sign out
        </DropdownMenuItem>
      </MenuContent>
    </DropdownMenu>
  );
}
