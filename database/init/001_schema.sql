CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    email text NOT NULL UNIQUE,
    role text NOT NULL CHECK (role IN ('teacher', 'student')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (id, role)
);

CREATE TABLE IF NOT EXISTS courses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    subject text NOT NULL,
    code text NOT NULL UNIQUE,
    teacher_id uuid NOT NULL,
    teacher_role text NOT NULL DEFAULT 'teacher' CHECK (teacher_role = 'teacher'),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    FOREIGN KEY (teacher_id, teacher_role) REFERENCES users (id, role)
);

CREATE TABLE IF NOT EXISTS course_enrollments (
    course_id uuid NOT NULL REFERENCES courses (id),
    student_id uuid NOT NULL,
    student_role text NOT NULL DEFAULT 'student' CHECK (student_role = 'student'),
    enrolled_at timestamptz NOT NULL DEFAULT now(),
    withdrawn_at timestamptz,
    PRIMARY KEY (course_id, student_id),
    FOREIGN KEY (student_id, student_role) REFERENCES users (id, role),
    CHECK (withdrawn_at IS NULL OR withdrawn_at >= enrolled_at)
);

CREATE TABLE IF NOT EXISTS class_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id uuid NOT NULL REFERENCES courses (id),
    title text NOT NULL,
    starts_at timestamptz NOT NULL,
    ends_at timestamptz NOT NULL,
    status text NOT NULL DEFAULT 'upcoming'
        CHECK (status IN ('upcoming', 'live', 'completed')),
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (id, course_id),
    CHECK (ends_at > starts_at)
);

CREATE TABLE IF NOT EXISTS attendance_records (
    session_id uuid NOT NULL,
    course_id uuid NOT NULL,
    student_id uuid NOT NULL,
    status text NOT NULL CHECK (status IN ('present', 'late', 'absent')),
    marked_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (session_id, student_id),
    FOREIGN KEY (session_id, course_id)
        REFERENCES class_sessions (id, course_id),
    FOREIGN KEY (course_id, student_id)
        REFERENCES course_enrollments (course_id, student_id)
);

CREATE INDEX IF NOT EXISTS courses_teacher_id_idx
    ON courses (teacher_id);
CREATE INDEX IF NOT EXISTS course_enrollments_student_id_idx
    ON course_enrollments (student_id);
CREATE INDEX IF NOT EXISTS class_sessions_course_starts_at_idx
    ON class_sessions (course_id, starts_at);
CREATE INDEX IF NOT EXISTS attendance_records_student_id_idx
    ON attendance_records (student_id);
