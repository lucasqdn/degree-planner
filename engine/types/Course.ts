// Define CourseID and Course types
export type CourseWithDetails = {
  readonly id: string;
  readonly department: string;
  readonly name: string;
  readonly description: string;
  readonly credits: number;
  readonly prerequisites: readonly string[];
  readonly corequisites: readonly string[];
};

export type RawCourseData = {
  dept: string;
  code: string;
  title: string;
};
interface CourseListMetadata {
  fetchedAt: string;
  department: string;
  fetchType: 'course-list';
  totalCourses: number;
  source: string;
  apiUrl: string;
}

interface CourseListItem {
  code: string;
  title: string | undefined;
}

interface CourseDetailMetadata {
  fetchedAt: string;
  department: string;
  fetchType: 'course-detail';
  totalCourse: number;
  successfulFetches: number;
  failedFetches: number;
  sources: string;
  notes: string;
}

export interface CourseDetailItem {
  code: string;
  title: string | undefined;
  description: string | undefined;
  prerequisites: string | undefined;
  corequisites: string | undefined;
  units: number | undefined;
  hasLectureSection: boolean;
  fetchedSection: string | null;
}

export interface FailedCourse {
  code: string;
  title: string | undefined;
  reason: string | undefined;
}

export interface CourseListJSON {
  metadata: CourseListMetadata;
  courses: CourseListItem[];
}
export interface CourseDetailJSON {
  metadata: CourseDetailMetadata;
  courses: CourseDetailItem[];
  failedCourses: FailedCourse[];
}
