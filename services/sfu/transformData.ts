import { SFUCourseResponse } from '@/engine/types/APIValidationType';
import { CourseWithDetails } from '@/engine/types/Course';

export function transformCourseData(
  dept: string,
  rawCourses: SFUCourseResponse,
  prerequisites: string,
  corequisites: string,
  description: string,
  credits: number,
): CourseWithDetails {
  const id = rawCourses.text;

  return {
    id,
    department: dept,
    name: rawCourses.title || id,
    description: description || '',
    credits: credits || 0,
    prerequisites: prerequisites ? prerequisites.split(',').map((prereq) => prereq.trim()) : [],
    corequisites: corequisites ? corequisites.split(',').map((coreq) => coreq.trim()) : [],
  };
}
