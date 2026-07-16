import * as teamMemberRepository from "@/lib/repositories/team-member.repository";
import type {
  TeamMemberCreateInput,
  TeamMemberUpdateInput,
} from "@/lib/validators/team-member";

export function listTeamMembers() {
  return teamMemberRepository.findAllTeamMembers();
}

export function getTeamMemberById(id: string) {
  return teamMemberRepository.findTeamMemberById(id);
}

export function createTeamMember(data: TeamMemberCreateInput) {
  return teamMemberRepository.createTeamMember(data);
}

export function updateTeamMember(id: string, data: TeamMemberUpdateInput) {
  return teamMemberRepository.updateTeamMember(id, data);
}

export function deleteTeamMember(id: string) {
  return teamMemberRepository.deleteTeamMember(id);
}

export function swapTeamMemberOrder(firstId: string, secondId: string) {
  return teamMemberRepository.swapTeamMemberOrder(firstId, secondId);
}
