# CS 436 Quiz Practice App

A simple and beautiful Flask web application for practicing CS 436 networking questions.

## Features

- 📚 **74 Quiz Questions** - All questions from your course materials
- 🎯 **Multiple Choice Questions** - Test your knowledge with multiple options
- 🔄 **Matching Questions** - Drag-and-drop interface for matching pairs
- 🎲 **Random Selection** - Get randomized quizzes each time
- 📊 **Score Tracking** - See your performance after each quiz
- 🎨 **Beautiful UI** - Modern, responsive design with smooth animations
- 📱 **Mobile Friendly** - Works on desktop, tablet, and mobile devices

## Setup

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the app:**
   ```bash
   python main.py
   ```

3. **Open your browser:**
   Go to `http://localhost:5000`

## How to Use

1. **Select Quiz Settings:**
   - Choose the number of questions (1-74)
   - Select question type:
     - **All Questions** - Mix of multiple choice and matching
     - **Multiple Choice Only** - Only multiple choice questions
     - **Matching Only** - Only matching questions

2. **Take the Quiz:**
   - Read each question carefully
   - For multiple choice: Click on your answer
   - For matching: Drag items from the right to their matches on the left
   - Click "Submit Answer" to check your answer
   - Click "Next" to move to the next question

3. **View Results:**
   - See your overall score and percentage
   - Get feedback on your performance
   - Click "Try Again" to restart with a new quiz

## File Structure

```
cs436finalspractice/
├── main.py                    # Flask application
├── requirements.txt           # Python dependencies
├── quiz_questions.json        # All quiz questions
├── templates/
│   └── index.html            # Main HTML template
├── static/
│   ├── style.css             # CSS styling
│   └── script.js             # JavaScript logic
└── README.md                 # This file
```

## Question Format

Questions are stored in `quiz_questions.json` with the following format:

**Multiple Choice:**
```json
{
  "type": "multiple_choice",
  "question": "Question text?",
  "choices": ["Option A", "Option B", "Option C"],
  "answer": "Option A",
  "image": null
}
```

**Matching:**
```json
{
  "type": "matching",
  "question": "Match items",
  "pairs": [
    {"left": "Item 1", "right": "Definition 1"},
    {"left": "Item 2", "right": "Definition 2"}
  ],
  "image": null
}
```

## Tips for Studying

- Start with a small number of questions to warm up
- Try filtering by question type to focus on specific skills
- Repeat quizzes to improve your score
- Pay attention to questions you get wrong and review the material

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

Enjoy studying! 📚✨
