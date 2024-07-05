# Program: Running the survey
#
# Description: This program is responsible for running the survey. It is a Flask application that allows users to
#              submit their survey data and view the results of the survey.
#              The survey data is stored in a MongoDB database. The results of the survey are calculated based on the
#              survey data stored in the database.
#
# Author: DHLAMINI SNYMAN @ https://www.github.com/SnymanD

from flask import Flask, request, jsonify, render_template
from pymongo import MongoClient
from datetime import datetime
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests

# MongoDB setup
client = MongoClient('mongodb://localhost:27017/survey_db.surveys')
db = client['survey_db']
surveys = db['surveys']

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/submit', methods=['POST'])
def submit_survey():
    try:
        data = request.json

        # Calculate age
        dob = datetime.strptime(data['dob'], '%Y-%m-%d')
        age = datetime.now().year - dob.year

        # Validate age
        if age < 5 or age > 120:
            return jsonify({"error": "Age must be between 5 and 120"}), 400

        # Ensure favoriteFoods is stored as an array
        if not isinstance(data.get('favoriteFoods'), list):
            return jsonify({"error": "Favorite foods should be an array"}), 400

        surveys.insert_one(data)
        return jsonify({"message": "Survey submitted successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/results', methods=['GET'])
def get_results():
    try:
        survey_count = surveys.count_documents({})
        if survey_count == 0:
            return jsonify({"message": "No Surveys Available."})

        survey_data = list(surveys.find({}))

        total_age = sum([(datetime.now().year - int(survey['dob'][:4])) for survey in survey_data])
        average_age = total_age / survey_count
        max_age = max([(datetime.now().year - int(survey['dob'][:4])) for survey in survey_data])
        min_age = min([(datetime.now().year - int(survey['dob'][:4])) for survey in survey_data])

        favorite_foods = [food for survey in survey_data for food in survey.get('favoriteFoods', [])]
        percentage_pizza = (favorite_foods.count('Pizza') / survey_count) * 100
        percentage_pasta = (favorite_foods.count('Pasta') / survey_count) * 100
        percentage_pap_and_wors = (favorite_foods.count('Pap and Wors') / survey_count) * 100

        def average_rating(category):
            total = sum([int(survey['ratings'][category]) for survey in survey_data if category in survey['ratings']])
            return total / survey_count if survey_count > 0 else 0

        average_movies = average_rating('movies')
        average_radio = average_rating('radio')
        average_eat_out = average_rating('eatOut')
        average_tv = average_rating('tv')

        return jsonify({
            "total_surveys": survey_count,
            "average_age": average_age,
            "max_age": max_age,
            "min_age": min_age,

            "percentage_pizza": percentage_pizza,
            "percentage_pasta": percentage_pasta,
            "percentage_pap_and_wors": percentage_pap_and_wors,

            "average_movies": average_movies,
            "average_radio": average_radio,
            "average_eat_out": average_eat_out,
            "average_tv": average_tv
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
