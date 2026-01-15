import {
  SFUDepartmentResponse,
  SFUDepartmentListSchema,
  SFUCourseListSchema,
  SFUCourseResponse,
  SFUCourseSectionResponse,
  SFUCourseSectionListSchema,
  SFUCourseDetailResponse,
  SFUCourseDetailSchema,
} from '@/engine/types/APIValidationType';

export async function getDepartmentList(): Promise<SFUDepartmentResponse[]> {
  const response = await fetch(`http://www.sfu.ca/bin/wcm/course-outlines?current/current/`);
  if (!response.ok) {
    throw new Error(`Failed to fetch course list`);
  }
  const courseList = await response.json();
  const parsed = SFUDepartmentListSchema.parse(courseList);
  return parsed;
}

export async function getCourseList(department: string): Promise<SFUCourseResponse[]> {
  const response = await fetch(
    `http://www.sfu.ca/bin/wcm/course-outlines?current/current/${department}/`,
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch course list for department ${department}`);
  }
  const courseList = await response.json();
  const parsed = SFUCourseListSchema.parse(courseList);
  return parsed;
}

export async function getCourseSection(
  department: string,
  courseNumber: string,
): Promise<SFUCourseSectionResponse[]> {
  const response = await fetch(
    `http://www.sfu.ca/bin/wcm/course-outlines?current/current/${department}/${courseNumber}`,
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch course info for ${department} ${courseNumber}`);
  }
  const courseInfo = await response.json();
  const parsed = SFUCourseSectionListSchema.parse(courseInfo);
  return parsed;
}

export async function getCourseDetail(
  department: string,
  courseNumber: string,
  sectionCode: string,
): Promise<SFUCourseDetailResponse> {
  const response = await fetch(
    `http://www.sfu.ca/bin/wcm/course-outlines?current/current/${department}/${courseNumber}/${sectionCode}`,
  );
  if (!response.ok) {
    throw new Error(
      `Failed to fetch course detail for ${department} ${courseNumber} ${sectionCode}`,
    );
  } else {
    console.log('Fetched course detail for', department, courseNumber, sectionCode);
  }
  const courseDetail = await response.json();
  const parsed = SFUCourseDetailSchema.parse(courseDetail);
  return parsed;
}
