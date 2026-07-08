import requests
import time
from api_config import load_api_key

# Step 1: Submit the text-to-video task
API_KEY = load_api_key("ominigate_api_key")
print(API_KEY)
response = requests.post(
    "https://api.ominigate.ai/v1/videos/google/text2video",
    headers={
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    },
    json={
        "model": "veo-2.0-generate-001",
        "instances": [
            {
                "prompt": "A cinematic aerial shot of a coastal city at sunset, "
                "golden light reflecting off the ocean waves, "
                "seagulls flying in the foreground"
            }
        ],
        "parameters": {
            "aspectRatio": "16:9",
            "durationSeconds": 8,
            "sampleCount": 1,
        },
    },
)

operation = response.json()
operation_name = operation["name"]
print(f"Submitted. Operation: {operation_name}")

# Step 2: Poll for the result
while True:
    time.sleep(15)
    poll = requests.post(
        "https://api.ominigate.ai/v1/videos/google/process",
        headers={
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json",
        },
        json={"operationName": operation_name},
    )

    print("Status:", poll.status_code)
    print("Raw response:", repr(poll.text))   # 用 repr 显示转义字符
    # 然后尝试解析
    result = poll.json()
    if result.get("done"):
        if "error" in result:
            print("Error:", result["error"]["message"])
        else:
            for video in result["response"]["videos"]:
                print("Video URL:", video["gcsUri"])
        break
    print("Processing...")