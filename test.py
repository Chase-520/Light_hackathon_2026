import requests
import time

API_KEY = ""
BASE_URL = "https://api.ominigate.ai"

# Step 1: Submit image-to-video generation
response = requests.post(
    f"{BASE_URL}/v1/videos/bytedance/generations",
    headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}",
    },
    json={
        "model": "dreamina-seedance-2-0-fast-260128-face",
        "content": [
            {
                "type": "text",
                "text": "A cat slowly turning its head, natural movement"
            },
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