import * as statRepository from "@/lib/repositories/stat.repository";
import type { StatCreateInput, StatUpdateInput } from "@/lib/validators/stat";

export function listStats() {
  return statRepository.findAllStats();
}

export function getStatById(id: string) {
  return statRepository.findStatById(id);
}

export function createStat(data: StatCreateInput) {
  return statRepository.createStat(data);
}

export function updateStat(id: string, data: StatUpdateInput) {
  return statRepository.updateStat(id, data);
}

export function deleteStat(id: string) {
  return statRepository.deleteStat(id);
}

export function swapStatOrder(firstId: string, secondId: string) {
  return statRepository.swapStatOrder(firstId, secondId);
}
