# AI Photo Studio

An application to remove backgrounds, apply artistic styles, and clean up product photos simply by typing instructions. This project is powered by Google's Gemini 2.5 Flash Image model.

## Features

-   **Text-Based Image Editing:** Use natural language prompts like "Remove the background" or "Make the lighting more dramatic" to edit your images.
-   **Artistic Style Transfer:** Apply a wide range of artistic styles to your photos. Simply describe a style like 'Van Gogh painting', 'cyberpunk', or 'minimalist watercolor'.
-   **Custom Background Generation:** Describe a new background for your product, and the AI will generate it. For example, "Place this on a marble countertop".
-   **Automatic Object Recognition & Tagging:** Upon uploading an image, the AI automatically identifies the product and suggests relevant tags (e.g., 'shoes', 'electronics', 'furniture'), helping you understand what the AI sees.
-   **Example Prompts:** A curated list of example prompts is provided to help you get started and explore the creative possibilities.
-   **Download Your Creation:** Easily download the final edited image in high quality.

## Tech Stack

-   **Frontend:** React, TypeScript, Tailwind CSS
-   **AI Model:** Google Gemini 2.5 Flash Image (for image generation/editing) & Gemini 2.5 Flash (for object recognition)
-   **API:** `@google/genai` SDK

## How to Use

1.  **Upload an Image:** Click on the upload area to select a product photo from your device (supports PNG, JPG, WEBP, with a maximum size of 4MB).
2.  **View Auto-Tags:** Once uploaded, the AI will analyze the image and display a set of descriptive tags.
3.  **Provide an Instruction:** Type your desired edit into the text box. Alternatively, click one of the example prompts to auto-fill the instruction.
4.  **Generate:** Click the "Generate" button to let the AI work its magic.
5.  **Download:** The edited image will appear in the result panel. Click on it to download the image.

---

*Powered by Google Gemini*
