"use client";

import styled from "styled-components";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { useUiStore } from "@/stores/ui-store";
import { AppSidebar } from "./app-sidebar";

const MobileSheet = styled(SheetContent)`
  width: 17.5rem;
  max-width: 17.5rem;
  padding: 0;
  border: 0;
`;

export function MobileNavigation() {
  const open = useUiStore((state) => state.mobileNavigationOpen);
  const setOpen = useUiStore((state) => state.setMobileNavigationOpen);
  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <MobileSheet showCloseButton={false} side="left">
        <SheetTitle className="sr-only">Primary navigation</SheetTitle>
        <SheetDescription className="sr-only">
          Navigate between Sita Shelters application modules.
        </SheetDescription>
        <AppSidebar mobile onNavigate={() => setOpen(false)} />
      </MobileSheet>
    </Sheet>
  );
}
