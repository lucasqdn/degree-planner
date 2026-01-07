import { getDepartmentList, getCourseList, getCourseInfo } from '@/services/sfu/getCourse';

async function fetchData(department: string, courseNumber?: string) {
  const departmentList = await getDepartmentList();
  console.log('Department List:', departmentList);

  const courseList = await getCourseList(department);
  console.log('Course List for Department:', courseList);

  const courseInfo = await getCourseInfo(department, courseNumber || '100');
  console.log('Course Info:', courseInfo);
}

fetchData('CMPT', '225').catch((error) => {
  console.error('Error fetching data:', error);
});
