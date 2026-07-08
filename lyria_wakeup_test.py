"""Generate a peaceful wake-up track with Google's Lyria 3.

Set GEMINI_API_KEY before running:
    $env:GEMINI_API_KEY = "your-api-key"
    python lyria_wakeup_test.py
"""

from __future__ import annotations

import argparse
import base64
import os
from pathlib import Path

from google import genai


DEFAULT_PROMPT = """Create a peaceful instrumental wake-up track.

Mood: calm, warm, hopeful, gentle morning light.
Duration: 30 seconds.
Tempo: 68 BPM.
Key: D major or G major.
Style: ambient acoustic, soft modern classical, minimal lo-fi warmth.
Instruments: soft felt piano, warm nylon guitar harmonics, airy pads, subtle
marimba, very light brushed percussion, quiet birdsong-like texture but no
literal bird samples.
Avoid: vocals, heavy bass, sharp transients, dramatic crescendos, sad or
melancholy feeling, alarm-like sounds.
Mix: soft attack, wide stereo, low volume, no harsh highs, suitable for waking
up peacefully.
"""


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Smoke-test Google Lyria 3 music generation."
    )
    parser.add_argument(
        "--model",
        default="lyria-3-clip-preview",
        choices=("lyria-3-clip-preview", "lyria-3-pro-preview"),
        help="Lyria model to use. Clip is faster and always returns 30 seconds.",
    )
    parser.add_argument(
        "--output",
        default="wakeup_music.mp3",
        help="Path for the generated audio file.",
    )
    parser.add_argument(
        "--prompt",
        default=DEFAULT_PROMPT,
        help="Music prompt to send to Lyria.",
    )
    parser.add_argument(
        "--prompt-file",
        type=Path,
        help="Optional text file containing the music prompt.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise SystemExit("Missing GEMINI_API_KEY environment variable.")

    prompt = args.prompt_file.read_text(encoding="utf-8") if args.prompt_file else args.prompt
    output_path = Path(args.output)

    client = genai.Client(api_key=api_key)
    interaction = client.interactions.create(
        model=args.model,
        input=prompt,
    )

    generated_audio = interaction.output_audio
    if not generated_audio:
        raise SystemExit("Lyria response did not include audio data.")

    output_path.write_bytes(base64.b64decode(generated_audio.data))
    print(f"Wrote audio: {output_path.resolve()}")

    if interaction.output_text:
        metadata_path = output_path.with_suffix(output_path.suffix + ".txt")
        metadata_path.write_text(interaction.output_text, encoding="utf-8")
        print(f"Wrote lyrics/structure: {metadata_path.resolve()}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
