import * as departmentRepository from "@/lib/repositories/department.repository";
import type {
  DepartmentCreateInput,
  DepartmentUpdateInput,
} from "@/lib/validators/department";

export function listDepartments() {
  return departmentRepository.findAllDepartments();
}

export function listDepartmentsWithMembers() {
  return departmentRepository.findDepartmentsWithMembers();
}

export function getDepartmentById(id: string) {
  return departmentRepository.findDepartmentById(id);
}

export function createDepartment(data: DepartmentCreateInput) {
  return departmentRepository.createDepartment(data);
}

export function updateDepartment(id: string, data: DepartmentUpdateInput) {
  return departmentRepository.updateDepartment(id, data);
}

export function deleteDepartment(id: string) {
  return departmentRepository.deleteDepartment(id);
}

export function swapDepartmentOrder(firstId: string, secondId: string) {
  return departmentRepository.swapDepartmentOrder(firstId, secondId);
}
