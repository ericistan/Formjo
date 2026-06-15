import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from resources.auth import auth
from resources.lesson import lesson

app = Flask(__name__)
CORS(app)
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
jwt = JWTManager(app)

@jwt.expired_token_loader
@jwt.invalid_token_loader
@jwt.unauthorized_loader
@jwt.needs_fresh_token_loader
@jwt.revoked_token_loader
def jwt_error(*args):
    return jsonify(msg="Access Denied"), 401

app.register_blueprint(auth)
app.register_blueprint(lesson)

if __name__ == '__main__':
    app.run(port=5001, debug=os.getenv('DEBUG', False))