"""Generate a short music clip with ElevenLabs.

Put your ElevenLabs API key in api_keys.json as either:
  "elevenlabs_api_key": "your-key"

The older "music" key is still supported for this test file.
"""

from __future__ import annotations

from pathlib import Path

from elevenlabs.client import ElevenLabs
from elevenlabs.core.api_error import ApiError

from api_config import load_api_key


OUTPUT_PATH = Path("elevenlabs_music.mp3")
PROMPT = "Peaceful jazz music for waking up, warm, gentle, instrumental, soft piano and brushed drums."


def load_elevenlabs_key() -> str:
    try:
        return load_api_key("elevenlabs_api_key")
    except SystemExit:
        return load_api_key("music")


def main() -> int:
    client = ElevenLabs(api_key=load_elevenlabs_key())
    temp_output_path = OUTPUT_PATH.with_suffix(OUTPUT_PATH.suffix + ".tmp")

    try:
        audio_chunks = client.music.compose(
            prompt=PROMPT,
            music_length_ms=30_000,
            model_id="music_v2",
            output_format="mp3_48000_192",
            force_instrumental=True,
        )

        wrote_bytes = 0
        with temp_output_path.open("wb") as audio_file:
            for chunk in audio_chunks:
                if chunk:
                    wrote_bytes += len(chunk)
                    audio_file.write(chunk)

        if wrote_bytes == 0:
            temp_output_path.unlink(missing_ok=True)
            raise SystemExit("ElevenLabs returned no audio data.")

        temp_output_path.replace(OUTPUT_PATH)
        print(f"Audio saved to {OUTPUT_PATH.resolve()} ({wrote_bytes} bytes)")
        return 0
    except ApiError as error:
        temp_output_path.unlink(missing_ok=True)
        print(f"ElevenLabs API error ({error.status_code}): {error.body}")
        if error.status_code == 402:
            print("Your ElevenLabs account needs a paid plan with Music API access.")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
