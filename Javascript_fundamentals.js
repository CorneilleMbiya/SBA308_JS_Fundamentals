

/**
 * Represents a course with an ID and name.
 * @typedef {Object} CourseInfo
 * @property {number} id - The unique identifier for the course.
 * @property {string} name - The name of the course.
 */
 
/**
 * Represents an assignment group with an ID, name, weight, and assignments.
 * @typedef {Object} AssignmentGroup
 * @property {number} id - The unique identifier for the assignment group.
 * @property {string} name - The name of the assignment group.
 * @property {number} group_weight - The weight of the assignment group.
 * @property {Array<AssignmentInfo>} assignments - The list of assignments in the group.
 */
 
/**
 * Represents an assignment with an ID, name, due date, and possible points.
 * @typedef {Object} AssignmentInfo
 * @property {number} id - The unique identifier for the assignment.
 * @property {string} name - The name of the assignment.
 * @property {string} due_at - The due date of the assignment in ISO format.
 * @property {number} points_possible - The total points possible for the assignment.
 */
 
/**
 * Represents a learner's submission for an assignment.
 * @typedef {Object} LearnerSubmission
 * @property {number} learner_id - The unique identifier for the learner.
 * @property {number} assignment_id - The unique identifier for the assignment.
 * @property {Object} submission - The submission details.
 * @property {string} submission.submitted_at - The submission date in ISO format.
 * @property {number} submission.score - The score received for the submission.
 */
 
/**
 * Retrieves learner data based on course, assignment group, and submissions.
 *
 * @param {CourseInfo} course - The course information.
 * @param {AssignmentGroup} assignmentGroup - The assignment group information.
 * @param {Array<LearnerSubmission>} submissions - The array of learner submissions.
 * @returns {Array<Object>} An array of objects containing assignment results and averages.
 * @throws {Error} Throws an error if the assignment group does not belong to the course or if there are data validation issues.
 */
function getLearnerData(course, assignmentGroup, submissions) {
    // Validate course ID
    if (assignmentGroup.course_id !== course.id) {
        throw new Error("Invalid assignment group: does not belong to the specified course.");
    }
 
    const results = [];
 
    // Iterate over each assignment in the assignment group
    for (const assignment of assignmentGroup.assignments) {
        try {
            // Validate assignment points
            if (typeof assignment.points_possible !== 'number' || assignment.points_possible <= 0) {
                throw new Error(`Invalid points_possible for assignment ${assignment.name}. Must be a positive number.`);
            }
 
            // Check if the assignment is due
            const dueDate = new Date(assignment.due_at);
            if (dueDate > new Date()) {
                continue; // Skip assignments that are not yet due
            }
 
            // Find the learner's submission for this assignment
            const submission = submissions.find(sub => sub.assignment_id === assignment.id);
            let score = 0;
 
            if (submission) {
                // Check if the submission is late
                const submittedAt = new Date(submission.submission.submitted_at);
                if (submittedAt > dueDate) {
                    score = submission.submission.score * 0.9; // Deduct 10% for late submission
                } else {
                    score = submission.submission.score;
                }
            }
 
            // Store the result for this assignment
            results.push({
                assignment_id: assignment.id,
                assignment_name: assignment.name,
                points_possible: assignment.points_possible,
                score: score,
                submitted_at: submission ? submission.submission.submitted_at : null,
                due_at: assignment.due_at
            });
        } catch (error) {
            console.error(`Error processing assignment ${assignment.name}: ${error.message}`);
        }
    }
 
    return results;
}
 
// Example usage
const course = { id: 1, name: "Mathematics" };
const assignmentGroup = {
    id: 1,
    name: "Homework",
    group_weight: 20,
    assignments: [
        { id: 1, name: "Algebra", due_at: "2023-10-01T23:59:59Z", points_possible: 100 },
        { id: 2, name: "Geometry", due_at: "2023-10-05T23:59:59Z", points_possible: 0 }, // Invalid points
        { id: 3, name: "Calculus", due_at: "2023-10-10T23:59:59Z", points_possible: 50 }
    ],
    course_id: 1
};
 
const submissions = [
    { learner_id: 1, assignment_id: 1, submission: { submitted_at: "2023-09-30T12:00:00Z", score: 90 } },
    { learner_id: 1, assignment_id: 3, submission: { submitted_at: "2023-10-11T12:00:00Z", score: 40 } } // Late submission
];
 
try {
    const learnerData = getLearnerData(course, assignmentGroup, submissions);
    console.log(learnerData);
} catch (error) {
    console.error(error.message);
}