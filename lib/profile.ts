export async function getProfileImage() {
  const randomId = Math.floor(Math.random() * 1000)
  const response = await fetch(`https://picsum.photos/id/${randomId}/info`)

  if (!response.ok) {
    throw new Error("Failed to fetch profile image")
  }

  const data = await response.json()
  return {
    id: data.id,
    author: data.author,
    url: data.download_url,
  }
}

