import os
from datetime import timedelta
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from resources.auth import auth
from resources.lesson import lesson
from resources.module import module
from resources.assignment import assignment
from resources.submission import submission
from resources.comment import comment

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "*"}})

app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)
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
app.register_blueprint(module)
app.register_blueprint(assignment)
app.register_blueprint(submission)
app.register_blueprint(comment)

if __name__ == '__main__':
    app.run(port=5001, debug=os.getenv('DEBUG', False))
