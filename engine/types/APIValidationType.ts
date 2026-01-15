import { z } from 'zod';

const SFUDepartmentSchema = z.object({
  text: z.string(),
  name: z.string().optional(),
});
export const SFUDepartmentListSchema = z.array(SFUDepartmentSchema);
export type SFUDepartmentResponse = z.infer<typeof SFUDepartmentSchema>;

const SFUCourseSchema = z.object({
  text: z.string(),
  title: z.string().optional(),
});
export const SFUCourseListSchema = z.array(SFUCourseSchema);
export type SFUCourseResponse = z.infer<typeof SFUCourseSchema>;

export const SFUCourseSectionSchema = z.object({
  text: z.string(),
  classType: z.string().optional(),
  sectionCode: z.string(),
});
export const SFUCourseSectionListSchema = z.array(SFUCourseSectionSchema);
export type SFUCourseSectionResponse = z.infer<typeof SFUCourseSectionSchema>;

export const SFUCourseDetailSchema = z.object({
  info: z.object({
    prerequisites: z.string().optional(),
    corequisites: z.string().optional(),
    description: z.string().optional(),
    units: z.string().optional(),
  }),
});
export type SFUCourseDetailResponse = z.infer<typeof SFUCourseDetailSchema>;
