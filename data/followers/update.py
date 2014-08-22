import json
import os
import sqlite3
import sys

database_location = sys.argv[1]
repo_location = sys.argv[2]

json_file_format = repo_location + "/json/%(login)s.json"

conn = None

try:
    conn = sqlite3.connect(database_location)

    cursor = conn.cursor()
    follower_cursor = conn.cursor()

    cursor.execute("""
SELECT
    users.id,
    users.login,
    (
        SELECT COUNT(followers.user_id)
            FROM followers
            WHERE followers.follower_id = users.id
    ) AS following_count
FROM users
WHERE following_count > 0;
""")

    user_data = cursor.fetchone()

    while user_data is not None:
        user_id, user_login, _ = user_data

        json_data = {
            "id": user_id,
            "login": user_login,
        }

        json_file_name = json_file_format % json_data

        follower_cursor.execute("""
SELECT
    users.login
FROM users
    INNER JOIN followers
WHERE
    followers.user_id = users.id AND
    followers.follower_id = ?;
""", (user_id, ))

        following = [followed[0] for followed in follower_cursor.fetchall()]

        json_data["following"] = following

        json_file = open(json_file_name, "w")

        json.dump(json_data, json_file, separators=(',', ':'))

        json_file.close()

        user_data = cursor.fetchone()
finally:
    if conn:
        conn.close()
