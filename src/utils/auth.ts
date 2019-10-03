export function logout() {
  localStorage.removeItem('token');
  location.href = "/";
}