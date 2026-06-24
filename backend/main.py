# Flask is our web framework — it receives HTTP requests and sends back responses
import os
from datetime import timedelta
from flask import Flask, jsonify

# flask_cors lets our React frontend (on a different port) talk to this backend
# Without CORS, browsers block requests between different origins by default
from flask_cors import CORS

# JWTManager adds JSON Web Token support to the app — used to protect routes
from flask_jwt_extended import JWTManager

# Each resource file is a Blueprint — a self-contained group of routes for one feature
from resources.auth import auth
from resources.lesson import lesson
from resources.module import module
from resources.assignment import assignment
from resources.submission import submission
from resources.comment import comment

app = Flask(__name__)

# Allow all origins to call this API — in production, lock this down to your frontend domain
CORS(app, resources={r"/*": {"origins": "*"}})

# The JWT secret key is used to sign tokens — only the server knows this value
# Always load secrets from environment variables, never hard-code them
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)
jwt = JWTManager(app)

# Catch every possible JWT error and return a consistent 401 response
# This prevents Flask from sending its own default HTML error page
@jwt.expired_token_loader
@jwt.invalid_token_loader
@jwt.unauthorized_loader
@jwt.needs_fresh_token_loader
@jwt.revoked_token_loader
def jwt_error(*args):
    return jsonify(msg="Access Denied"), 401

# Register all blueprints — this is how Flask discovers every route in the app
# Think of it like plugging feature modules into the main app
app.register_blueprint(auth)
app.register_blueprint(lesson)
app.register_blueprint(module)
app.register_blueprint(assignment)
app.register_blueprint(submission)
app.register_blueprint(comment)

# Only start the dev server when running this file directly (not when imported as a module)
if __name__ == '__main__':
    app.run(port=5001, debug=os.getenv('DEBUG', False))
