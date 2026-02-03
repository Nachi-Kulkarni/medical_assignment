from typing import List, Dict

MEDICAL_SUMMARY_SYSTEM = """You are a medical documentation assistant. Your task is to analyze doctor-patient conversations and generate structured medical summaries.

Extract and organize the following information from the conversation:
1. Chief complaint - the primary reason for the visit
2. Symptoms - all symptoms mentioned
3. Duration - how long symptoms have been present
4. Medications - current medications and any discussed
5. Allergies - any allergies mentioned
6. Follow-up - recommended next steps

Be concise and accurate. If information is not mentioned, use "Not discussed".

IMPORTANT: Return ONLY valid JSON without any markdown formatting, code blocks, or additional text."""

SUMMARY_USER_PROMPT = """Based on the following conversation between a doctor and patient, generate a structured medical summary.

{conversation_text}

Return the summary as a JSON object with these exact keys:
- chief_complaint
- symptoms (array of strings)
- duration
- medications (array of strings)
- allergies (array of strings)
- follow_up

Return ONLY the JSON object without markdown formatting, code blocks, or any additional text."""


def get_summary_prompt(conversation_text: str) -> List[Dict]:
    """Build summary generation prompt."""
    user_prompt = SUMMARY_USER_PROMPT.format(conversation_text=conversation_text)

    return [
        {"role": "system", "content": MEDICAL_SUMMARY_SYSTEM},
        {"role": "user", "content": user_prompt},
    ]
