from flask import request, jsonify, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from db.db_pool import get_cursor, release_connection

submission = Blueprint('submission', __name__)


@submission.route('/submission', methods=['POST'])
@jwt_required()
def create_submission():
    data = request.get_json()
    student_id = get_jwt_identity()
    conn, cursor = get_cursor()

    cursor.execute(
        'SELECT id FROM assignments WHERE id = %s AND student_id = %s',
        (data['assignment_id'], student_id)
    )
    if not cursor.fetchone():
        release_connection(conn)
        return jsonify(status='error', msg='assignment not found or unauthorized'), 404

    cursor.execute(
        '''INSERT INTO submissions (assignment_id, lesson_id, student_id, media_url, media_type, notes)
           VALUES (%s, %s, %s, %s, %s, %s) RETURNING id''',
        (data['assignment_id'], data.get('lesson_id') or None, student_id,
         data['media_url'], data['media_type'],
         data.get('notes') or None)
    )
    new_id = cursor.fetchone()['id']
    conn.commit()
    release_connection(conn)
    return jsonify(id=new_id, msg='submission created'), 201


@submission.route('/submission', methods=['GET'])
@jwt_required()
def get_submissions():
    user_id = get_jwt_identity()
    assignment_id = request.args.get('assignment_id')
    lesson_id = request.args.get('lesson_id')
    conn, cursor = get_cursor()

    query = '''SELECT submissions.id,
                      submissions.lesson_id,
                      submissions.media_url,
                      submissions.media_type,
                      submissions.notes,
                      submissions.created_at,
                      users.name AS student_name
               FROM submissions
               JOIN users ON submissions.student_id = users.id
               JOIN assignments ON submissions.assignment_id = assignments.id
               WHERE submissions.assignment_id = %s
                 AND (assignments.coach_id = %s OR assignments.student_id = %s)'''

    params = [assignment_id, user_id, user_id]

    if lesson_id:
        query += ' AND submissions.lesson_id = %s'
        params.append(lesson_id)

    query += ' ORDER BY submissions.created_at DESC'

    cursor.execute(query, params)
    results = cursor.fetchall()
    release_connection(conn)
    return jsonify(results), 200


@submission.route('/submission/<int:id>', methods=['GET'])
@jwt_required()
def get_submission_by_id(id):
    user_id = get_jwt_identity()
    conn, cursor = get_cursor()

    cursor.execute(
        '''SELECT submissions.id,
                  submissions.media_url,
                  submissions.media_type,
                  submissions.notes,
                  submissions.created_at,
                  users.name AS student_name
           FROM submissions
                    JOIN users ON submissions.student_id = users.id
                    JOIN assignments ON submissions.assignment_id = assignments.id
           WHERE submissions.id = %s
             AND (assignments.coach_id = %s OR assignments.student_id = %s)''',
        (id, user_id, user_id)
    )
    data = cursor.fetchone()

    if not data:
        release_connection(conn)
        return jsonify(status='error', msg='submission not found or unauthorized'), 404

    release_connection(conn)
    return jsonify(data), 200


@submission.route('/submission/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_submission(id):
    user_id = get_jwt_identity()
    conn, cursor = get_cursor()

    cursor.execute(
        'SELECT id FROM submissions WHERE id = %s AND student_id = %s',
        (id, user_id)
    )
    if not cursor.fetchone():
        release_connection(conn)
        return jsonify(status='error', msg='submission not found or unauthorized'), 404

    cursor.execute('DELETE FROM submissions WHERE id = %s', (id,))
    conn.commit()
    release_connection(conn)
    return jsonify(status='ok', msg='submission deleted'), 200