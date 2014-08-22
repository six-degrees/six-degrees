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
            WHERE followers.user_id = users.id AND
            followers.follower_id != 2755100 AND
            followers.follower_id != 2755130
    ) AS followers_count
FROM users
WHERE followers_count > 0;
""")

    row = cursor.fetchone()

    while row is not None:
        user_id, user_login, _ = row

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
    followers.follower_id = users.id AND
    followers.follower_id != 2755100 AND
    followers.follower_id != 2755130 AND
    followers.user_id = ?;
""", (user_id, ))

        following = [followed[0] for followed in follower_cursor.fetchall()]

        json_data["followers"] = following

        json_file = open(json_file_name, "w")

        json.dump(json_data, json_file, separators=(',', ':'))

        json_file.close()

        row = cursor.fetchone()
finally:
    if conn:
        conn.close()
