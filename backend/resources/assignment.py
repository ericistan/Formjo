from flask import request, jsonify, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from db.db_pool import get_cursor, release_connection

assignment = Blueprint('assignment', __name__)


@assignment.route('/students', methods=['GET'])
@jwt_required()
def get_students():
    conn, cursor = get_cursor()
    cursor.execute("SELECT id, name, email FROM users WHERE role = 'student'")
    results = cursor.fetchall()
    release_connection(conn)
    return jsonify(results), 200


@assignment.route('/assignment', methods=['POST'])
@jwt_required()
def create_assignment():
    data = request.get_json()
    coach_id = get_jwt_identity()
    conn, cursor = get_cursor()

    cursor.execute(
        '''INSERT INTO assignments (module_id, student_id, coach_id, due_date)
           VALUES (%s, %s, %s, %s) RETURNING id''', #returning id needs primary key from prev table.
        (data['module_id'], data['student_id'], coach_id, data.get('due_date'))
    )
    new_id = cursor.fetchone()['id']
    conn.commit()
    release_connection(conn)
    return jsonify(id=new_id, msg='assignment created'), 201


@assignment.route('/assignment', methods=['GET'])
@jwt_required()
def get_assignments():
    coach_id = get_jwt_identity()
    module_id = request.args.get('module_id')
    conn, cursor = get_cursor()

    query = '''SELECT assignments.id,
                      assignments.status,
                      assignments.due_date,
                      assignments.created_at,
                      modules.title AS module_title,
                      users.name AS student_name
               FROM assignments
               JOIN modules ON assignments.module_id = modules.id
               JOIN users ON assignments.student_id = users.id
               WHERE assignments.coach_id = %s'''

    params = [coach_id]

    if module_id:
        query += ' AND assignments.module_id = %s'
        params.append(module_id)

    query += ' ORDER BY assignments.created_at DESC'

    cursor.execute(query, params)
    results = cursor.fetchall()
    release_connection(conn)
    return jsonify(results), 200


@assignment.route('/assignment/<int:id>', methods=['GET'])
@jwt_required()
def get_assignment_by_id(id):
    coach_id = get_jwt_identity()
    conn, cursor = get_cursor()

    cursor.execute(
        '''SELECT assignments.id,
                  assignments.status,
                  assignments.due_date,
                  assignments.created_at,
                  modules.id    AS module_id,
                  modules.title AS module_title,
                  users.id      AS student_id,
                  users.name    AS student_name,
                  users.email   AS student_email
           FROM assignments
           JOIN modules ON assignments.module_id = modules.id
           JOIN users ON assignments.student_id = users.id
           WHERE assignments.id = %s AND assignments.coach_id = %s''',
        (id, coach_id)
    )
    data = cursor.fetchone()

    if not data:
        release_connection(conn)
        return jsonify(status='error', msg='assignment not found or unauthorized'), 404

    cursor.execute(
        '''SELECT lesson.id,
                  lesson.title,
                  categories.name AS category,
                  difficulty_levels.name AS difficulty,
                  module_lessons.order_index,
                  CASE WHEN lp.lesson_id IS NOT NULL THEN true ELSE false END AS is_complete
           FROM module_lessons
           JOIN lesson ON module_lessons.lesson_id = lesson.id
           JOIN categories ON lesson.category_id = categories.id
           JOIN difficulty_levels ON lesson.difficulty_id = difficulty_levels.id
           LEFT JOIN lesson_progress lp
             ON lp.lesson_id = lesson.id AND lp.assignment_id = %s
           WHERE module_lessons.module_id = %s
           ORDER BY module_lessons.order_index''',
        (id, data['module_id'])
    )
    lessons = cursor.fetchall()

    release_connection(conn)
    return jsonify({**data, 'lessons': lessons}), 200


@assignment.route('/assignment/<int:id>', methods=['PATCH'])
@jwt_required()
def update_assignment(id):
    data = request.get_json()
    coach_id = get_jwt_identity()
    conn, cursor = get_cursor()

    cursor.execute(
        'SELECT id FROM assignments WHERE id = %s AND coach_id = %s',
        (id, coach_id)
    )
    if not cursor.fetchone():
        release_connection(conn)
        return jsonify(status='error', msg='assignment not found or unauthorized'), 404

    cursor.execute(
        'UPDATE assignments SET status = %s, due_date = %s WHERE id = %s',
        (data.get('status'), data.get('due_date'), id)
    )
    conn.commit()
    release_connection(conn)
    return jsonify(status='ok', msg='assignment updated'), 200


@assignment.route('/assignment/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_assignment(id):
    coach_id = get_jwt_identity()
    conn, cursor = get_cursor()

    cursor.execute(
        'SELECT id FROM assignments WHERE id = %s AND coach_id = %s',
        (id, coach_id)
    )
    if not cursor.fetchone():
        release_connection(conn)
        return jsonify(status='error', msg='assignment not found or unauthorized'), 404

    cursor.execute('DELETE FROM assignments WHERE id = %s', (id,))
    conn.commit()
    release_connection(conn)
    return jsonify(status='ok', msg='assignment deleted'), 200


@assignment.route('/assignment/<int:id>/lesson/<int:lesson_id>/complete', methods=['POST'])
@jwt_required()
def mark_lesson_complete(id, lesson_id):
    coach_id = get_jwt_identity()
    conn, cursor = get_cursor()

    cursor.execute(
        'SELECT module_id FROM assignments WHERE id = %s AND coach_id = %s',
        (id, coach_id)
    )
    row = cursor.fetchone()
    if not row:
        release_connection(conn)
        return jsonify(status='error', msg='assignment not found or unauthorized'), 404

    cursor.execute(
        'INSERT INTO lesson_progress (assignment_id, lesson_id) VALUES (%s, %s) ON CONFLICT DO NOTHING',#delete
        (id, lesson_id)
    )

    cursor.execute(
        'SELECT COUNT(*) AS total FROM module_lessons WHERE module_id = %s',
        (row['module_id'],)
    )
    total = cursor.fetchone()['total']

    cursor.execute(
        'SELECT COUNT(*) AS done FROM lesson_progress WHERE assignment_id = %s',
        (id,)
    )
    done = cursor.fetchone()['done']

    if done >= total:
        cursor.execute('UPDATE assignments SET status = %s WHERE id = %s', ('completed', id))

    conn.commit()
    release_connection(conn)
    return jsonify(status='ok', msg='lesson marked complete'), 200


@assignment.route('/assignment/<int:id>/lesson/<int:lesson_id>/complete', methods=['DELETE'])
@jwt_required()
def unmark_lesson_complete(id, lesson_id):
    coach_id = get_jwt_identity()
    conn, cursor = get_cursor()

    cursor.execute(
        'SELECT id FROM assignments WHERE id = %s AND coach_id = %s',
        (id, coach_id)
    )
    if not cursor.fetchone():
        release_connection(conn)
        return jsonify(status='error', msg='assignment not found or unauthorized'), 404

    cursor.execute(
        'DELETE FROM lesson_progress WHERE assignment_id = %s AND lesson_id = %s',
        (id, lesson_id)
    )
    cursor.execute('UPDATE assignments SET status = %s WHERE id = %s', ('pending', id))
    conn.commit()
    release_connection(conn)
    return jsonify(status='ok', msg='lesson unmarked'), 200


@assignment.route('/student/assignments', methods=['GET'])
@jwt_required()
def get_student_assignments():
    student_id = get_jwt_identity()
    conn, cursor = get_cursor()

    cursor.execute(
        '''SELECT assignments.id,
                  assignments.status,
                  assignments.due_date,
                  assignments.created_at,
                  modules.title AS module_title,
                  users.name AS coach_name
           FROM assignments
           JOIN modules ON assignments.module_id = modules.id
           JOIN users ON assignments.coach_id = users.id
           WHERE assignments.student_id = %s
           ORDER BY assignments.created_at DESC''',
        (student_id,)
    )
    results = cursor.fetchall()
    release_connection(conn)
    return jsonify(results), 200


@assignment.route('/student/assignments/<int:id>', methods=['GET'])
@jwt_required()
def get_student_assignment_by_id(id):
    student_id = get_jwt_identity()
    conn, cursor = get_cursor()

    cursor.execute(
        '''SELECT assignments.id,
                  assignments.status,
                  assignments.due_date,
                  modules.id AS module_id,
                  modules.title AS module_title,
                  modules.description AS module_description,
                  users.name AS coach_name
           FROM assignments
           JOIN modules ON assignments.module_id = modules.id
           JOIN users ON assignments.coach_id = users.id
           WHERE assignments.id = %s AND assignments.student_id = %s''',
        (id, student_id)
    )
    data = cursor.fetchone()

    if not data:
        release_connection(conn)
        return jsonify(status='error', msg='assignment not found or unauthorized'), 404

    cursor.execute(
        '''SELECT lesson.id,
                  lesson.title,
                  lesson.description,
                  lesson.media_type,
                  lesson.media_url,
                  categories.name AS category,
                  difficulty_levels.name AS difficulty,
                  module_lessons.order_index,
                  CASE WHEN lp.lesson_id IS NOT NULL THEN true ELSE false END AS is_complete
           FROM module_lessons
           JOIN lesson ON module_lessons.lesson_id = lesson.id
           JOIN categories ON lesson.category_id = categories.id
           JOIN difficulty_levels ON lesson.difficulty_id = difficulty_levels.id
           LEFT JOIN lesson_progress lp
             ON lp.lesson_id = lesson.id AND lp.assignment_id = %s
           WHERE module_lessons.module_id = %s
           ORDER BY module_lessons.order_index''',
        (id, data['module_id'])
    )
    lessons = cursor.fetchall()

    release_connection(conn)
    return jsonify({**data, 'lessons': lessons}), 200
