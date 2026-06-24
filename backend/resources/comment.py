from flask import request, jsonify, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from db.db_pool import get_cursor, release_connection

comment = Blueprint('comment', __name__)


@comment.route('/comment', methods=['POST'])
@jwt_required()
def create_comment():
    data = request.get_json()
    author_id = get_jwt_identity()
    conn, cursor = get_cursor()

    cursor.execute(
        'SELECT id FROM submissions WHERE id = %s',
        (data['submission_id'],)
    )
    if not cursor.fetchone():
        release_connection(conn)
        return jsonify(status='error', msg='submission not found'), 404

    # body and audio_url are mutually optional, a comment can be text, voice, or both
    body = data.get('body') or None
    audio_url = data.get('audio_url') or None

    if not body and not audio_url:
        release_connection(conn)
        return jsonify(status='error', msg='comment must have body or audio_url'), 400

    cursor.execute(
        '''INSERT INTO comments (submission_id, author_id, body, audio_url)
           VALUES (%s, %s, %s, %s) RETURNING id''',
        (data['submission_id'], author_id, body, audio_url)
    )
    new_id = cursor.fetchone()['id']
    conn.commit()
    release_connection(conn)
    return jsonify(id=new_id, msg='comment created'), 201


@comment.route('/comment', methods=['GET'])
@jwt_required()
def get_comments():
    submission_id = request.args.get('submission_id')
    conn, cursor = get_cursor()

    cursor.execute(
        '''SELECT comments.id,
                  comments.body,
                  comments.audio_url,
                  comments.created_at,
                  users.name AS author_name,
                  users.role AS author_role
           FROM comments
           JOIN users ON comments.author_id = users.id
           WHERE comments.submission_id = %s
           ORDER BY comments.created_at ASC''',
        (submission_id,)
    )
    results = cursor.fetchall()
    release_connection(conn)
    return jsonify(results), 200


@comment.route('/comment/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_comment(id):
    author_id = get_jwt_identity()
    conn, cursor = get_cursor()

    cursor.execute(
        'SELECT id FROM comments WHERE id = %s AND author_id = %s',
        (id, author_id)
    )
    if not cursor.fetchone():
        release_connection(conn)
        return jsonify(status='error', msg='comment not found or unauthorized'), 404

    cursor.execute('DELETE FROM comments WHERE id = %s', (id,))
    conn.commit()
    release_connection(conn)
    return jsonify(status='ok', msg='comment deleted'), 200
