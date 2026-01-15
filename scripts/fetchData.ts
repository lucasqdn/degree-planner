import {
  getDepartmentList,
  getCourseList,
  getCourseSection,
  getCourseDetail,
} from '@/services/sfu/getAPI';
import { type Department } from '@/engine/types/Department';

async function main() {
  // const rawDepartments = await getDepartmentList();
  // const departments: Department[] = rawDepartments.map((dept) => ({
  //   code: dept.text,
  //   name: dept.name ?? dept.text,
  // }));
  // console.log('Mapped Departments:', departments);
  console.log(await getCourseDetail('CMPT', '225', 'D100'));
}

main().catch(console.error);
