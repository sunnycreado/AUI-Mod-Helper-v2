from flask import Flask, jsonify, render_template
from discord_utils import DiscordUtils
import time

app = Flask(__name__)
utils = DiscordUtils()

@app.route('/')
def index():
    # Add timestamp for cache busting
    timestamp = int(time.time())
    return render_template('index.html', timestamp=timestamp)

# Add cache control headers middleware
@app.after_request
def add_header(response):
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '-1'
    return response

@app.route('/userinfo/<user_id>', methods=['GET'])
def get_user_info(user_id):
    user_data, status_code = utils.get_client_info_json(user_id)
    if status_code == 200:
        username = user_data.get('username', 'No username available')
        response_text = {
            "message": f"User ID: {user_id}\nUsername: {username}",
            "username": username,  # Include username separately for easy access
            "userId": user_id
        }
    elif status_code == 404:
        response_text = {"message": "User not found."}
    elif status_code == 401:
        response_text = {"message": "Bot token is invalid."}
    else:
        response_text = {"message": "An error occurred."}

    return jsonify(response_text), status_code

if __name__ == '__main__':
    app.run(debug=True)