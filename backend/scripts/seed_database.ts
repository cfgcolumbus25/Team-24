import pool from '../DataBase/Connection/db';
import { mockSchools } from '../DataBase/mock-data';

async function seedDatabase() {
    console.log('Starting database seed...');

    try {
        //insert schools
        for (const school of mockSchools) {
            console.log(`Inserting school: ${school.name}`);

            //insert school into database
            const schoolResult = await pool.query(
                `INSERT INTO schools (id, name, address, city, state, zip, latitude, longitude, website_url, registrar_email)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                     ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                                             address = EXCLUDED.address,
                                             city = EXCLUDED.city,
                                             state = EXCLUDED.state,
                                             zip = EXCLUDED.zip,
                                             latitude = EXCLUDED.latitude,
                                             longitude = EXCLUDED.longitude,
                                             website_url = EXCLUDED.website_url,
                                             registrar_email = EXCLUDED.registrar_email
                                             RETURNING id`,
                [
                    school.id,
                    school.name,
                    school.address,
                    school.city,
                    school.state,
                    school.zip,
                    school.latitude,
                    school.longitude,
                    school.websiteUrl,
                    school.registrarEmail
                ]
            );

            //get school id from result
            const schoolId = schoolResult.rows[0].id;

            //insert policies for this school
            for (const policy of school.policies) {
                await pool.query(
                    `INSERT INTO school_policies (id, school_id, exam_id, min_score, course_code, course_name, credits, is_general_credit, notes, is_updated, updated_at)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                         ON CONFLICT (id) DO UPDATE SET
                        school_id = EXCLUDED.school_id,
                                                 exam_id = EXCLUDED.exam_id,
                                                 min_score = EXCLUDED.min_score,
                                                 course_code = EXCLUDED.course_code,
                                                 course_name = EXCLUDED.course_name,
                                                 credits = EXCLUDED.credits,
                                                 is_general_credit = EXCLUDED.is_general_credit,
                                                 notes = EXCLUDED.notes,
                                                 is_updated = EXCLUDED.is_updated,
                                                 updated_at = EXCLUDED.updated_at`,
                    [
                        policy.id,
                        schoolId,
                        policy.examId,
                        policy.minScore,
                        policy.courseCode,
                        policy.courseName,
                        policy.credits,
                        policy.isGeneralCredit || false,
                        policy.notes || null,
                        policy.isUpdated,
                        policy.updatedAt
                    ]
                );
            }

            //get vote counts from school data
            const upvotes = school.votes?.upvotes ?? 0;
            const downvotes = school.votes?.downvotes ?? 0;

            //insert upvotes
            for (let i = 0; i < upvotes; i++) {
                await pool.query(
                    `INSERT INTO votes (school_id, vote_type, user_ip)
                     VALUES ($1, $2, $3)`,
                    [schoolId, 'upvote', `mock-ip-${i}`]
                );
            }

            //insert downvotes
            for (let i = 0; i < downvotes; i++) {
                await pool.query(
                    `INSERT INTO votes (school_id, vote_type, user_ip)
                     VALUES ($1, $2, $3)`,
                    [schoolId, 'downvote', `mock-ip-down-${i}`]
                );
            }

            console.log(`✓ Inserted ${school.name} with ${school.policies.length} policies`);
        }

        console.log('\nDatabase seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();