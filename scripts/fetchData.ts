import { getDepartmentList, getCourseList, getCourseInfo } from '@/services/sfu/getCourse';
import { type Department } from '@/engine/types/Department';
import { z } from 'zod';

async function fetchData(department: string, courseNumber?: string) {
  const courseList = await getCourseList(department);
  console.log('Course List for Department:', courseList);

  const courseInfo = await getCourseInfo(department, courseNumber || '100');
  console.log('Course Info:', courseInfo);
}

const SFUDepartmentSchema = z.object({
  text: z.string(),
  value: z.string(),
  name: z.string().optional(),
});

type SFUDepartmentResponse = z.infer<typeof SFUDepartmentSchema>;

const SFUDepartmentListSchema = z.array(SFUDepartmentSchema);

async function validateDepartmentList(): Promise<SFUDepartmentResponse[]> {
  const response = await getDepartmentList();
  console.log('Raw Department List:', response);
  const parsed = SFUDepartmentListSchema.parse(response);
  return parsed;
}

async function main() {
  const rawDepartments = await validateDepartmentList();
  const departments: Department[] = rawDepartments.map((dept) => ({
    code: dept.text,
    name: dept.name ?? dept.text,
  }));
  console.log('Mapped Departments:', departments);
}

main().catch(console.error);
// const rawDepartmentList: SFUDepartmentResponse[] = fetchDepartmentList().then((data) => data);
// const departments: Department[] = rawDepartmentList.map((dept) => ({
//   code: dept.text,
//   name: dept.name,
// }));
// console.log('Mapped Departments:', departments);
