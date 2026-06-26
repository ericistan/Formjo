from flask import request, jsonify, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from db.db_pool import get_cursor, release_connection

# All lesson routes are grouped in this Blueprint
lesson = Blueprint('lesson', __name__)


@lesson.route('/lesson', methods=['POST'])
@jwt_required()
def create_lesson():
    data = request.get_json()
    coach_id = get_jwt_identity()
    conn, cursor = get_cursor()

    # Category and difficulty are stored as lookup tables (foreign keys)
    cursor.execute('SELECT id FROM categories WHERE name=%s;', (data['category'],))
    category = cursor.fetchone()

    cursor.execute('SELECT id FROM difficulty_levels WHERE name=%s;', (data['difficulty'],))
    difficulty = cursor.fetchone()

    if not category or not difficulty:
        release_connection(conn)
        return jsonify(status='error', msg='invalid category or difficulty'), 400

    # %s used to prevent SQL injection as it returns as a string
    # `RETURNING` clause hands back the generated ID of the row you just inserted in the same query.
    cursor.execute(
        '''INSERT INTO lesson (created_by, category_id, difficulty_id, title, description, media_type, media_url)
           VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id''',
        (coach_id, category['id'], difficulty['id'], data['title'],
         data.get('description') or None, data.get('media_type') or None, data.get('media_url') or None)
    )

    new_id = cursor.fetchone()['id']

    # Insert steps if provided
    steps = data.get('steps', [])
    for i, step in enumerate(steps):
        instruction = step.get('instruction', '').strip()
        if instruction:
            cursor.execute(
                'INSERT INTO lesson_steps (lesson_id, order_index, instruction) VALUES (%s, %s, %s)',
                (new_id, i + 1, instruction)
            )

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


@lesson.route('/lesson/<int:id>', methods=['GET'])
@jwt_required()
def get_lesson_by_id(id):
    conn, cursor = get_cursor()

    # JOIN pulls data from multiple tables in one query
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
        (id,)
    )
    lesson_data = cursor.fetchone()

    if not lesson_data:
        release_connection(conn)
        return jsonify(status='error', msg='lesson not found'), 404

    cursor.execute(
        'SELECT id, order_index, instruction FROM lesson_steps WHERE lesson_id = %s ORDER BY order_index',
        (id,)
    )
    steps = cursor.fetchall()

    release_connection(conn)
    return jsonify({**lesson_data, 'steps': steps}), 200


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

    # Ownership check,  verify this lesson belongs to the requesting coach before allowing edits
    # Combining id AND created_by in the WHERE clause means a coach can't edit another coach's lessons
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
           WHERE id=%s''',
        (data['title'], data.get('description') or None, category['id'], difficulty['id'],
         data.get('media_type') or None, data.get('media_url') or None, id)
    )

    conn.commit()

    cursor.execute('DELETE FROM lesson_steps WHERE lesson_id = %s', (id,))

    steps = data.get('steps', [])
    for i, step in enumerate(steps):
        instruction = step.get('instruction', '').strip()
        if instruction:
            cursor.execute(
                'INSERT INTO lesson_steps (lesson_id, order_index, instruction) VALUES (%s, %s, %s)',
                (id, i + 1, instruction)
            )

    conn.commit()

    # Return the full updated lesson so the frontend can update its state without a second fetch
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
        (id,)
    )

    updated = cursor.fetchone()
    release_connection(conn)
    return jsonify(updated), 200


@lesson.route('/lesson/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_lesson(id):
    coach_id = get_jwt_identity()
    conn, cursor = get_cursor()

    # Ownership check, same pattern as update: coach can only delete their own lessons
    cursor.execute('SELECT id FROM lesson WHERE id=%s AND created_by=%s;', (id, coach_id))
    existing = cursor.fetchone()

    if not existing:
        release_connection(conn)
        return jsonify(status='error', msg='lesson not found or unauthorized'), 404

    cursor.execute('DELETE FROM lesson WHERE id=%s', (id,))
    conn.commit()
    release_connection(conn)
    return jsonify(status='ok', msg='lesson deleted'), 200
