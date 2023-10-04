import requests
import pandas as pd
import json
import sqlite3

url = "https://sports.core.api.espn.com/v3/sports/football/nfl/athletes?limit=18000"
jsonData = requests.get(url).json()

players = pd.DataFrame(jsonData["items"]).dropna(subset="firstName")
players = players[["id", "fullName"]].dropna()

#print(players.loc[players["fullName"] == "Travis Kelce"].id)

conn = sqlite3.connect("madden_stats.db")
cur = conn.cursor()

cur.execute("alter table stats add column espn_player_id text")

for index, row in players.iterrows():
    espn_player_id = row["id"]
    full_name = row["fullName"]

    cur.execute("""
                update stats
                set espn_player_id = ?
                where fullNameForSearch = ?
                """, (espn_player_id, full_name))
    
    conn.commit()

conn.close()







