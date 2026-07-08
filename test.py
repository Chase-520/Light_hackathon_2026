import requests
import time
from api_config import load_api_key

API_KEY = load_api_key("ominigate_api_key")
BASE_URL = "https://api.ominigate.ai"

# Step 1: Submit image-to-video generation
response = requests.post(
    f"{BASE_URL}/v1/videos/bytedance/generations",
    headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}",
    },
    json={
        "model": "dreamina-seedance-2-0-fast-260128",
        "content": [
            {
                "type": "text",
                "text": "A cat slowly turning its head, natural movement, peaceful jazz music playing in the background"
            },
            {
                "type": "image_url",
                "image_url": {
                    "url": "https://betterwithcats.net/wp-content/uploads/2022/08/cat-is-laying-on-a-old-wooden-table.jpg"
                },
                "role": "first_frame"
            }
        ],
        "resolution": "720p",
        "ratio": "16:9",
        "duration": 5,
    },
)
task = response.json()
print(task)
task_id = task["id"]
print(f"Task submitted: {task_id}")

# Step 2: Poll for results
while True:
    result = requests.get(
        f"{BASE_URL}/v1/videos/bytedance/single-task/{task_id}",
        headers={"Authorization": f"Bearer {API_KEY}"},
    ).json()

    status = result["status"]
    print(f"Status: {status}")

    if status == "succeeded":
        print(f"Video URL: {result['content']['video_url']}")
        break
    elif status == "failed":
        print(f"Error: {result['error']}")
        break

    time.sleep(8)