// Define CourseID and Course types
type CourseID = string;

type Course = {
    readonly id: CourseID;
    readonly prerequisites: readonly CourseID[];
    readonly name: string;
    readonly description: string;
    readonly credits: number;
}

export { type CourseID, type Course };