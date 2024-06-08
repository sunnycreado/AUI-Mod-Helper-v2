import requests
import os

class DiscordUtils():

    def __init__(self) -> None:
        self.DISCORD_TOKEN  = os.environ.get('DISCORD_BOT_TOKEN')

    def get_discord_token(self):
        return self.DISCORD_TOKEN

    def get_client_info_json(self, user_id):
        token = self.get_discord_token()
        url = f'https://discord.com/api/v9/users/{user_id}'
        headers = {'Authorization': f'Bot {token}'}
        response = requests.get(url, headers=headers)

        if response.status_code == 200:
            return response.json(), 200
        elif response.status_code == 404:
            return {"error": "User not found."}, 404
        elif response.status_code == 401:
            return {"error": "Bot token is invalid."}, 401
        else:
            return {"error": "An error occurred."}, response.status_code

from flask import Flask, jsonify

app = Flask(__name__)
utils = DiscordUtils()

@app.route('/userinfo/<user_id>')
def get_user_info(user_id):
    user_data, status_code = utils.get_client_info_json(user_id)
    if isinstance(user_data, dict):
        # Assuming user_data is a dictionary, we encapsulate it in a "text box"
        user_data = {"text_box": user_data}
    return jsonify(user_data), status_code

if __name__ == '__main__':
    app.run(debug=False,host='0.0.0.0')