from flask import Flask, jsonify, render_template
import pandas as pd
import sqlite3
import json

team_colors = {"Ravens": (26, 25, 95), "Bengals": (251, 79, 20), "Browns": (49, 29, 0),
               "Steelers": (255, 182, 18), "Bills": (0, 51, 141), "Dolphins": (0, 142, 151),
               "Patriots": (0, 34, 68), "Jets": (18, 87, 64), "Texans": (3, 32, 47), 
               "Colts": (0, 44, 95), "Jaguars": (16, 24, 32), "Titans": (12, 35, 64),
               "Broncos": (251, 79, 20), "Chiefs": (227, 24, 55), "Raiders": (0, 0, 0), 
               "Chargers": (0, 128, 198), "Lions": (0, 118, 182), "Packers": (24, 48, 40),
               "Vikings": (79, 38, 131), "Cowboys": (0, 53, 148), "Giants": (1, 35, 82),
               "Eagles": (0, 76, 84), "Commanders": (90, 20, 20), "Falcons": (167, 25, 48), 
               "Panthers": (0, 133, 202), "Saints": (211, 188, 141), "Buccaneers": (213, 10, 10), 
               "Cardinals": (151, 35, 63), "Rams": (0, 53, 148), "49ers": (170, 0, 0),
               "Seahawks": (0, 34, 68), "Bears": (11, 22, 42)}

team_alt_color = {"Ravens": "#9a7611", "Bengals": "#000000", "Browns": "#ff3c00",
                  "Steelers": "#000000", "Bills": "#d50a0a", "Dolphins": "#f0651d",
                  "Patriots": "#c60c30", "Jets": "#ffffff", "Texans": "#c41230", 
                  "Colts": "#ffffff", "Jaguars": "#d7a22a", "Titans": "#002a5c",
                  "Broncos": "#0a2343", "Chiefs": "#ffb612", "Raiders": "#a5acaf", 
                  "Chargers": "#ffc20e", "Lions": "#bbbbbb", "Packers": "#ffb612",
                  "Vikings": "#ffc62f", "Cowboys": "#b0b7bc", "Giants": "#c9243f",
                  "Eagles": "#a5acaf", "Commanders": "#ffb612", "Falcons": "#000000", 
                  "Panthers": "#000000", "Saints": "#000000", "Buccaneers": "#3e3a35", 
                  "Cardinals": "#ffffff", "Rams": "#ffd100", "49ers": "#b3995d",
                  "Seahawks": "#69be28", "Bears": "#fb4f14"}

team_abbr = {"Ravens": "BAL", "Bengals": "CIN", "Browns": "CLE",
               "Steelers": "PIT", "Bills": "BUF", "Dolphins": "MIA",
               "Patriots": "NE", "Jets": "NYJ", "Texans": "HOU", 
               "Colts": "IND", "Jaguars": "JAX", "Titans": "TEN",
               "Broncos": "DEN", "Chiefs": "KC", "Raiders": "LV", 
               "Chargers": "LAC", "Lions": "DET", "Packers": "GB",
               "Vikings": "MIN", "Cowboys": "DAL", "Giants": "NYG",
               "Eagles": "PHI", "Commanders": "WSH", "Falcons": "ATL", 
               "Panthers": "CAR", "Saints": "NO", "Buccaneers": "TB", 
               "Cardinals": "ARI", "Rams": "LAR", "49ers": "SF",
               "Seahawks": "SEA", "Bears": "CHI"}



app = Flask(__name__)

conn = sqlite3.connect("madden_stats.db")
cur = conn.cursor()
cur.execute("select * from stats")
rows = cur.fetchall()

# Get column names from cursor.description
column_names = [desc[0] for desc in cur.description]


def create_dict(data):
    # Create a list of dictionaries where keys are column names
    result = []

    for row in data:
        row_dict = {}
        for i, value in enumerate(row):
            row_dict[column_names[i]] = value
            #when we add "team" key to row_dict, go to team_color 
            #dictionary, get value and add "team_color" to row_dict
            if (column_names[i] == "team"):
                row_dict["team_color"] = team_colors[row_dict["team"]]
                row_dict["team_abbr"] = team_abbr[row_dict["team"]]
                row_dict["team_alt_color"] = team_alt_color[row_dict["team"]]
        result.append(row_dict)        

    return result


all_results = create_dict(rows)




@app.route("/")
def home():
    #return render_template("index.html")
    return render_template("index-btstrp.html")

@app.route("/data")
def data():
    return jsonify(all_results)


if __name__ == "__main__":
    app.run(debug=True)