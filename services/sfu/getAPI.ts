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

const FETCH_TIMEOUT_MS = 15_000;

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

function validateParam(value: string, name: string): void {
  if (!value.trim()) {
    throw new Error(`Invalid parameter: ${name} must not be empty`);
  }
  if (/[/?#]/.test(value)) {
    throw new Error(`Invalid parameter: ${name} contains illegal characters`);
  }
}

export async function getDepartmentList(): Promise<SFUDepartmentResponse[]> {
  const url = `http://www.sfu.ca/bin/wcm/course-outlines?current/current/`;
  const response = await fetchWithTimeout(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch department list (HTTP ${response.status})`);
  }
  const raw = await response.json();
  const result = SFUDepartmentListSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(`Invalid department list response from ${url}: ${result.error.message}`);
  }
  return result.data;
}

export async function getCourseList(department: string): Promise<SFUCourseResponse[]> {
  validateParam(department, 'department');
  const url = `http://www.sfu.ca/bin/wcm/course-outlines?current/current/${department}/`;
  const response = await fetchWithTimeout(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch course list for department ${department} (HTTP ${response.status})`,
    );
  }
  const raw = await response.json();
  const result = SFUCourseListSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(
      `Invalid course list response for ${department} from ${url}: ${result.error.message}`,
    );
  }
  return result.data;
}

export async function getCourseSection(
  department: string,
  courseNumber: string,
): Promise<SFUCourseSectionResponse[]> {
  validateParam(department, 'department');
  validateParam(courseNumber, 'courseNumber');
  const url = `http://www.sfu.ca/bin/wcm/course-outlines?current/current/${department}/${courseNumber}`;
  const response = await fetchWithTimeout(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch sections for ${department} ${courseNumber} (HTTP ${response.status})`,
    );
  }
  const raw = await response.json();
  const result = SFUCourseSectionListSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(
      `Invalid section list response for ${department} ${courseNumber} from ${url}: ${result.error.message}`,
    );
  }
  return result.data;
}

export async function getCourseDetail(
  department: string,
  courseNumber: string,
  sectionCode: string,
): Promise<SFUCourseDetailResponse> {
  validateParam(department, 'department');
  validateParam(courseNumber, 'courseNumber');
  validateParam(sectionCode, 'sectionCode');
  const url = `http://www.sfu.ca/bin/wcm/course-outlines?current/current/${department}/${courseNumber}/${sectionCode}`;
  const response = await fetchWithTimeout(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch course detail for ${department} ${courseNumber} ${sectionCode} (HTTP ${response.status})`,
    );
  }
  const raw = await response.json();
  const result = SFUCourseDetailSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(
      `Invalid course detail response for ${department} ${courseNumber} ${sectionCode} from ${url}: ${result.error.message}`,
    );
  }
  return result.data;
}
