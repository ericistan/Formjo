import bcrypt
from flask import request, jsonify, Blueprint
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity, get_jwt
from db.db_pool import get_cursor, release_connection

auth = Blueprint('auth', __name__)

@auth.route('/auth/signup', methods = ['PUT'])
def signup():
    data = request.get_json()
    #The incoming request carries a JSON body (email + password from the frontend). This line unpacks it into a Python dictionary, so you can do data['email'], data['password'], etc.

    conn, cursor = get_cursor()
    #Opens a connection to your database (like opening a channel to talk to Postgres/MySQL)

    cursor.execute('SELECT id FROM users WHERE email=%s;', (data['email'],))
    #Runs a SQL query: "Find any user where email matches what was submitted"
    # %s is a safe placeholder — it prevents SQL injection attacks

    results = cursor.fetchone()
    #fetchone() — Grabs the first matching row, or None if nothing found


    if results:
        release_connection(conn)
        return jsonify(status = 'error', msg = 'duplicate email'), 400

    hashed = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
    #.encode('utf-8')Converts the string to bytes (bcrypt requires this)
    # Generates a random salt — a unique noise added to the password before hashing

    cursor.execute(
        'INSERT INTO users (email, password_hash, role, name) VALUES (%s, %s, %s, %s) RETURNING id, email, role, name',
        (data['email'], hashed.decode('utf-8'), data['role'], data['name']))

    new_user = cursor.fetchone()
    conn.commit()
    release_connection(conn)
    access_token = create_access_token(str(new_user['id']),
                                       additional_claims={'name': new_user['name'], 'role': new_user['role']})
    return jsonify(access=access_token, user=new_user), 201


@auth.route('/auth/signin', methods = ['POST'])
def signin():
    data = request.get_json()
    conn, cursor = get_cursor()
    cursor.execute('SELECT * FROM users WHERE email=%s', (data['email'],))
    results = cursor.fetchone()
    release_connection(conn)

    if not results:
        return jsonify(status='error', msg='username or password is wrong'), 400

    valid = bcrypt.checkpw(data['password'].encode('utf-8'), results['password_hash'].encode('utf-8'))

    if not valid:
        return jsonify(status='error', msg='username or password is wrong'), 401

    access_token = create_access_token(str(results['id']),
                                       additional_claims={'name': results['name'], 'role': results['role']})
    return jsonify(access=access_token, user={'id': results['id'], 'email': results['email'], 'name': results['name'],
                                              'role': results['role']})

@auth.route('/auth/signout', methods=['POST'])
@jwt_required()
def signout():
    return jsonify(status='ok', msg='signed out'), 200