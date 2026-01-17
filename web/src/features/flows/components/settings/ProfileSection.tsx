"use client";

import { Button } from "@/components/ui/button";
import { initialsFor } from "../../lib/flow-utils";

type Props = {
  profileName: string;
  profileEmail: string;
  profileAvatar: React.CSSProperties;
  onSignOut: () => void;
  showInfo: (title: string, msg: string) => void;
};

export function ProfileSection({
  profileName,
  profileEmail,
  profileAvatar,
  onSignOut,
  showInfo,
}: Props) {
  return (
    <section className="bg-panel border border-border rounded-xl shadow-soft overflow-hidden">
      <div className="px-6 py-5 border-b border-border flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text">Profile</h3>
        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-surface2 border border-border text-muted">
          Signed in
        </span>
      </div>
      <div className="p-6 flex items-center gap-4">
        <div
          className="size-12 rounded-full border border-border flex items-center justify-center font-bold"
          style={profileAvatar}
          title={profileEmail || profileName}
        >
          {initialsFor(profileName)}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-text truncate">{profileName}</div>
          <div className="text-xs text-muted truncate">{profileEmail || "—"}</div>
        </div>
        <div className="ml-auto flex items-center gap-3 text-sm">
          <Button
            variant="link"
            className="text-muted hover:text-text p-0 h-auto font-normal"
            onClick={() => showInfo("Profile", "Profile editing is coming soon.")}
          >
            Edit profile
          </Button>
          <Button
            variant="link"
            className="text-red hover:underline p-0 h-auto font-normal"
            onClick={onSignOut}
          >
            Sign out
          </Button>
        </div>
      </div>
    </section>
  );
}
