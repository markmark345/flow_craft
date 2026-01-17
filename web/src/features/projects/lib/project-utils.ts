import { ProjectMemberDTO } from "@/types/dto";

/**
 * Get initials from project member
 * @param member - Project member DTO
 * @returns Initials (e.g., "JD") or "U" if not found
 */
export function memberInitials(member: ProjectMemberDTO): string {
  const nameValue = (member.user.name || "").trim();
  if (nameValue) {
    const parts = nameValue.split(/\s+/).filter(Boolean);
    return ((parts[0]?.[0] || "") + (parts[1]?.[0] || parts[0]?.[1] || "")).toUpperCase() || "U";
  }
  const email = (member.user.email || "").trim();
  if (email) return email.slice(0, 2).toUpperCase();
  return "U";
}
