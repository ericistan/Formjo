import bcrypt
from flask import request, jsonify, Blueprint
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity, get_jwt
from db.db_pool import get_cursor, release_connection

auth = Blueprint('auth', __name__)


@auth.route('/auth/signup', methods=['PUT'])
def signup():
    # Parse the JSON body sent from the frontend (email, password, name, role)
    data = request.get_json()

    conn, cursor = get_cursor()

    # Check if this email already exists before creating a duplicate account
    # %s is a parameterized placeholder, psycopg2 escapes it to prevent SQL injection
    cursor.execute('SELECT id FROM users WHERE email=%s;', (data['email'],))
    results = cursor.fetchone()

    if results:
        release_connection(conn)
        # 400 = Bad Request — tell the client their input caused the problem
        return jsonify(status='error', msg='duplicate email'), 400

    # bcrypt.gensalt() generates a random "salt" added to the password before hashing
    # This means two identical passwords produce different hashes (prevents rainbow table attacks by precomputing hashes instead of computing them on the fly.)
    hashed = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())

    cursor.execute(
        'INSERT INTO users (email, password_hash, role, name) VALUES (%s, %s, %s, %s) RETURNING id, email, role, name',
        (data['email'], hashed.decode('utf-8'), data['role'], data['name']))

    new_user = cursor.fetchone()
    conn.commit()
    release_connection(conn)

    # Create a JWT using the user's database ID as the "identity" (the subject of the token)
    # additional_claims embeds name + role inside the token so we can read them without a DB query
    access_token = create_access_token(str(new_user['id']),
                                       additional_claims={'name': new_user['name'], 'role': new_user['role']})
    return jsonify(access=access_token, user=new_user), 201


@auth.route('/auth/signin', methods=['POST'])
def signin():
    data = request.get_json()
    conn, cursor = get_cursor()

    cursor.execute('SELECT * FROM users WHERE email=%s', (data['email'],))
    results = cursor.fetchone()
    release_connection(conn)

    # Return the same vague error whether the email is wrong OR the password is wrong
    if not results:
        return jsonify(status='error', msg='username or password is wrong'), 400

    valid = bcrypt.checkpw(data['password'].encode('utf-8'), results['password_hash'].encode('utf-8'))

    if not valid:
        return jsonify(status='error', msg='username or password is wrong'), 401

    access_token = create_access_token(str(results['id']),
                                       additional_claims={'name': results['name'], 'role': results['role']})
    return jsonify(access=access_token, user={'id': results['id'], 'email': results['email'],
                                              'name': results['name'], 'role': results['role']})


@auth.route('/auth/signout', methods=['POST'])
@jwt_required()
def signout():
    return jsonify(status='ok', msg='signed out'), 200
