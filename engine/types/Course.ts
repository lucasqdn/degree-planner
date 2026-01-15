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
