import requests
import sys

print('Starting test script...', file=sys.stderr)

try:
    # Get token
    print('Sending login request...', file=sys.stderr)
    response = requests.post('http://127.0.0.1:8000/api/auth/login/', json={
        'email': 'test@example.com',
        'password': 'testpass123'
    })
    print('Login response status:', response.status_code, file=sys.stderr)
    print('Login response:', response.text, file=sys.stderr)

    if response.status_code == 200:
        token = response.json()['access']
        print('Token obtained:', token[:20] + '...', file=sys.stderr)

        # Test /api/cv-analysis/cvs/
        print('\nTesting /api/cv-analysis/cvs/...', file=sys.stderr)
        response = requests.get('http://127.0.0.1:8000/api/cv-analysis/cvs/', headers={
            'Authorization': f'Bearer {token}'
        })
        print('/api/cv-analysis/cvs/ response status:', response.status_code, file=sys.stderr)
        print('/api/cv-analysis/cvs/ response:', response.text, file=sys.stderr)
except Exception as e:
    print('Error:', e, file=sys.stderr)
    import traceback
    print('Stack trace:', traceback.format_exc(), file=sys.stderr)
