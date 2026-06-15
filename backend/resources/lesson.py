from flask import request, jsonify, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from db.db_pool import get_cursor, release_connection

lesson = Blueprint('lesson', __name__)

@lesson.route('/lesson', methods=['POST'])
@jwt_required()
def create_lesson():
    data = request.get_json()
    coach_id = get_jwt_identity()
    conn, cursor = get_cursor()

    cursor.execute('SELECT id FROM categories WHERE name=%s;', (data['category'],))
    category = cursor.fetchone()

    cursor.execute('SELECT id FROM difficulty_levels WHERE name=%s;', (data['difficulty'],))
    difficulty = cursor.fetchone()

    if not category or not difficulty:
        release_connection(conn)
        return jsonify(status='error', msg='invalid category or difficulty'), 400

    cursor.execute(
        '''INSERT INTO lesson (created_by, category_id, difficulty_id, title, description, media_type, media_url)
           VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id''',
        (coach_id, category['id'], difficulty['id'], data['title'],
         data.get('description'), data.get('media_type'), data.get('media_url'))
    )

    new_id = cursor.fetchone()['id']
    conn.commit()

    cursor.execute(
        '''SELECT lesson.id, lesson.title, lesson.description, lesson.media_type, lesson.media_url, lesson.created_at,
                  users.name AS created_by,
                  categories.name AS category,
                  difficulty_levels.name AS difficulty
           FROM lesson
           JOIN users ON lesson.created_by = users.id
           JOIN categories ON lesson.category_id = categories.id
           JOIN difficulty_levels ON lesson.difficulty_id = difficulty_levels.id
           WHERE lesson.id = %s''',
        (new_id,)
    )

    new_lesson = cursor.fetchone()
    release_connection(conn)
    return jsonify(new_lesson), 201

@lesson.route('/lesson', methods=['GET'])
@jwt_required()
def get_lesson():
    coach_id = get_jwt_identity()
    conn, cursor = get_cursor()

    cursor.execute(
        '''SELECT lesson.id, lesson.title, lesson.description, lesson.media_type, lesson.media_url, lesson.created_at,
                  users.name AS created_by,
                  categories.name AS category,
                  difficulty_levels.name AS difficulty
           FROM lesson
           JOIN users ON lesson.created_by = users.id
           JOIN categories ON lesson.category_id = categories.id
           JOIN difficulty_levels ON lesson.difficulty_id = difficulty_levels.id
           WHERE lesson.created_by = %s
           ORDER BY lesson.created_at DESC''',
        (coach_id,)
    )
    results = cursor.fetchall()
    release_connection(conn)
    return jsonify(results), 200


@lesson.route('/lesson/<int:id>', methods=['PATCH'])
@jwt_required()
def update_lesson(id):
    data = request.get_json()
    coach_id = get_jwt_identity()
    conn, cursor = get_cursor()

    cursor.execute('SELECT id FROM lesson WHERE id=%s AND created_by=%s;', (id, coach_id))
    existing = cursor.fetchone()

    if not existing:
        release_connection(conn)
        return jsonify(status='error', msg='lesson not found or unauthorized'), 404

    cursor.execute('SELECT id FROM categories WHERE name=%s;', (data['category'],))
    category = cursor.fetchone()

    cursor.execute('SELECT id FROM difficulty_levels WHERE name=%s;', (data['difficulty'],))
    difficulty = cursor.fetchone()

    if not category or not difficulty:
        release_connection(conn)
        return jsonify(status='error', msg='invalid category or difficulty'), 400

    cursor.execute(
        '''UPDATE lesson
           SET title=%s,
               description=%s,
               category_id=%s,
               difficulty_id=%s,
               media_type=%s,
               media_url=%s
           WHERE id=%s RETURNING *''',
        (data['title'], data.get('description'), category['id'], difficulty['id'],
         data.get('media_type'), data.get('media_url'), id)
    )

    updated = cursor.fetchone()
    conn.commit()
    release_connection(conn)
    return jsonify(updated), 200

@lesson.route('/lesson/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_lesson(id):
    coach_id = get_jwt_identity()
    conn, cursor = get_cursor()

    cursor.execute('SELECT id FROM lesson WHERE id=%s AND created_by=%s;', (id, coach_id))
    existing = cursor.fetchone()

    if not existing:
        release_connection(conn)
        return jsonify(status='error', msg='lesson not found or unauthorized'), 404

    cursor.execute('DELETE FROM lesson WHERE id=%s', (id,))
    conn.commit()
    release_connection(conn)
    return jsonify(status='ok', msg='lesson deleted'), 200
