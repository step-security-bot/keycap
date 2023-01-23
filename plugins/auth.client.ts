export default defineNuxtPlugin(() => {
  const user = useUser();

  if (user.value) return;

  $fetch('/api/user/me')
    .then((fetchedUser) => user.value = fetchedUser)
    .catch(() => null);
});