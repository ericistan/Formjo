-- Formjo Database Schema

-- ENUM types
CREATE TYPE role_enum AS ENUM ('coach', 'student');
CREATE TYPE lesson_media_type AS ENUM ('youtube', 'upload');
CREATE TYPE submission_media_type AS ENUM ('video', 'image', 'upload', 'youtube');
CREATE TYPE assignment_status AS ENUM ('pending', 'completed');
CREATE TYPE coach_student_status AS ENUM ('pending', 'accepted');

-- Sequences
CREATE SEQUENCE IF NOT EXISTS users_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS categories_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS difficulty_levels_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS lesson_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS lesson_steps_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS modules_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS module_lessons_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS coach_student_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS assignments_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS assignment_lesson_progress_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS submissions_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS comments_id_seq START WITH 1 INCREMENT BY 1;


-- Table: public.users

CREATE TABLE IF NOT EXISTS public.users
(
    id integer NOT NULL DEFAULT nextval('users_id_seq'::regclass),
    email character varying(255) NOT NULL,
    password_hash character(60) NOT NULL,
    role role_enum NOT NULL,
    name character varying(100) NOT NULL,
    avatar_url character varying(255),
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_email_key UNIQUE (email)
);


-- Table: public.categories

CREATE TABLE IF NOT EXISTS public.categories
(
    id integer NOT NULL DEFAULT nextval('categories_id_seq'::regclass),
    name character varying(255) NOT NULL,
    CONSTRAINT categories_pkey PRIMARY KEY (id)
);


-- Table: public.difficulty_levels

CREATE TABLE IF NOT EXISTS public.difficulty_levels
(
    id integer NOT NULL DEFAULT nextval('difficulty_levels_id_seq'::regclass),
    name character varying(255) NOT NULL,
    CONSTRAINT difficulty_levels_pkey PRIMARY KEY (id)
);


-- Table: public.lesson

CREATE TABLE IF NOT EXISTS public.lesson
(
    id integer NOT NULL DEFAULT nextval('lesson_id_seq'::regclass),
    created_by integer,
    category_id integer,
    difficulty_id integer,
    title character varying(255) NOT NULL,
    description text,
    media_type lesson_media_type,
    media_url character varying(255),
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT lesson_pkey PRIMARY KEY (id),
    CONSTRAINT lesson_created_by_fkey FOREIGN KEY (created_by)
        REFERENCES public.users (id),
    CONSTRAINT lesson_category_id_fkey FOREIGN KEY (category_id)
        REFERENCES public.categories (id),
    CONSTRAINT lesson_difficulty_id_fkey FOREIGN KEY (difficulty_id)
        REFERENCES public.difficulty_levels (id)
);


-- Table: public.lesson_steps

CREATE TABLE IF NOT EXISTS public.lesson_steps
(
    id integer NOT NULL DEFAULT nextval('lesson_steps_id_seq'::regclass),
    lesson_id integer,
    order_index integer,
    instruction text,
    CONSTRAINT lesson_steps_pkey PRIMARY KEY (id),
    CONSTRAINT lesson_steps_lesson_id_fkey FOREIGN KEY (lesson_id)
        REFERENCES public.lesson (id)
        ON DELETE CASCADE
);


-- Table: public.modules

CREATE TABLE IF NOT EXISTS public.modules
(
    id integer NOT NULL DEFAULT nextval('modules_id_seq'::regclass),
    created_by integer,
    title character varying(255) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT modules_pkey PRIMARY KEY (id),
    CONSTRAINT modules_created_by_fkey FOREIGN KEY (created_by)
        REFERENCES public.users (id)
);



-- Table: public.module_lessons

CREATE TABLE IF NOT EXISTS public.module_lessons
(
    id integer NOT NULL DEFAULT nextval('module_lessons_id_seq'::regclass),
    module_id integer,
    lesson_id integer,
    order_index integer NOT NULL,
    CONSTRAINT module_lessons_pkey PRIMARY KEY (id),
    CONSTRAINT module_lessons_module_id_fkey FOREIGN KEY (module_id)
        REFERENCES public.modules (id)
        ON DELETE CASCADE,
    CONSTRAINT module_lessons_lesson_id_fkey FOREIGN KEY (lesson_id)
        REFERENCES public.lesson (id)
        ON DELETE CASCADE
);


-- Table: public.coach_student

CREATE TABLE IF NOT EXISTS public.coach_student
(
    id integer NOT NULL DEFAULT nextval('coach_student_id_seq'::regclass),
    coach_id integer,
    student_id integer,
    status coach_student_status DEFAULT 'pending'::coach_student_status,
    invited_at timestamp without time zone DEFAULT now(),
    accepted_at timestamp without time zone,
    CONSTRAINT coach_student_pkey PRIMARY KEY (id),
    CONSTRAINT coach_student_coach_id_fkey FOREIGN KEY (coach_id)
        REFERENCES public.users (id),
    CONSTRAINT coach_student_student_id_fkey FOREIGN KEY (student_id)
        REFERENCES public.users (id)
);


-- Table: public.assignments

CREATE TABLE IF NOT EXISTS public.assignments
(
    id integer NOT NULL DEFAULT nextval('assignments_id_seq'::regclass),
    module_id integer,
    student_id integer,
    coach_id integer,
    status assignment_status DEFAULT 'pending'::assignment_status,
    due_date date,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT assignments_pkey PRIMARY KEY (id),
    CONSTRAINT assignments_module_id_fkey FOREIGN KEY (module_id)
        REFERENCES public.modules (id),
    CONSTRAINT assignments_student_id_fkey FOREIGN KEY (student_id)
        REFERENCES public.users (id),
    CONSTRAINT assignments_coach_id_fkey FOREIGN KEY (coach_id)
        REFERENCES public.users (id)
);


-- Table: public.assignment_lesson_progress

CREATE TABLE IF NOT EXISTS public.assignment_lesson_progress
(
    id integer NOT NULL DEFAULT nextval('assignment_lesson_progress_id_seq'::regclass),
    assignment_id integer,
    lesson_id integer,
    is_completed boolean DEFAULT false,
    completed_at timestamp without time zone,
    CONSTRAINT assignment_lesson_progress_pkey PRIMARY KEY (id),
    CONSTRAINT assignment_lesson_progress_assignment_id_fkey FOREIGN KEY (assignment_id)
        REFERENCES public.assignments (id)
        ON DELETE CASCADE,
    CONSTRAINT assignment_lesson_progress_lesson_id_fkey FOREIGN KEY (lesson_id)
        REFERENCES public.lesson (id)
);


-- Table: public.lesson_progress

CREATE TABLE IF NOT EXISTS public.lesson_progress
(
    assignment_id integer NOT NULL,
    lesson_id integer NOT NULL,
    completed_at timestamp without time zone DEFAULT now(),
    CONSTRAINT lesson_progress_pkey PRIMARY KEY (assignment_id, lesson_id),
    CONSTRAINT lesson_progress_assignment_id_fkey FOREIGN KEY (assignment_id)
        REFERENCES public.assignments (id)
        ON DELETE CASCADE,
    CONSTRAINT lesson_progress_lesson_id_fkey FOREIGN KEY (lesson_id)
        REFERENCES public.lesson (id)
        ON DELETE CASCADE
);


-- Table: public.submissions

CREATE TABLE IF NOT EXISTS public.submissions
(
    id integer NOT NULL DEFAULT nextval('submissions_id_seq'::regclass),
    assignment_id integer,
    student_id integer,
    media_url character varying(255),
    media_type submission_media_type,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    lesson_id integer,
    CONSTRAINT submissions_pkey PRIMARY KEY (id),
    CONSTRAINT submissions_assignment_id_fkey FOREIGN KEY (assignment_id)
        REFERENCES public.assignments (id),
    CONSTRAINT submissions_student_id_fkey FOREIGN KEY (student_id)
        REFERENCES public.users (id),
    CONSTRAINT submissions_lesson_id_fkey FOREIGN KEY (lesson_id)
        REFERENCES public.lesson (id)
);



-- Table: public.comments

CREATE TABLE IF NOT EXISTS public.comments
(
    id integer NOT NULL DEFAULT nextval('comments_id_seq'::regclass),
    submission_id integer,
    author_id integer,
    body text,
    voice_note_url character varying(255),
    created_at timestamp without time zone DEFAULT now(),
    audio_url text,
    CONSTRAINT comments_pkey PRIMARY KEY (id),
    CONSTRAINT comments_submission_id_fkey FOREIGN KEY (submission_id)
        REFERENCES public.submissions (id)
        ON DELETE CASCADE,
    CONSTRAINT comments_author_id_fkey FOREIGN KEY (author_id)
        REFERENCES public.users (id)
);
