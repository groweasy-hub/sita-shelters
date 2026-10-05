"use client";

import { useRef, useState } from "react";
import { Camera, X } from "lucide-react";
import styled from "styled-components";

import { UserAvatar } from "@/components/shared/user-avatar";
import {
  useRemoveUserAvatar,
  useUploadUserAvatar,
} from "../hooks/use-administration-users";

const Root = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;
const AvatarButton = styled.button`
  position: relative;
  display: inline-flex;
  padding: 0;
  border: none;
  background: none;
  border-radius: ${({ theme }) => theme.radii.pill};
  cursor: pointer;
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;
const CameraBadge = styled.span`
  position: absolute;
  right: -0.125rem;
  bottom: -0.125rem;
  display: inline-flex;
  width: 1.25rem;
  height: 1.25rem;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radii.pill};
  border: 2px solid ${({ theme }) => theme.colors.card};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.background};
  svg {
    width: 0.625rem;
    height: 0.625rem;
  }
`;
const RemoveButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  border: none;
  background: none;
  padding: 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    color: ${({ theme }) => theme.colors.danger};
  }
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
  svg {
    width: 0.75rem;
    height: 0.75rem;
  }
`;
const ErrorText = styled.span`
  color: ${({ theme }) => theme.colors.danger};
  font-size: 0.75rem;
`;

/**
 * The user's avatar, click-to-upload when `canManage`, with a "Remove
 * profile image" action once one exists. Both actions hit Cloudinary via
 * the backend (see `administration-users.js`'s `/avatar` routes).
 */
export function UserAvatarUpload({ canManage, imageUrl, name, userId }) {
  const inputRef = useRef(null);
  const uploadAvatar = useUploadUserAvatar();
  const removeAvatar = useRemoveUserAvatar();
  const [error, setError] = useState("");
  const pending = uploadAvatar.isPending || removeAvatar.isPending;

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file.");
      return;
    }
    setError("");
    uploadAvatar.mutate(
      { userId, file },
      { onError: (err) => setError(err?.message ?? "The image could not be uploaded") },
    );
  }

  return (
    <Root>
      <div>
        <AvatarButton
          aria-label={imageUrl ? "Change profile image" : "Add profile image"}
          disabled={!canManage || pending}
          onClick={() => inputRef.current?.click()}
          type="button"
        >
          <UserAvatar imageUrl={imageUrl} name={name} size="3.25rem" style={{ fontSize: "1rem" }} />
          {canManage ? (
            <CameraBadge>
              <Camera aria-hidden="true" strokeWidth={2} />
            </CameraBadge>
          ) : null}
        </AvatarButton>
        {canManage ? (
          <input
            accept="image/*"
            hidden
            onChange={handleFileChange}
            ref={inputRef}
            type="file"
          />
        ) : null}
      </div>
      {canManage && imageUrl ? (
        <RemoveButton
          disabled={pending}
          onClick={() => {
            setError("");
            removeAvatar.mutate(userId, {
              onError: (err) =>
                setError(err?.message ?? "The image could not be removed"),
            });
          }}
          type="button"
        >
          <X aria-hidden="true" strokeWidth={2} />
          Remove profile image
        </RemoveButton>
      ) : null}
      {error ? <ErrorText role="alert">{error}</ErrorText> : null}
    </Root>
  );
}
