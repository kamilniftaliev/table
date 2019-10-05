export function logout(): void {
  localStorage.removeItem('token');
  window.location.href = '/';
}

export default logout;
