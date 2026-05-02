const url = 'https://team-taskbackend-production.up.railway.app/api';

const testSignup = async () => {
  const email = `testuser+${Date.now()}@example.com`;
  const password = 'Test1234!';
  const name = 'QA Test';
  const response = await fetch(`${url}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await response.json().catch(() => null);
  console.log('SIGNUP', response.status, data);
  return { status: response.status, data, email, password };
};

const testLogin = async (email, password) => {
  const response = await fetch(`${url}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json().catch(() => null);
  console.log('LOGIN', response.status, data);
  return { status: response.status, data };
};

(async () => {
  try {
    const signup = await testSignup();
    if (signup.data?.token) {
      console.log('Signup token returned ✅');
      await testLogin(signup.email, signup.password);
    } else {
      console.log('Signup failed or no token returned');
      if (signup.data?.message) console.log('Message:', signup.data.message);
    }
  } catch (err) {
    console.error('ERROR', err);
  }
})();
