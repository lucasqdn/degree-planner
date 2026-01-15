import { SFUCourseResponse, SFUCourseSectionResponse } from '@/engine/types/APIValidationType';
import { getDepartmentList, getCourseList, getCourseSection, getCourseDetail } from './getAPI';
import fs from 'fs/promises';
import { get } from 'http';

// Batch processing utility to limit concurrency
async function batchProcess<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  concurrency: number = 10,
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);
  }
  return results;
}

async function saveToJSON(data: any, filename: string) {}
// Main function to get all courses from all departments
// This function fetches the list of departments, then for each department,
// it fetches the list of courses and aggregates them.
export async function getAllCoursesList() {
  const departments = await getDepartmentList();
  console.log('Departments fetched:', departments.length);

  const successfulDepts: string[] = [];
  const failedDepts: string[] = [];

  const allCourses = await batchProcess(
    // Filtering out departments without a name
    departments.filter((d) => d.name),
    async (dept) => {
      try {
        const courses: SFUCourseResponse[] = await getCourseList(dept.text);
        successfulDepts.push(dept.text); // Track successful fetches
        return courses.map((c) => ({ dept: dept.text, course: c }));
      } catch (error) {
        failedDepts.push(dept.text); // Track failed fetches
        console.error(`Error fetching courses for department ${dept.text}:`, error);
        return [];
      }
    },
    10,
  );

  const flatCourses = allCourses.flat();

  console.log(`Successfully fetched courses for departments: ${successfulDepts.join(', ')}`);
  if (failedDepts.length > 0) {
    console.warn(`Failed to fetch courses for departments: ${failedDepts.join(', ')}`);
  }
  return flatCourses;
}

async function getCourseDetailsWithLec(dept: string, code: string) {
  try {
    const sections: SFUCourseSectionResponse[] = await getCourseSection(dept, code);
    const lecSection = sections.find((section) => section.sectionCode === 'LEC');
    console.log('Lecture Section found', lecSection);
    if (!lecSection) {
      console.warn(`No LEC section found for ${dept} ${code} for current semester`);
      return null;
    }
    const details = await getCourseDetail(dept, code, lecSection.sectionCode);
    return details;
  } catch (error) {
    console.error('Error fetching course details for', dept, code, error);
    return null;
  }
}

export async function getAllCoursesWithDetails() {
  const courses = await getAllCoursesList();
  console.log('Total courses fetched:', courses.length);
  console.log('Fetching course details for each course...');

  const coursesWithDetails = await batchProcess(
    courses,
    async (raw) => {
      const details = await getCourseDetailsWithLec(raw.dept, raw.course.text);
      if (!details) {
        return null;
      }
      return {
        dept: raw.dept,
        code: raw.course.text,
        title: raw.course.title,
        prerequisites: details.info.prerequisites,
        corequisites: details.info.corequisites,
        description: details.info.description,
        units: details.info.units ? parseFloat(details.info.units) : 0,
      };
    },
    5,
  );

  const validCourses = coursesWithDetails.filter((c) => c !== null);
  console.log('Total courses with details fetched:', validCourses.length);
  return validCourses;
}

async function main() {
  const courses = await getAllCoursesList();
  console.log(courses.slice(0, 3));

  const cmptCourses = courses.filter((c) => c.dept === 'CMPT');
  for (const course of cmptCourses) {
    const details = await getCourseDetailsWithLec(course.dept, course.course.text);
  }
  // const getAllCoursesWithDetailsResults = await getAllCoursesWithDetails();
  // console.log(getAllCoursesWithDetailsResults.slice(0, 3));
  // console.log(await getCourseDetail('CMPT', '225', 'D100'));
}

main().catch(console.error);
// console.log(
//   getCourseList('CMPT')
//     .then((data) => console.log(data))
//     .catch(console.error),
// );

// console.log(
//   getCourseSection('CMPT', '225')
//     .then((data) => console.log(data))
//     .catch(console.error),
// );

// console.log(
//   getCourseDetail('CMPT', '225', 'D100')
//     .then((data) => console.log(data))
//     .catch(console.error),
// );
