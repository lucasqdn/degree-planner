import { SFUCourseResponse } from '@/engine/types/APIValidationType';
import { getDepartmentList, getCourseList, getCourseSection, getCourseDetail } from './getAPI';
import {
  CourseListJSON,
  CourseDetailJSON,
  CourseDetailItem,
  FailedCourse,
} from '@/engine/types/Course';
import fs from 'fs/promises';
import path, { parse } from 'path';

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

async function saveToJSON(data: any, filename: string, subdir?: string) {
  const dataDir = subdir
    ? path.join(process.cwd(), 'data', subdir)
    : path.join(process.cwd(), 'data');

  await fs.mkdir(dataDir, { recursive: true });

  const filepath = path.join(dataDir, filename);
  // const metadata = {
  //   fetchedAt: new Date().toISOString(),
  // };
  await fs.writeFile(filepath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`Data saved to ${filepath}`);
}

// Main function to get all courses from all departments
// This function fetches the list of departments, then for each department,
// it fetches the list of courses and aggregates them.
export async function getCourseListForDepartment(department: string): Promise<CourseListJSON> {
  console.log('Fetching courses for department:', department);
  const courses: SFUCourseResponse[] = await getCourseList(department);

  const courseListJSON: CourseListJSON = {
    metadata: {
      fetchedAt: new Date().toISOString(),
      department: department,
      fetchType: 'course-list',
      totalCourses: courses.length,
      source: 'SFU Course Outlines API',
      apiUrl: `http://www.sfu.ca/bin/wcm/course-outlines?current/current/${department}/`,
    },
    courses: courses.map((course) => ({
      code: course.text,
      title: course.title,
    })),
  };
  await saveToJSON(courseListJSON, `${department.toLowerCase()}-course-list.json`, 'courses');
  return courseListJSON;
}

export async function getAllCoursesList(): Promise<Map<string, CourseListJSON>> {
  console.log('\nFetching all course lists...\n');

  const departments = await getDepartmentList();
  console.log('Departments fetched:', departments.length);

  const successfulDepts: string[] = [];
  const failedDepts: string[] = [];
  const courseListMap = new Map<string, CourseListJSON>();

  const results = await batchProcess(
    departments.filter((d) => d.name), // Filtering out departments without a name
    async (dept) => {
      try {
        const courseList = await getCourseListForDepartment(dept.text);
        successfulDepts.push(dept.text);
        return { success: true, department: dept.text, data: courseList };
      } catch (error) {
        failedDepts.push(dept.text);
        console.error(`Error fetching courses for department ${dept.text}:`, error);
        return { success: false, department: dept.text, data: null };
      }
    },
    5,
  );

  results.forEach((result) => {
    if (result.success && result.data) {
      courseListMap.set(result.department, result.data);
    }
  });

  console.log(`Successfully fetched courses for departments: ${successfulDepts.join(', ')}`);
  if (failedDepts.length > 0) {
    console.warn(`Failed to fetch courses for departments: ${failedDepts.join(', ')}`);
  }
  return courseListMap;
}

async function fetchAndSaveCourseDetails(
  department: string,
  courseList?: CourseListJSON,
): Promise<CourseDetailJSON> {
  console.log(`Fetching course details for department: ${department}`);

  if (!courseList) {
    console.log('No course list provided, fetching course list from API');
    courseList = await getCourseListForDepartment(department);
  }

  const detailedCourses: CourseDetailItem[] = [];
  const failedCourses: FailedCourse[] = [];
  let processed = 0;

  const results = await batchProcess(
    courseList.courses,
    async (course) => {
      processed++;
      try {
        const sections = await getCourseSection(department, course.code);
        const lecSection = sections.find((s) => s.sectionCode === 'LEC');

        if (!lecSection) {
          console.warn('No lecture section found for', department, course.code);
          return {
            success: false,
            course: course,
            reason: 'No lecture section found',
          };
        }
        const details = await getCourseDetail(department, course.code, lecSection.text);
        return {
          success: true,
          course: {
            code: course.code,
            title: course.title,
            description: details.info.description || null,
            units: details.info.units ? parseFloat(details.info.units) : null,
            prerequisites: details.info.prerequisites || null,
            corequisites: details.info.corequisites || null,
            hasLectureSection: true,
            fetchedSection: lecSection.text,
          },
        };
      } catch (error) {
        console.error(`Error fetching details for ${department} ${course.code}:`, error);
        return {
          success: false,
          course: course,
          reason: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    },
    3,
  );

  results.forEach((result) => {
    if (result.success && 'course' in result && result.course) {
      detailedCourses.push(result.course as CourseDetailItem);
    } else if (!result.success && 'course' in result && 'reason' in result) {
      failedCourses.push({
        code: result.course.code,
        title: result.course.title,
        reason: result.reason,
      });
    }
  });

  const courseDetailJSON: CourseDetailJSON = {
    metadata: {
      fetchedAt: new Date().toISOString(),
      department: department,
      fetchType: 'course-detail',
      totalCourse: courseList.courses.length,
      successfulFetches: detailedCourses.length,
      failedFetches: failedCourses.length,
      sources: 'SFU Course Outlines API',
      notes:
        failedCourses.length > 0
          ? 'Some courses failed to fetch details'
          : 'All courses fetched successfully',
    },
    courses: detailedCourses,
    failedCourses: failedCourses,
  };

  await saveToJSON(
    courseDetailJSON,
    `${department.toLowerCase()}-course-details.json`,
    'course-details',
  );
  console.log(
    `Finished fetching details for department: ${department}. Successful: ${detailedCourses.length}, Failed: ${failedCourses.length}`,
  );
  return courseDetailJSON;
}

async function main() {
  const department = 'CMPT';
  try {
    const courseList = await getCourseListForDepartment(department);
    const courseDetails = await fetchAndSaveCourseDetails(department, courseList);
    console.log(
      `Course details fetched for ${department}: ${courseDetails.courses.length} successful, ${courseDetails.failedCourses.length} failed.`,
    );
  } catch (error) {
    console.error('Error in main:', error);
    process.exit(1);
  }
}
main().catch(console.error);
