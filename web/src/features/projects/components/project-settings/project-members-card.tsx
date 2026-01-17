"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/cn";
import { ProjectMemberDTO } from "@/types/dto";

type MemberRole = "admin" | "member";

import { memberInitials } from "../../lib/project-utils";

type Props = {
  addingMember: boolean;
  isAdmin: boolean;
  memberIdentifier: string;
  memberRole: MemberRole;
  members: ProjectMemberDTO[];
  onAddMember: () => void;
  onMemberIdentifierChange: (value: string) => void;
  onMemberRoleChange: (value: MemberRole) => void;
  onRemoveMember: (userId: string) => void;
};

export function ProjectMembersCard({
  addingMember,
  isAdmin,
  memberIdentifier,
  memberRole,
  members,
  onAddMember,
  onMemberIdentifierChange,
  onMemberRoleChange,
  onRemoveMember,
}: Props) {
  const inviteDisabled = !isAdmin || addingMember || !memberIdentifier.trim();

  return (
    <section className="bg-panel border border-border rounded-xl shadow-soft overflow-hidden">
      <div className="px-6 py-5 border-b border-border">
        <h2 className="text-lg font-semibold text-text">Project Members</h2>
        <p className="text-xs text-muted mt-1">Manage who has access to this project.</p>
      </div>
      <div className="p-6 space-y-6">
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (!inviteDisabled) {
              onAddMember();
            }
          }}
        >
          <Label className="text-xs font-semibold text-muted">Invite members</Label>
          <div className="relative">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-muted" />
            <Input
              value={memberIdentifier}
              onChange={(event) => onMemberIdentifierChange(event.target.value)}
              className="h-10 rounded-lg bg-surface2 pl-9 pr-24"
              placeholder="Add users by email..."
            />
            <Button
              type="submit"
              size="sm"
              disabled={inviteDisabled}
              className="absolute right-1 top-1 h-8 px-3 text-xs rounded-md"
            >
              {addingMember ? "Inviting..." : "Invite"}
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="text-xs font-semibold text-muted">Role</div>
            <Select
              value={memberRole}
              onChange={(value) => onMemberRoleChange(value as MemberRole)}
              options={[
                { value: "member", label: "Member" },
                { value: "admin", label: "Admin" },
              ]}
              className={cn("sm:w-[200px]", !isAdmin ? "opacity-60 pointer-events-none" : "")}
            />
          </div>
        </form>

        <div className="border border-border rounded-xl overflow-hidden">
          <Table>
            <TableHeader className="bg-surface2">
              <TableRow className="hover:bg-surface2 border-border">
                <TableHead className="px-6 py-3 h-auto text-xs uppercase font-semibold text-muted">User</TableHead>
                <TableHead className="px-6 py-3 h-auto text-xs uppercase font-semibold text-muted text-right">Role</TableHead>
                <TableHead className="px-6 py-3 h-auto w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell className="px-6 py-6 text-sm text-muted text-center" colSpan={3}>
                    No members yet.
                  </TableCell>
                </TableRow>
              ) : (
                members.map((member) => {
                  const roleLabel = member.role === "admin" ? "Admin" : "Member";
                  const roleClass =
                    member.role === "admin"
                      ? "border-[color-mix(in_srgb,var(--accent)_30%,transparent)] bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-accent"
                      : "border-border bg-surface2 text-muted";
                  return (
                    <TableRow key={member.user.id} className="border-border hover:bg-surface2/50">
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-full bg-surface2 border border-border flex items-center justify-center text-xs font-semibold text-muted">
                            {memberInitials(member)}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-text truncate">
                              {member.user.name || member.user.email}
                            </div>
                            <div className="text-xs text-muted truncate">{member.user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <span
                          className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
                            roleClass
                          )}
                        >
                          {roleLabel}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <IconButton
                          icon="close"
                          size="sm"
                          disabled={!isAdmin}
                          className="text-muted hover:text-red"
                          onClick={() => onRemoveMember(member.user.id)}
                          title="Remove member"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}

