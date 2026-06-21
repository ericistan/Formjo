from flask import request, jsonify, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from db.db_pool import get_cursor, release_connection

module = Blueprint('module', __name__)

@module.route('/module', methods=['POST'])
@jwt_required()
def create_module():
    data = request.get_json()
    coach_id = get_jwt_identity()
    conn, cursor = get_cursor()

    cursor.execute(
        'INSERT INTO modules (created_by, title, description) VALUES (%s, %s, %s) RETURNING id',
        (coach_id, data['title'], data.get('description'))
    )
    new_id = cursor.fetchone()['id']

    lessons = data.get('lessons', [])
    for i, lesson_id in enumerate(lessons):
        cursor.execute(
            'INSERT INTO module_lessons (module_id, lesson_id, order_index) VALUES (%s, %s, %s)',
            (new_id, lesson_id, i+1)
        )

    conn.commit()
    release_connection(conn)
    return jsonify(id=new_id, msg='module created'), 201

@module.route('/module', methods=['GET'])
@jwt_required()
def get_modules():
    coach_id = get_jwt_identity()
    conn, cursor = get_cursor()

    cursor.execute(
        'SELECT id, title, description FROM modules WHERE created_by =%s ORDER BY created_at DESC ', (coach_id,)
    )
    results = cursor.fetchall()
    release_connection(conn)
    return jsonify(results), 200

@module.route('/module/<int:id>', methods=['GET'])
@jwt_required()
def get_module_by_id(id):
    coach_id = get_jwt_identity()
    conn, cursor = get_cursor()

    cursor.execute(
        'SELECT id, title, description, created_at FROM modules WHERE id = %s AND created_by = %s',
        (id, coach_id)
    )
    module_data = cursor.fetchone()

    if not module_data:
        release_connection(conn)
        return jsonify(status='error', msg='module not found or unauthorized'), 404

    cursor.execute(
        '''SELECT lesson.id,
                  lesson.title,
                  lesson.description,
                  lesson.media_type,
                  categories.name        AS category,
                  difficulty_levels.name AS difficulty,
                  module_lessons.order_index
           FROM module_lessons
                    JOIN lesson ON module_lessons.lesson_id = lesson.id
                    JOIN categories ON lesson.category_id = categories.id
                    JOIN difficulty_levels ON lesson.difficulty_id = difficulty_levels.id
           WHERE module_lessons.module_id = %s
           ORDER BY module_lessons.order_index''',
        (id,)
    )
    lessons = cursor.fetchall()

    release_connection(conn)
    return jsonify({**module_data, 'lessons': lessons}), 200

@module.route('/module/<int:id>', methods=['PATCH'])
@jwt_required()
def update_module(id):
    data = request.get_json()
    coach_id = get_jwt_identity()
    conn, cursor = get_cursor()

    cursor.execute(
        'SELECT id FROM modules WHERE id = %s AND created_by = %s',
        (id, coach_id)
    )
    if not cursor.fetchone():
        release_connection(conn)
        return jsonify(status='error', msg = 'module not found or unauthorized'), 404

    cursor.execute(
        'UPDATE modules SET title = %s, description = %s WHERE id = %s',
        (data['title'], data.get('description'), id)
    )

    cursor.execute('DELETE FROM module_lessons WHERE module_id = %s', (id,))

    lessons = data.get('lessons', [])
    for i, lesson_id in enumerate(lessons):
        cursor.execute(
            'INSERT INTO module_lessons (module_id, lesson_id, order_index) VALUES (%s, %s, %s)',
            (id, lesson_id, i+1)
        )
    conn.commit()
    release_connection(conn)
    return jsonify(status='ok', msg = 'module updated'), 200

@module.route('/module/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_module(id):
    coach_id = get_jwt_identity()
    conn, cursor = get_cursor()

    cursor.execute(
        'SELECT id FROM modules WHERE id = %s AND created_by = %s',
        (id, coach_id)
    )
    if not cursor.fetchone():
        release_connection(conn)
        return jsonify(status='error', msg = 'module not found or unauthorized'), 404

    cursor.execute('DELETE FROM module_lessons WHERE module_id = %s', (id,))
    cursor.execute('DELETE FROM modules WHERE id = %s', (id,))
    conn.commit()
    release_connection(conn)
    return jsonify(status='ok', msg='module deleted'), 200

