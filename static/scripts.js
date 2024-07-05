/* scripts.js
    This file contains the JavaScript code for the survey form.
    It handles the form submission, validation, and displaying survey results.
    It also makes fetch requests to the server to submit survey data and retrieve survey results.

    Author: DHLAMINI SNYMAN @ https://www.github.com/SnymanD
*/

document.getElementById('fill-out-survey').addEventListener('click', () => {
    document.getElementById('survey-form').style.display = 'block';
    document.getElementById('survey-results').style.display = 'none';
});

document.getElementById('view-survey-results').addEventListener('click', async () => {
    document.getElementById('survey-form').style.display = 'none';
    document.getElementById('survey-results').style.display = 'block';

    const response = await fetch('/api/results');
    const data = await response.json();
    if (data.message) {
        document.getElementById('results-container').innerText = data.message;
    } else {
        document.getElementById('results-container').innerText = `
Total number of surveys: ${data.total_surveys}
Average Age: ${data.average_age}
Oldest person who participated in survey: ${data.max_age}
Youngest person who participated in survey: ${data.min_age}

Percentage of people who like Pizza: ${data.percentage_pizza}%
Percentage of people who like Pasta: ${data.percentage_pasta}%
Percentage of people who like Pap and Wors: ${data.percentage_pap_and_wors}%

Average ratings:
- People who like to watch movies: ${data.average_movies}
- People who like to listen to radio: ${data.average_radio}
- People who like to eat out: ${data.average_eat_out}
- People who like to watch TV: ${data.average_tv}
        `;
    }
});

document.getElementById('submit').addEventListener('click', async (e) => {
    e.preventDefault(); // Prevent form from submitting normally

    // Validate form inputs
    const fullNames = document.getElementById('full-names').value.trim();
    const email = document.getElementById('email').value.trim();
    const dob = document.getElementById('date-of-birth').value;
    const contactNumber = document.getElementById('contact-number').value.trim();
    const favoriteFoods = Array.from(document.querySelectorAll('input[name="favorite-food[]"]:checked')).map(checkbox => checkbox.value);
    const movies = document.querySelector('input[name="movies"]:checked');
    const radio = document.querySelector('input[name="radio"]:checked');
    const eatOut = document.querySelector('input[name="eat-out"]:checked');
    const tv = document.querySelector('input[name="tv"]:checked');

    if (!fullNames || !email || !dob || !contactNumber || favoriteFoods.length === 0 || !movies || !radio || !eatOut || !tv) {
        alert('Please fill out all required fields.');
        return;
    }

    // Validate email format using a regular expression
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        alert('Please enter a valid email address.');
        return;
    }

    // Calculate age
    const birthDate = new Date(dob);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    if (age < 5 || age > 120) {
        alert('Age must be between 5 and 120.');
        return;
    }

    const surveyData = {
        fullNames,
        email,
        dob,
        contactNumber,
        favoriteFoods,
        ratings: {
            movies: movies.value,
            radio: radio.value,
            eatOut: eatOut.value,
            tv: tv.value
        }
    };

    const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(surveyData)
    });

    if (response.ok) {
        alert('Survey submitted successfully!');
        document.getElementById('survey-form').reset();
    } else {
        alert('Failed to submit survey.');
    }
});
