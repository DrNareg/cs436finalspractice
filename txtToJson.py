import re
import json

INPUT_FILE = "CS 436 Final Prep formatted.txt"
OUTPUT_FILE = "quiz_questions.json"

with open(INPUT_FILE, "r", encoding="utf-8") as f:
    text = f.read()

# split questions by quiz number pattern
questions_raw = re.split(r"\n(\d+)\.\s+", text)

# Reconstruct questions with their numbers
questions_text = []
for i in range(1, len(questions_raw), 2):
    if i + 1 < len(questions_raw):
        questions_text.append(questions_raw[i + 1])

questions = []

for block in questions_text:
    lines = block.split("\n")
    
    # Get question text (first non-empty line)
    question_text = ""
    start_idx = 0
    for i, line in enumerate(lines):
        if line.strip():
            question_text = line.strip()
            start_idx = i + 1
            break
    
    if not question_text:
        continue
    
    # Collect option lines (those starting with *)
    option_lines = []
    for line in lines[start_idx:]:
        if line.strip().startswith('*'):
            option_lines.append(line.strip())
    
    # Detect if this is a multiple choice by counting lines that start with "a.", "b.", etc.
    multiple_choice_count = sum(1 for line in option_lines if re.match(r"\*\s*[a-f]\.\s*", line))
    colon_count = sum(1 for line in option_lines if ':' in line)
    
    # If we have multiple choice options, treat as multiple choice
    if multiple_choice_count >= 2:
        choices = []
        answer = None
        
        for line in option_lines:
            m = re.match(r"\*\s*([a-f])\.\s*(.+)", line)
            if m:
                choice = m.group(2).replace("✓", "").strip()
                choices.append(choice)
                
                if "✓" in line:
                    answer = choice
        
        if choices:
            questions.append({
                "type": "multiple_choice",
                "question": question_text,
                "choices": choices,
                "answer": answer,
                "image": None
            })
    
    # Otherwise, if we have colons and they're actual key:value pairs, treat as matching
    elif colon_count >= 2 and all(':' in line for line in option_lines):
        pairs = []
        for line in option_lines:
            if ':' in line:
                parts = line.split(':', 1)
                left = parts[0].replace('*', '').strip()
                right = parts[1].replace('✓', '').strip() if len(parts) > 1 else ''
                # Only add if both left and right have content
                if left and right:
                    pairs.append({"left": left, "right": right})
        
        if pairs:
            questions.append({
                "type": "matching",
                "question": question_text,
                "pairs": pairs,
                "image": None
            })

# write JSON
with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(questions, f, indent=2)

print("Converted", len(questions), "questions")
