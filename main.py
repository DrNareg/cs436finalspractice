from flask import Flask, render_template, request, jsonify
import json
import random

app = Flask(__name__)

# Load questions from JSON
with open('quiz_questions.json', 'r') as f:
    all_questions = json.load(f)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/questions')
def get_questions():
    """Get all questions"""
    return jsonify(all_questions)

@app.route('/api/quiz', methods=['GET'])
def get_quiz():
    """Get a random quiz with selected number of questions"""
    num_questions = request.args.get('num', default=10, type=int)
    num_questions = min(num_questions, len(all_questions))
    
    selected = random.sample(all_questions, num_questions)
    return jsonify(selected)

@app.route('/api/quiz/by-type', methods=['GET'])
def get_quiz_by_type():
    """Get a quiz filtered by question type"""
    question_type = request.args.get('type', default='all')
    num_questions = request.args.get('num', default=10, type=int)
    
    if question_type == 'all':
        filtered = all_questions
    else:
        filtered = [q for q in all_questions if q['type'] == question_type]
    
    num_questions = min(num_questions, len(filtered))
    selected = random.sample(filtered, num_questions)
    return jsonify(selected)

@app.route('/api/check-answer', methods=['POST'])
def check_answer():
    """Check if answer is correct"""
    data = request.json
    question_type = data.get('type')
    answer = data.get('answer')
    correct_answer = data.get('correct_answer')
    
    if question_type == 'multiple_choice':
        is_correct = answer == correct_answer
    else:  # matching
        # For matching, check if all pairs match
        is_correct = answer == correct_answer
    
    return jsonify({
        'correct': is_correct,
        'correct_answer': correct_answer
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
