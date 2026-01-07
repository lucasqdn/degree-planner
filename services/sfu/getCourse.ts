import { type Course } from '@/engine/types/Course';

type responseData = {
  course: Course;
};

export async function getDepartmentList() {
  const response = await fetch(`http://www.sfu.ca/bin/wcm/course-outlines?current/current/`);
  if (!response.ok) {
    throw new Error(`Failed to fetch course list`);
  }
  const courseList = await response.json();
  return courseList;
}

export async function getCourseList(department: string) {
  const response = await fetch(
    `http://www.sfu.ca/bin/wcm/course-outlines?current/current/${department}/`,
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch course list for department ${department}`);
  }
  const courseList = await response.json();
  return courseList;
}

export async function getCourseInfo(department: string, courseNumber: string) {
  const response = await fetch(
    `http://www.sfu.ca/bin/wcm/course-outlines?current/current/${department}/${courseNumber}`,
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch course info for ${department} ${courseNumber}`);
  }
  const courseInfo = await response.json();
  return courseInfo;
}
