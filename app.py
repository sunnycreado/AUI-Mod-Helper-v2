from flask import Flask, jsonify, render_template, request
from discord_utils import DiscordUtils
from database_utils import insert_report
import time
import logging

app = Flask(__name__)
utils = DiscordUtils()

# Disable Flask's default logger
log = logging.getLogger('werkzeug')
log.disabled = True

# Disable debug mode
app.config['DEBUG'] = False

@app.route('/')
def index():
    timestamp = int(time.time())
    return render_template('index.html', timestamp=timestamp)

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
            "username": username,
            "userId": user_id
        }
    elif status_code == 404:
        response_text = {"message": "User not found."}
    elif status_code == 401:
        response_text = {"message": "Bot token is invalid."}
    else:
        response_text = {"message": "An error occurred."}

    return jsonify(response_text), status_code

@app.route('/submit_report', methods=['POST'])
def submit_report():
    try:
        data = request.json
        report_id = insert_report(
            user_id=data['userId'],
            username=data['username'],
            offence=data['offence'],
            action=data['action'],
            reported_by=data.get('reportedBy'),
            advice=data.get('advice'),
            note=data.get('note'),
            proof=data.get('proof'),
            rm=data.get('rm')
        )
        return jsonify({'success': True, 'report_id': report_id}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=False)