import time

import requests

from api_config import load_api_key


API_KEY = ""# load_api_key("ominigate_api_key")
BASE_URL = "https://api.ominigate.ai"

# Step 1: Submit image-to-video generation
response = requests.post(
    f"{BASE_URL}/v1/videos/bytedance11/generations",
    headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}",
    },
    json={
        "model": "dreamina-seedance-2-0-fast-260128-face",
        "content": [
            {
                "type": "text",
                "text": "A cat slowly turning its head, natural movement",
            },
            {
                "type": "image_url",
                "image_url": {
                    "url": "https://example.com/cat.jpg",
                },
                "role": "first_frame",
            },
        ],
        "resolution": "720p",
        "ratio": "16:9",
        "duration": 5,
    },
)
response.raise_for_status()
task = response.json()
task_id = task.get("id") or task.get("task_id") or task.get("data", {}).get("id")
if not task_id:
    raise SystemExit(f"Task response did not include an id: {task}")
print(f"Task submitted: {task_id}")

# Step 2: Poll for results
while True:
    result_response = requests.get(
        f"{BASE_URL}/v1/videos/bytedance/single-task/{task_id}",
        headers={"Authorization": f"Bearer {API_KEY}"},
    )
    result_response.raise_for_status()
    result = result_response.json()

    status = result.get("status")
    print(f"Status: {status}")

    if status == "succeeded":
        print(f"Video URL: {result['content']['video_url']}")
        break
    if status == "failed":
        print(f"Error: {result.get('error')}")
        break

    time.sleep(8)
