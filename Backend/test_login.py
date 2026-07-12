
import requests

BASE_URL = 'http://127.0.0.1:8000/api'

# Test login with the newly created user
login_payload = {
    "email": "test@test.com",
    "password": "Test1234!"
}

print("Testing login...")
try:
    response = requests.post(f'{BASE_URL}/auth/login/', json=login_payload)
    print(f"Response status: {response.status_code}")
    print(f"Response headers: {dict(response.headers)}")
    print(f"Response text: {response.text}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Login successful!")
        print(f"Access token: {data.get('access', 'NOT FOUND')}")
        print(f"User data: {data.get('user', 'NOT FOUND')}")
        
        # Test calling /auth/me
        access_token = data.get('access')
        headers = {'Authorization': f'Bearer {access_token}'}
        
        print("\nTesting /auth/me with token...")
        me_response = requests.get(f'{BASE_URL}/auth/me/', headers=headers)
        print(f"me status: {me_response.status_code}")
        print(f"me response: {me_response.text}")
        
    else:
        print(f"Login failed!")
        
except Exception as e:
    print(f"Exception: {type(e)} - {str(e)}")
    import traceback
    print(traceback.format_exc())
