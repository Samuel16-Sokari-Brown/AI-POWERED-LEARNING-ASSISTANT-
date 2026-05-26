import fs from 'fs';

async function test() {
  try {
    const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
    fs.writeFileSync('dummy.png', buffer);

    const formData = new FormData();
    const blob = new Blob([buffer], { type: 'image/png' });
    formData.append('image', blob, 'dummy.png');
    
    const response = await fetch('http://localhost:8000/api/auth/test-upload-avatar', {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    console.log(response.status, data);
  } catch (error) {
    console.error('Error:', error.message);
  }
}
test();
