from openai import OpenAI
from api_config import load_api_key

client = OpenAI(
    base_url="https://api.ominigate.ai/v1",
    api_key=load_api_key("ominigate_api_key"),
)

response = client.chat.completions.create(
    model="openai/gpt-4o",
    messages=[{"role": "user", "content": "Hello!"}],
)

print(response.choices[0].message.content)