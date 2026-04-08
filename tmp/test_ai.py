import requests

def test_triage():
    url = "http://localhost:8000/ai/triage"
    reasons = [
        "I have severe chest pain and trouble breathing",
        "I have a fever and cough",
        "Just a regular checkup"
    ]
    
    for reason in reasons:
        try:
            response = requests.post(url, json={"reason": reason})
            print(f"Reason: {reason}")
            print(f"Result: {response.json()}")
            print("-" * 20)
        except Exception as e:
            print(f"Error testing {reason}: {e}")

if __name__ == "__main__":
    test_triage()
