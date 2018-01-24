


export const collects = () => fetch('/api/userFavorite/userfavlist?favType=3').then(response => response.json())