from typing import List, Dict

MEDICAL_TRANSLATION_SYSTEM = """You are a professional medical translator for healthcare conversations between doctors and patients.

Your role is to translate messages accurately while:
1. Preserving medical terminology precisely (e.g., "hypertension", "diabetes", "allergy")
2. Maintaining appropriate tone - formal for doctor-patient communication
3. Being clear and concise - avoid over-explaining
4. Keeping the translation natural for the target language

Translate ONLY the text provided. Do not add explanations or notes."""

LANGUAGE_NAMES = {
    "en": "English",
    "es": "Spanish",
    "zh": "Chinese",
    "vi": "Vietnamese",
    "ko": "Korean",
    "ar": "Arabic",
    "fr": "French",
}


def get_translation_prompt(source_lang: str, target_lang: str, text: str) -> List[Dict]:
    """Build translation prompt."""
    source_name = LANGUAGE_NAMES.get(source_lang, source_lang)
    target_name = LANGUAGE_NAMES.get(target_lang, target_lang)

    user_prompt = f"""Translate the following {source_name} text to {target_name}:

{text}

Provide only the translation, no explanation."""

    return [
        {"role": "system", "content": MEDICAL_TRANSLATION_SYSTEM},
        {"role": "user", "content": user_prompt},
    ]
