
# PolyLingo AI

PolyLingo AI is a production-ready web application designed for automatic language detection and context-aware multilingual explanations. It uses the Gemini 3 Flash model to provide natural interpretations of idioms, phrases, and text across 22 supported languages.

## Key Features

- **Automatic Language Detection**: Instantly detects source language with confidence scoring.
- **Multilingual Explanations**: Generates natural, non-literal explanations in 20+ languages simultaneously.
- **RTL Support**: Full support for right-to-left languages like Arabic and Hebrew.
- **Modern UI**: A clean, responsive SaaS interface with dark/light transitions and smooth animations.
- **History Tracking**: Saves your previous translations locally for quick access.
- **Copy-to-Clipboard**: Easily copy generated explanations with one click.

## Supported Languages

English, Hindi, French, Canadian French, Spanish, German, Italian, Portuguese, Russian, Japanese, Chinese (Simplified & Traditional), Arabic, Korean, Turkish, Dutch, Polish, Swedish, Indonesian, Vietnamese, Thai, and Hebrew.

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **AI Engine**: Google Gemini API (`gemini-3-flash-preview`)
- **State Management**: React Hooks (useState, useEffect, useCallback)
- **Deployment**: Single Page Application (SPA) compatible

## Getting Started

1. Ensure you have your `API_KEY` from Google AI Studio.
2. The application expects the key to be available in the environment.
3. Simply paste your text into the input field and hit "Analyze & Explain".

## Architecture

The app is built with a modular approach:
- `geminiService.ts`: Handles all communication with the Gemini API.
- `constants.ts`: Contains the scalable language configuration.
- `App.tsx`: Orchestrates the main user flow and state.
- `components/`: Reusable UI elements for maintainability.

## Quality Assurance

- **Unicode Handling**: Supports full script rendering for non-Latin characters.
- **Responsive Design**: Optimized for mobile, tablet, and desktop views.
- **Error Handling**: Graceful failure modes for API limits or connectivity issues.
